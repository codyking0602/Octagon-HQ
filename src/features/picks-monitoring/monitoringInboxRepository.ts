import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  MonitoringFinding,
  MonitoringFindingReviewStatus,
  MonitoringInbox,
  MonitoringRun,
} from "./monitoringInboxModel";

const schedulerSchema = z.object({
  job_id: z.number().int().nullable(),
  job_name: z.string().nullable(),
  schedule: z.string().nullable(),
  active: z.boolean(),
  token_configured: z.boolean(),
  last_wake_status: z.string().nullable(),
  last_wake_started_at: z.string().nullable(),
  last_wake_ended_at: z.string().nullable(),
});

const eventSchema = z.object({
  kind: z.enum(["staged", "current"]),
  event_id: z.string(),
  source_event_identity: z.string(),
  name: z.string(),
  subtitle: z.string(),
  starts_at: z.string(),
  locks_at: z.string(),
  bout_count: z.number().int().nonnegative(),
});

const scheduleStateSchema = z.object({
  source_event_identity: z.string(),
  next_eligible_at: z.string(),
  lease_until: z.string().nullable(),
  last_claimed_at: z.string().nullable(),
  updated_at: z.string(),
});

const runSchema = z.object({
  run_id: z.string(),
  trigger_kind: z.enum(["scheduled", "manual"]),
  status: z.enum(["completed", "partial", "failed"]),
  source_event_identity: z.string(),
  event_id: z.string().nullable(),
  started_at: z.string(),
  completed_at: z.string().nullable(),
  card_source: z.string().nullable().optional(),
  card_source_url: z.string().nullable().optional(),
  odds_provider: z.string().nullable().optional(),
  provider_requests_remaining: z.number().int().nonnegative().nullable(),
  provider_requests_used: z.number().int().nonnegative().nullable(),
  provider_last_request_cost: z.number().int().nonnegative().nullable(),
  provider_event_count: z.number().int().nonnegative(),
  complete_snapshot_count: z.number().int().nonnegative(),
  missing_snapshot_count: z.number().int().nonnegative(),
  diagnostics: z.array(z.unknown()).default([]),
  finding_count: z.number().int().nonnegative(),
  new_finding_count: z.number().int().nonnegative(),
});

const findingSchema = z.object({
  finding_id: z.string(),
  run_id: z.string(),
  trigger_kind: z.enum(["scheduled", "manual"]),
  run_status: z.enum(["completed", "partial", "failed"]),
  finding_key: z.string(),
  finding_type: z.enum(["card_change", "odds_available", "odds_change", "unmatched_fight", "provider_error", "quota_warning"]),
  severity: z.enum(["info", "warning", "error"]),
  review_status: z.enum(["new", "reviewed", "dismissed"]),
  matchup_identity: z.string().nullable(),
  bout_id: z.string().nullable(),
  summary: z.string(),
  before_value: z.unknown().nullable(),
  after_value: z.unknown().nullable(),
  source_details: z.record(z.string(), z.unknown()).default({}),
  detected_at: z.string(),
  reviewed_at: z.string().nullable(),
});

const approvalProposalSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("adjust_event_lock"),
    event_id: z.string(),
    expected_locks_at: z.string(),
    proposed_locks_at: z.string(),
  }),
  z.object({
    action: z.literal("update_event_metadata"),
    event_id: z.string(),
    field: z.enum(["venue", "location"]),
    expected_value: z.string().nullable(),
    proposed_value: z.string(),
  }),
  z.object({
    action: z.literal("update_bout_weight_class"),
    event_id: z.string(),
    bout_id: z.string(),
    expected_weight_class: z.string().nullable(),
    proposed_weight_class: z.string(),
    expected_red_fighter_slug: z.string(),
    expected_blue_fighter_slug: z.string(),
  }),
  z.object({
    action: z.literal("add_bout"),
    event_id: z.string(),
    bout_id: z.string(),
    weight_class: z.string(),
    red_fighter_slug: z.string(),
    red_fighter_name: z.string(),
    blue_fighter_slug: z.string(),
    blue_fighter_name: z.string(),
    card_segment: z.enum(["prelim", "main"]),
    segment_sequence: z.number().int().positive(),
    locks_at: z.string(),
    expected_bout_ids: z.array(z.string()),
  }),
  z.object({
    action: z.literal("remove_bout"),
    event_id: z.string(),
    bout_id: z.string(),
    expected_included_in_picks: z.literal(true),
    expected_red_fighter_slug: z.string(),
    expected_blue_fighter_slug: z.string(),
  }),
  z.object({
    action: z.literal("replace_fighter"),
    event_id: z.string(),
    bout_id: z.string(),
    corner: z.enum(["red", "blue"]),
    expected_red_fighter_slug: z.string(),
    expected_blue_fighter_slug: z.string(),
    replacement_fighter_slug: z.string(),
    replacement_fighter_name: z.string(),
  }),
  z.object({
    action: z.literal("reorder_card"),
    event_id: z.string(),
    expected_bout_ids: z.array(z.string()).min(1),
    proposed_bout_ids: z.array(z.string()).min(1),
  }),
]);

export const monitoringApprovalReceiptSchema = z.object({
  decision: z.literal("applied"),
  action: z.string().min(1),
  event_id: z.string().min(1),
  bout_id: z.string().nullable(),
  finding_id: z.string().nullable().optional(),
  before_value: z.unknown().nullable(),
  after_value: z.unknown().nullable(),
  mutation_occurred: z.boolean(),
  finding_resolved: z.boolean(),
  picks_preserved: z.number().int().nonnegative(),
  picks_invalidated: z.number().int().nonnegative(),
  repicks_required: z.boolean(),
  player_action_required: z.boolean(),
  required_action: z.string().nullable(),
  player_action_profile_ids: z.array(z.string()),
  deadlines_changed: z.boolean(),
  card_order_changed: z.boolean(),
  notification_recorded: z.boolean(),
  notification_count: z.number().int().nonnegative(),
  remains_pending: z.boolean(),
  audit_id: z.coerce.number().int().positive(),
  failure_code: z.string().nullable(),
});

export type MonitoringApprovalReceipt = z.infer<typeof monitoringApprovalReceiptSchema>;

const decisionSchema = z.object({
  outcome: z.enum(["completed", "partial", "failed", "skipped"]),
  reason: z.string().nullable(),
  attempted_at: z.string(),
  provider_called: z.boolean(),
}).nullable();

const inboxSchema = z.object({
  generated_at: z.string(),
  scheduler: schedulerSchema,
  monitored_event: eventSchema.nullable(),
  schedule_state: scheduleStateSchema.nullable(),
  latest_scheduled_decision: decisionSchema,
  latest_run: runSchema.nullable(),
  unresolved_count: z.number().int().nonnegative(),
  new_findings: z.array(findingSchema),
  reviewed_findings: z.array(findingSchema),
  recent_runs: z.array(runSchema),
});

export interface MonitoringInboxRepository {
  loadInbox: () => Promise<MonitoringInbox>;
  runManualCheck: () => Promise<void>;
  approveFinding?: (findingId: string, reason: string) => Promise<MonitoringApprovalReceipt>;
  reviewFinding: (findingId: string, status: Exclude<MonitoringFindingReviewStatus, "new">) => Promise<void>;
}

async function requireRpcSuccess<T>(request: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Monitoring Inbox could not complete that request.");
  return data;
}

function nonEmptyMessage(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function functionErrorMessage(error: unknown) {
  const candidate = error && typeof error === "object"
    ? error as { message?: unknown; context?: unknown }
    : null;
  const context = candidate?.context;

  if (context && typeof context === "object") {
    const readable = context as { clone?: () => unknown; json?: () => Promise<unknown> };
    let response = readable;
    if (typeof readable.clone === "function") {
      try {
        const cloned = readable.clone();
        if (cloned && typeof cloned === "object") response = cloned as typeof readable;
      } catch {
        // Keep the original Functions response as the fallback.
      }
    }
    if (typeof response.json === "function") {
      try {
        const payload = await response.json();
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          const message = nonEmptyMessage((payload as Record<string, unknown>).message);
          if (message) return message;
        }
      } catch {
        // Fall through to the safe client message.
      }
    }
  }

  return nonEmptyMessage(candidate?.message)
    ?? (error instanceof Error ? nonEmptyMessage(error.message) : null)
    ?? "The monitoring check could not run.";
}

function mapRun(value: z.infer<typeof runSchema>): MonitoringRun {
  return {
    runId: value.run_id,
    triggerKind: value.trigger_kind,
    status: value.status,
    sourceEventIdentity: value.source_event_identity,
    eventId: value.event_id,
    startedAt: value.started_at,
    completedAt: value.completed_at,
    cardSource: value.card_source ?? null,
    cardSourceUrl: value.card_source_url ?? null,
    oddsProvider: value.odds_provider ?? null,
    providerRequestsRemaining: value.provider_requests_remaining,
    providerRequestsUsed: value.provider_requests_used,
    providerLastRequestCost: value.provider_last_request_cost,
    providerEventCount: value.provider_event_count,
    completeSnapshotCount: value.complete_snapshot_count,
    missingSnapshotCount: value.missing_snapshot_count,
    diagnostics: value.diagnostics,
    findingCount: value.finding_count,
    newFindingCount: value.new_finding_count,
  };
}

function mapFinding(value: z.infer<typeof findingSchema>): MonitoringFinding {
  const proposal = approvalProposalSchema.safeParse(value.source_details.approval_proposal);
  return {
    findingId: value.finding_id,
    runId: value.run_id,
    triggerKind: value.trigger_kind,
    runStatus: value.run_status,
    findingKey: value.finding_key,
    findingType: value.finding_type,
    severity: value.severity,
    reviewStatus: value.review_status,
    matchupIdentity: value.matchup_identity,
    boutId: value.bout_id,
    summary: value.summary,
    beforeValue: value.before_value,
    afterValue: value.after_value,
    sourceDetails: value.source_details,
    approvalProposal: proposal.success ? proposal.data : null,
    detectedAt: value.detected_at,
    reviewedAt: value.reviewed_at,
  };
}

export function mapMonitoringInbox(value: unknown): MonitoringInbox {
  const parsed = inboxSchema.parse(value);
  return {
    generatedAt: parsed.generated_at,
    scheduler: {
      jobId: parsed.scheduler.job_id,
      jobName: parsed.scheduler.job_name,
      schedule: parsed.scheduler.schedule,
      active: parsed.scheduler.active,
      tokenConfigured: parsed.scheduler.token_configured,
      lastWakeStatus: parsed.scheduler.last_wake_status,
      lastWakeStartedAt: parsed.scheduler.last_wake_started_at,
      lastWakeEndedAt: parsed.scheduler.last_wake_ended_at,
    },
    monitoredEvent: parsed.monitored_event ? {
      kind: parsed.monitored_event.kind,
      eventId: parsed.monitored_event.event_id,
      sourceEventIdentity: parsed.monitored_event.source_event_identity,
      name: parsed.monitored_event.name,
      subtitle: parsed.monitored_event.subtitle,
      startsAt: parsed.monitored_event.starts_at,
      locksAt: parsed.monitored_event.locks_at,
      boutCount: parsed.monitored_event.bout_count,
    } : null,
    scheduleState: parsed.schedule_state ? {
      sourceEventIdentity: parsed.schedule_state.source_event_identity,
      nextEligibleAt: parsed.schedule_state.next_eligible_at,
      leaseUntil: parsed.schedule_state.lease_until,
      lastClaimedAt: parsed.schedule_state.last_claimed_at,
      updatedAt: parsed.schedule_state.updated_at,
    } : null,
    latestScheduledDecision: parsed.latest_scheduled_decision ? {
      outcome: parsed.latest_scheduled_decision.outcome,
      reason: parsed.latest_scheduled_decision.reason,
      attemptedAt: parsed.latest_scheduled_decision.attempted_at,
      providerCalled: parsed.latest_scheduled_decision.provider_called,
    } : null,
    latestRun: parsed.latest_run ? mapRun(parsed.latest_run) : null,
    unresolvedCount: parsed.unresolved_count,
    newFindings: parsed.new_findings.map(mapFinding),
    reviewedFindings: parsed.reviewed_findings.map(mapFinding),
    recentRuns: parsed.recent_runs.map(mapRun),
  };
}

export function createMonitoringInboxRepository(): MonitoringInboxRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async loadInbox() {
      return mapMonitoringInbox(
        await requireRpcSuccess(client.rpc("get_pick_monitoring_inbox")),
      );
    },

    async runManualCheck() {
      const { error } = await client.functions.invoke("run-pick-monitoring", { body: {} });
      if (error) throw new Error(await functionErrorMessage(error));
    },

    async approveFinding(findingId, reason) {
      return monitoringApprovalReceiptSchema.parse(
        await requireRpcSuccess(client.rpc("approve_pick_monitoring_finding", {
          p_finding_id: findingId,
          p_reason: reason,
        })),
      );
    },

    async reviewFinding(findingId, status) {
      await requireRpcSuccess(client.rpc("review_pick_monitoring_finding", {
        p_finding_id: findingId,
        p_review_status: status,
      }));
    },
  };
}
