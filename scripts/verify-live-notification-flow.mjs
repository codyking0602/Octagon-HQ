import fs from "node:fs";
import { webkit } from "playwright";
import { verifyLiveFrontendDelivery } from "./verify-live-frontend-delivery.mjs";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const githubToken = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY ?? "codyking0602/Octagon-HQ";
const expectedMainSha = process.env.EXPECTED_LIVE_MAIN_SHA?.trim().toLowerCase() ?? "";
const productionOrigin = (process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev").replace(/\/$/, "");

if (!accessToken || !projectId || !githubToken) {
  throw new Error("Live notification verification is not configured.");
}
if (!/^[0-9a-f]{40}$/.test(expectedMainSha)) {
  throw new Error("An exact current-main SHA is required for live notification verification.");
}

const supabaseOrigin = `https://${projectId}.supabase.co`;

async function readBody(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return text;
  }
}

function safeMessage(body) {
  const value = typeof body === "string"
    ? body
    : body?.message ?? body?.msg ?? body?.error_description ?? body?.error ?? "No response message.";
  return String(value).replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]");
}

async function request(stage, url, options = {}, acceptedStatuses = [200]) {
  const response = await fetch(url, options);
  const body = await readBody(response);
  if (!acceptedStatuses.includes(response.status)) {
    throw new Error(`${stage}: HTTP ${response.status}; ${safeMessage(body)}`);
  }
  return { response, body };
}

async function githubRequest(path) {
  return request(
    `GitHub ${path}`,
    `https://api.github.com${path}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "octagon-hq-live-notification-proof/1",
      },
    },
  );
}

function requireSuccessfulRun(runs, name, expectedEvent) {
  const candidates = runs
    .filter((run) => run?.name === name && run?.head_sha?.toLowerCase() === expectedMainSha)
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
  const successful = candidates.find((run) => (
    run.status === "completed"
    && run.conclusion === "success"
    && (!expectedEvent || run.event === expectedEvent)
  ));
  if (!successful) {
    const state = candidates.map((run) => `${run.status}/${run.conclusion ?? "none"}/${run.event}`).join(", ") || "missing";
    throw new Error(`${name} has not passed for ${expectedMainSha}; exact-SHA runs: ${state}.`);
  }
  return successful;
}

async function loadSnapshot(token, publishableKey) {
  const result = await request(
    "Notification snapshot",
    `${supabaseOrigin}/rest/v1/rpc/get_notification_snapshot`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: publishableKey,
        "Content-Type": "application/json",
        Origin: productionOrigin,
      },
      body: JSON.stringify({ p_limit: 50 }),
    },
  );
  return result.body;
}

async function waitForSnapshot(token, publishableKey, predicate, label, timeoutMs = 15_000) {
  const started = Date.now();
  let snapshot;
  while (Date.now() - started < timeoutMs) {
    snapshot = await loadSnapshot(token, publishableKey);
    if (predicate(snapshot)) return snapshot;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${label}: timed out with snapshot ${JSON.stringify(snapshot)}`);
}

const branch = await githubRequest(`/repos/${repository}/branches/main`);
const currentMainSha = branch.body?.commit?.sha?.toLowerCase() ?? "";
if (currentMainSha !== expectedMainSha) {
  throw new Error(`Current main moved: expected ${expectedMainSha}, received ${currentMainSha || "missing"}.`);
}

const workflowRuns = await githubRequest(
  `/repos/${repository}/actions/runs?head_sha=${expectedMainSha}&per_page=100`,
);
const runs = Array.isArray(workflowRuns.body?.workflow_runs) ? workflowRuns.body.workflow_runs : [];
const deployRun = requireSuccessfulRun(runs, "Deploy Cloudflare Frontend", "push");
const deliveryRun = requireSuccessfulRun(runs, "Verify Live Frontend Delivery", "workflow_run");
if (new Date(deliveryRun.created_at).getTime() < new Date(deployRun.updated_at).getTime()) {
  throw new Error("Verify Live Frontend Delivery completed before the exact frontend deployment it should prove.");
}

const liveDelivery = await verifyLiveFrontendDelivery({
  origin: productionOrigin,
  expectedSha: expectedMainSha,
});

const keysResult = await request(
  "Project key lookup",
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);
const keys = Array.isArray(keysResult.body) ? keysResult.body : [];
const publishableKey = keys.find((item) => item.type === "publishable")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /anon/i.test(item.name ?? ""))?.api_key;
const secretKey = keys.find((item) => item.type === "secret")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;
if (!publishableKey || !secretKey) throw new Error("Project keys are unavailable.");

const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};
const suffix = `${process.env.GITHUB_RUN_ID ?? Date.now()}${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`;
const creatorName = `HQNC${suffix}`.slice(0, 24);
const recipientName = `HQNR${suffix}`.slice(0, 24);
const creatorEmail = `hqnc-${suffix}@login.octagon-hq.app`;
const recipientEmail = `hqnr-${suffix}@login.octagon-hq.app`;
const password = `Notification-${suffix}!Aa1`;
const creatorPin = "4831";
const recipientPin = "4832";
let creatorId = "";
let recipientId = "";
let browser;

async function createProfile(email, displayName, initials, pin) {
  const created = await request(
    `Create ${displayName}`,
    `${supabaseOrigin}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      }),
    },
  );
  const id = created.body?.id;
  if (!id) throw new Error(`${displayName} creation did not return a user ID.`);
  await request(
    `Register ${displayName}`,
    `${supabaseOrigin}/rest/v1/rpc/register_pin_profile`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        p_profile_id: id,
        p_display_name: displayName,
        p_initials: initials,
        p_internal_email: email,
        p_pin: pin,
      }),
    },
  );
  return id;
}

async function passwordToken(email) {
  const result = await request(
    `Authenticate ${email}`,
    `${supabaseOrigin}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );
  const token = result.body?.access_token;
  if (!token) throw new Error("Password authentication did not return an access token.");
  return token;
}

try {
  creatorId = await createProfile(creatorEmail, creatorName, "NC", creatorPin);
  recipientId = await createProfile(recipientEmail, recipientName, "NR", recipientPin);
  const creatorToken = await passwordToken(creatorEmail);
  const recipientToken = await passwordToken(recipientEmail);

  const challenge = await request(
    "Create canonical Find the Leader challenge",
    `${supabaseOrigin}/rest/v1/rpc/create_play_challenge`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creatorToken}`,
        apikey: publishableKey,
        "Content-Type": "application/json",
        Origin: productionOrigin,
      },
      body: JSON.stringify({
        p_recipient_id: recipientId,
        p_game_id: "find-leader",
        p_game_version: "v1",
        p_game_title: "Find the Leader",
        p_summary: "Live notification proof",
        p_play_url: "/play/find-leader",
        p_setup: {},
        p_creator_result: {},
      }),
    },
  );
  const code = String(challenge.body ?? "").replace(/^"|"$/g, "").trim();
  if (!/^[A-Z0-9]{8}$/.test(code)) {
    throw new Error(`Challenge creation returned an invalid code: ${code || "missing"}.`);
  }

  const expectedRoute = `/play/find-leader?challenge=${code}`;
  const recipientSnapshot = await waitForSnapshot(
    recipientToken,
    publishableKey,
    (snapshot) => Array.isArray(snapshot?.items) && snapshot.items.some((item) => (
      item?.kind === "game_challenge_received"
      && item?.title === "You were challenged"
      && item?.route === expectedRoute
      && item?.is_read === false
    )),
    "Recipient notification persistence",
  );
  const received = recipientSnapshot.items.find((item) => item?.kind === "game_challenge_received");
  if (received?.summary !== `${creatorName} challenged you to Find the Leader.`) {
    throw new Error(`Recipient notification summary mismatch: ${received?.summary ?? "missing"}.`);
  }
  if (Number(recipientSnapshot.unread_count) !== 1) {
    throw new Error(`Recipient unread count should be 1, received ${recipientSnapshot.unread_count}.`);
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
    diagnostics.push(`requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? "unknown"}`);
  });

  await page.goto(`${productionOrigin}/notifications?live-notification-proof=${suffix}`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await page.getByRole("heading", { name: "Notifications", exact: true }).waitFor({
    state: "visible",
    timeout: 15_000,
  });
  await page.getByRole("button", { name: "Sign in to Octagon HQ" }).click();
  await page.getByLabel("YOUR NAME").fill(recipientName);
  await page.getByLabel("YOUR 4-DIGIT PIN").fill(recipientPin);
  await page.getByRole("button", { name: "ENTER HQ" }).click();

  await page.getByRole("button", { name: `Open ${recipientName} profile menu` }).waitFor({
    state: "visible",
    timeout: 15_000,
  });
  await page.waitForURL((url) => url.pathname === "/notifications", { timeout: 15_000 });

  const notification = page.locator("article.notification-item").filter({ hasText: "You were challenged" }).first();
  try {
    await notification.waitFor({ state: "visible", timeout: 15_000 });
  } catch {
    throw new Error([
      "Live Notification Center did not render the persisted challenge notification.",
      ...diagnostics,
    ].join("\n"));
  }
  const visibleNotification = (await notification.innerText()).replace(/\s+/g, " ").trim();
  for (const expected of [creatorName, "Find the Leader", "VIEW CHALLENGE", "NEW"]) {
    if (!visibleNotification.includes(expected)) {
      throw new Error(`Live notification is missing ${expected}: ${visibleNotification}`);
    }
  }

  const screenshotPath = process.env.NOTIFICATION_E2E_SCREENSHOT_PATH
    ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/notification-e2e.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const notificationLink = notification.locator("a.notification-item__main");
  await notificationLink.click();
  await page.waitForURL((url) => (
    url.pathname === "/play/find-leader" && url.searchParams.get("challenge") === code
  ), { timeout: 15_000 });
  await page.getByText("Find the Leader", { exact: true }).first().waitFor({ state: "visible", timeout: 15_000 });

  await waitForSnapshot(
    recipientToken,
    publishableKey,
    (snapshot) => Array.isArray(snapshot?.items) && snapshot.items.some((item) => (
      item?.kind === "game_challenge_received" && item?.is_read === true
    )),
    "Notification read state after deep-link open",
  );
  await waitForSnapshot(
    creatorToken,
    publishableKey,
    (snapshot) => Array.isArray(snapshot?.items) && snapshot.items.some((item) => (
      item?.kind === "game_challenge_accepted"
      && item?.title === "Your challenge was accepted"
      && item?.route === expectedRoute
      && item?.is_read === false
    )),
    "Challenge acceptance notification after deep-link open",
  );

  console.log(
    `PASS: current main ${expectedMainSha} has successful frontend deploy and live-delivery workflows; the live shell loads ${liveDelivery.javascriptAssets} JavaScript and ${liveDelivery.stylesheetAssets} CSS assets from that exact deployment; canonical challenge ${code} created the correct unread notification for ${recipientName}; Notification Center rendered it and opened ${expectedRoute}; the open marked it read and created the creator acceptance notification.`,
  );
} finally {
  if (browser) await browser.close().catch(() => undefined);
  for (const userId of [recipientId, creatorId]) {
    if (!userId) continue;
    await fetch(`${supabaseOrigin}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: serviceHeaders,
    }).catch(() => undefined);
  }
}
