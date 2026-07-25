const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
if (!accessToken || !projectId) throw new Error("Supabase diagnostics are not configured.");

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Invalid JSON response." };
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const body = await readJson(response);
  return { response, body };
}

const keysResult = await request(
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);
if (!keysResult.response.ok) throw new Error(`Could not read project API keys: HTTP ${keysResult.response.status}.`);

const keys = keysResult.body;
const secretKey = keys.find((item) => item.type === "secret")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;
if (!secretKey) throw new Error("The project secret key is unavailable.");

const base = `https://${projectId}.supabase.co`;
const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};

const stateResult = await request(`${base}/rest/v1/rpc/inspect_profile_pin_state`, {
  method: "POST",
  headers: serviceHeaders,
  body: JSON.stringify({ p_display_name: "CODY" }),
});
if (!stateResult.response.ok) throw new Error(`CODY credential inspection failed: HTTP ${stateResult.response.status}.`);
const state = Array.isArray(stateResult.body) ? stateResult.body[0] : null;

const profileResult = await request(`${base}/rest/v1/profiles?normalized_name=eq.CODY&select=id,display_name`, {
  headers: serviceHeaders,
});
if (!profileResult.response.ok) throw new Error(`CODY profile lookup failed: HTTP ${profileResult.response.status}.`);
const profile = Array.isArray(profileResult.body) ? profileResult.body[0] : null;
if (!profile?.id) throw new Error("CODY profile row is missing.");

const userResult = await request(`${base}/auth/v1/admin/users/${profile.id}`, { headers: serviceHeaders });
if (!userResult.response.ok) throw new Error(`CODY Auth user lookup failed: HTTP ${userResult.response.status}.`);
const user = userResult.body;
if (!user?.id || !user?.email) throw new Error("CODY Auth user is incomplete.");

console.log("CODY profile row: present");
console.log(`CODY credential row: ${state?.credential_exists ? "present" : "missing"}`);
console.log(`CODY Auth user: ${state?.auth_user_exists ? "present" : "missing"}`);
console.log(`CODY credential email matches Auth user: ${Boolean(state?.internal_email_matches_auth)}`);
console.log(`CODY email confirmed: ${Boolean(state?.email_confirmed)}`);
console.log(`CODY banned: ${Boolean(state?.banned)}`);
console.log(`CODY failed attempts: ${Number(state?.failed_attempts ?? 0)}`);
console.log(`CODY currently locked: ${Boolean(state?.locked)}`);

const tokenResult = await request(`${base}/auth/v1/admin/generate_link`, {
  method: "POST",
  headers: serviceHeaders,
  body: JSON.stringify({ type: "magiclink", email: user.email }),
});

const tokenHash = tokenResult.body?.properties?.hashed_token ?? tokenResult.body?.hashed_token;
if (!tokenResult.response.ok || !tokenHash) {
  const code = tokenResult.body?.code ?? tokenResult.body?.error_code ?? "unknown";
  const message = String(
    tokenResult.body?.msg
      ?? tokenResult.body?.message
      ?? tokenResult.body?.error_description
      ?? "unknown error",
  ).replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]");
  throw new Error(`CODY session-token generation failed: HTTP ${tokenResult.response.status}; code=${code}; message=${message}`);
}

console.log("CODY session-token generation: available");
