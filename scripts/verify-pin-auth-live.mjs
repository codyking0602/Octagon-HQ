import fs from "node:fs";
import { webkit } from "playwright";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const productionOrigin = process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev";

if (!accessToken || !projectId) {
  throw new Error("Live PIN verification is not configured.");
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

async function request(stage, url, options = {}) {
  const response = await fetch(url, options);
  const body = await readBody(response);
  if (!response.ok) {
    throw new Error(`${stage}: HTTP ${response.status}; ${safeMessage(body)}`);
  }
  return { response, body };
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
  "x-client-info": "octagon-hq-live-pin-check/2",
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
    if (!response.url().includes("/functions/v1/pin-auth")) return;
    const request = response.request();
    const headers = await response.allHeaders();
    diagnostics.push(
      `response: ${request.method()} ${response.status()} allow-origin=${headers["access-control-allow-origin"] ?? "missing"} allow-headers=${headers["access-control-allow-headers"] ?? "missing"}`,
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

  console.log(
    "PASS: WebKit opened production Octagon HQ, submitted the visible PIN form, completed browser CORS, and loaded the UUID-linked profile.",
  );
} finally {
  if (browser) await browser.close().catch(() => undefined);
  if (userId) {
    await fetch(`${supabaseOrigin}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: serviceHeaders,
    }).catch(() => undefined);
  }
}
