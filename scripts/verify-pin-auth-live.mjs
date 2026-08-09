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
  const resolvedStatus = await page.waitForFunction(() => {
    const text = document.querySelector(".picks-control-center__status")?.textContent?.trim() ?? "";
    return text && ![
      "LOADING CONTROL CENTER",
      "CHECKING NEXT EVENT",
      "OWNER SIGN-IN REQUIRED",
    ].includes(text) ? text : "";
  }, undefined, { timeout: 15_000 });
  return String(await resolvedStatus.jsonValue());
}

async function waitForSingleExpandedFight(fightRegion, fightRows, expectedIndex) {
  const deadline = Date.now() + 15_000;
  const detailPanels = fightRegion.locator(".open-pick-row__details");
  const expandedRows = fightRegion.locator('.open-pick-row__summary[aria-expanded="true"]');
  while (Date.now() < deadline) {
    if (
      await expandedRows.count() === 1
      && await detailPanels.count() === 1
      && await fightRows.nth(expectedIndex).getAttribute("aria-expanded") === "true"
    ) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Fight ${expectedIndex + 1} did not settle as the only expanded detail panel.`);
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
    "Disposable profile upsert",
    `${supabaseOrigin}/rest/v1/profiles?on_conflict=id`,
    {
      method: "POST",
      headers: {
        ...serviceHeaders,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        id: userId,
        display_name: displayName,
      }),
    },
    [201, 204],
  );

  await request(
    "Temporary owner grant",
    `${supabaseOrigin}/rest/v1/app_roles?on_conflict=user_id,role`,
    {
      method: "POST",
      headers: {
        ...serviceHeaders,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        user_id: userId,
        role: "picks_admin",
      }),
    },
    [201, 204],
  );

  await request(
    "PIN credential registration",
    `${supabaseOrigin}/functions/v1/pin-auth`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        action: "register",
        profileId: userId,
        email: staleCredentialEmail,
        pin,
      }),
    },
  );

  browser = await webkit.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  const diagnostics = [];
  let syncRequestCount = 0;
  page.on("request", (request) => {
    if (request.url().includes("/functions/v1/sync-next-ufc-event")) syncRequestCount += 1;
  });
  page.on("requestfailed", (request) => {
    diagnostics.push(`failed: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? "unknown"}`);
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
      const syncHeading = monitoringRegion.getByRole("heading", {
        name: /^AUTO-SYNC (CHECKED THE EVENT|IS WAITING FOR ITS NEXT CHECK|HAS PARTIAL COVERAGE|NEEDS ATTENTION)$/,
      });
      await syncHeading.waitFor({ state: "visible", timeout: 15_000 });
      const syncHeadingText = (await syncHeading.textContent())?.trim() ?? "";
      await monitoringRegion.getByRole("button", { name: "CHECK NOW" }).waitFor({ state: "visible", timeout: 15_000 });
      if (await monitoringRegion.locator(".monitoring-event").count()) {
        throw new Error("The unified dashboard repeated the standalone current event card inside monitoring.");
      }
      if (await monitoringRegion.getByRole("link", { name: "OPEN UFC EVENT SOURCE" }).count() > 1) {
        throw new Error("The unified dashboard rendered more than one event source link.");
      }

      const allClear = monitoringRegion.getByLabel("Pending changes all clear");
      const pendingChanges = monitoringRegion.getByRole("heading", { name: "One finding, one clear decision" });
      const partialCoverage = syncHeadingText === "AUTO-SYNC HAS PARTIAL COVERAGE";
      const waitingForNextCheck = syncHeadingText === "AUTO-SYNC IS WAITING FOR ITS NEXT CHECK";
      if (!await allClear.count() && !await pendingChanges.count() && !partialCoverage && !waitingForNextCheck) {
        throw new Error("Monitoring rendered neither its compact all-clear state, pending findings workflow, explicit partial coverage, nor healthy waiting state.");
      }

      await fightRegion.waitFor({ state: "visible", timeout: 15_000 });
      const fightRows = fightRegion.locator(".open-pick-row__summary");
      const detailPanels = fightRegion.locator(".open-pick-row__details");
      const fightRowCount = await fightRows.count();
      if (fightRowCount < 2) {
        throw new Error(`Manage Open Picks rendered ${fightRowCount} compact fight rows; expected multiple rows.`);
      }
      if (await detailPanels.count()) {
        throw new Error("Collapsed fight rows exposed a permanent detail panel.");
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
      await waitForSingleExpandedFight(fightRegion, fightRows, 0);
      await fightRows.nth(1).click();
      await waitForSingleExpandedFight(fightRegion, fightRows, 1);
      await fightRows.nth(1).click();

      monitoringOutcome = `loaded visible truthful automation, ${partialCoverage ? "an explicit partial-coverage state" : waitingForNextCheck ? "the healthy waiting-for-next-check state" : "a compact review state"}, and ${fightRowCount} collapsed fight rows with one-detail-at-a-time controls`;
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
  await waitForControlStatus(page);
  await page.getByRole("region", { name: "Event setup" }).waitFor({ state: "visible", timeout: 15_000 });
  if (await page.getByText("CONTROL UNAVAILABLE", { exact: true }).count()) {
    throw new Error("Picks Control Center rendered its control-unavailable state during Event Setup verification.");
  }
  if (await page.getByText("SETUP UNAVAILABLE", { exact: true }).count()) {
    throw new Error("Picks Control Center rendered its setup-unavailable state during Event Setup verification.");
  }
  await page.getByText("EVENT SETUP", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: "PREVIEW EVENT" }).waitFor({ state: "visible", timeout: 15_000 });
  const beforePreviewText = await page.getByRole("region", { name: "Event setup" }).textContent();
  await page.getByRole("button", { name: "PREVIEW EVENT" }).click();
  await page.getByText("PREVIEW READY", { exact: true }).waitFor({ state: "visible", timeout: 30_000 });
  const afterPreviewText = await page.getByRole("region", { name: "Event setup" }).textContent();
  if (beforePreviewText === afterPreviewText) {
    throw new Error("Event Setup preview did not visibly refresh after PREVIEW EVENT.");
  }
  if (syncRequestCount !== syncRequestsBeforeSetup + 1) {
    throw new Error(`Event Setup preview issued ${syncRequestCount - syncRequestsBeforeSetup} sync request(s); expected exactly one.`);
  }

  const previewStateText = await page.getByRole("region", { name: "Event setup" }).textContent();
  assertCurrentEventPreview(previewStateText);
  assertSafeEventSourceRollover(previewStateText);

  const results = await request(
    "Live Picks scoring projection",
    `${supabaseOrigin}/rest/v1/rpc/get_my_pick_summary`,
    {
      method: "POST",
      headers: {
        ...publicHeaders,
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("octagon-hq-access-token") ?? "")}`,
      },
      body: JSON.stringify({ p_season: 2026 }),
    },
  );
  const expectedSummaryFields = [
    "completed_events",
    "correct_picks",
    "total_picks",
    "base_points",
    "underdog_lock_bonus_points",
    "total_points",
    "season_rank",
  ];
  for (const field of expectedSummaryFields) {
    if (!Number.isInteger(Number(results.body?.[field]))) {
      throw new Error(`Live Picks scoring projection is missing integer field ${field}.`);
    }
  }

  console.log(`Live PIN/WebKit proof passed: ${monitoringOutcome}; Event Setup preview stayed non-destructive; scoring projection is healthy.`);
} finally {
  if (browser) await browser.close();
  if (userId) {
    await request(
      "Temporary owner grant cleanup",
      `${supabaseOrigin}/rest/v1/app_roles?user_id=eq.${encodeURIComponent(userId)}`,
      { method: "DELETE", headers: serviceHeaders },
      [200, 204],
    ).catch(() => undefined);
    await request(
      "Disposable profile cleanup",
      `${supabaseOrigin}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
      { method: "DELETE", headers: serviceHeaders },
      [200, 204],
    ).catch(() => undefined);
    await request(
      "Disposable Auth user cleanup",
      `${supabaseOrigin}/auth/v1/admin/users/${userId}`,
      { method: "DELETE", headers: serviceHeaders },
      [200, 204],
    ).catch(() => undefined);
  }
}
