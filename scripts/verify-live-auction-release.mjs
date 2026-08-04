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
const screenshotPath = process.env.AUCTION_RELEASE_SCREENSHOT_PATH
  ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/auction-release-proof.png`;
const outsiderScreenshotPath = process.env.AUCTION_OUTSIDER_SCREENSHOT_PATH
  ?? `${process.env.RUNNER_TEMP ?? "/tmp"}/auction-outsider-proof.png`;

if (!accessToken || !projectId || !githubToken) {
  throw new Error("Live Auction release verification is not configured.");
}
if (!/^[0-9a-f]{40}$/.test(expectedMainSha)) {
  throw new Error("An exact current-main SHA is required for live Auction release verification.");
}

const supabaseOrigin = `https://${projectId}.supabase.co`;
const forbiddenPattern = /(private_item|pending_bid|future_deck|rarity_weight|rarity_class|grading_formula|grading_weight|intermediate_grade|category_grade|item_grade|winner_explanation|best_purchase|overpay|missed_opportunity|random_seed)/i;
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

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
        "User-Agent": "octagon-hq-live-auction-release-proof/1",
      },
    },
  );
}

async function waitForSuccessfulRun(name, expectedEvent, timeoutMs = 12 * 60_000) {
  const started = Date.now();
  let observed = "missing";
  while (Date.now() - started < timeoutMs) {
    const result = await githubRequest(
      `/repos/${repository}/actions/runs?head_sha=${expectedMainSha}&per_page=100`,
    );
    const runs = Array.isArray(result.body?.workflow_runs) ? result.body.workflow_runs : [];
    const candidates = runs
      .filter((run) => run?.name === name && run?.head_sha?.toLowerCase() === expectedMainSha)
      .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
    const successful = candidates.find((run) => (
      run.status === "completed"
      && run.conclusion === "success"
      && (!expectedEvent || run.event === expectedEvent)
    ));
    if (successful) return successful;
    const failed = candidates.find((run) => run.status === "completed" && run.conclusion !== "success");
    if (failed) {
      throw new Error(`${name} failed for ${expectedMainSha}: ${failed.html_url}`);
    }
    observed = candidates.map((run) => `${run.status}/${run.conclusion ?? "none"}/${run.event}`).join(", ") || "missing";
    await wait(10_000);
  }
  throw new Error(`${name} did not pass for ${expectedMainSha}; observed ${observed}.`);
}

function authHeaders(token, publishableKey) {
  return {
    Authorization: `Bearer ${token}`,
    apikey: publishableKey,
    "Content-Type": "application/json",
    Origin: productionOrigin,
  };
}

function scalar(body) {
  if (typeof body === "string") return body.replace(/^"|"$/g, "").trim();
  return body;
}

function firstRow(body, label) {
  if (Array.isArray(body) && body.length === 1) return body[0];
  if (body && typeof body === "object" && !Array.isArray(body)) return body;
  throw new Error(`${label} did not return one row: ${JSON.stringify(body)}`);
}

async function rpc(name, body, token, publishableKey, label = name) {
  return request(
    label,
    `${supabaseOrigin}/rest/v1/rpc/${name}`,
    {
      method: "POST",
      headers: authHeaders(token, publishableKey),
      body: JSON.stringify(body),
    },
  ).then((result) => result.body);
}

async function loadAuction(auctionId, token, publishableKey) {
  const body = await rpc(
    "get_auction_participant_state",
    { p_auction_id: auctionId },
    token,
    publishableKey,
    "Read Auction state",
  );
  if (Array.isArray(body) && body.length === 0) return null;
  return firstRow(body, "Auction state");
}

async function loadSnapshot(token, publishableKey) {
  return rpc("get_notification_snapshot", { p_limit: 50 }, token, publishableKey, "Notification snapshot");
}

async function waitForSnapshot(token, publishableKey, predicate, label, timeoutMs = 20_000) {
  const started = Date.now();
  let snapshot;
  while (Date.now() - started < timeoutMs) {
    snapshot = await loadSnapshot(token, publishableKey);
    if (predicate(snapshot)) return snapshot;
    await wait(500);
  }
  throw new Error(`${label}: timed out with ${JSON.stringify(snapshot)}`);
}

async function publicPreview(auctionId, publishableKey) {
  return rpc(
    "get_rich_preview_data",
    { p_kind: "auction", p_key: auctionId },
    publishableKey,
    publishableKey,
    "Auction public preview",
  );
}

function assertSafeSurface(label, value) {
  const serialized = JSON.stringify(value);
  if (forbiddenPattern.test(serialized)) {
    throw new Error(`${label} leaked a forbidden private Auction marker: ${serialized}`);
  }
}

async function crawlerPreview(auctionId, token) {
  const url = new URL("/play/auction", `${productionOrigin}/`);
  url.searchParams.set("auction", auctionId);
  url.searchParams.set("share", token);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)",
      "Cache-Control": "no-cache",
    },
  });
  const html = await response.text();
  if (!response.ok) throw new Error(`Auction crawler preview returned HTTP ${response.status}.`);
  assertSafeSurface("Auction crawler HTML", html);
  return {
    kind: response.headers.get("x-octagon-preview")?.toLowerCase() ?? "",
    html,
  };
}

async function createProfile(serviceHeaders, email, displayName, initials, pin, password) {
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

async function passwordToken(email, password, publishableKey) {
  const result = await request(
    `Authenticate ${email}`,
    `${supabaseOrigin}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );
  const token = result.body?.access_token;
  if (!token) throw new Error("Password authentication did not return an access token.");
  return token;
}

async function signInWithPin(page, displayName, pin) {
  await page.getByRole("button", { name: /sign in/i }).first().click();
  await page.getByLabel("YOUR NAME").fill(displayName);
  await page.getByLabel("YOUR 4-DIGIT PIN").fill(pin);
  await page.getByRole("button", { name: "ENTER HQ" }).click();
  await page.getByRole("button", { name: `Open ${displayName} profile menu` }).waitFor({
    state: "visible",
    timeout: 20_000,
  });
}

const branch = await githubRequest(`/repos/${repository}/branches/main`);
const currentMainSha = branch.body?.commit?.sha?.toLowerCase() ?? "";
if (currentMainSha !== expectedMainSha) {
  throw new Error(`Current main moved: expected ${expectedMainSha}, received ${currentMainSha || "missing"}.`);
}

const frontendRun = await waitForSuccessfulRun("Deploy Cloudflare Frontend", "push");
const deliveryRun = await waitForSuccessfulRun("Verify Live Frontend Delivery", "workflow_run");
const backendRun = await waitForSuccessfulRun("Deploy Supabase Backend", "push");
if (new Date(deliveryRun.created_at).getTime() < new Date(frontendRun.updated_at).getTime()) {
  throw new Error("Verify Live Frontend Delivery completed before the exact frontend deployment it proves.");
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
const profiles = [
  { role: "A", name: `HQA${suffix}`.slice(0, 24), email: `hqa-${suffix}@login.octagon-hq.app`, initials: "HA", pin: "6841", id: "", token: "" },
  { role: "B", name: `HQB${suffix}`.slice(0, 24), email: `hqb-${suffix}@login.octagon-hq.app`, initials: "HB", pin: "6842", id: "", token: "" },
  { role: "OUTSIDER", name: `HQO${suffix}`.slice(0, 24), email: `hqo-${suffix}@login.octagon-hq.app`, initials: "HO", pin: "6843", id: "", token: "" },
];
const password = `Auction-${suffix}!Aa1`;
let auctionId = "";
let challengeCode = "";
let browser;

try {
  for (const profile of profiles) {
    profile.id = await createProfile(
      serviceHeaders,
      profile.email,
      profile.name,
      profile.initials,
      profile.pin,
      password,
    );
    profile.token = await passwordToken(profile.email, password, publishableKey);
  }
  const [participantA, participantB, outsider] = profiles;

  auctionId = scalar(await rpc(
    "prepare_auction",
    { p_recipient_id: participantB.id, p_mode_id: "strikers" },
    participantA.token,
    publishableKey,
    "Prepare Auction",
  ));
  if (!/^[0-9a-f-]{36}$/i.test(auctionId)) {
    throw new Error(`Auction preparation returned invalid ID ${auctionId || "missing"}.`);
  }

  let stateA = await loadAuction(auctionId, participantA.token, publishableKey);
  if (!stateA || stateA.lifecycle_state !== "prepared" || stateA.current_round !== 1) {
    throw new Error(`Prepared Auction projection was invalid: ${JSON.stringify(stateA)}`);
  }
  assertSafeSurface("Prepared participant projection", stateA);
  if (await loadAuction(auctionId, participantB.token, publishableKey) !== null) {
    throw new Error("Recipient discovered the unsent prepared Auction.");
  }
  if (await loadAuction(auctionId, outsider.token, publishableKey) !== null) {
    throw new Error("Unrelated profile discovered the prepared Auction.");
  }
  if (await publicPreview(auctionId, publishableKey) !== null) {
    throw new Error("Prepared Auction exposed a completed public preview.");
  }
  const privateCrawler = await crawlerPreview(auctionId, `prepared-${suffix}`);
  if (privateCrawler.kind !== "auction" || !privateCrawler.html.includes("Private Auction")) {
    throw new Error(`Prepared Auction preview was not the generic private card: ${privateCrawler.kind}.`);
  }

  challengeCode = scalar(await rpc(
    "send_auction_first_bid",
    {
      p_auction_id: auctionId,
      p_expected_revision: stateA.revision,
      p_amount: 20,
      p_category: null,
    },
    participantA.token,
    publishableKey,
    "Send first Auction bid",
  ));
  if (!/^[A-Z0-9]{8}$/.test(challengeCode)) {
    throw new Error(`Auction send returned invalid challenge code ${challengeCode || "missing"}.`);
  }

  const exactRoute = `/play/auction?auction=${auctionId}`;
  const receivedSnapshot = await waitForSnapshot(
    participantB.token,
    publishableKey,
    (snapshot) => Array.isArray(snapshot?.items) && snapshot.items.some((item) => (
      item?.kind === "game_challenge_received"
      && item?.priority === "push_candidate"
      && item?.route === exactRoute
      && item?.is_read === false
    )),
    "Auction recipient notification",
  );
  assertSafeSurface("Received notification", receivedSnapshot);

  const outsiderSentState = await loadAuction(auctionId, outsider.token, publishableKey);
  if (outsiderSentState !== null) throw new Error("Unrelated profile discovered the sent Auction.");

  const stateB = await loadAuction(auctionId, participantB.token, publishableKey);
  if (!stateB || stateB.lifecycle_state !== "sent" || stateB.action_required_by !== "current_user") {
    throw new Error(`Recipient sent-state projection was invalid: ${JSON.stringify(stateB)}`);
  }
  await rpc(
    "submit_auction_bid",
    {
      p_auction_id: auctionId,
      p_round: stateB.current_round,
      p_expected_revision: stateB.revision,
      p_amount: 10,
      p_category: null,
    },
    participantB.token,
    publishableKey,
    "Accept Auction with first bid",
  );

  const actionSnapshot = await waitForSnapshot(
    participantA.token,
    publishableKey,
    (snapshot) => Array.isArray(snapshot?.items) && snapshot.items.some((item) => (
      item?.kind === "auction_action_required"
      && item?.category === "games"
      && item?.priority === "push_candidate"
      && item?.route === exactRoute
      && item?.title === "Auction accepted · bid now"
    )),
    "Auction first resolved-round action notification",
  );
  assertSafeSurface("Action notification", actionSnapshot);

  for (let safety = 0; safety < 12; safety += 1) {
    stateA = await loadAuction(auctionId, participantA.token, publishableKey);
    if (!stateA) throw new Error("Participant A lost the Auction projection.");
    if (stateA.lifecycle_state === "completed") break;
    const nextB = await loadAuction(auctionId, participantB.token, publishableKey);
    if (!nextB) throw new Error("Participant B lost the Auction projection.");
    assertSafeSurface("Active participant A projection", stateA);
    assertSafeSurface("Active participant B projection", nextB);
    if (stateA.current_round !== nextB.current_round || stateA.revision !== nextB.revision) {
      throw new Error("Participants received inconsistent authoritative round state.");
    }

    if (!stateA.current_user_submitted_bid && stateA.action_required_by !== "opponent") {
      await rpc(
        "submit_auction_bid",
        {
          p_auction_id: auctionId,
          p_round: stateA.current_round,
          p_expected_revision: stateA.revision,
          p_amount: 5,
          p_category: null,
        },
        participantA.token,
        publishableKey,
        `Participant A round ${stateA.current_round} bid`,
      );
    }

    const refreshedB = await loadAuction(auctionId, participantB.token, publishableKey);
    if (refreshedB?.lifecycle_state === "completed") break;
    if (refreshedB && !refreshedB.current_user_submitted_bid && refreshedB.action_required_by !== "opponent") {
      await rpc(
        "submit_auction_bid",
        {
          p_auction_id: auctionId,
          p_round: refreshedB.current_round,
          p_expected_revision: refreshedB.revision,
          p_amount: 1,
          p_category: null,
        },
        participantB.token,
        publishableKey,
        `Participant B round ${refreshedB.current_round} bid`,
      );
    }
  }

  stateA = await loadAuction(auctionId, participantA.token, publishableKey);
  const finalB = await loadAuction(auctionId, participantB.token, publishableKey);
  if (!stateA || !finalB || stateA.lifecycle_state !== "completed" || finalB.lifecycle_state !== "completed") {
    throw new Error(`Auction did not complete: ${JSON.stringify({ stateA, finalB })}`);
  }
  for (const score of [stateA.challenger_final_score, stateA.recipient_final_score]) {
    if (typeof score !== "number" || score < 0 || score > 100) {
      throw new Error(`Auction returned invalid final score ${score}.`);
    }
  }
  if (stateA.challenger_final_score === stateA.recipient_final_score) {
    if (!stateA.is_tie || stateA.winner_profile_id !== null) {
      throw new Error("Equal final scores did not produce a true tie with null winner.");
    }
  } else if (stateA.is_tie || ![participantA.id, participantB.id].includes(stateA.winner_profile_id)) {
    throw new Error("Different final scores did not produce one participant winner.");
  }
  assertSafeSurface("Completed participant projection", stateA);
  if (await loadAuction(auctionId, outsider.token, publishableKey) !== null) {
    throw new Error("Unrelated profile discovered the completed participant projection.");
  }

  const resultSnapshots = await Promise.all([
    waitForSnapshot(participantA.token, publishableKey, (snapshot) => snapshot?.items?.some((item) => (
      item?.kind === "auction_result_ready" && item?.route === exactRoute
    )), "Participant A result notification"),
    waitForSnapshot(participantB.token, publishableKey, (snapshot) => snapshot?.items?.some((item) => (
      item?.kind === "auction_result_ready" && item?.route === exactRoute
    )), "Participant B result notification"),
  ]);
  for (const snapshot of resultSnapshots) {
    const result = snapshot.items.find((item) => item?.kind === "auction_result_ready" && item?.route === exactRoute);
    if (!result || result.priority !== "push_candidate" || result.category !== "games") {
      throw new Error(`Result notification was not push eligible: ${JSON.stringify(result)}`);
    }
    assertSafeSurface("Result notification", result);
    const claim = await rpc(
      "claim_notification_push_delivery",
      { p_notification_id: result.id },
      secretKey,
      secretKey,
      "Claim Auction push delivery",
    );
    if (claim?.notification?.kind !== "auction_result_ready" || claim?.notification?.route !== exactRoute) {
      throw new Error(`Push claim did not preserve the safe canonical destination: ${JSON.stringify(claim)}`);
    }
    assertSafeSurface("Push payload", claim?.notification);
  }

  const publicResult = await publicPreview(auctionId, publishableKey);
  const allowedPreviewKeys = [
    "auction_id",
    "challenger_name",
    "challenger_score",
    "kind",
    "mode_id",
    "recipient_name",
    "recipient_score",
    "verdict",
  ];
  if (!publicResult || publicResult.kind !== "auction-result") {
    throw new Error(`Completed public Auction preview was missing: ${JSON.stringify(publicResult)}`);
  }
  const publicKeys = Object.keys(publicResult).sort();
  if (JSON.stringify(publicKeys) !== JSON.stringify(allowedPreviewKeys)) {
    throw new Error(`Completed Auction preview exposed unexpected fields: ${publicKeys.join(", ")}`);
  }
  assertSafeSurface("Completed public Auction preview", publicResult);

  const completedCrawler = await crawlerPreview(auctionId, `completed-${suffix}`);
  if (completedCrawler.kind !== "auction-result") {
    throw new Error(`Completed Auction crawler preview returned ${completedCrawler.kind || "missing"}.`);
  }
  for (const marker of [participantA.name, participantB.name, "Auction result", "/share-preview/auction-result-"]) {
    if (!completedCrawler.html.includes(marker)) {
      throw new Error(`Completed Auction crawler preview is missing ${marker}.`);
    }
  }

  browser = await webkit.launch({ headless: true });
  const intendedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "en-US" });
  const intendedPage = await intendedContext.newPage();
  await intendedPage.goto(`${productionOrigin}${exactRoute}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await intendedPage.getByRole("heading", { name: "Sign in to open this Auction" }).waitFor({
    state: "visible",
    timeout: 20_000,
  });
  if (new URL(intendedPage.url()).searchParams.get("auction") !== auctionId) {
    throw new Error("Signed-out Auction deep link did not retain the exact destination.");
  }
  await signInWithPin(intendedPage, participantA.name, participantA.pin);
  await intendedPage.waitForURL((url) => url.pathname === "/play/auction" && url.searchParams.get("auction") === auctionId, {
    timeout: 20_000,
  });
  await intendedPage.getByRole("region", { name: "Auction final result" }).waitFor({ state: "visible", timeout: 20_000 });
  await intendedPage.getByRole("button", { name: "SHARE RESULT" }).waitFor({ state: "visible", timeout: 20_000 });
  await intendedPage.screenshot({ path: screenshotPath, fullPage: true });

  const outsiderContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "en-US" });
  const outsiderPage = await outsiderContext.newPage();
  await outsiderPage.goto(`${productionOrigin}${exactRoute}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await signInWithPin(outsiderPage, outsider.name, outsider.pin);
  await outsiderPage.waitForURL((url) => url.pathname === "/play/auction" && url.searchParams.get("auction") === auctionId, {
    timeout: 20_000,
  });
  await outsiderPage.getByRole("heading", { name: "Auction unavailable" }).waitFor({ state: "visible", timeout: 20_000 });
  await outsiderPage.screenshot({ path: outsiderScreenshotPath, fullPage: true });

  console.log(JSON.stringify({
    status: "PASS",
    expected_main_sha: expectedMainSha,
    frontend_deployment_run: frontendRun.id,
    frontend_delivery_run: deliveryRun.id,
    backend_deployment_run: backendRun.id,
    javascript_assets: liveDelivery.javascriptAssets,
    stylesheet_assets: liveDelivery.stylesheetAssets,
    auction_id: auctionId,
    challenge_code: challengeCode,
    outcome: stateA.is_tie ? "true_tie" : "winner",
    challenger_score: stateA.challenger_final_score,
    recipient_score: stateA.recipient_final_score,
    winner_profile_id: stateA.winner_profile_id,
    cleanup_pending: true,
  }, null, 2));
} finally {
  if (browser) await browser.close().catch(() => undefined);
  for (const profile of [...profiles].reverse()) {
    if (!profile.id) continue;
    await fetch(`${supabaseOrigin}/auth/v1/admin/users/${profile.id}`, {
      method: "DELETE",
      headers: serviceHeaders,
    }).catch(() => undefined);
  }

  const cleanupEvidence = [];
  if (profiles.some((profile) => profile.id)) {
    await wait(750);
    for (const profile of profiles) {
      if (!profile.id) continue;

      const authResult = await request(
        `Auction cleanup auth query ${profile.role}`,
        `${supabaseOrigin}/auth/v1/admin/users/${profile.id}`,
        { headers: serviceHeaders },
        [404],
      );
      cleanupEvidence.push(`${profile.role} auth user: removed (${authResult.response.status})`);

      const profileQuery = new URL(`${supabaseOrigin}/rest/v1/profiles`);
      profileQuery.searchParams.set("id", `eq.${profile.id}`);
      profileQuery.searchParams.set("select", "id");
      const profileResult = await request(
        `Auction cleanup profile query ${profile.role}`,
        profileQuery,
        { headers: serviceHeaders },
      );
      if (!Array.isArray(profileResult.body) || profileResult.body.length !== 0) {
        throw new Error(`Temporary Auction profile ${profile.role} still exists after cleanup.`);
      }
      cleanupEvidence.push(`${profile.role} profile: removed`);
    }

    const profileIds = profiles.filter((profile) => profile.id).map((profile) => profile.id);
    const challengeQuery = new URL(`${supabaseOrigin}/rest/v1/play_challenges`);
    challengeQuery.searchParams.set(
      "or",
      `(creator_id.in.(${profileIds.join(",")}),recipient_id.in.(${profileIds.join(",")}))`,
    );
    challengeQuery.searchParams.set("select", "id");
    const challengeResult = await request(
      "Auction cleanup challenge query",
      challengeQuery,
      { headers: serviceHeaders },
    );
    if (!Array.isArray(challengeResult.body) || challengeResult.body.length !== 0) {
      throw new Error(`Temporary Auction challenge rows still exist: ${JSON.stringify(challengeResult.body)}`);
    }
    cleanupEvidence.push("play challenge rows: removed");
  }

  if (auctionId) {
    const previewAfterCleanup = await publicPreview(auctionId, publishableKey).catch(() => null);
    if (previewAfterCleanup !== null) {
      throw new Error("Temporary Auction public preview still exists after profile cleanup.");
    }
    cleanupEvidence.push("completed Auction public projection: removed");
  }

  cleanupEvidence.push("push subscriptions and owner grants: none created by this proof");
  cleanupEvidence.push("private Auction and notification cascades: enforced by the fresh-database PR 6 SQL suite");
  fs.writeFileSync(
    `${process.env.RUNNER_TEMP ?? "/tmp"}/auction-cleanup-proof.txt`,
    [
      `Auction release cleanup proof for ${auctionId || "uncreated Auction"}`,
      ...cleanupEvidence.map((item) => `- ${item}`),
      "",
    ].join("\n"),
  );
}
