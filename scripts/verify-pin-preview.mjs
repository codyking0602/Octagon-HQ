const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const headBranch = process.env.HEAD_BRANCH;

if (!accessToken || !projectId || !headBranch) {
  throw new Error("PIN preview verification is not configured.");
}

const branchSlug = headBranch
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const previewOrigin = `https://${branchSlug}-octagon.hq-app.workers.dev`;
const supabaseOrigin = `https://${projectId}.supabase.co`;
const proxyBase = `${previewOrigin}/api/supabase/${projectId}`;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

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

async function requestJson(stage, url, options = {}) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error(`${stage}: network failure (${error instanceof Error ? error.message : "unknown"}).`);
  }

  const body = await readBody(response);
  return { response, body };
}

async function requireOk(stage, url, options, expectedStatus = 200) {
  const result = await requestJson(stage, url, options);
  if (result.response.status !== expectedStatus) {
    throw new Error(
      `${stage}: HTTP ${result.response.status}; ${safeMessage(result.body)}`,
    );
  }
  return result;
}

async function waitForDirectClientBundle() {
  for (let attempt = 1; attempt <= 24; attempt += 1) {
    try {
      const shell = await fetch(`${previewOrigin}/?pin-transport=${attempt}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (shell.ok) {
        const html = await shell.text();
        const assetPaths = [...html.matchAll(/src="(\/[^\"]+\.js)"/g)].map((match) => match[1]);
        let bundle = "";
        for (const assetPath of [...new Set(assetPaths)]) {
          const asset = await fetch(`${previewOrigin}${assetPath}?pin-transport=${attempt}`, {
            headers: { "Cache-Control": "no-cache" },
          });
          if (asset.ok) bundle += await asset.text();
        }

        if (bundle.includes("octagon-hq-web/1") && bundle.includes("Profile service returned HTTP")) {
          return;
        }
      }
    } catch {
      // Cloudflare can briefly return a network error while replacing the preview.
    }

    if (attempt < 24) await sleep(10_000);
  }

  throw new Error(`Preview readiness: ${previewOrigin} never served the direct PIN client.`);
}

await waitForDirectClientBundle();

const keysResult = await requireOk(
  "Project key lookup",
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);

const keys = keysResult.body;
const publishableKey = keys.find((item) => item.type === "publishable")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /anon/i.test(item.name ?? ""))?.api_key;
const secretKey = keys.find((item) => item.type === "secret")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;

if (!publishableKey || !secretKey) throw new Error("Project keys: required keys are unavailable.");

const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};
const publicHeaders = {
  Authorization: `Bearer ${publishableKey}`,
  apikey: publishableKey,
  "Content-Type": "application/json",
  "x-client-info": "octagon-hq-web/1",
};

const suffix = `${process.env.GITHUB_RUN_ID ?? Date.now()}${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`;
const displayName = `HQCHECK${suffix}`.slice(0, 24);
const authEmail = `hqcheck-${suffix}@login.octagon-hq.app`;
const staleCredentialEmail = `stale-${suffix}@login.octagon-hq.app`;
const pin = "4826";
const password = `HealthCheck-${suffix}!Aa1`;
let userId = "";

try {
  const created = await requireOk(
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
  if (!userId) throw new Error("Disposable Auth user creation: response did not include a user ID.");

  await requireOk(
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

  const login = await requireOk(
    "Live preview PIN login",
    `${proxyBase}/functions/v1/pin-auth`,
    {
      method: "POST",
      headers: {
        ...publicHeaders,
        Origin: previewOrigin,
      },
      body: JSON.stringify({ action: "login", displayName, pin }),
    },
  );
  if (login.response.headers.get("x-octagon-supabase-proxy") !== "1") {
    throw new Error("Live preview PIN login: Worker proxy marker is missing.");
  }

  const tokenHash = login.body?.tokenHash;
  if (!tokenHash) throw new Error("Live preview PIN login: response did not include a token hash.");

  const verified = await requireOk(
    "Live preview session verification",
    `${proxyBase}/auth/v1/verify`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token_hash: tokenHash, type: "magiclink" }),
    },
  );
  if (verified.response.headers.get("x-octagon-supabase-proxy") !== "1") {
    throw new Error("Live preview session verification: Worker proxy marker is missing.");
  }
  if (!verified.body?.access_token) {
    throw new Error("Live preview session verification: no access token was returned.");
  }
  if (verified.body?.user?.id !== userId) {
    throw new Error("Live preview session verification: session belongs to the wrong Auth user.");
  }

  console.log("PASS: the live branch preview completed direct PIN login and opened the UUID-linked Auth user despite a stale credential email.");
} finally {
  if (userId) {
    await fetch(`${supabaseOrigin}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: serviceHeaders,
    }).catch(() => undefined);
  }
}
