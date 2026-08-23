import fs from "node:fs";
import { webkit } from "playwright";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const projectId = process.env.SUPABASE_PROJECT_ID?.trim();
const productionOrigin = (process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev").replace(/\/$/, "");
const screenshotPath = process.env.WHATS_NEW_SCREENSHOT_PATH
  ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/whats-new-live-proof.png`;

if (!accessToken || !projectId) {
  throw new Error("Live What's New verification requires Supabase project credentials.");
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

async function request(stage, url, options = {}, acceptedStatuses = [200]) {
  const response = await fetch(url, options);
  const body = await readBody(response);
  if (!acceptedStatuses.includes(response.status)) {
    throw new Error(`${stage}: HTTP ${response.status}; ${body?.message ?? body?.error ?? "request failed"}`);
  }
  return body;
}

const keys = await request(
  "Project key lookup",
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);
const publishableKey = keys.find((item) => item.type === "publishable")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /anon/i.test(item.name ?? ""))?.api_key;
const secretKey = keys.find((item) => item.type === "secret" && item.disabled !== true)?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;
if (!publishableKey || !secretKey) throw new Error("Required Supabase project keys are unavailable.");

const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};
const canonicalSnapshot = await request(
  "Canonical What's New snapshot",
  `${supabaseOrigin}/rest/v1/rpc/get_whats_new_snapshot`,
  {
    method: "POST",
    headers: serviceHeaders,
    body: JSON.stringify({ p_limit: 1 }),
  },
);
const expectedItem = Array.isArray(canonicalSnapshot?.items)
  ? canonicalSnapshot.items[0]
  : undefined;
if (!expectedItem?.id || !expectedItem?.title || !expectedItem?.summary) {
  throw new Error("Canonical What's New snapshot did not return a current visible item.");
}

const suffix = `${process.env.GITHUB_RUN_ID ?? Date.now()}${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`;
const displayName = `HQNEWS${suffix}`.slice(0, 24);
const authEmail = `hqnews-${suffix}@login.octagon-hq.app`;
const internalEmail = `hqnews-pin-${suffix}@login.octagon-hq.app`;
const password = `HealthCheck-${suffix}!Aa1`;
const pin = "4826";
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
  userId = created?.id ?? "";
  if (!userId) throw new Error("Disposable Auth user creation returned no user ID.");

  await request(
    "Disposable PIN profile registration",
    `${supabaseOrigin}/rest/v1/rpc/register_pin_profile`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        p_profile_id: userId,
        p_display_name: displayName,
        p_initials: "H",
        p_internal_email: internalEmail,
        p_pin: pin,
      }),
    },
  );

  browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "en-US" });
  const page = await context.newPage();
  const diagnostics = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      diagnostics.push(`console:${message.type()}: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (request.url().includes("supabase.co")) {
      diagnostics.push(`requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? "unknown"}`);
    }
  });

  await page.goto(`${productionOrigin}/whats-new?live-proof=${suffix}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.getByRole("heading", { name: "What's New", exact: true }).waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: "Sign in to Octagon HQ" }).click();
  await page.getByLabel("YOUR NAME").fill(displayName);
  await page.getByLabel("YOUR 4-DIGIT PIN").fill(pin);
  await page.getByRole("button", { name: "ENTER HQ" }).click();
  await page.getByRole("button", { name: `Open ${displayName} profile menu` })
    .waitFor({ state: "visible", timeout: 15_000 });

  const item = page.locator(".whats-new-item")
    .filter({ has: page.getByText(expectedItem.title, { exact: true }) })
    .filter({ has: page.getByText(expectedItem.summary, { exact: true }) })
    .first();
  try {
    await item.waitFor({ state: "visible", timeout: 15_000 });
    await item.getByText(expectedItem.title, { exact: true }).waitFor({ state: "visible" });
    await item.getByText(expectedItem.summary, { exact: true }).waitFor({ state: "visible" });
  } catch (error) {
    const body = await page.locator("body").innerText().catch(() => "");
    throw new Error([
      `The signed-in live What's New feed did not render canonical item ${expectedItem.id}: ${expectedItem.title}`,
      `Locator failure: ${error instanceof Error ? error.message : String(error)}`,
      `Visible feed text: ${body.slice(0, 1800)}`,
      ...diagnostics,
    ].join("\n"));
  }

  const expectedRoute = typeof expectedItem.route === "string" ? expectedItem.route : "";
  const expectedAction = typeof expectedItem.action_label === "string" ? expectedItem.action_label : "";
  if (expectedRoute) {
    const href = await item.getAttribute("href");
    if (href !== expectedRoute) {
      throw new Error(`Canonical What's New item links to ${href ?? "no route"}, expected ${expectedRoute}.`);
    }
    if (expectedAction) {
      await item.getByText(expectedAction, { exact: false }).waitFor({ state: "visible" });
    }
  } else if (await item.getAttribute("href")) {
    throw new Error("Canonical What's New item unexpectedly rendered a route when its snapshot route is null.");
  }

  await page.screenshot({ path: screenshotPath, fullPage: true });
  if (!fs.existsSync(screenshotPath) || fs.statSync(screenshotPath).size < 5_000) {
    throw new Error("The signed-in What's New screenshot was not created correctly.");
  }
  console.log(`PASS: signed-in live What's New renders canonical item ${expectedItem.id}: ${expectedItem.title}.`);
} finally {
  if (browser) await browser.close();
  if (userId) {
    await fetch(`${supabaseOrigin}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: serviceHeaders,
    }).catch(() => undefined);
  }
}