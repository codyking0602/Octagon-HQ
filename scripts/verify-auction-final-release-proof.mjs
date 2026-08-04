import fs from "node:fs";
import crypto from "node:crypto";
import { webkit } from "playwright";
import { verifyLiveFrontendDelivery } from "./verify-live-frontend-delivery.mjs";

const expectedSha = process.env.EXPECTED_SOURCE_SHA?.trim().toLowerCase() ?? "";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const githubToken = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY ?? "codyking0602/Octagon-HQ";
const productionOrigin = (process.env.OCTAGON_PRODUCTION_ORIGIN ?? "https://octagon.hq-app.workers.dev").replace(/\/$/, "");
const proofPath = process.env.PROOF_PATH ?? "release-proof/auction-final-proof.json";
const screenshotDir = process.env.SCREENSHOT_DIR ?? "/tmp/auction-final-proof";

if (!/^[0-9a-f]{40}$/.test(expectedSha) || !accessToken || !projectId || !githubToken) {
  throw new Error("Exact release proof is not configured.");
}
fs.mkdirSync(new URL(`file://${proofPath}`).pathname.replace(/\/[^/]+$/, ""), { recursive: true });
fs.mkdirSync(screenshotDir, { recursive: true });

const proof = {
  status: "running",
  expected_sha: expectedSha,
  production_origin: productionOrigin,
  canonical_runs: {},
  backend: {},
  frontend: {},
  ui: {},
  cleanup: {},
};

async function body(response) {
  const text = await response.text();
  try { return text ? JSON.parse(text) : {}; } catch { return text; }
}

async function request(label, url, options = {}, statuses = [200]) {
  const response = await fetch(url, options);
  const result = await body(response);
  if (!statuses.includes(response.status)) {
    throw new Error(`${label}: HTTP ${response.status}; ${typeof result === "string" ? result.slice(0, 240) : JSON.stringify(result).slice(0, 240)}`);
  }
  return result;
}

async function github(path) {
  return request(`GitHub ${path}`, `https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "octagon-hq-auction-final-proof/1",
    },
  });
}

async function waitForRuns() {
  const required = [
    ["Deploy Supabase Backend", "push"],
    ["Deploy Cloudflare Frontend", "push"],
    ["Verify Live Frontend Delivery", "workflow_run"],
    ["Verify Live Notification Flow", "workflow_run"],
  ];
  const started = Date.now();
  while (Date.now() - started < 35 * 60_000) {
    const payload = await github(`/repos/${repository}/actions/runs?head_sha=${expectedSha}&per_page=100`);
    const runs = Array.isArray(payload?.workflow_runs) ? payload.workflow_runs : [];
    const selected = {};
    let ready = true;
    for (const [name, event] of required) {
      const candidates = runs.filter((run) => run.name === name && run.head_sha?.toLowerCase() === expectedSha && run.event === event)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      const passed = candidates.find((run) => run.status === "completed" && run.conclusion === "success");
      if (!passed) {
        ready = false;
        const failed = candidates.find((run) => run.status === "completed" && run.conclusion && run.conclusion !== "success");
        if (failed) throw new Error(`${name} failed for exact SHA ${expectedSha}: ${failed.html_url}`);
      } else {
        selected[name] = { id: passed.id, event: passed.event, url: passed.html_url, completed_at: passed.updated_at };
      }
    }
    if (ready) return selected;
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  }
  throw new Error(`Timed out waiting for canonical exact-SHA release workflows for ${expectedSha}.`);
}

async function managementQuery(query) {
  const payload = await request(
    "Supabase read-only SQL",
    `https://api.supabase.com/v1/projects/${projectId}/database/query/read-only`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    },
    [200, 201],
  );
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.data)) return payload.data;
  throw new Error(`Unexpected SQL response shape: ${JSON.stringify(payload).slice(0, 300)}`);
}

const launchSql = `
with campaign as (
  select min(event.occurred_at) as campaign_at
  from private.notification_events event
  where event.source_key = 'new-game:auction'
), target_profiles as (
  select profile.id
  from public.profiles profile
  join auth.users auth_user on auth_user.id = profile.id
  cross join campaign
  where campaign.campaign_at is not null
    and auth_user.created_at <= campaign.campaign_at
), launch_events as (
  select event.*
  from private.notification_events event
  where event.source_key = 'new-game:auction'
), launch_groups as (
  select notification.*
  from private.notification_groups notification
  where notification.aggregation_key = 'new-game:auction'
), expected_subscriptions as (
  select subscription.id
  from private.notification_push_subscriptions subscription
  join target_profiles target on target.id = subscription.profile_id
  cross join campaign
  where subscription.enabled
    and subscription.created_at <= campaign.campaign_at
), launch_deliveries as (
  select delivery.*, subscription.profile_id, profile.display_name
  from private.notification_push_deliveries delivery
  join launch_groups notification on notification.id = delivery.notification_id
  join private.notification_push_subscriptions subscription on subscription.id = delivery.subscription_id
  join public.profiles profile on profile.id = subscription.profile_id
)
select
  exists(select 1 from supabase_migrations.schema_migrations where version = '202609030003') as migration_recorded,
  (select campaign_at from campaign) as campaign_at,
  (select count(*) from target_profiles)::integer as target_count,
  (select count(*) from launch_events)::integer as event_count,
  (select count(distinct recipient_profile_id) from launch_events)::integer as distinct_recipient_count,
  (select count(*) from launch_groups)::integer as group_count,
  (select count(*) from launch_groups where kind = 'new_game_available' and category = 'games' and priority = 'push_candidate' and title = 'Auction is live' and summary = 'Build your collection through sealed bids and challenge another Octagon HQ member.' and route = '/play/auction' and action_label = 'PLAY NOW' and aggregate_count = 1)::integer as exact_group_count,
  (select count(*) from (select recipient_profile_id from launch_events group by recipient_profile_id having count(*) <> 1) duplicate)::integer as duplicate_recipient_count,
  (select count(*) from launch_events event where not exists (select 1 from target_profiles target where target.id = event.recipient_profile_id))::integer as late_profile_event_count,
  (select count(*) from expected_subscriptions)::integer as expected_push_delivery_count,
  (select count(*) from launch_deliveries)::integer as push_delivery_count,
  (select count(*) from launch_deliveries where status = 'sent' and http_status between 200 and 299)::integer as push_sent_count,
  (select count(*) from launch_deliveries where status <> 'sent' or http_status not between 200 and 299)::integer as push_not_sent_count,
  (select count(*) from launch_deliveries where status = 'sent' and http_status between 200 and 299 and display_name ~* '(TEST|HQCHECK|CODEX|PROOF|DISPOSABLE)')::integer as test_profile_push_sent_count;
`;

async function waitForLaunchProof() {
  const started = Date.now();
  let row;
  while (Date.now() - started < 120_000) {
    [row] = await managementQuery(launchSql);
    const expected = Number(row?.expected_push_delivery_count ?? 0);
    const sent = Number(row?.push_sent_count ?? 0);
    if (row?.migration_recorded === true && expected > 0 && sent === expected && Number(row?.push_not_sent_count ?? 0) === 0) return row;
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
  throw new Error(`Auction launch push proof did not settle: ${JSON.stringify(row)}`);
}

async function projectKeys() {
  const keys = await request("Supabase project keys", `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const list = Array.isArray(keys) ? keys : [];
  const publishableKey = list.find((item) => item.type === "publishable")?.api_key
    ?? list.find((item) => item.type === "legacy" && /anon/i.test(item.name ?? ""))?.api_key;
  const secretKey = list.find((item) => item.type === "secret")?.api_key
    ?? list.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;
  if (!publishableKey || !secretKey) throw new Error("Supabase project keys unavailable.");
  return { publishableKey, secretKey };
}

async function createProfile({ supabaseOrigin, serviceHeaders, email, password, displayName, initials, pin }) {
  const user = await request(`Create ${displayName}`, `${supabaseOrigin}/auth/v1/admin/users`, {
    method: "POST", headers: serviceHeaders,
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { display_name: displayName } }),
  });
  if (!user?.id) throw new Error(`No user ID for ${displayName}.`);
  await request(`Register ${displayName}`, `${supabaseOrigin}/rest/v1/rpc/register_pin_profile`, {
    method: "POST", headers: serviceHeaders,
    body: JSON.stringify({ p_profile_id: user.id, p_display_name: displayName, p_initials: initials, p_internal_email: email, p_pin: pin }),
  });
  return user.id;
}

async function assetSha(path) {
  const response = await fetch(`${productionOrigin}${path}?proof=${expectedSha}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}.`);
  return crypto.createHash("sha256").update(Buffer.from(await response.arrayBuffer())).digest("hex");
}

let browser;
let creatorId = "";
let opponentId = "";
try {
  const main = await github(`/repos/${repository}/branches/main`);
  if (main?.commit?.sha?.toLowerCase() !== expectedSha) throw new Error(`Current main moved from ${expectedSha}.`);

  proof.canonical_runs = await waitForRuns();
  const live = await verifyLiveFrontendDelivery({ origin: productionOrigin, expectedSha, attempts: 8, delayMs: 5_000 });
  const jonSha = await assetSha("/auction/jon-jones-performances.webp");
  const rampageSha = await assetSha("/auction/nicknames.webp");
  if (jonSha !== "28dd1e815471c27baffe6e80d0b03cc12cda1572bb5a42465792c89216ab531c") throw new Error(`Jon artwork SHA mismatch: ${jonSha}`);
  if (rampageSha !== "f87a950f86b2741fe89735be0c8600f48eebcd74f7a36b74aaf8ffcf057c2117") throw new Error(`Rampage artwork SHA mismatch: ${rampageSha}`);
  proof.frontend = { marker_sha: expectedSha, javascript_assets: live.javascriptAssets, stylesheet_assets: live.stylesheetAssets, auction_assets: live.auctionFormatAssets, jon_sha256: jonSha, rampage_sha256: rampageSha };

  const launch = await waitForLaunchProof();
  const pushConfig = await request("Push deployment marker", `https://${projectId}.supabase.co/functions/v1/deliver-notification-push`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: productionOrigin }, body: JSON.stringify({ mode: "configuration" }),
  });
  if (pushConfig?.deployment_sha !== expectedSha) throw new Error(`Push function deployment SHA is ${pushConfig?.deployment_sha ?? "missing"}.`);
  proof.backend = { ...launch, push_function_sha: pushConfig.deployment_sha };

  const { publishableKey, secretKey } = await projectKeys();
  const supabaseOrigin = `https://${projectId}.supabase.co`;
  const serviceHeaders = { Authorization: `Bearer ${secretKey}`, apikey: secretKey, "Content-Type": "application/json" };
  const suffix = `${process.env.GITHUB_RUN_ID ?? Date.now()}${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`;
  const creatorName = `HQAUC${suffix}A`.slice(0, 24);
  const opponentName = `HQAUC${suffix}B`.slice(0, 24);
  const password = `AuctionProof-${suffix}!Aa1`;
  creatorId = await createProfile({ supabaseOrigin, serviceHeaders, email: `hqauc-${suffix}-a@login.octagon-hq.app`, password, displayName: creatorName, initials: "HA", pin: "4861" });
  opponentId = await createProfile({ supabaseOrigin, serviceHeaders, email: `hqauc-${suffix}-b@login.octagon-hq.app`, password, displayName: opponentName, initials: "HB", pin: "4862" });

  browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "en-US" });
  const page = await context.newPage();
  await page.goto(`${productionOrigin}/play/auction?final-proof=${suffix}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.getByRole("heading", { name: "Auction", exact: true }).first().waitFor({ state: "visible", timeout: 15_000 });
  await page.getByRole("button", { name: "SIGN IN TO PLAY" }).click();
  await page.getByLabel("YOUR NAME").fill(creatorName);
  await page.getByLabel("YOUR 4-DIGIT PIN").fill("4861");
  await page.getByRole("button", { name: "ENTER HQ" }).click();
  await page.locator(".auction-catalog ol").waitFor({ state: "visible", timeout: 15_000 });

  const screen1 = await page.evaluate(() => {
    const hero = document.querySelector(".auction-hero")?.getBoundingClientRect();
    const cards = [...document.querySelectorAll(".auction-catalog li")];
    const images = [...document.querySelectorAll(".auction-catalog__image")];
    return { hero_height: hero?.height ?? 0, card_count: cards.length, min_card_height: Math.min(...cards.map((card) => card.getBoundingClientRect().height)), image_count: images.length, images_ready: images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth === 720 && image.naturalHeight === 405), title_count: cards.filter((card) => card.querySelector(".auction-catalog__name")?.textContent?.trim()).length };
  });
  if (screen1.hero_height <= 0 || screen1.hero_height > 155 || screen1.card_count !== 16 || screen1.image_count !== 16 || !screen1.images_ready || screen1.title_count !== 16 || screen1.min_card_height < 108) throw new Error(`Screen 1 compact catalog proof failed: ${JSON.stringify(screen1)}`);
  const screen1Path = `${screenshotDir}/screen-1.png`;
  await page.screenshot({ path: screen1Path, fullPage: true });

  await page.getByRole("button", { name: /JON JONES PERFORMANCES/i }).click();
  await page.getByRole("button", { name: /CHOOSE OPPONENT/i }).click();
  await page.locator(".auction-opponents__summary").waitFor({ state: "visible", timeout: 10_000 });
  const screen2 = await page.evaluate(() => ({ artwork_images: document.querySelectorAll(".auction-opponents__image").length, summary_height: document.querySelector(".auction-opponents__summary")?.getBoundingClientRect().height ?? 0, summary_text: document.querySelector(".auction-opponents__summary")?.textContent?.replace(/\s+/g, " ").trim() ?? "" }));
  if (screen2.artwork_images !== 0 || !screen2.summary_text.includes("SELECTED AUCTION") || !screen2.summary_text.includes("Jon Jones Performances") || screen2.summary_height > 90) throw new Error(`Screen 2 no-photo proof failed: ${JSON.stringify(screen2)}`);
  const screen2Path = `${screenshotDir}/screen-2.png`;
  await page.screenshot({ path: screen2Path, fullPage: true });

  await page.getByLabel("Auction opponent profile name").fill(opponentName);
  await page.getByRole("button", { name: "PREPARE AUCTION" }).click();
  await page.locator(".auction-board__header").waitFor({ state: "visible", timeout: 15_000 });
  const screen3 = await page.evaluate(() => ({ artwork_images: document.querySelectorAll(".auction-board__image").length, header_images: document.querySelectorAll(".auction-board__header img").length, header_height: document.querySelector(".auction-board__header")?.getBoundingClientRect().height ?? 0, header_text: document.querySelector(".auction-board__header")?.textContent?.replace(/\s+/g, " ").trim() ?? "", refresh_visible: [...document.querySelectorAll("button")].some((button) => button.textContent?.trim() === "REFRESH" && button.getBoundingClientRect().height > 0) }));
  if (screen3.artwork_images !== 0 || screen3.header_images !== 0 || screen3.header_height <= 0 || screen3.header_height > 100 || !screen3.header_text.includes("Jon Jones Performances") || !screen3.refresh_visible) throw new Error(`Screen 3 no-photo proof failed: ${JSON.stringify(screen3)}`);
  const screen3Path = `${screenshotDir}/screen-3.png`;
  await page.screenshot({ path: screen3Path, fullPage: true });
  proof.ui = { viewport: "390x844", screen_1: screen1, screen_2: screen2, screen_3: screen3, screenshots: [screen1Path, screen2Path, screen3Path].map((path) => ({ name: path.split("/").at(-1), bytes: fs.statSync(path).size, sha256: crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex") })) };

  proof.status = "passed";
} catch (error) {
  proof.status = "failed";
  proof.error = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => undefined);
  try {
    const { secretKey } = await projectKeys();
    const headers = { Authorization: `Bearer ${secretKey}`, apikey: secretKey };
    for (const id of [opponentId, creatorId]) {
      if (id) await fetch(`https://${projectId}.supabase.co/auth/v1/admin/users/${id}`, { method: "DELETE", headers });
    }
    proof.cleanup = { disposable_profiles_deleted: [creatorId, opponentId].filter(Boolean).length };
  } catch (cleanupError) {
    proof.cleanup = { error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError) };
    if (proof.status === "passed") { proof.status = "failed"; proof.error = "Disposable profile cleanup failed."; process.exitCode = 1; }
  }
  fs.writeFileSync(proofPath, `${JSON.stringify(proof, null, 2)}\n`);
  console.log(`${proof.status.toUpperCase()}: ${proofPath}`);
}
