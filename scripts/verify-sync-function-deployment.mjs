import { existsSync, writeFileSync } from "node:fs";

const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;
const expectedSha = process.env.EXPECTED_SYNC_SOURCE_SHA?.trim() ?? "";
const productionOrigin = process.env.OCTAGON_PRODUCTION_ORIGIN
  ?? "https://octagon.hq-app.workers.dev";

if (!accessToken || !projectId || !expectedSha) {
  throw new Error("Exact sync-function verification is not configured.");
}
if (!/^[0-9a-f]{40}$/i.test(expectedSha)) {
  throw new Error("EXPECTED_SYNC_SOURCE_SHA must be a full commit SHA.");
}

async function readBody(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
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
if (body?.deployment_sha !== expectedSha) {
  throw new Error(
    `Deployed sync-function marker mismatch: expected ${expectedSha}, received ${body?.deployment_sha ?? "missing"}.`,
  );
}
if (response.headers.get("x-octagon-backend-sha") !== expectedSha) {
  throw new Error("Deployed sync-function SHA header did not match the expected exact source.");
}
if (response.headers.get("access-control-allow-origin") !== productionOrigin) {
  throw new Error(`Deployed sync function is not allowing ${productionOrigin}.`);
}

console.log(`PASS: sync-next-ufc-event is deployed from exact source ${expectedSha}.`);

if (existsSync("supabase/functions/run-pick-monitoring/index.ts")) {
  process.env.EXPECTED_MONITORING_SOURCE_SHA = process.env.EXPECTED_MONITORING_SOURCE_SHA?.trim() || expectedSha;
  try {
    await import("./verify-monitoring-function-deployment.mjs");
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    if (process.env.RUNNER_TEMP) {
      writeFileSync(
        `${process.env.RUNNER_TEMP}/event-setup-webkit.log`,
        `Manual monitoring deployment verification failed:\n${message}\n`,
        "utf8",
      );
    }
    throw error;
  }
}
