import { execFileSync } from "node:child_process";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const expectedSha = process.env.EXPECTED_MONITORING_SOURCE_SHA?.trim() ?? "";
const productionOrigin = process.env.OCTAGON_PRODUCTION_ORIGIN ?? "https://octagon.hq-app.workers.dev";
const expectedSchedulerValue = process.env.EXPECTED_MONITORING_SCHEDULER_ENABLED?.trim().toLowerCase();
if (!accessToken || !projectId || !/^[0-9a-f]{40}$/i.test(expectedSha)) {
  throw new Error("Exact monitoring-function verification is not configured.");
}
if (expectedSchedulerValue && !["true", "false"].includes(expectedSchedulerValue)) {
  throw new Error("Expected monitoring scheduler state is invalid.");
}

async function readBody(response) {
  const value = await response.text();
  try { return JSON.parse(value); } catch { return { message: value }; }
}

const cli = (args) => execFileSync("supabase", args, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
const remoteMigrationRecorded = (output, version) => output.split(/\r?\n/).some((line) => {
  const columns = line.replaceAll("│", "|").split("|");
  if (columns.length < 2) return false;
  const local = columns[0].replace(/\D/g, "");
  const remote = columns[1].replace(/\D/g, "");
  return local === version && remote === version;
});

const secrets = JSON.parse(cli(["secrets", "list", "--project-ref", projectId, "--output", "json"]));
if (!Array.isArray(secrets) || !secrets.some((secret) => secret?.name === "THE_ODDS_API_KEY")) {
  throw new Error("THE_ODDS_API_KEY is not configured in the Supabase project.");
}

const functionList = cli(["functions", "list", "--project-ref", projectId]);
if (!functionList.includes("run-pick-monitoring")) throw new Error("run-pick-monitoring is not deployed.");
const migrationList = cli(["migration", "list", "--linked"]);
for (const version of ["202608080001", "202608090001", "202608090002", "202608090003", "202608250001"]) {
  if (!remoteMigrationRecorded(migrationList, version)) throw new Error(`Monitoring migration ${version} is not recorded remotely.`);
}

const keysResponse = await fetch(
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);
const keys = await readBody(keysResponse);
if (!keysResponse.ok || !Array.isArray(keys)) throw new Error(`Project key lookup failed with HTTP ${keysResponse.status}.`);
const publishableKey = keys.find((item) => item.type === "publishable")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /anon/i.test(item.name ?? ""))?.api_key;
const secretKey = keys.find((item) => item.type === "secret")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /service.role/i.test(item.name ?? ""))?.api_key;
if (!publishableKey || !secretKey) throw new Error("Project API keys are unavailable.");

const endpoint = `https://${projectId}.supabase.co/functions/v1/run-pick-monitoring`;
const request = (body, extraHeaders = {}) => fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${publishableKey}`,
    apikey: publishableKey,
    Origin: productionOrigin,
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    ...extraHeaders,
  },
  body: JSON.stringify(body),
});
const infoResponse = await request({ mode: "deployment-info" });
const info = await readBody(infoResponse);
if (!infoResponse.ok
  || info.deployment_sha !== expectedSha
  || infoResponse.headers.get("x-octagon-backend-sha") !== expectedSha) {
  throw new Error("Deployed monitoring-function exact source marker did not match.");
}
if (infoResponse.headers.get("access-control-allow-origin") !== productionOrigin) {
  throw new Error("Deployed monitoring function production CORS did not match.");
}
const deniedResponse = await request({});
if (deniedResponse.status !== 401) {
  throw new Error(`Monitoring authentication rejection expected HTTP 401, received ${deniedResponse.status}.`);
}
const fakeSchedulerResponse = await request(
  { mode: "scheduled" },
  { "x-octagon-scheduler-token": "not-a-real-scheduler-token" },
);
if (fakeSchedulerResponse.status !== 401) {
  throw new Error(`Scheduled authentication rejection expected HTTP 401, received ${fakeSchedulerResponse.status}.`);
}

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
if (!healthResponse.ok
  || health?.job_name !== "octagon-hq-pick-monitoring"
  || health?.schedule !== "7 * * * *"
  || health?.token_configured !== true
  || health?.command_configured !== true
  || health?.function_name !== "run-pick-monitoring") {
  throw new Error("Canonical monitoring scheduler infrastructure is unavailable or mismatched.");
}
if (expectedSchedulerValue && health.active !== (expectedSchedulerValue === "true")) {
  throw new Error("Canonical monitoring scheduler active state did not match the trusted deployment mode.");
}

console.log(`PASS: run-pick-monitoring exact source, scheduler infrastructure, server authorization, quota secret, CORS, and no-provider-call rejection paths verified for ${expectedSha}.`);
