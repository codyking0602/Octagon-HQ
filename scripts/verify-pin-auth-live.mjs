import fs from "node:fs";
import { webkit } from "playwright";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const productionOrigin = process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev";
const expectedDeploymentSha = process.env.EXPECTED_DEPLOYMENT_SHA?.trim() ?? "";
const articleUrl = "https://www.mmamania.com/ufc-fight-cards/446488/latest-ufc-belgrade-fight-card-paramount-start-time-date-and-location-medic-vs-rodriguez-mma";

if (!accessToken || !projectId) {
  throw new Error("Live PIN verification is not configured.");
}
if (expectedDeploymentSha && !/^[0-9a-f]{40}$/i.test(expectedDeploymentSha)) {
  throw new Error("EXPECTED_DEPLOYMENT_SHA must be a full commit SHA.");
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

if (expectedDeploymentSha) {
  const marker = await request(
    "Live frontend deployment marker",
    `${productionOrigin}/deployment.json?expected=${expectedDeploymentSha}&run=${process.env.GITHUB_RUN_ID ?? Date.now()}`,
    { headers: { "Cache-Control": "no-cache" } },
  );
  if (marker.body?.sha !== expectedDeploymentSha) {
    throw new Error(
      `Live frontend deployment marker: expected ${expectedDeploymentSha}, received ${marker.body?.sha ?? "missing"}.`,
    );
  }
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
  "x-client-info": "octagon-hq-live-pin-check/3",
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

  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      diagnostics.push(`console:${message.type()}: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (request.url().includes("supabase.co")) {
      diagnostics.push(
        `requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? "unknown"}`,
      );
    }
  });
  page.on("response", async (response) => {
    if (!response.url().includes("/functions/v1/")) return;
    const request = response.request();
    const headers = await response.allHeaders();
    diagnostics.push(
      `response: ${request.method()} ${response.status()} ${response.url().split("/functions/v1/")[1]} allow-origin=${headers["access-control-allow-origin"] ?? "missing"}`,
    );
  });

  await page.goto(`${productionOrigin}/?browser-pin-check=${suffix}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
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

  await page.goto(`${productionOrigin}/picks/setup?event-preview-check=${suffix}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.getByRole("heading", { name: "Event Setup" }).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByLabel("MMA MANIA CARD URL (OPTIONAL)").fill(articleUrl);
  await page.getByRole("button", { name: "CHECK FOR CARD UPDATES" }).click();
  await page.getByText("SOURCE REVIEW · NOT APPLIED").waitFor({ state: "visible", timeout: 30_000 });
  await page.getByRole("heading", { name: "Main card · 4 fights" }).waitFor({ state: "visible" });
  await page.getByText("Uroš Medić vs. Daniel Rodriguez", { exact: true }).first().waitFor({ state: "visible" });
  await page.getByText(/Belgrade Arena.*Belgrade, Serbia/).first().waitFor({ state: "visible" });
  await page.getByText("Marcin Tybura vs. Aleksandar Rakić", { exact: true }).waitFor({ state: "visible" });
  await page.getByText("Ante Delija vs. Johnny Walker", { exact: true }).waitFor({ state: "visible" });
  await page.getByText("Jan Błachowicz vs. Bogdan Guskov", { exact: true }).waitFor({ state: "visible" });

  const visibleText = await page.locator("body").innerText();
  if (/iframe|googletagmanager|skip\s+to\s+main|src\s*=/i.test(visibleText)) {
    throw new Error("Event Setup source review exposed polluted UFC visible-page metadata.");
  }
  if (/Bogdan Guskov 2\b/.test(visibleText)) {
    throw new Error("Event Setup source review exposed the article-only Bogdan Guskov rematch marker.");
  }
  const falsePairChanges = visibleText.split("\n").filter((line) => /\b(?:added|removed)\b/i.test(line));
  if (falsePairChanges.some((line) => /medic.*rodriguez|rodriguez.*medic/i.test(line))) {
    throw new Error(`Event Setup reported a false Medic-Rodriguez change: ${falsePairChanges.join(" | ")}`);
  }
  if (falsePairChanges.some((line) => /tybura.*raki|raki.*tybura/i.test(line))) {
    throw new Error(`Event Setup reported a false Tybura-Rakic change: ${falsePairChanges.join(" | ")}`);
  }
  if (await page.getByRole("button", { name: "PUBLISH CARD" }).count()) {
    throw new Error("Publish controls remained visible during the read-only source review.");
  }

  const screenshotPath = process.env.EVENT_SETUP_SCREENSHOT_PATH
    ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/event-setup-preview.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(
    `PASS: WebKit verified exact production frontend ${expectedDeploymentSha || "(SHA not requested)"}, authenticated at 390x844, opened Event Setup, and displayed the clean four-fight UFC Belgrade source review without Apply or Publish.`,
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
