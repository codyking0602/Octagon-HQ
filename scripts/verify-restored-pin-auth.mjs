const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const productionOrigin = "https://octagon.hq-app.workers.dev";

if (!accessToken || !projectId) {
  throw new Error("PIN restore verification is not configured.");
}

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Invalid JSON response." };
  }
}

async function request(stage, url, options = {}, expectedStatus = 200) {
  const response = await fetch(url, options);
  const body = await readJson(response);
  if (response.status !== expectedStatus) {
    const message = body?.message ?? body?.msg ?? body?.error_description ?? body?.error ?? "No response message.";
    throw new Error(`${stage}: HTTP ${response.status}; ${String(message)}`);
  }
  return { response, body };
}

const keyResult = await request(
  "Project key lookup",
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);

const keys = keyResult.body;
const publishableKey = keys.find((item) => item.type === "publishable")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /anon/i.test(item.name ?? ""))?.api_key;
const secretKey = keys.find((item) => item.type === "secret")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;

if (!publishableKey || !secretKey) throw new Error("Required Supabase keys are unavailable.");

const base = `https://${projectId}.supabase.co`;
const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};
const publicHeaders = {
  Authorization: `Bearer ${publishableKey}`,
  apikey: publishableKey,
  "Content-Type": "application/json",
  "x-client-info": "supabase-js-web/2.110.7",
  Origin: productionOrigin,
};

const suffix = `${process.env.GITHUB_RUN_ID ?? Date.now()}${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`;
const displayName = `RESTORE${suffix}`.slice(0, 24);
const internalEmail = `restore-${suffix}@login.octagon-hq.app`;
const pin = "4826";
const password = `Restore-${suffix}!Aa1`;
let userId = "";

try {
  const created = await request(
    "Disposable Auth user creation",
    `${base}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        email: internalEmail,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      }),
    },
  );
  userId = created.body?.id;
  if (!userId) throw new Error("Disposable Auth user creation returned no user ID.");

  await request(
    "Disposable PIN profile registration",
    `${base}/rest/v1/rpc/register_pin_profile`,
    {
      method: "POST",
      headers: serviceHeaders,
      body: JSON.stringify({
        p_profile_id: userId,
        p_display_name: displayName,
        p_initials: "R",
        p_internal_email: internalEmail,
        p_pin: pin,
      }),
    },
  );

  const login = await request(
    "Production-origin PIN login",
    `${base}/functions/v1/pin-auth`,
    {
      method: "POST",
      headers: publicHeaders,
      body: JSON.stringify({ action: "login", displayName, pin }),
    },
  );

  if (login.response.headers.get("access-control-allow-origin") !== productionOrigin) {
    throw new Error("Production-origin PIN login did not return the production CORS origin.");
  }

  const tokenHash = login.body?.tokenHash;
  if (!tokenHash) throw new Error("Production-origin PIN login returned no token hash.");

  const verified = await request(
    "PIN session verification",
    `${base}/auth/v1/verify`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token_hash: tokenHash, type: "magiclink" }),
    },
  );

  if (!verified.body?.access_token) throw new Error("PIN session verification returned no access token.");
  if (verified.body?.user?.id !== userId) throw new Error("PIN session belongs to the wrong user.");

  console.log("PASS: production PIN authentication created and verified a disposable session.");
} finally {
  if (userId) {
    await fetch(`${base}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: serviceHeaders,
    }).catch(() => undefined);
  }
}
