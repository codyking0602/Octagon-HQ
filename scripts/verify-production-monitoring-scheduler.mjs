import fs from "node:fs";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
if (!accessToken || !projectId) {
  throw new Error("Production monitoring scheduler verification is not configured.");
}

const configuredExpectation = process.env.EXPECTED_MONITORING_SCHEDULER_ACTIVE?.trim().toLowerCase();
if (configuredExpectation && !["true", "false"].includes(configuredExpectation)) {
  throw new Error("EXPECTED_MONITORING_SCHEDULER_ACTIVE must be true or false when provided.");
}
const expectedActive = configuredExpectation
  ? configuredExpectation === "true"
  : process.env.GITHUB_EVENT_NAME !== "pull_request";

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
  command_configured: health?.command_configured === true,
  function_name: health?.function_name ?? null,
};

if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(
    `${process.env.RUNNER_TEMP}/event-setup-webkit.log`,
    `${JSON.stringify({ expected_active: expectedActive, health: safeHealth }, null, 2)}\n`,
  );
}

if (safeHealth.job_name !== "octagon-hq-pick-monitoring"
  || safeHealth.schedule !== "7 * * * *"
  || safeHealth.active !== expectedActive
  || safeHealth.token_configured !== true
  || safeHealth.command_configured !== true
  || safeHealth.function_name !== "run-pick-monitoring") {
  throw new Error(
    `Production Picks monitoring scheduler health mismatch; expected active=${expectedActive}: ${JSON.stringify(safeHealth)}`,
  );
}

console.log(
  `PASS: production Picks monitoring scheduler is ${expectedActive ? "active" : "safely paused"}, canonical, command-configured, and token-configured without invoking the runner or provider.`,
);