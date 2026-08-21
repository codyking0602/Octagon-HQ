import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import { adaptEspnUfcLiveFightState, ESPN_UFC_SCOREBOARD_URL, shouldPollEspnLiveFightState } from "../../../src/features/picks-monitoring/espnLiveFightState.ts";
import { adaptTheOddsApiResponse, buildTheOddsApiRequestUrl } from "../../../src/features/picks-monitoring/theOddsApi.ts";
import { buildManualMonitoringPayload, monitoringSummary, resolveMonitoringEvent, type CardScope, type MonitoringEvent, type SourcePreview } from "../../../src/features/picks-monitoring/manualMonitoringRunner.ts";
import {
  decideScheduledMonitoring,
  eventIsInAutomaticStagingWindow,
  shouldAttemptAutomaticEventStaging,
  type ScheduledMonitoringState,
} from "../../../src/features/picks-monitoring/scheduledMonitoring.ts";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";

const schedulerHeader = "x-octagon-scheduler-token";
const HOUR_MS = 60 * 60 * 1000;
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Octagon-Backend-Sha",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store", "X-Octagon-Backend-Sha": DEPLOYED_SOURCE_SHA } });
const safeError = (status: number, code: string, message: string) => json({ code, message, deployment_sha: DEPLOYED_SOURCE_SHA }, status);
const asRecord = (value: unknown): Record<string, unknown> | null => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const asEvent = (value: unknown) => asRecord(value) as unknown as MonitoringEvent | null;
const noOp = (
  reason: string,
  sourceEventIdentity?: string,
  nextEligibleAt?: string,
  notificationDispatch?: unknown,
  liveStateSync?: unknown,
) => json({
  status: "noop",
  reason,
  source_event_identity: sourceEventIdentity ?? null,
  next_eligible_at: nextEligibleAt ?? null,
  provider_called: false,
  notification_dispatch: notificationDispatch ?? null,
  live_state_sync: liveStateSync ?? null,
  deployment_sha: DEPLOYED_SOURCE_SHA,
});

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
  const finishScheduledDecision = async (decision: {
    outcome: "skipped" | "failed";
    reason: string;
    response: Response;
    identity?: string;
    nextEligibleAt?: string;
    providerCalled?: boolean;
  }) => {
    if (!scheduled) return decision.response;
    const recorded = await admin.rpc("record_pick_monitoring_scheduler_decision", {
      p_outcome: decision.outcome,
      p_reason: decision.reason,
      p_source_event_identity: decision.identity ?? null,
      p_next_eligible_at: decision.nextEligibleAt ?? null,
      p_provider_called: decision.providerCalled ?? false,
    });
    if (recorded.error || !recorded.data) {
      return safeError(
        503,
        "MONITORING_DECISION_RECORD_FAILED",
        "The scheduled monitoring outcome could not be recorded safely.",
      );
    }
    return decision.response;
  };
  const authorization = request.headers.get("authorization") ?? "";
  let setupData: MonitoringEvent | null = null;
  let currentData: MonitoringEvent | null = null;
  let notificationDispatch: unknown = null;

  if (scheduled) {
    const schedulerToken = request.headers.get(schedulerHeader) ?? "";
    const authorized = await admin.rpc("authorize_pick_monitoring_scheduler", { p_token: schedulerToken });
    if (authorized.error || authorized.data !== true) return safeError(401, "SCHEDULER_AUTH_REQUIRED", "Scheduled monitoring authorization required.");

    // Reuse the one trusted hourly wake-up for all due in-app reminders and owner actions.
    // The database function owns timing and idempotency; this Edge Function adds no scheduler.
    const dispatched = await admin.rpc("dispatch_due_in_app_notifications", {
      p_now: new Date().toISOString(),
    });
    if (dispatched.error) {
      return finishScheduledDecision({
        outcome: "failed",
        reason: "notification_dispatch_failed",
        response: safeError(503, "NOTIFICATION_DISPATCH_FAILED", "Due notifications could not be dispatched safely."),
      });
    }
    notificationDispatch = dispatched.data;

    const eventState = await admin.rpc("get_pick_monitoring_event_state");
    if (eventState.error) {
      return finishScheduledDecision({
        outcome: "failed",
        reason: "database_read_failed",
        response: safeError(503, "DATABASE_READ_FAILED", "Canonical Picks state is unavailable."),
      });
    }
    const state = asRecord(eventState.data);
    setupData = asEvent(state?.staged);
    currentData = asEvent(state?.current);

    // When Event Setup is empty, reuse the existing source preview and staging RPC.
    // Discovery is bounded to Monday/Tuesday checkpoints and the preview must prove
    // the next event is inside the six-day fight-week horizon. This path stages only;
    // publishing remains an explicit owner action in Event Setup.
    const stagingNow = new Date();
    if (!setupData && !currentData && shouldAttemptAutomaticEventStaging(stagingNow)) {
      const stagePreviewResponse = await fetch(`${url}/functions/v1/sync-next-ufc-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: serviceKey },
        body: JSON.stringify({ mode: "monitoring-preview" }),
      });
      const stagePreviewBody = await stagePreviewResponse.json().catch(() => null) as {
        event_preview?: SourcePreview;
        effective_scope?: CardScope;
      } | null;
      if (!stagePreviewResponse.ok || !stagePreviewBody?.event_preview || !stagePreviewBody.effective_scope) {
        return finishScheduledDecision({
          outcome: "failed",
          reason: "automatic_stage_source_failed",
          providerCalled: false,
          response: safeError(502, "AUTOMATIC_STAGE_SOURCE_FAILED", "The next UFC event could not be discovered safely for automatic staging."),
        });
      }

      const stageEvent = asRecord(stagePreviewBody.event_preview);
      const stageStartsAt = typeof stageEvent?.starts_at === "string" ? stageEvent.starts_at : null;
      if (eventIsInAutomaticStagingWindow(stageStartsAt, stagingNow)) {
        const staged = await admin.rpc("stage_pick_event_draft", {
          p_payload: stagePreviewBody.event_preview,
        });
        if (staged.error) {
          return finishScheduledDecision({
            outcome: "failed",
            reason: "automatic_stage_write_failed",
            providerCalled: false,
            response: safeError(503, "AUTOMATIC_STAGE_WRITE_FAILED", "The next UFC event could not be staged safely."),
          });
        }
        const stagedIdentity = typeof stageEvent?.source_event_key === "string"
          ? stageEvent.source_event_key
          : typeof stageEvent?.event_id === "string"
            ? stageEvent.event_id
            : undefined;

        // The due-notification dispatcher ran before the draft existed. Re-run that
        // same idempotent canonical owner once after staging so event_draft_ready is
        // delivered in this wake rather than waiting for the next hourly scheduler run.
        const stagedDispatch = await admin.rpc("dispatch_due_in_app_notifications", {
          p_now: stagingNow.toISOString(),
        });
        if (stagedDispatch.error) {
          return finishScheduledDecision({
            outcome: "failed",
            reason: "automatic_stage_notification_failed",
            identity: stagedIdentity,
            providerCalled: false,
            response: safeError(503, "AUTOMATIC_STAGE_NOTIFICATION_FAILED", "The event was staged, but its owner review notification could not be dispatched safely."),
          });
        }
        notificationDispatch = stagedDispatch.data;

        return finishScheduledDecision({
          outcome: "skipped",
          reason: "event_staged",
          identity: stagedIdentity,
          providerCalled: false,
          response: noOp("event_staged", stagedIdentity, undefined, notificationDispatch),
        });
      }
    }
  } else {
    const token = authorization.replace(/^Bearer\s+/i, "");
    const auth = await admin.auth.getUser(token);
    if (auth.error || !auth.data.user) return safeError(401, "OWNER_AUTH_REQUIRED", "Owner sign-in required.");
    const owner = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false }, global: { headers: { Authorization: authorization } } });
    const ownerProbe = await owner.rpc("get_pick_event_setup");
    if (ownerProbe.error) return safeError(403, "OWNER_ACCESS_REQUIRED", "Fight Night owner access required.");

    // Manual CHECK NOW and the scheduler resolve the same canonical monitoring state.
    // The owner probe above authorizes the request; it is not a second event query path.
    const eventState = await admin.rpc("get_pick_monitoring_event_state");
    if (eventState.error) return safeError(503, "DATABASE_READ_FAILED", "Canonical Picks state is unavailable.");
    const state = asRecord(eventState.data);
    setupData = asEvent(state?.staged);
    currentData = asEvent(state?.current);
  }

  let resolved;
  try {
    resolved = resolveMonitoringEvent(setupData, currentData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (scheduled && message.includes("No monitorable")) {
      return finishScheduledDecision({
        outcome: "skipped",
        reason: "no_event",
        response: noOp("no_event", undefined, undefined, notificationDispatch),
      });
    }
    return finishScheduledDecision({
      outcome: "failed",
      reason: "event_resolution_failed",
      response: safeError(409, "EVENT_RESOLUTION_FAILED", "Monitoring event identity is missing, conflicting, or ambiguous."),
    });
  }

  let liveStateSync: Record<string, unknown> | null = null;
  const liveStateNow = new Date();
  if (
    resolved.kind === "current"
    && resolved.storageEventId
    && shouldPollEspnLiveFightState(resolved.selected, liveStateNow)
  ) {
    const observedAt = liveStateNow.toISOString();
    try {
      const liveResponse = await fetch(ESPN_UFC_SCOREBOARD_URL, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!liveResponse.ok) {
        liveStateSync = { status: "source_error", http_status: liveResponse.status };
      } else {
        const adapted = adaptEspnUfcLiveFightState({
          body: await liveResponse.json().catch(() => null),
          event: resolved.selected,
          observedAt,
        });
        liveStateSync = {
          status: adapted.status,
          source_event_id: adapted.source_event_id,
          observations: adapted.observations.length,
          diagnostics: adapted.diagnostics,
        };
        if (adapted.status === "matched" && adapted.observations.length) {
          const persisted = await admin.rpc("record_pick_bout_live_states", {
            p_event_id: resolved.storageEventId,
            p_observations: adapted.observations,
          });
          liveStateSync = persisted.error
            ? { ...liveStateSync, status: "write_error" }
            : { ...liveStateSync, status: "recorded", persistence: persisted.data };
        }
      }
    } catch {
      liveStateSync = { status: "source_error" };
    }
  }

  let suppressFindingKeys = new Set<string>();
  let scheduledClaimedAt: string | null = null;
  let scheduledNextEligibleAt: string | null = null;
  if (scheduled) {
    const scheduleStateResponse = await admin.rpc("get_pick_monitoring_schedule_state", { p_source_event_identity: resolved.identity });
    if (scheduleStateResponse.error) {
      return finishScheduledDecision({
        outcome: "failed",
        reason: "schedule_state_failed",
        identity: resolved.identity,
        response: safeError(503, "SCHEDULE_STATE_FAILED", "Monitoring schedule state is unavailable."),
      });
    }
    const scheduleState = asRecord(scheduleStateResponse.data) as ScheduledMonitoringState & { existing_finding_keys?: unknown } | null;
    const decision = decideScheduledMonitoring({ event: resolved.selected, now: new Date(), state: scheduleState });
    if (!decision.due) {
      return finishScheduledDecision({
        outcome: "skipped",
        reason: decision.reason,
        identity: resolved.identity,
        nextEligibleAt: decision.next_eligible_at,
        response: noOp(decision.reason, resolved.identity, decision.next_eligible_at, notificationDispatch, liveStateSync),
      });
    }

    scheduledClaimedAt = new Date().toISOString();
    scheduledNextEligibleAt = decision.next_eligible_at;
    const claim = await admin.rpc("claim_pick_monitoring_schedule", {
      p_source_event_identity: resolved.identity,
      p_now: scheduledClaimedAt,
    });
    if (claim.error) {
      return finishScheduledDecision({
        outcome: "failed",
        reason: "schedule_claim_failed",
        identity: resolved.identity,
        nextEligibleAt: scheduledNextEligibleAt,
        response: safeError(503, "SCHEDULE_CLAIM_FAILED", "Monitoring schedule could not be claimed safely."),
      });
    }
    if (claim.data !== true) {
      return finishScheduledDecision({
        outcome: "skipped",
        reason: "already_claimed",
        identity: resolved.identity,
        response: noOp("already_claimed", resolved.identity, undefined, notificationDispatch, liveStateSync),
      });
    }
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
    const retryAt = retryInOneHour();
    await releaseSchedule(retryAt);
    return finishScheduledDecision({
      outcome: "failed",
      reason: "monitoring_not_configured",
      identity: resolved.identity,
      nextEligibleAt: retryAt,
      response: safeError(503, "MONITORING_NOT_CONFIGURED", "Monitoring credentials are not configured."),
    });
  }

  const startedAt = new Date().toISOString();
  const selectedEvent = asRecord(resolved.selected);
  const sourceUrl = typeof selectedEvent?.source_url === "string"
    ? selectedEvent.source_url.trim()
    : "";
  const sourceEventKey = typeof selectedEvent?.source_event_key === "string"
    ? selectedEvent.source_event_key.trim()
    : "";
  const previewResponse = await fetch(`${url}/functions/v1/sync-next-ufc-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: serviceKey },
    body: JSON.stringify({
      mode: "monitoring-preview",
      ...(sourceUrl ? { source_url: sourceUrl } : {}),
      ...(sourceEventKey ? { source_event_key: sourceEventKey } : {}),
    }),
  });
  const previewBody = await previewResponse.json().catch(() => null) as { event_preview?: SourcePreview; effective_scope?: CardScope } | null;
  if (!previewResponse.ok || !previewBody?.event_preview || !previewBody.effective_scope) {
    const retryAt = retryInOneHour();
    await releaseSchedule(retryAt);
    return finishScheduledDecision({
      outcome: "failed",
      reason: "source_preview_failed",
      identity: resolved.identity,
      nextEligibleAt: retryAt,
      providerCalled: false,
      response: safeError(502, "SOURCE_PREVIEW_FAILED", "The event/card source preview failed safely."),
    });
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
    return finishScheduledDecision({
      outcome: "failed",
      reason: "event_identity_mismatch",
      identity: resolved.identity,
      nextEligibleAt: scheduledNextEligibleAt ?? undefined,
      providerCalled: true,
      response: safeError(409, "EVENT_IDENTITY_MISMATCH", "Source and monitored event identities did not match."),
    });
  }

  const recorded = scheduled
    ? await admin.rpc("record_scheduled_pick_monitoring_run", {
        p_payload: payload,
        p_claimed_at: scheduledClaimedAt,
        p_next_eligible_at: scheduledNextEligibleAt,
      })
    : await admin.rpc("record_pick_monitoring_run_and_apply_odds", { p_payload: payload });
  if (recorded.error || !recorded.data) {
    const retryAt = retryInOneHour();
    if (scheduledNextEligibleAt) await releaseSchedule(retryAt);
    return finishScheduledDecision({
      outcome: "failed",
      reason: "monitoring_record_failed",
      identity: resolved.identity,
      nextEligibleAt: retryAt,
      providerCalled: true,
      response: safeError(503, "MONITORING_RECORD_FAILED", "Monitoring evidence and eligible odds could not be recorded atomically."),
    });
  }
  return json({
    ...monitoringSummary(String(recorded.data), payload),
    trigger_kind: payload.trigger_kind,
    provider_called: true,
    notification_dispatch: notificationDispatch,
    live_state_sync: liveStateSync,
  });
});