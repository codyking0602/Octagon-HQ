import fs from "node:fs";
import { webkit } from "playwright";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const productionOrigin = process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev";
const expectedDeploymentSha = process.env.EXPECTED_DEPLOYMENT_SHA?.trim() ?? "";

if (!accessToken || !projectId) {
  throw new Error("Live PIN verification is not configured.");
}
if (expectedDeploymentSha && !/^[0-9a-f]{40}$/i.test(expectedDeploymentSha)) {
  throw new Error("The expected frontend deployment SHA must be a full commit SHA.");
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
  "x-client-info": "octagon-hq-live-pin-check/6",
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
    "Temporary Picks control owner grant",
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
  const screenshotPath = process.env.EVENT_SETUP_SCREENSHOT_PATH
    ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/picks-control-center-preview.png`;

  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      diagnostics.push(`console:${message.type()}: ${message.text()}`);
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

  await page.goto(`${productionOrigin}/picks/setup?browser-pin-check=${suffix}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.waitForURL(
    (url) => url.pathname === "/picks/control" && url.hash === "#setup",
    { timeout: 15_000 },
  );
  await page.getByText("PRIVATE PICKS OWNER", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });

  const ownerHeader = page.locator(".picks-control-center__header");
  await ownerHeader.getByRole("button", { name: "SIGN IN", exact: true }).click();
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
    (url) => url.pathname === "/picks/control" && url.hash === "#setup",
    { timeout: 15_000 },
  );

  const controlStatus = page.locator(".picks-control-center__status");
  try {
    await page.waitForFunction(() => {
      const status = document.querySelector(".picks-control-center__status")?.textContent?.trim() ?? "";
      return Boolean(status)
        && !["OWNER SIGN-IN REQUIRED", "LOADING CONTROL CENTER", "CHECKING NEXT EVENT"].includes(status);
    }, undefined, { timeout: 30_000 });
  } catch {
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
    const status = (await controlStatus.textContent().catch(() => ""))?.trim() || "missing";
    const headings = await page.locator("h1, h2").allTextContents().catch(() => []);
    throw new Error([
      `The unified Picks Control Center lifecycle did not resolve. Status: ${status}.`,
      `Headings: ${headings.map((heading) => heading.trim()).filter(Boolean).join(" | ") || "none"}.`,
      ...diagnostics,
    ].join("\n"));
  }

  const status = (await controlStatus.textContent())?.trim() ?? "";
  if (status === "CONTROL UNAVAILABLE" || status === "SETUP UNAVAILABLE") {
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
    throw new Error([
      `The unified Picks Control Center reported ${status}.`,
      ...diagnostics,
    ].join("\n"));
  }

  let lifecycleOutcome;
  if (status === "SET UP NEXT EVENT" || status === "REVIEW CARD") {
    await page.getByRole("heading", { name: "Event Setup", exact: true }).waitFor({ state: "visible", timeout: 15_000 });
    await page.getByLabel("MMA MANIA CARD URL (OPTIONAL)").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "CHECK FOR CARD UPDATES" }).waitFor({ state: "visible" });
    lifecycleOutcome = "loaded the no-active-event setup owner without invoking sync or publish";
  } else if (status === "PICKS OPEN") {
    await page.getByRole("heading", { name: "Monitoring Inbox", exact: true }).waitFor({ state: "visible", timeout: 15_000 });
    await page.getByText("ACTIVE", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });
    if (await page.getByText("INBOX UNAVAILABLE", { exact: true }).count()) {
      throw new Error("Monitoring Inbox rendered its unavailable state for the temporary owner.");
    }
    lifecycleOutcome = "loaded the published/open event with active owner-only monitoring";
  } else if (/FIGHT(?:S)? NEED RESULTS|PICKS CLOSED · RESULTS OPEN|EVENT COMPLETE/.test(status)) {
    await page.getByRole("heading", { name: "Fight Night Control", exact: true }).waitFor({ state: "visible", timeout: 15_000 });
    if (await page.getByText("CONTROL UNAVAILABLE", { exact: true }).count()) {
      throw new Error("Fight Night Control rendered its unavailable state for the temporary owner.");
    }
    lifecycleOutcome = "loaded the locked, result-entry, or completed event owner";
  } else {
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
    throw new Error(`The unified Picks Control Center returned an unrecognized lifecycle status: ${status}.`);
  }

  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(
    `PASS: WebKit verified live production frontend ${liveDeploymentSha}, redirected the legacy setup route to /picks/control#setup, preserved that canonical destination through owner sign-in at 390x844, and ${lifecycleOutcome}.`,
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
