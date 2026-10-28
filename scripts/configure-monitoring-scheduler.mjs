const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const requested = process.env.PICK_MONITORING_SCHEDULER_ENABLED?.trim().toLowerCase();
if (!accessToken || !projectId || !["true", "false"].includes(requested)) {
  throw new Error("Monitoring scheduler configuration is incomplete.");
}
const enabled = requested === "true";

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
if (!secretKey) throw new Error("Project secret key is unavailable for scheduler configuration.");

const response = await fetch(
  `https://${projectId}.supabase.co/rest/v1/rpc/set_pick_monitoring_scheduler_enabled`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      apikey: secretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_enabled: enabled }),
  },
);
const health = await readBody(response);
if (!response.ok) throw new Error(`Scheduler configuration failed with HTTP ${response.status}.`);
if (health?.job_name !== "octagon-hq-pick-monitoring"
  || health?.schedule !== "*/5 * * * *"
  || health?.active !== enabled
  || health?.token_configured !== true
  || health?.command_configured !== true
  || health?.function_name !== "run-pick-monitoring") {
  throw new Error("Scheduler health did not match the requested canonical configuration.");
}
console.log(`PASS: canonical Picks monitoring scheduler is ${enabled ? "active" : "inactive"}.`);
