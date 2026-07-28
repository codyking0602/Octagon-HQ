import type {
  NormalizedFightOddsSnapshot,
  OddsAdapterDiagnostic,
  OddsAdapterResult,
} from "./oddsModel";

export type MonitoringTriggerKind = "scheduled" | "manual";
export type MonitoringRunStatus = "completed" | "partial" | "failed";
export type MonitoringFindingType =
  | "card_change"
  | "odds_change"
  | "odds_available"
  | "unmatched_fight"
  | "provider_error"
  | "quota_warning";
export type MonitoringFindingSeverity = "info" | "warning" | "error";

export interface MonitoringFindingInput {
  finding_key: string;
  finding_type: MonitoringFindingType;
  severity: MonitoringFindingSeverity;
  summary: string;
  detected_at: string;
  matchup_identity?: string;
  bout_id?: string;
  before_value?: unknown;
  after_value?: unknown;
  source_details?: Record<string, unknown>;
}

export interface StoredOddsSnapshotInput {
  provider: NormalizedFightOddsSnapshot["provider"];
  sport_key: NormalizedFightOddsSnapshot["sportKey"];
  source_event_id: string;
  source_event_identity: string;
  matchup_identity: string;
  commence_time: string;
  sportsbook: NormalizedFightOddsSnapshot["sportsbook"];
  sportsbook_title: string;
  sportsbook_updated_at: string;
  fetched_at: string;
  bout_id?: string;
  prices: readonly [
    {
      fighter_name: string;
      fighter_identity: string;
      american_odds: number;
    },
    {
      fighter_name: string;
      fighter_identity: string;
      american_odds: number;
    },
  ];
}

export interface MonitoringRunPayload {
  trigger_kind: MonitoringTriggerKind;
  status: MonitoringRunStatus;
  source_event_identity: string;
  event_id?: string;
  locks_at?: string;
  started_at: string;
  completed_at: string;
  card_source?: string;
  card_source_url?: string;
  odds_provider: "the-odds-api";
  quota: {
    requests_remaining: number | null;
    requests_used: number | null;
    last_request_cost: number | null;
  };
  coverage: {
    provider_events: number;
    complete_snapshots: number;
    missing_snapshots: number;
  };
  diagnostics: OddsAdapterDiagnostic[];
  findings: MonitoringFindingInput[];
  odds_snapshots: StoredOddsSnapshotInput[];
}

export interface BuildMonitoringRunPayloadInput {
  triggerKind: MonitoringTriggerKind;
  sourceEventIdentity: string;
  startedAt: string;
  completedAt: string;
  odds: OddsAdapterResult;
  eventId?: string;
  locksAt?: string;
  cardSource?: string;
  cardSourceUrl?: string;
  findings?: MonitoringFindingInput[];
  boutIdByMatchup?: Readonly<Record<string, string>>;
}

export function monitoringRunStatus(odds: OddsAdapterResult): MonitoringRunStatus {
  const hasError = odds.diagnostics.some((diagnostic) => diagnostic.severity === "error");
  if (hasError && odds.coverage.completeSnapshots === 0) return "failed";
  if (odds.diagnostics.length > 0 || odds.coverage.missingSnapshots > 0 || odds.quota.requestsRemaining === 0) return "partial";
  return "completed";
}

export function snapshotIsBeforeLock(fetchedAt: string, locksAt?: string | null) {
  if (!locksAt) return false;
  const fetched = Date.parse(fetchedAt);
  const lock = Date.parse(locksAt);
  return Number.isFinite(fetched) && Number.isFinite(lock) && fetched < lock;
}

function storedSnapshot(
  snapshot: NormalizedFightOddsSnapshot,
  boutIdByMatchup: Readonly<Record<string, string>>,
): StoredOddsSnapshotInput {
  return {
    provider: snapshot.provider,
    sport_key: snapshot.sportKey,
    source_event_id: snapshot.sourceEventId,
    source_event_identity: snapshot.sourceEventIdentity,
    matchup_identity: snapshot.matchupIdentity,
    commence_time: snapshot.commenceTime,
    sportsbook: snapshot.sportsbook,
    sportsbook_title: snapshot.sportsbookTitle,
    sportsbook_updated_at: snapshot.sportsbookUpdatedAt,
    fetched_at: snapshot.fetchedAt,
    bout_id: boutIdByMatchup[snapshot.matchupIdentity],
    prices: [
      {
        fighter_name: snapshot.prices[0].fighterName,
        fighter_identity: snapshot.prices[0].fighterIdentity,
        american_odds: snapshot.prices[0].americanOdds,
      },
      {
        fighter_name: snapshot.prices[1].fighterName,
        fighter_identity: snapshot.prices[1].fighterIdentity,
        american_odds: snapshot.prices[1].americanOdds,
      },
    ],
  };
}

export function buildMonitoringRunPayload({
  triggerKind,
  sourceEventIdentity,
  startedAt,
  completedAt,
  odds,
  eventId,
  locksAt,
  cardSource,
  cardSourceUrl,
  findings = [],
  boutIdByMatchup = {},
}: BuildMonitoringRunPayloadInput): MonitoringRunPayload {
  return {
    trigger_kind: triggerKind,
    status: monitoringRunStatus(odds),
    source_event_identity: sourceEventIdentity,
    event_id: eventId,
    locks_at: locksAt,
    started_at: startedAt,
    completed_at: completedAt,
    card_source: cardSource,
    card_source_url: cardSourceUrl,
    odds_provider: "the-odds-api",
    quota: {
      requests_remaining: odds.quota.requestsRemaining,
      requests_used: odds.quota.requestsUsed,
      last_request_cost: odds.quota.lastRequestCost,
    },
    coverage: {
      provider_events: odds.coverage.providerEvents,
      complete_snapshots: odds.coverage.completeSnapshots,
      missing_snapshots: odds.coverage.missingSnapshots,
    },
    diagnostics: odds.diagnostics,
    findings,
    odds_snapshots: odds.snapshots.map((snapshot) => storedSnapshot(snapshot, boutIdByMatchup)),
  };
}
