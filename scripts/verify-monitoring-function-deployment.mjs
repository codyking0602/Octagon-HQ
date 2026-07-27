import { execFileSync } from "node:child_process";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const expectedSha = process.env.EXPECTED_MONITORING_SOURCE_SHA?.trim() ?? "";
const productionOrigin = process.env.OCTAGON_PRODUCTION_ORIGIN ?? "https://octagon.hq-app.workers.dev";
if (!accessToken || !projectId || !/^[0-9a-f]{40}$/i.test(expectedSha)) {
  throw new Error("Exact monitoring-function verification is not configured.");
}

async function readBody(response) {
  const value = await response.text();
  try {
    return JSON.parse(value);
  } catch {
    return { message: value };
  }
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

const functionList = cli(["functions", "list", "--project-ref", projectId]);
if (!functionList.includes("run-pick-monitoring")) {
  throw new Error("run-pick-monitoring is not deployed.");
}
const migrationList = cli(["migration", "list", "--linked"]);
if (!remoteMigrationRecorded(migrationList, "202608080001")) {
  throw new Error("Manual monitoring migration 202608080001 is not recorded remotely.");
}

const keysResponse = await fetch(
  `https://api.supabase.com/v1/projects/${projectId}/api-keys?reveal=true`,
  { headers: { Authorization: `Bearer ${accessToken}` } },
);
const keys = await readBody(keysResponse);
if (!keysResponse.ok || !Array.isArray(keys)) {
  throw new Error(`Project key lookup failed with HTTP ${keysResponse.status}.`);
}
const publishableKey = keys.find((item) => item.type === "publishable")?.api_key
  ?? keys.find((item) => item.type === "legacy" && /anon/i.test(item.name ?? ""))?.api_key;
if (!publishableKey) throw new Error("Project publishable key is unavailable.");

const endpoint = `https://${projectId}.supabase.co/functions/v1/run-pick-monitoring`;
const request = (body) => fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${publishableKey}`,
    apikey: publishableKey,
    Origin: productionOrigin,
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
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

console.log(`PASS: run-pick-monitoring exact source, migration, function presence, CORS, and no-quota authentication contract verified for ${expectedSha}.`);
