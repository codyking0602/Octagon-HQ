import type { CardChangeApprovalProposal } from "./cardChangeApproval";

export type MonitoringTriggerKind = "scheduled" | "manual";
export type MonitoringRunStatus = "completed" | "partial" | "failed";
export type MonitoringFindingSeverity = "info" | "warning" | "error";
export type MonitoringFindingReviewStatus = "new" | "reviewed" | "dismissed";
export type MonitoringFindingType = "card_change" | "odds_available" | "odds_change" | "unmatched_fight" | "provider_error" | "quota_warning";

export interface MonitoringSchedulerHealth {
  jobId: number | null;
  jobName: string | null;
  schedule: string | null;
  active: boolean;
  tokenConfigured: boolean;
  lastWakeStatus: string | null;
  lastWakeStartedAt: string | null;
  lastWakeEndedAt: string | null;
}

export interface MonitoredPickEvent {
  kind: "staged" | "current";
  eventId: string;
  sourceEventIdentity: string;
  name: string;
  subtitle: string;
  startsAt: string;
  locksAt: string;
  boutCount: number;
}

export interface MonitoringScheduleState {
  sourceEventIdentity: string;
  nextEligibleAt: string;
  leaseUntil: string | null;
  lastClaimedAt: string | null;
  updatedAt: string;
}

export interface MonitoringRun {
  runId: string;
  triggerKind: MonitoringTriggerKind;
  status: MonitoringRunStatus;
  sourceEventIdentity: string;
  eventId: string | null;
  startedAt: string;
  completedAt: string | null;
  cardSource?: string | null;
  cardSourceUrl?: string | null;
  oddsProvider?: string | null;
  providerRequestsRemaining: number | null;
  providerRequestsUsed: number | null;
  providerLastRequestCost: number | null;
  providerEventCount: number;
  completeSnapshotCount: number;
  missingSnapshotCount: number;
  diagnostics: unknown[];
  findingCount: number;
  newFindingCount: number;
}

export interface MonitoringFinding {
  findingId: string;
  runId: string;
  triggerKind: MonitoringTriggerKind;
  runStatus: MonitoringRunStatus;
  findingKey: string;
  findingType: MonitoringFindingType;
  severity: MonitoringFindingSeverity;
  reviewStatus: MonitoringFindingReviewStatus;
  matchupIdentity: string | null;
  boutId: string | null;
  summary: string;
  beforeValue: unknown;
  afterValue: unknown;
  sourceDetails: Record<string, unknown>;
  approvalProposal?: CardChangeApprovalProposal | null;
  detectedAt: string;
  reviewedAt: string | null;
}

export interface MonitoringInbox {
  generatedAt: string;
  scheduler: MonitoringSchedulerHealth;
  monitoredEvent: MonitoredPickEvent | null;
  scheduleState: MonitoringScheduleState | null;
  latestRun: MonitoringRun | null;
  unresolvedCount: number;
  newFindings: MonitoringFinding[];
  reviewedFindings: MonitoringFinding[];
  recentRuns: MonitoringRun[];
  latestScheduledDecision?: {
    outcome: "completed" | "partial" | "failed" | "skipped";
    reason: string | null;
    attemptedAt: string;
    providerCalled: boolean;
  } | null;
}

export function monitoringFindingTypeLabel(type: MonitoringFindingType) {
  if (type === "card_change") return "CARD CHANGE";
  if (type === "odds_available") return "ODDS AVAILABLE";
  if (type === "odds_change") return "ODDS CHANGE";
  if (type === "unmatched_fight") return "UNMATCHED FIGHT";
  if (type === "provider_error") return "PROVIDER ISSUE";
  return "QUOTA WARNING";
}

export function monitoringRunStatusLabel(status: MonitoringRunStatus) {
  if (status === "completed") return "COMPLETE";
  if (status === "partial") return "PARTIAL";
  return "FAILED";
}
