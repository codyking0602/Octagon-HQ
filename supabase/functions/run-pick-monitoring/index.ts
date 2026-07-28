import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import { adaptTheOddsApiResponse, buildTheOddsApiRequestUrl } from "../../../src/features/picks-monitoring/theOddsApi.ts";
import { buildManualMonitoringPayload, monitoringSummary, resolveMonitoringEvent, type CardScope, type MonitoringEvent, type SourcePreview } from "../../../src/features/picks-monitoring/manualMonitoringRunner.ts";
import { decideScheduledMonitoring, type ScheduledMonitoringState } from "../../../src/features/picks-monitoring/scheduledMonitoring.ts";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";

const schedulerHeader = "x-octagon-scheduler-token";
const HOUR_MS = 60 * 60 * 1000;
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Octagon-Backend-Sha",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store", "X-Octagon-Backend-Sha": DEPLOYED_SOURCE_SHA } });
const safeError = (status: number, code: string, message: string) => json({ code, message, deployment_sha: DEPLOYED_SOURCE_SHA }, status);
const asRecord = (value: unknown): Record<string, unknown> | null => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const asEvent = (value: unknown) => asRecord(value) as unknown as MonitoringEvent | null;
const noOp = (reason: string, sourceEventIdentity?: string, nextEligibleAt?: string) => json({ status: "noop", reason, source_event_identity: sourceEventIdentity ?? null, next_eligible_at: nextEligibleAt ?? null, provider_called: false, deployment_sha: DEPLOYED_SOURCE_SHA });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return safeError(405, "METHOD_NOT_ALLOWED", "Method not allowed.");

  let input: Record<string, unknown> = {};
  try { input = asRecord(await request.json()) ?? {}; } catch { /* empty input */ }
  if (input.mode === "deployment-info") return json({ deployment_sha: DEPLOYED_SOURCE_SHA });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return safeError(503, "MONITORING_NOT_CONFIGURED", "Monitoring credentials are not configured.");

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const scheduled = input.mode === "scheduled";
  const authorization = request.headers.get("authorization") ?? "";
  let setupData: MonitoringEvent | null = null;
  let currentData: MonitoringEvent | null = null;

  if (scheduled) {
    const schedulerToken = request.headers.get(schedulerHeader) ?? "";
    const authorized = await admin.rpc("authorize_pick_monitoring_scheduler", { p_token: schedulerToken });
    if (authorized.error || authorized.data !== true) return safeError(401, "SCHEDULER_AUTH_REQUIRED", "Scheduled monitoring authorization required.");

    const eventState = await admin.rpc("get_pick_monitoring_event_state");
    if (eventState.error) return safeError(503, "DATABASE_READ_FAILED", "Canonical Picks state is unavailable.");
    const state = asRecord(eventState.data);
    setupData = asEvent(state?.staged);
    currentData = asEvent(state?.current);
  } else {
    const token = authorization.replace(/^Bearer\s+/i, "");
    const auth = await admin.auth.getUser(token);
    if (auth.error || !auth.data.user) return safeError(401, "OWNER_AUTH_REQUIRED", "Owner sign-in required.");
    const owner = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false }, global: { headers: { Authorization: authorization } } });
    const [setup, current] = await Promise.all([owner.rpc("get_pick_event_setup"), owner.rpc("get_current_pick_event")]);
    if (setup.error) return safeError(403, "OWNER_ACCESS_REQUIRED", "Fight Night owner access required.");
    if (current.error) return safeError(503, "DATABASE_READ_FAILED", "Canonical Picks state is unavailable.");
    setupData = asEvent(setup.data);
    currentData = asEvent(current.data);
  }

  let resolved;
  try {
    resolved = resolveMonitoringEvent(setupData, currentData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (scheduled && message.includes("No monitorable")) return noOp("no_event");
    return safeError(409, "EVENT_RESOLUTION_FAILED", "Monitoring event identity is missing, conflicting, or ambiguous.");
  }

  let suppressFindingKeys = new Set<string>();
  let scheduledClaimedAt: string | null = null;
  let scheduledNextEligibleAt: string | null = null;
  if (scheduled) {
    const scheduleStateResponse = await admin.rpc("get_pick_monitoring_schedule_state", { p_source_event_identity: resolved.identity });
    if (scheduleStateResponse.error) return safeError(503, "SCHEDULE_STATE_FAILED", "Monitoring schedule state is unavailable.");
    const scheduleState = asRecord(scheduleStateResponse.data) as ScheduledMonitoringState & { existing_finding_keys?: unknown } | null;
    const decision = decideScheduledMonitoring({ event: resolved.selected, now: new Date(), state: scheduleState });
    if (!decision.due) return noOp(decision.reason, resolved.identity, decision.next_eligible_at);

    scheduledClaimedAt = new Date().toISOString();
    scheduledNextEligibleAt = decision.next_eligible_at;
    const claim = await admin.rpc("claim_pick_monitoring_schedule", {
      p_source_event_identity: resolved.identity,
      p_now: scheduledClaimedAt,
    });
    if (claim.error) return safeError(503, "SCHEDULE_CLAIM_FAILED", "Monitoring schedule could not be claimed safely.");
    if (claim.data !== true) return noOp("already_claimed", resolved.identity);
    suppressFindingKeys = new Set(Array.isArray(scheduleState?.existing_finding_keys)
      ? scheduleState.existing_finding_keys.filter((value): value is string => typeof value === "string")
      : []);
  }

  const releaseSchedule = async (retryAt: string) => {
    if (!scheduled || !scheduledClaimedAt) return;
    await admin.rpc("release_pick_monitoring_schedule", {
      p_source_event_identity: resolved.identity,
      p_claimed_at: scheduledClaimedAt,
      p_retry_at: retryAt,
    });
  };
  const retryInOneHour = () => new Date(Date.now() + HOUR_MS).toISOString();

  const providerKey = Deno.env.get("THE_ODDS_API_KEY");
  if (!providerKey) {
    await releaseSchedule(retryInOneHour());
    return safeError(503, "MONITORING_NOT_CONFIGURED", "Monitoring credentials are not configured.");
  }

  const startedAt = new Date().toISOString();
  const previewHeaders: Record<string, string> = { "Content-Type": "application/json" };
  if (scheduled) previewHeaders.apikey = serviceKey;
  else previewHeaders.Authorization = authorization;
  const previewResponse = await fetch(`${url}/functions/v1/sync-next-ufc-event`, {
    method: "POST",
    headers: previewHeaders,
    body: JSON.stringify({ mode: scheduled ? "monitoring-preview" : "preview" }),
  });
  const previewBody = await previewResponse.json().catch(() => null) as { event_preview?: SourcePreview; effective_scope?: CardScope } | null;
  if (!previewResponse.ok || !previewBody?.event_preview || !previewBody.effective_scope) {
    await releaseSchedule(retryInOneHour());
    return safeError(502, "SOURCE_PREVIEW_FAILED", "The UFC source preview failed safely.");
  }

  const fetchedAt = new Date().toISOString();
  let oddsResponse: Response;
  try { oddsResponse = await fetch(buildTheOddsApiRequestUrl(providerKey)); } catch { oddsResponse = new Response(null, { status: 502 }); }
  const odds = adaptTheOddsApiResponse({ status: oddsResponse.status, body: await oddsResponse.json().catch(() => null), headers: oddsResponse.headers }, fetchedAt);
  let payload;
  try {
    payload = buildManualMonitoringPayload({
      resolved,
      source: previewBody.event_preview,
      scope: previewBody.effective_scope,
      odds,
      startedAt,
      completedAt: new Date().toISOString(),
      triggerKind: scheduled ? "scheduled" : "manual",
      suppressFindingKeys: scheduled ? suppressFindingKeys : undefined,
    });
  } catch {
    if (scheduledNextEligibleAt) await releaseSchedule(scheduledNextEligibleAt);
    return safeError(409, "EVENT_IDENTITY_MISMATCH", "Source and monitored event identities did not match.");
  }

  const recorded = scheduled
    ? await admin.rpc("record_scheduled_pick_monitoring_run", {
        p_payload: payload,
        p_claimed_at: scheduledClaimedAt,
        p_next_eligible_at: scheduledNextEligibleAt,
      })
    : await admin.rpc("record_pick_monitoring_run_and_apply_odds", { p_payload: payload });
  if (recorded.error || !recorded.data) {
    if (scheduledNextEligibleAt) await releaseSchedule(scheduledNextEligibleAt);
    return safeError(503, "MONITORING_RECORD_FAILED", "Monitoring evidence and eligible odds could not be recorded atomically.");
  }
  return json({ ...monitoringSummary(String(recorded.data), payload), trigger_kind: payload.trigger_kind, provider_called: true });
});
