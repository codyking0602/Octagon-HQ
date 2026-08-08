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
  : true;
const maximumWakeAgeMs = 2.5 * 60 * 60 * 1000;
const wakeDecisionToleranceMs = 5 * 60 * 1000;

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

const serviceHeaders = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
  "Content-Type": "application/json",
};
const healthResponse = await fetch(
  `https://${projectId}.supabase.co/rest/v1/rpc/get_pick_monitoring_scheduler_health`,
  {
    method: "POST",
    headers: serviceHeaders,
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
  last_run_status: health?.last_run_status ?? null,
  last_run_started_at: health?.last_run_started_at ?? null,
  last_run_finished_at: health?.last_run_finished_at ?? null,
};

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

let latestDecision = null;
if (expectedActive) {
  const lastWakeStartedAt = Date.parse(safeHealth.last_run_started_at ?? "");
  const lastWakeFinishedAt = Date.parse(safeHealth.last_run_finished_at ?? "");
  const now = Date.now();
  if (safeHealth.last_run_status !== "succeeded"
    || !Number.isFinite(lastWakeStartedAt)
    || !Number.isFinite(lastWakeFinishedAt)
    || lastWakeFinishedAt < lastWakeStartedAt
    || now - lastWakeStartedAt > maximumWakeAgeMs
    || lastWakeStartedAt - now > wakeDecisionToleranceMs) {
    throw new Error(`Production Picks monitoring scheduler has no recent successful wake: ${JSON.stringify(safeHealth)}`);
  }

  const query = new URLSearchParams({
    select: "run_id,status,decision_reason,provider_called,started_at,completed_at,source_event_identity",
    trigger_kind: "eq.scheduled",
    order: "completed_at.desc.nullslast,created_at.desc",
    limit: "1",
  });
  const decisionResponse = await fetch(
    `https://${projectId}.supabase.co/rest/v1/pick_monitoring_runs?${query}`,
    { headers: serviceHeaders },
  );
  const decisions = await readBody(decisionResponse);
  if (!decisionResponse.ok || !Array.isArray(decisions) || decisions.length !== 1) {
    throw new Error(`Latest production monitoring decision lookup failed with HTTP ${decisionResponse.status}.`);
  }

  const decision = decisions[0];
  latestDecision = {
    run_id: decision?.run_id ?? null,
    status: decision?.status ?? null,
    decision_reason: decision?.decision_reason ?? null,
    provider_called: decision?.provider_called,
    started_at: decision?.started_at ?? null,
    completed_at: decision?.completed_at ?? null,
    source_event_identity: decision?.source_event_identity ?? null,
  };
  const completedAt = Date.parse(latestDecision.completed_at ?? "");
  const allowedStatuses = new Set(["completed", "partial", "failed", "skipped"]);
  const preProviderFailureReasons = new Set([
    "notification_dispatch_failed",
    "database_read_failed",
    "event_resolution_failed",
    "schedule_state_failed",
    "schedule_claim_failed",
    "monitoring_not_configured",
    "source_preview_failed",
  ]);
  if (!allowedStatuses.has(latestDecision.status)
    || typeof latestDecision.provider_called !== "boolean"
    || !Number.isFinite(completedAt)
    || completedAt < lastWakeStartedAt - wakeDecisionToleranceMs
    || completedAt > now + wakeDecisionToleranceMs
    || (latestDecision.status === "skipped" && latestDecision.provider_called !== false)
    || (["completed", "partial"].includes(latestDecision.status) && latestDecision.provider_called !== true)
    || (preProviderFailureReasons.has(latestDecision.decision_reason) && latestDecision.provider_called !== false)) {
    throw new Error(`Latest production monitoring decision is missing or untruthful: ${JSON.stringify(latestDecision)}`);
  }

  const healthyStatuses = new Set(["completed", "skipped"]);
  if (!healthyStatuses.has(latestDecision.status)) {
    throw new Error(`Production Picks monitoring is unhealthy: ${JSON.stringify(latestDecision)}`);
  }
}

if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(
    `${process.env.RUNNER_TEMP}/monitoring-scheduler-proof.json`,
    `${JSON.stringify({ expected_active: expectedActive, health: safeHealth, latest_decision: latestDecision }, null, 2)}\n`,
  );
}

if (!expectedActive) {
  console.log("PASS: production Picks monitoring scheduler is safely paused, canonical, command-configured, and token-configured without invoking the runner or provider.");
} else {
  console.log(
    `PASS: production Picks monitoring scheduler woke successfully and recorded a healthy ${latestDecision.status} decision (provider_called=${latestDecision.provider_called}).`,
  );
}
