import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync } from "node:fs";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const expectedSha = process.env.EXPECTED_SYNC_SOURCE_SHA?.trim() ?? "";
const productionOrigin = "https://the.hq-app.workers.dev";
const verifyExactSource = process.env.GITHUB_EVENT_NAME !== "pull_request";
const requiredAuctionMigrationVersions = [
  "202608220001",
  "202608220002",
  "202608220003",
  "202608220004",
];

if (!accessToken || !projectId || !expectedSha) {
  throw new Error("Exact sync-function verification is not configured.");
}
if (!/^[0-9a-f]{40}$/i.test(expectedSha)) {
  throw new Error("EXPECTED_SYNC_SOURCE_SHA must be a full commit SHA.");
}

function verifyAuctionMigrationHistory() {
  const migrationList = execFileSync(
    "supabase",
    ["migration", "list", "--linked"],
    { encoding: "utf8" },
  );
  const rows = migrationList.split("\n").map((line) => {
    const columns = line.replaceAll("│", "|").split("|");
    return {
      local: (columns[0] ?? "").replaceAll(/[^0-9]/g, ""),
      remote: (columns[1] ?? "").replaceAll(/[^0-9]/g, ""),
    };
  });

  for (const version of requiredAuctionMigrationVersions) {
    const row = rows.find((candidate) => candidate.local === version);
    if (!row || row.remote !== version) {
      throw new Error(
        `Auction migration ${version} is not recorded in linked remote history.`,
      );
    }
  }

  console.log(
    "PASS: Auction migrations 202608220001 through 202608220004 are recorded in linked remote history.",
  );
}

async function readBody(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

verifyAuctionMigrationHistory();

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
if (!publishableKey) {
  throw new Error("Project publishable key is unavailable.");
}

const endpoint = `https://${projectId}.supabase.co/functions/v1/sync-next-ufc-event`;
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${publishableKey}`,
    apikey: publishableKey,
    Origin: productionOrigin,
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
  body: JSON.stringify({ mode: "deployment-info", expected_sha: expectedSha }),
});
const body = await readBody(response);
if (!response.ok) {
  throw new Error(`Deployed sync-function marker returned HTTP ${response.status}: ${body?.message ?? "unknown response"}`);
}
const deployedSha = body?.deployment_sha ?? "";
if (!/^[0-9a-f]{40}$/i.test(deployedSha)) {
  throw new Error(`Deployed sync-function marker is missing or invalid: ${deployedSha || "missing"}.`);
}
if (verifyExactSource && deployedSha !== expectedSha) {
  throw new Error(
    `Deployed sync-function marker mismatch: expected ${expectedSha}, received ${deployedSha}.`,
  );
}
if (response.headers.get("x-octagon-backend-sha") !== deployedSha) {
  throw new Error("Deployed sync-function SHA header did not match its deployment marker.");
}
if (response.headers.get("access-control-allow-origin") !== productionOrigin) {
  throw new Error(`Deployed sync function is not allowing ${productionOrigin}.`);
}

if (verifyExactSource) {
  console.log(`PASS: sync-next-ufc-event is deployed from exact source ${expectedSha}.`);
} else {
  console.log(`PASS: production sync-next-ufc-event deployment ${deployedSha} is healthy; unmerged PR source ${expectedSha} was not required to be live.`);
  if (process.env.GITHUB_ENV) {
    appendFileSync(process.env.GITHUB_ENV, `EXPECTED_SYNC_SOURCE_SHA=${deployedSha}\n`);
  }
}

if (existsSync("supabase/functions/run-pick-monitoring/index.ts")) {
  process.env.EXPECTED_MONITORING_SOURCE_SHA = process.env.EXPECTED_MONITORING_SOURCE_SHA?.trim() || deployedSha;
  await import("./verify-monitoring-function-deployment.mjs");
}
