import { webkit } from "playwright";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const productionOrigin = process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev";
const expectedMainSha = (process.env.EXPECTED_MAIN_SHA ?? "").trim();
const screenshotPath = process.env.PICKS_DEADLINE_SCREENSHOT_PATH
  ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/picks-deadline-control-mobile.png`;

if (!accessToken || !projectId || !/^[0-9a-f]{40}$/i.test(expectedMainSha)) {
  throw new Error("Live mobile Picks deadline verification is not configured.");
}

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
    const message = String(body?.message ?? body?.error ?? "No response message.")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]");
    throw new Error(`${stage}: HTTP ${response.status}; ${message}`);
  }
  return body;
}

const marker = await request(
  "Live frontend deployment marker",
  `${productionOrigin}/deployment.json?picks-deadline-proof=${Date.now()}`,
  { headers: { "Cache-Control": "no-cache" } },
);
if (marker.sha !== expectedMainSha) {
  throw new Error(
    `Live frontend marker expected current main ${expectedMainSha}, received ${marker.sha ?? "missing"}.`,
  );
}

const supabaseOrigin = `https://${projectId}.supabase.co`;
const keys = await request(
  "Project key lookup",
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);
const publishableKey = keys.find((item) => item.type === "publishable")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /anon/i.test(item.name ?? ""))?.api_key;
const secretKey = keys.find((item) => item.type === "secret")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;
if (!publishableKey || !secretKey) {
  throw new Error("Project keys are unavailable.");
}

const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};
const suffix = `${process.env.GITHUB_RUN_ID ?? Date.now()}${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`;
const displayName = `DEADLINE${suffix}`.slice(0, 24);
const authEmail = `deadline-${suffix}@login.octagon-hq.app`;
const pin = "5937";
const password = `Deadline-${suffix}!Aa1`;
let userId = "";
let browser;
let primaryError;

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
  if (!userId) throw new Error("Disposable Auth user response did not include an ID.");

  await request(
    "Disposable profile registration",
    `${supabaseOrigin}/rest/v1/rpc/register_pin_profile`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        p_profile_id: userId,
        p_display_name: displayName,
        p_initials: "D",
        p_internal_email: authEmail,
        p_pin: pin,
      }),
    },
  );
  await request(
    "Temporary Picks owner grant",
    `${supabaseOrigin}/rest/v1/pick_control_owners`,
    {
      method: "POST",
      headers: { ...serviceHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({ profile_id: userId }),
    },
    [201],
  );

  browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "en-US",
    timezoneId: "America/Chicago",
  });
  const page = await context.newPage();

  await page.goto(`${productionOrigin}/picks/control?deadline-proof=${suffix}#fight-night`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.getByText("PRIVATE PICKS OWNER", { exact: true })
    .waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: "Sign in to Octagon HQ" }).click();
  await page.getByLabel("YOUR NAME").fill(displayName);
  await page.getByLabel("YOUR 4-DIGIT PIN").fill(pin);
  await page.getByRole("button", { name: "ENTER HQ" }).click();
  await page.getByRole("button", { name: `Open ${displayName} profile menu` })
    .waitFor({ state: "visible", timeout: 15_000 });

  const status = page.locator(".picks-control-center__status");
  await status.waitFor({ state: "visible", timeout: 15_000 });
  await page.waitForFunction(() => {
    const text = document.querySelector(".picks-control-center__status")?.textContent?.trim() ?? "";
    return Boolean(text && ![
      "LOADING CONTROL CENTER",
      "CHECKING NEXT EVENT",
      "OWNER SIGN-IN REQUIRED",
    ].includes(text));
  }, undefined, { timeout: 15_000 });
  const lifecycle = (await status.textContent())?.trim() ?? "";
  if (lifecycle !== "PICKS OPEN") {
    throw new Error(`Expected PICKS OPEN, received ${lifecycle || "missing"}.`);
  }

  await page.locator("#pick-control-event-title")
    .filter({ hasText: "UFC Fight Night" })
    .waitFor({ state: "visible", timeout: 15_000 });
  await page.getByText("Mateusz Gamrot vs. Quillan Salkilld", { exact: true })
    .waitFor({ state: "visible", timeout: 15_000 });

  const cards = page.locator(
    'section.picks-control-bouts[aria-label*="pre-lock card controls"] article.pick-control-bout',
  );
  await cards.first().waitFor({ state: "visible", timeout: 15_000 });
  const count = await cards.count();
  if (count !== 5) {
    throw new Error(`Expected five live fight controls, received ${count}.`);
  }

  const expectedDeadlines = [
    "Sat, Aug 8, 7:00 PM",
    "Sat, Aug 8, 6:30 PM",
    "Sat, Aug 8, 6:00 PM",
    "Sat, Aug 8, 5:30 PM",
    "Sat, Aug 8, 5:00 PM",
  ];
  const visibleDeadlines = [];
  for (let index = 0; index < count; index += 1) {
    const card = cards.nth(index);
    const expectedHeading = index === 0 ? "MAIN EVENT" : `MAIN CARD · FIGHT ${index + 1}`;
    const heading = (await card.locator(".pick-control-bout__heading span").textContent())?.trim() ?? "";
    const deadline = (await card.locator(".picks-control-deadline strong").textContent())?.trim() ?? "";
    if (heading !== expectedHeading) {
      throw new Error(`Fight ${index + 1} heading expected ${expectedHeading}, received ${heading || "missing"}.`);
    }
    if (deadline !== expectedDeadlines[index]) {
      throw new Error(
        `Fight ${index + 1} visible deadline expected ${expectedDeadlines[index]}, received ${deadline || "missing"}.`,
      );
    }
    for (const label of ["+10 MIN", "+20 MIN", "SET TIME"]) {
      if (await card.getByRole("button", { name: label, exact: true }).count() !== 1) {
        throw new Error(`Fight ${index + 1} is missing the existing ${label} owner control.`);
      }
    }
    visibleDeadlines.push(deadline);
  }

  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(
    `PASS: live current-main Control Center displayed five Gamrot vs. Quillan deadlines at 390x844: ${visibleDeadlines.join(" | ")}.`,
  );
} catch (error) {
  primaryError = error;
} finally {
  await browser?.close().catch(() => undefined);
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

if (primaryError) throw primaryError;

const retainedProfiles = await request(
  "Temporary profile cleanup verification",
  `${supabaseOrigin}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id`,
  { headers: serviceHeaders },
);
if (!Array.isArray(retainedProfiles) || retainedProfiles.length !== 0) {
  throw new Error("Temporary deadline-proof profile was not removed.");
}
