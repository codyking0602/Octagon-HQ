const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;

if (!accessToken || !projectId) {
  throw new Error("Live Picks scoring verification is not configured.");
}

const supabaseOrigin = `https://${projectId}.supabase.co`;

async function readBody(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

async function request(stage, url, options = {}) {
  const response = await fetch(url, options);
  const body = await readBody(response);
  if (!response.ok) {
    throw new Error(`${stage}: HTTP ${response.status}; ${JSON.stringify(body)}`);
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
const secretKey = keys.find((item) => item.type === "secret")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;

if (!publishableKey || !secretKey) {
  throw new Error("Project keys: required keys are unavailable.");
}

const suffix = `${process.env.GITHUB_RUN_ID ?? Date.now()}${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`;
const email = `picks-check-${suffix}@login.octagon-hq.app`;
const password = `PicksCheck-${suffix}!Aa1`;
const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};
let userId = "";

try {
  const created = await request(
    "Disposable Auth user creation",
    `${supabaseOrigin}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({ email, password, email_confirm: true }),
    },
  );
  userId = created?.id ?? "";
  if (!userId) throw new Error("Disposable Auth user creation returned no user ID.");

  const session = await request(
    "Disposable user sign-in",
    `${supabaseOrigin}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
  );
  const userToken = session?.access_token;
  if (!userToken) throw new Error("Disposable user sign-in returned no access token.");

  const publicHeaders = {
    Authorization: `Bearer ${publishableKey}`,
    apikey: publishableKey,
    "Content-Type": "application/json",
  };
  const userHeaders = {
    Authorization: `Bearer ${userToken}`,
    apikey: publishableKey,
    "Content-Type": "application/json",
  };

  const event = await request(
    "Current Picks event",
    `${supabaseOrigin}/rest/v1/rpc/get_current_pick_event`,
    { method: "POST", headers: publicHeaders, body: "{}" },
  );
  if (!event?.event_id || !Number.isInteger(event?.season)) {
    throw new Error("Current Picks event did not return an event ID and season.");
  }

  const lock = await request(
    "Underdog Lock RPC",
    `${supabaseOrigin}/rest/v1/rpc/get_my_event_underdog_lock`,
    {
      method: "POST",
      headers: userHeaders,
      body: JSON.stringify({ p_event_id: event.event_id }),
    },
  );
  if (!Array.isArray(lock)) {
    throw new Error("Underdog Lock RPC did not return a table-shaped JSON array.");
  }

  const summary = await request(
    "Picks scoring summary RPC",
    `${supabaseOrigin}/rest/v1/rpc/get_my_pick_summary`,
    {
      method: "POST",
      headers: userHeaders,
      body: JSON.stringify({ p_season: event.season }),
    },
  );
  const row = Array.isArray(summary) ? summary[0] : null;
  for (const field of ["correct", "incorrect", "pending", "events_entered", "base_points", "lock_bonus", "total_points"]) {
    if (!Number.isInteger(row?.[field])) {
      throw new Error(`Picks scoring summary is missing integer field ${field}.`);
    }
  }

  console.log(`PASS: production Picks scoring RPCs are visible for event ${event.event_id}.`);
} finally {
  if (userId) {
    await fetch(`${supabaseOrigin}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: serviceHeaders,
    }).catch(() => undefined);
  }
}
