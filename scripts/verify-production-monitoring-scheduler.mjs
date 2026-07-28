const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
if (!accessToken || !projectId) {
  throw new Error("Production monitoring scheduler verification is not configured.");
}

async function readBody(response) {
  const text = await response.text();
  try { return JSON.parse(text); } catch { return { message: text }; }
}

const keysResponse = await fetch(
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);
const keys = await readBody(keysResponse);
if (!keysResponse.ok || !Array.isArray(keys)) {
  throw new Error(`Project key lookup failed with HTTP ${keysResponse.status}.`);
}
const secretKey = keys.find((item) => item.type === "secret")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;
if (!secretKey) throw new Error("Project secret key is unavailable for scheduler verification.");

const healthResponse = await fetch(
  `https://${projectId}.supabase.co/rest/v1/rpc/get_pick_monitoring_scheduler_health`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      apikey: secretKey,
      "Content-Type": "application/json",
    },
    body: "{}",
  },
);
const health = await readBody(healthResponse);
if (!healthResponse.ok) {
  throw new Error(`Production scheduler health failed with HTTP ${healthResponse.status}.`);
}
const safeHealth = {
  job_name: health?.job_name ?? null,
  schedule: health?.schedule ?? null,
  active: health?.active === true,
  token_configured: health?.token_configured === true,
  function_name: health?.function_name ?? null,
};
if (safeHealth.job_name !== "octagon-hq-pick-monitoring"
  || safeHealth.schedule !== "7 * * * *"
  || safeHealth.active !== true
  || safeHealth.token_configured !== true
  || safeHealth.function_name !== "run-pick-monitoring") {
  throw new Error(`Production Picks monitoring scheduler health mismatch: ${JSON.stringify(safeHealth)}`);
}

console.log("PASS: production Picks monitoring scheduler is active, canonical, and token-configured without invoking the runner or provider.");
