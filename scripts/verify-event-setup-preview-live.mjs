import { writeFileSync } from "node:fs";

function recordUnhandledFailure(error) {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  const runnerTemp = process.env.RUNNER_TEMP?.trim();
  if (!runnerTemp) return;
  try {
    writeFileSync(`${runnerTemp}/event-setup-webkit.log`, `${message}\n`, "utf8");
  } catch {
    // Preserve the original verifier failure if diagnostics cannot be written.
  }
}

process.on("uncaughtException", recordUnhandledFailure);
process.on("unhandledRejection", recordUnhandledFailure);

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const expectedSha = process.env.EXPECTED_SYNC_SOURCE_SHA?.trim() ?? "";
const productionOrigin = process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev";
const articleUrl = process.env.EVENT_SETUP_TEST_MMA_URL
  ?? "https://www.mmamania.com/ufc-fight-cards/446488/latest-ufc-belgrade-fight-card-paramount-start-time-date-and-location-medic-vs-rodriguez-mma";
const expectedFights = [
  ["Uroš Medić", "Daniel Rodriguez"],
  ["Marcin Tybura", "Aleksandar Rakić"],
  ["Ante Delija", "Johnny Walker"],
  ["Jan Błachowicz", "Bogdan Guskov"],
];
const pollution = /iframe|googletagmanager|skip\s+to\s+main|src\s*=|<|>/i;

if (!accessToken || !projectId || !/^[0-9a-f]{40}$/i.test(expectedSha)) {
  throw new Error("Live Event Setup preview verification is not configured.");
}

const supabaseOrigin = `https://${projectId}.supabase.co`;

async function readBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function safeMessage(body) {
  return String(body?.message ?? body?.error_description ?? body?.error ?? "No response message.")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]");
}

async function request(stage, url, options = {}, acceptedStatuses = [200]) {
  const response = await fetch(url, options);
  const body = await readBody(response);
  if (!acceptedStatuses.includes(response.status)) {
    const safeDetails = body?.safeDetails && typeof body.safeDetails === "object"
      ? JSON.stringify(body.safeDetails)
      : "{}";
    throw new Error(
      `${stage}: HTTP ${response.status}; ${safeMessage(body)}; stage=${body?.stage ?? "unknown"}; details=${safeDetails}`,
    );
  }
  return { response, body };
}

function assertCleanEvent(event, stage) {
  if (!event || typeof event !== "object") throw new Error(`${stage} is missing the event payload.`);
  if (event.name !== "UFC Fight Night") throw new Error(`${stage} event name mismatch: ${event.name ?? "missing"}.`);
  if (event.subtitle !== "Uroš Medić vs. Daniel Rodriguez") {
    throw new Error(`${stage} subtitle mismatch: ${event.subtitle ?? "missing"}.`);
  }
  if (event.venue !== "Belgrade Arena") throw new Error(`${stage} venue mismatch: ${event.venue ?? "missing"}.`);
  if (event.location !== "Belgrade, Serbia") throw new Error(`${stage} location mismatch: ${event.location ?? "missing"}.`);
  if (String(event.starts_at ?? "").slice(0, 10) !== "2026-08-01") {
    throw new Error(`${stage} event date mismatch: ${event.starts_at ?? "missing"}.`);
  }
  if (pollution.test(JSON.stringify({
    name: event.name,
    subtitle: event.subtitle,
    venue: event.venue,
    location: event.location,
  }))) {
    throw new Error(`${stage} contains rejected UFC visible-page pollution.`);
  }
  if (!Array.isArray(event.bouts) || event.bouts.length !== expectedFights.length) {
    throw new Error(`${stage} fight count mismatch: ${event.bouts?.length ?? "missing"}.`);
  }
  event.bouts.forEach((bout, index) => {
    const expected = expectedFights[index];
    if (bout?.red_fighter_name !== expected[0] || bout?.blue_fighter_name !== expected[1]) {
      throw new Error(
        `${stage} fight ${index + 1} mismatch: ${bout?.red_fighter_name ?? "missing"} vs. ${bout?.blue_fighter_name ?? "missing"}.`,
      );
    }
  });
  if (JSON.stringify(event.bouts).includes("Bogdan Guskov 2")) {
    throw new Error(`${stage} retained the article-only Bogdan Guskov rematch marker.`);
  }
}

function assertNoSourceChanges(changes) {
  if (changes.length) {
    throw new Error(`Preview reported changes after the same source was already applied: ${changes.join(" | ")}`);
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
if (!publishableKey || !secretKey) throw new Error("Project keys are unavailable.");

const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};
const suffix = `${process.env.GITHUB_RUN_ID ?? Date.now()}${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`;
const displayName = `HQEVENT${suffix}`.slice(0, 24);
const email = `hqevent-${suffix}@login.octagon-hq.app`;
const password = `EventPreview-${suffix}!Aa1`;
const pin = "7318";
let userId = "";

async function rpc(name, token, body = {}) {
  return request(
    `RPC ${name}`,
    `${supabaseOrigin}/rest/v1/rpc/${name}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: publishableKey,
        "Content-Type": "application/json",
        Origin: productionOrigin,
      },
      body: JSON.stringify(body),
    },
  );
}

try {
  const created = await request(
    "Disposable Auth user creation",
    `${supabaseOrigin}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { display_name: displayName } }),
    },
  );
  userId = created.body?.id ?? "";
  if (!userId) throw new Error("Disposable Auth user creation did not return a user ID.");

  await request(
    "Disposable profile registration",
    `${supabaseOrigin}/rest/v1/rpc/register_pin_profile`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        p_profile_id: userId,
        p_display_name: displayName,
        p_initials: "H",
        p_internal_email: email,
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

  const session = await request(
    "Disposable owner sign-in",
    `${supabaseOrigin}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );
  const userToken = session.body?.access_token;
  if (!userToken) throw new Error("Disposable owner sign-in did not return an access token.");

  const draftBefore = (await rpc("get_pick_event_setup", userToken)).body;
  const liveBefore = (await rpc("get_current_pick_event", userToken)).body;

  const preview = await request(
    "Production Event Setup preview",
    `${supabaseOrigin}/functions/v1/sync-next-ufc-event`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        apikey: publishableKey,
        "Content-Type": "application/json",
        Origin: productionOrigin,
        "x-client-info": "octagon-hq-event-preview-check/4",
      },
      body: JSON.stringify({ mode: "preview", card_scope: "auto", source_url: articleUrl }),
    },
  );

  if (preview.body?.deployment_sha !== expectedSha) {
    throw new Error(`Preview backend SHA mismatch: expected ${expectedSha}, received ${preview.body?.deployment_sha ?? "missing"}.`);
  }
  if (preview.body?.requested_scope !== "auto" || preview.body?.effective_scope !== "main") {
    throw new Error(`Preview scope mismatch: ${preview.body?.requested_scope ?? "missing"}/${preview.body?.effective_scope ?? "missing"}.`);
  }
  if (preview.body?.source_url !== articleUrl) {
    throw new Error(`Preview source mismatch: received ${preview.body?.source_url ?? "missing"}.`);
  }
  if (preview.body?.fight_count !== expectedFights.length) {
    throw new Error(`Preview returned the wrong Fight Night main-card count: ${preview.body?.fight_count ?? "missing"}.`);
  }
  if (!preview.body?.source_hash || !Array.isArray(preview.body?.changes)) {
    throw new Error("Preview response is missing its reviewed source hash or change list.");
  }
  assertCleanEvent(preview.body.event_preview, "Preview");
  assertNoSourceChanges(preview.body.changes);

  const draftAfterPreview = (await rpc("get_pick_event_setup", userToken)).body;
  const liveAfterPreview = (await rpc("get_current_pick_event", userToken)).body;
  if (JSON.stringify(draftAfterPreview) !== JSON.stringify(draftBefore)) {
    throw new Error("Preview changed the staged Event Setup draft.");
  }
  if (JSON.stringify(liveAfterPreview) !== JSON.stringify(liveBefore)) {
    throw new Error("Preview changed the live Picks event.");
  }
  assertCleanEvent(draftAfterPreview, "Current staged draft");

  console.log(
    `PASS: production Event Setup preview returned zero changes for the already-applied exact clean four-fight main card at backend ${expectedSha}; the current private staged draft is exact and clean, the preview was non-destructive, the live Picks event was byte-for-byte unchanged, and nothing was published.`,
  );
} finally {
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
