import fs from "node:fs";
import { webkit } from "playwright";
import {
  assertCurrentEventPreview,
  assertSafeEventSourceRollover,
} from "./event-setup-preview-contract.mjs";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const productionOrigin = process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev";
const expectedDeploymentSha = process.env.EXPECTED_DEPLOYMENT_SHA?.trim() ?? "";
const expectedSyncSourceSha = process.env.EXPECTED_SYNC_SOURCE_SHA?.trim() ?? "";
const configuredArticleUrl = process.env.EVENT_SETUP_TEST_MMA_URL?.trim() ?? "";

if (!accessToken || !projectId) {
  throw new Error("Live PIN verification is not configured.");
}
if (expectedDeploymentSha && !/^[0-9a-f]{40}$/i.test(expectedDeploymentSha)) {
  throw new Error("The expected frontend deployment SHA must be a full commit SHA.");
}
if (expectedSyncSourceSha && !/^[0-9a-f]{40}$/i.test(expectedSyncSourceSha)) {
  throw new Error("The expected UFC sync deployment SHA must be a full commit SHA.");
}

const supabaseOrigin = `https://${projectId}.supabase.co`;

async function readBody(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Invalid JSON response." };
  }
}

function safeMessage(body) {
  return String(
    body?.message
      ?? body?.msg
      ?? body?.error_description
      ?? body?.error
      ?? "No response message.",
  ).replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]");
}

async function request(stage, url, options = {}, acceptedStatuses = [200]) {
  const response = await fetch(url, options);
  const body = await readBody(response);
  if (!acceptedStatuses.includes(response.status)) {
    throw new Error(`${stage}: HTTP ${response.status}; ${safeMessage(body)}`);
  }
  return { response, body };
}

function isSetupLifecycle(status) {
  return status === "SET UP NEXT EVENT" || status === "REVIEW CARD";
}

function isActiveEventLifecycle(status) {
  return status === "PICKS OPEN"
    || status === "PICKS CLOSED · RESULTS OPEN"
    || status === "EVENT COMPLETE"
    || /^\d+ FIGHTS? NEED RESULTS$/.test(status);
}

async function waitForControlStatus(page) {
  const statusLocator = page.locator(".picks-control-center__status");
  await statusLocator.waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForFunction(() => {
    const text = document.querySelector(".picks-control-center__status")?.textContent?.trim() ?? "";
    return Boolean(text && ![
      "LOADING CONTROL CENTER",
      "CHECKING NEXT EVENT",
      "OWNER SIGN-IN REQUIRED",
    ].includes(text));
  }, undefined, { timeout: 15_000 });
  return (await statusLocator.textContent())?.trim() ?? "";
}

const markerUrl = new URL("/deployment.json", productionOrigin);
markerUrl.searchParams.set("run", process.env.GITHUB_RUN_ID ?? String(Date.now()));
if (expectedDeploymentSha) markerUrl.searchParams.set("expected", expectedDeploymentSha);
const marker = await request(
  "Live frontend deployment marker",
  markerUrl.toString(),
  { headers: { "Cache-Control": "no-cache" } },
);
const liveDeploymentSha = marker.body?.sha ?? "";
if (!/^[0-9a-f]{40}$/i.test(liveDeploymentSha)) {
  throw new Error(`Live frontend deployment marker is missing or invalid: ${liveDeploymentSha || "missing"}.`);
}
if (expectedDeploymentSha && liveDeploymentSha !== expectedDeploymentSha) {
  throw new Error(
    `Live frontend deployment marker: expected ${expectedDeploymentSha}, received ${liveDeploymentSha}.`,
  );
}

const keysResult = await request(
  "Project key lookup",
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);

const keys = keysResult.body;
const publishableKey = keys.find((item) => item.type === "publishable")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /anon/i.test(item.name ?? ""))?.api_key;
const secretKey = keys.find((item) => item.type === "secret")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;

if (!publishableKey || !secretKey) {
  throw new Error("Project keys: required keys are unavailable.");
}

if (process.env.PUBLIC_CONFIG_PATH) {
  fs.writeFileSync(
    process.env.PUBLIC_CONFIG_PATH,
    `VITE_SUPABASE_URL=${supabaseOrigin}\nVITE_SUPABASE_PUBLISHABLE_KEY=${publishableKey}\n`,
    { mode: 0o600 },
  );
}

const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};
const publicHeaders = {
  Authorization: `Bearer ${publishableKey}`,
  apikey: publishableKey,
  "Content-Type": "application/json",
  "x-client-info": "octagon-hq-live-pin-check/5",
  Origin: productionOrigin,
};

const suffix = `${process.env.GITHUB_RUN_ID ?? Date.now()}${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`;
const displayName = `HQCHECK${suffix}`.slice(0, 24);
const authEmail = `hqcheck-${suffix}@login.octagon-hq.app`;
const staleCredentialEmail = `stale-${suffix}@login.octagon-hq.app`;
const pin = "4826";
const password = `HealthCheck-${suffix}!Aa1`;
let userId = "";
let browser;

try {
  const created = await request(
    "Disposable Auth user creation",
    `${supabaseOrigin}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        email: authEmail,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      }),
    },
  );
  userId = created.body?.id;
  if (!userId) {
    throw new Error("Disposable Auth user creation: response did not include a user ID.");
  }

  await request(
    "Stale PIN credential registration",
    `${supabaseOrigin}/rest/v1/rpc/register_pin_profile`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        p_profile_id: userId,
        p_display_name: displayName,
        p_initials: "H",
        p_internal_email: staleCredentialEmail,
        p_pin: pin,
      }),
    },
  );

  await request(
    "Temporary Event Setup owner grant",
    `${supabaseOrigin}/rest/v1/pick_control_owners`,
    {
      method: "POST",
      headers: { ...serviceHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({ profile_id: userId }),
    },
    [201],
  );

  const login = await request(
    "Direct live PIN login",
    `${supabaseOrigin}/functions/v1/pin-auth`,
    {
      method: "POST",
      headers: publicHeaders,
      body: JSON.stringify({ action: "login", displayName, pin }),
    },
  );

  if (!login.body?.tokenHash) {
    throw new Error("Direct live PIN login: response did not include a token hash.");
  }

  browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "en-US",
  });
  const page = await context.newPage();
  const diagnostics = [];
  let syncRequestCount = 0;

  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      diagnostics.push(`console:${message.type()}: ${message.text()}`);
    }
  });
  page.on("request", (request) => {
    if (request.url().includes("/functions/v1/sync-next-ufc-event")) {
      syncRequestCount += 1;
    }
  });
  page.on("requestfailed", (failedRequest) => {
    if (failedRequest.url().includes("supabase.co")) {
      diagnostics.push(
        `requestfailed: ${failedRequest.method()} ${failedRequest.url()} ${failedRequest.failure()?.errorText ?? "unknown"}`,
      );
    }
  });
  page.on("response", async (response) => {
    if (!response.url().includes("/functions/v1/")) return;
    const responseRequest = response.request();
    const headers = await response.allHeaders();
    diagnostics.push(
      `response: ${responseRequest.method()} ${response.status()} ${response.url().split("/functions/v1/")[1]} allow-origin=${headers["access-control-allow-origin"] ?? "missing"}`,
    );
  });

  await page.goto(`${productionOrigin}/picks/monitoring?browser-pin-check=${suffix}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.waitForURL(
    (url) => url.pathname === "/picks/control" && url.hash === "#monitoring",
    { timeout: 15_000 },
  );
  await page.getByText("PRIVATE PICKS OWNER", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });

  await page.getByRole("button", { name: "Sign in to Octagon HQ" }).click();
  await page.getByLabel("YOUR NAME").fill(displayName);
  await page.getByLabel("YOUR 4-DIGIT PIN").fill(pin);
  await page.getByRole("button", { name: "ENTER HQ" }).click();

  const signedInButton = page.getByRole("button", {
    name: `Open ${displayName} profile menu`,
  });

  try {
    await signedInButton.waitFor({ state: "visible", timeout: 15_000 });
  } catch {
    const visibleError = await page.locator(".identity-error").textContent().catch(() => "");
    throw new Error(
      [
        `Browser PIN login failed: ${visibleError?.trim() || "no visible error"}`,
        ...diagnostics,
      ].join("\n"),
    );
  }

  await page.waitForURL(
    (url) => url.pathname === "/picks/control" && url.hash === "#monitoring",
    { timeout: 15_000 },
  );
  const controlStatus = await waitForControlStatus(page);
  let monitoringOutcome;
  const monitoringRegion = page.getByRole("region", {
    name: "Automatic monitoring and card review",
  });

  if (controlStatus === "PICKS OPEN") {
    await monitoringRegion.waitFor({ state: "visible", timeout: 15_000 });
    await monitoringRegion.getByRole("button", { name: "REFRESH STATUS" }).waitFor({ state: "visible", timeout: 15_000 });
    if (await page.getByText("MONITORING UNAVAILABLE", { exact: true }).count()) {
      throw new Error("Monitoring Inbox rendered its unavailable state for the temporary owner.");
    }

    const fightRegion = page.getByRole("region", { name: /compact fight controls$/ });
    if (await fightRegion.count()) {
      await monitoringRegion.getByRole("heading", {
        name: /^AUTO-SYNC (CHECKED THE EVENT|IS WAITING FOR ITS NEXT CHECK|HAS PARTIAL COVERAGE|NEEDS ATTENTION)$/,
      }).waitFor({ state: "visible", timeout: 15_000 });
      await monitoringRegion.getByRole("button", { name: "CHECK NOW" }).waitFor({ state: "visible", timeout: 15_000 });
      if (await monitoringRegion.locator(".monitoring-event").count()) {
        throw new Error("The unified dashboard repeated the standalone current event card inside monitoring.");
      }
      if (await monitoringRegion.getByRole("link", { name: "OPEN UFC EVENT SOURCE" }).count() > 1) {
        throw new Error("The unified dashboard rendered more than one event source link.");
      }

      const allClear = monitoringRegion.getByLabel("Pending changes all clear");
      const pendingChanges = monitoringRegion.getByRole("heading", { name: "One finding, one clear decision" });
      if (!await allClear.count() && !await pendingChanges.count()) {
        throw new Error("Monitoring rendered neither its compact all-clear state nor its pending findings workflow.");
      }

      await fightRegion.waitFor({ state: "visible", timeout: 15_000 });
      const fightRows = fightRegion.locator(".open-pick-row__summary");
      const fightRowCount = await fightRows.count();
      if (fightRowCount < 2) {
        throw new Error(`Manage Open Picks rendered ${fightRowCount} compact fight rows; expected multiple rows.`);
      }
      if (await page.getByRole("button", { name: "+10 MIN" }).count()) {
        throw new Error("Collapsed fight rows exposed permanent lock controls.");
      }
      const monitoringBeforeFights = await page.evaluate(() => {
        const monitoring = document.querySelector('[aria-label="Automatic monitoring and card review"]');
        const firstFight = document.querySelector(".open-pick-row__summary");
        return Boolean(
          monitoring
          && firstFight
          && (monitoring.compareDocumentPosition(firstFight) & Node.DOCUMENT_POSITION_FOLLOWING),
        );
      });
      if (!monitoringBeforeFights) {
        throw new Error("Automation status did not render before the compact fight list.");
      }

      await fightRows.nth(0).click();
      await page.getByRole("button", { name: "+10 MIN" }).waitFor({ state: "visible", timeout: 15_000 });
      if (await page.getByRole("button", { name: "+10 MIN" }).count() !== 1) {
        throw new Error("Expanding one fight exposed detailed actions for more than one row.");
      }
      await fightRows.nth(1).click();
      if (await fightRows.nth(0).getAttribute("aria-expanded") !== "false") {
        throw new Error("Opening a second fight did not collapse the first fight.");
      }
      if (await page.getByRole("button", { name: "+10 MIN" }).count() !== 1) {
        throw new Error("The compact card allowed more than one detailed fight panel at a time.");
      }
      await fightRows.nth(1).click();

      monitoringOutcome = `loaded visible truthful automation, a compact review state, and ${fightRowCount} collapsed fight rows with one-detail-at-a-time controls`;
    } else {
      await monitoringRegion.getByRole("heading", { name: "One finding, one clear decision" }).waitFor({ state: "visible", timeout: 15_000 });
      monitoringOutcome = "confirmed the currently deployed main frontend still satisfies its legacy monitoring contract before this exact UI head is deployed";
    }
  } else if (isSetupLifecycle(controlStatus) || isActiveEventLifecycle(controlStatus)) {
    if (await monitoringRegion.count()) {
      throw new Error(`Monitoring Inbox rendered during the ${controlStatus} lifecycle.`);
    }
    monitoringOutcome = `confirmed the ${controlStatus} lifecycle correctly omits monitoring`;
  } else {
    throw new Error(`Picks Control Center did not reach a valid owner lifecycle: ${controlStatus || "missing"}.`);
  }

  const monitoringScreenshotPath = process.env.MONITORING_INBOX_SCREENSHOT_PATH
    ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/monitoring-inbox-preview.png`;
  await page.screenshot({ path: monitoringScreenshotPath, fullPage: true });

  const syncRequestsBeforeSetup = syncRequestCount;
  await page.goto(`${productionOrigin}/picks/setup?event-preview-check=${suffix}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.waitForURL(
    (url) => url.pathname === "/picks/control" && url.hash === "#setup",
    { timeout: 15_000 },
  );
  await page.getByText("PRIVATE PICKS OWNER", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });
  const setupStatus = await waitForControlStatus(page);
  let previewOutcome;

  if (isSetupLifecycle(setupStatus)) {
    await page.getByRole("region", { name: "Card scope" }).waitFor({ state: "visible", timeout: 15_000 });
    await page.getByRole("heading", { name: "Choose what counts", exact: true }).waitFor({ state: "visible", timeout: 15_000 });
    const sourceInput = page.getByLabel("MMA MANIA CARD URL (OPTIONAL)");
    const stagedSourceUrl = await sourceInput.inputValue();
    if (configuredArticleUrl) {
      await sourceInput.fill(configuredArticleUrl);
    }

    const updateButton = page.getByRole("button", { name: "CHECK FOR CARD UPDATES" });
    const syncButton = page.getByRole("button", { name: "SYNC NEXT UFC EVENT" });

    if (await updateButton.count()) {
      const previewResponsePromise = page.waitForResponse(
        (response) => response.url().includes("/functions/v1/sync-next-ufc-event")
          && response.request().method() === "POST",
        { timeout: 30_000 },
      );
      await updateButton.click();
      const previewResponse = await previewResponsePromise;
      const previewBody = await previewResponse.json().catch(() => ({}));
      if (expectedSyncSourceSha && previewBody?.deployment_sha !== expectedSyncSourceSha) {
        throw new Error(
          `WebKit Event Setup backend SHA mismatch: expected ${expectedSyncSourceSha}, received ${previewBody?.deployment_sha ?? "missing"}.`,
        );
      }

      if (previewResponse.status() === 200) {
        assertCurrentEventPreview({
          ...previewBody.event_preview,
          source_url: previewBody.source_url,
        });
        await page.getByText("SOURCE REVIEW · NOT APPLIED").waitFor({ state: "visible", timeout: 15_000 });
        await page.getByRole("heading", { name: /^(Main card|Full card) · \d+ fights$/i }).waitFor({ state: "visible" });
        const visibleText = await page.locator("body").innerText();
        for (const expected of [
          previewBody.event_preview?.name,
          previewBody.event_preview?.subtitle,
          previewBody.event_preview?.venue,
          previewBody.event_preview?.location,
        ]) {
          if (!expected || !visibleText.includes(expected)) {
            throw new Error(`Event Setup source review did not render ${expected || "a required event field"}.`);
          }
        }
        if (await page.getByRole("button", { name: "PUBLISH CARD" }).count()) {
          throw new Error("Publish controls remained visible during the read-only source review.");
        }
        previewOutcome = `rendered a clean ${previewBody.fight_count}-fight current-source review`;
      } else if (previewResponse.status() === 502) {
        assertSafeEventSourceRollover(previewBody);
        const visibleError = page.locator(".picks-error");
        await visibleError.waitFor({ state: "visible", timeout: 15_000 });
        const visibleErrorText = (await visibleError.textContent())?.trim() ?? "";
        if (!visibleErrorText || (previewBody?.message && !visibleErrorText.includes(previewBody.message))) {
          throw new Error(`Event Setup did not display the safe source rollover message: ${visibleErrorText || "missing"}.`);
        }
        await page.getByText("STAGED CARD · NOT LIVE").waitFor({ state: "visible" });
        await updateButton.waitFor({ state: "visible" });
        if (await page.getByText("SOURCE REVIEW · NOT APPLIED").count()) {
          throw new Error("Event Setup opened a source review after the backend rejected the event identity.");
        }
        if ((await sourceInput.inputValue()) !== (configuredArticleUrl || stagedSourceUrl)) {
          throw new Error("Event Setup changed the persisted source field after a safe source rollover rejection.");
        }
        previewOutcome = "displayed the fail-closed source rollover without applying or publishing it";
      } else {
        throw new Error(
          `Event Setup returned unexpected HTTP ${previewResponse.status()}: ${safeMessage(previewBody)}.\n${diagnostics.join("\n")}`,
        );
      }
    } else if (await syncButton.count()) {
      await page.getByText("NO STAGED CARD", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });
      await page.getByRole("heading", { name: "Stage the next UFC event.", exact: true }).waitFor({ state: "visible", timeout: 15_000 });
      await syncButton.waitFor({ state: "visible", timeout: 15_000 });
      if (await syncButton.isDisabled()) {
        throw new Error("Event Setup disabled the canonical no-draft sync action.");
      }
      if (await page.getByText("SOURCE REVIEW · NOT APPLIED").count()) {
        throw new Error("Event Setup opened a source review without a staged draft.");
      }
      if (await page.getByRole("button", { name: "PUBLISH CARD" }).count()) {
        throw new Error("Event Setup exposed publish controls without a staged draft.");
      }
      await page.waitForTimeout(250);
      if (syncRequestCount !== syncRequestsBeforeSetup) {
        throw new Error("Event Setup called the sync provider while rendering the no-draft review state.");
      }
      previewOutcome = "confirmed the no-draft setup presents its canonical sync action without applying or publishing anything";
    } else {
      throw new Error("Event Setup rendered neither its staged-card review action nor its no-draft sync action.");
    }
  } else if (isActiveEventLifecycle(setupStatus)) {
    if (await page.getByRole("region", { name: "Card scope" }).count()) {
      throw new Error(`Event Setup rendered during the ${setupStatus} lifecycle.`);
    }
    previewOutcome = `confirmed the ${setupStatus} lifecycle correctly omits Event Setup without calling the sync provider`;
  } else {
    throw new Error(`Picks Control Center did not reach a valid setup lifecycle: ${setupStatus || "missing"}.`);
  }

  const visibleText = await page.locator("body").innerText();
  if (/iframe|googletagmanager|skip\s+to\s+main|src\s*=/i.test(visibleText)) {
    throw new Error("Event Setup exposed polluted UFC visible-page metadata.");
  }

  const screenshotPath = process.env.EVENT_SETUP_SCREENSHOT_PATH
    ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/event-setup-preview.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(
    `PASS: WebKit verified live production frontend ${liveDeploymentSha}, authenticated at 390x844, preserved the canonical Picks Control Center monitoring and setup anchors through sign-in, ${monitoringOutcome}, and ${previewOutcome}.`,
  );
} finally {
  if (browser) await browser.close().catch(() => undefined);
  if (userId) {
    await fetch(`${supabaseOrigin}/rest/v1/pick_control_owners?profile_id=eq.${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: serviceHeaders,
    }).catch(() => undefined);
    await fetch(`${supabaseOrigin}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: serviceHeaders,
    }).catch(() => undefined);
  }
}
