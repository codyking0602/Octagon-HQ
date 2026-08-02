import {
  assertCurrentEventPreview,
  assertReportedSourceChanges,
  assertSafeEventSourceRollover,
} from "./event-setup-preview-contract.mjs";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const expectedSha = process.env.EXPECTED_SYNC_SOURCE_SHA?.trim() ?? "";
const productionOrigin = process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev";
const configuredArticleUrl = process.env.EVENT_SETUP_TEST_MMA_URL?.trim() ?? "";

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

function safeDetails(body) {
  return body?.safeDetails && typeof body.safeDetails === "object"
    ? JSON.stringify(body.safeDetails)
    : "{}";
}

async function request(stage, url, options = {}, acceptedStatuses = [200]) {
  const response = await fetch(url, options);
  const body = await readBody(response);
  if (!acceptedStatuses.includes(response.status)) {
    throw new Error(
      `${stage}: HTTP ${response.status}; ${safeMessage(body)}; stage=${body?.stage ?? "unknown"}; details=${safeDetails(body)}`,
    );
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
  const previewPayload = { mode: "preview", card_scope: "auto" };
  if (configuredArticleUrl) previewPayload.source_url = configuredArticleUrl;

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
        "x-client-info": "octagon-hq-event-preview-check/5",
      },
      body: JSON.stringify(previewPayload),
    },
    [200, 502],
  );

  let outcome;
  if (preview.response.status === 200) {
    if (preview.body?.deployment_sha !== expectedSha) {
      throw new Error(`Preview backend SHA mismatch: expected ${expectedSha}, received ${preview.body?.deployment_sha ?? "missing"}.`);
    }
    if (preview.body?.requested_scope !== "auto" || !["main", "full"].includes(preview.body?.effective_scope)) {
      throw new Error(`Preview scope mismatch: ${preview.body?.requested_scope ?? "missing"}/${preview.body?.effective_scope ?? "missing"}.`);
    }
    if (configuredArticleUrl && preview.body?.source_url !== configuredArticleUrl) {
      throw new Error(`Preview source mismatch: received ${preview.body?.source_url ?? "missing"}.`);
    }
    if (preview.body?.fight_count !== preview.body?.event_preview?.bouts?.length) {
      throw new Error(`Preview fight count does not match its event payload: ${preview.body?.fight_count ?? "missing"}/${preview.body?.event_preview?.bouts?.length ?? "missing"}.`);
    }
    if (!preview.body?.source_hash || !Array.isArray(preview.body?.changes)) {
      throw new Error("Preview response is missing its reviewed source hash or change list.");
    }
    assertCurrentEventPreview({
      ...preview.body.event_preview,
      source_url: preview.body.source_url,
    });
    assertReportedSourceChanges(draftBefore, preview.body.event_preview, preview.body.changes);
    outcome = `returned an independently verified ${preview.body.fight_count}-fight current-source change list`;
  } else {
    if (preview.body?.deployment_sha !== expectedSha) {
      throw new Error(`Rejected preview backend SHA mismatch: expected ${expectedSha}, received ${preview.body?.deployment_sha ?? "missing"}.`);
    }
    if (
      preview.body?.code !== "ARTICLE_IDENTITY_REJECTED"
      || preview.body?.stage !== "identity-match"
    ) {
      throw new Error(
        `Expected a safe article identity rejection, received ${preview.body?.code ?? "missing"}/${preview.body?.stage ?? "missing"}; message=${safeMessage(preview.body)}; details=${safeDetails(preview.body)}`,
      );
    }
    assertSafeEventSourceRollover(preview.body);
    outcome = "safely rejected a persisted article after the official UFC event identity rolled forward";
  }

  const draftAfterPreview = (await rpc("get_pick_event_setup", userToken)).body;
  const liveAfterPreview = (await rpc("get_current_pick_event", userToken)).body;
  if (JSON.stringify(draftAfterPreview) !== JSON.stringify(draftBefore)) {
    throw new Error("Preview changed the staged Event Setup draft.");
  }
  if (JSON.stringify(liveAfterPreview) !== JSON.stringify(liveBefore)) {
    throw new Error("Preview changed the live Picks event.");
  }

  console.log(
    `PASS: production Event Setup preview ${outcome} at backend ${expectedSha}; the authenticated preview boundary was non-destructive, the staged draft and live Picks event were byte-for-byte unchanged, and nothing was applied or published.`,
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
