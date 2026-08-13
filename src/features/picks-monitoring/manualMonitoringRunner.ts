import { matchCanonicalEventIdentity } from "../../../supabase/functions/sync-next-ufc-event/eventIdentity.ts";
import { fighterMatch } from "../../../supabase/functions/sync-next-ufc-event/normalization.ts";
import { buildCardChangeFindings } from "./cardChangeApproval.ts";
import { fightOddsMatchupIdentity, fighterOddsIdentity, type NormalizedFightOddsSnapshot, type OddsAdapterResult } from "./oddsModel.ts";
import { buildMonitoringRunPayload, type MonitoringFindingInput, type MonitoringRunPayload, type MonitoringTriggerKind } from "./monitoringStorageModel.ts";

export type CardScope = "main" | "full";
export interface MonitoringBout {
  bout_id: string;
  weight_class?: string;
  red_fighter_slug: string;
  red_fighter_name: string;
  blue_fighter_slug: string;
  blue_fighter_name: string;
  red_american_odds?: number | null;
  blue_american_odds?: number | null;
  included_in_picks?: boolean;
  card_segment?: "prelim" | "main";
  segment_sequence?: number;
}
export interface MonitoringEvent {
  event_id: string;
  source_event_key?: string;
  source_url?: string;
  name: string;
  subtitle: string;
  venue?: string;
  location?: string;
  prelims_starts_at?: string;
  starts_at: string;
  locks_at: string;
  bouts: MonitoringBout[];
}
export interface SourcePreview extends MonitoringEvent { source: string; source_url: string; source_event_key: string; warnings?: string[] }
export interface ResolvedMonitoringEvent { selected: MonitoringEvent; kind: "staged" | "current"; storageEventId?: string; identity: string; ignoredMatchupIdentities: string[] }

function normalizedEventName(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stableEventMatch(left: MonitoringEvent, right: MonitoringEvent) {
  const leftKey = left.source_event_key?.trim().toLowerCase();
  const rightKey = right.source_event_key?.trim().toLowerCase();
  if (leftKey && rightKey) {
    if (leftKey !== rightKey) return false;
    const leftStart = Date.parse(left.starts_at);
    const rightStart = Date.parse(right.starts_at);
    return normalizedEventName(left.name) === normalizedEventName(right.name)
      && Number.isFinite(leftStart)
      && Number.isFinite(rightStart)
      && Math.abs(leftStart - rightStart) <= 18 * 60 * 60 * 1000;
  }
  return matchCanonicalEventIdentity(
    { name: left.name, subtitle: left.subtitle, venue: left.venue ?? "", location: left.location ?? "", starts_at: left.starts_at },
    { name: right.name, subtitle: right.subtitle, venue: right.venue ?? "", location: right.location ?? "", starts_at: right.starts_at },
  );
}

const matchupIdentity = (bout: MonitoringBout) => fightOddsMatchupIdentity(bout.red_fighter_name, bout.blue_fighter_name);
const includedBouts = (event: MonitoringEvent) => event.bouts.filter((bout) => bout.included_in_picks !== false);

function pairMatchesBout(left: string, right: string, bout: MonitoringBout) {
  return (
    fighterMatch(bout.red_fighter_name, left)
    && fighterMatch(bout.blue_fighter_name, right)
  ) || (
    fighterMatch(bout.red_fighter_name, right)
    && fighterMatch(bout.blue_fighter_name, left)
  );
}

function matchingCanonicalBout(left: string, right: string, event: MonitoringEvent) {
  const matches = includedBouts(event).filter((bout) => pairMatchesBout(left, right, bout));
  return matches.length === 1 ? matches[0] : null;
}

function canonicalizeSnapshot(snapshot: NormalizedFightOddsSnapshot, event: MonitoringEvent): NormalizedFightOddsSnapshot | null {
  const [first, second] = snapshot.prices;
  const bout = matchingCanonicalBout(first.fighterName, second.fighterName, event);
  if (!bout) return null;
  const red = fighterMatch(bout.red_fighter_name, first.fighterName) ? first : second;
  const blue = red === first ? second : first;
  if (!fighterMatch(bout.red_fighter_name, red.fighterName) || !fighterMatch(bout.blue_fighter_name, blue.fighterName)) return null;
  return {
    ...snapshot,
    matchupIdentity: matchupIdentity(bout),
    prices: [
      {
        fighterName: bout.red_fighter_name,
        fighterIdentity: fighterOddsIdentity(bout.red_fighter_name),
        americanOdds: red.americanOdds,
      },
      {
        fighterName: bout.blue_fighter_name,
        fighterIdentity: fighterOddsIdentity(bout.blue_fighter_name),
        americanOdds: blue.americanOdds,
      },
    ],
  };
}

function canonicalizeDiagnosticMatchup(identity: string, event: MonitoringEvent) {
  const fighters = identity.split("|").map((fighter) => fighter.trim()).filter(Boolean);
  if (fighters.length !== 2) return null;
  const bout = matchingCanonicalBout(fighters[0], fighters[1], event);
  return bout ? matchupIdentity(bout) : null;
}

export function resolveMonitoringEvent(staged?: MonitoringEvent | null, current?: MonitoringEvent | null): ResolvedMonitoringEvent {
  const valid = (event: MonitoringEvent | null | undefined) => Boolean(event?.name?.trim() && event?.subtitle?.trim() && Number.isFinite(Date.parse(event.starts_at)) && Number.isFinite(Date.parse(event.locks_at)) && includedBouts(event).length);
  staged = valid(staged) ? staged : null;
  current = valid(current) ? current : null;
  if (staged && current && !stableEventMatch(staged, current)) throw new Error("Staged and current event identities conflict.");
  if (current) return {
    selected: { ...current, bouts: includedBouts(current) },
    kind: "current",
    storageEventId: current.event_id,
    identity: `ufc:${current.source_event_key || current.starts_at.slice(0, 10)}`,
    ignoredMatchupIdentities: current.bouts.filter((bout) => bout.included_in_picks === false).map(matchupIdentity),
  };
  if (staged) return {
    selected: { ...staged, bouts: includedBouts(staged) },
    kind: "staged",
    identity: `ufc:${staged.source_event_key || staged.starts_at.slice(0, 10)}`,
    ignoredMatchupIdentities: [],
  };
  throw new Error("No monitorable staged or current Picks event exists.");
}

export function sourceMatchesMonitoredEvent(source: SourcePreview, monitored: MonitoringEvent) { return stableEventMatch(source, monitored); }

export function filterOddsToMonitoredEvent(odds: OddsAdapterResult, event: MonitoringEvent): OddsAdapterResult {
  const eventTime = Date.parse(event.starts_at);
  const boutIds = new Set(includedBouts(event).map(matchupIdentity));
  const candidates = odds.snapshots
    .filter((snapshot) => Math.abs(Date.parse(snapshot.commenceTime) - eventTime) <= 18 * 60 * 60 * 1000)
    .map((snapshot) => canonicalizeSnapshot(snapshot, event))
    .filter((snapshot): snapshot is NormalizedFightOddsSnapshot => Boolean(snapshot));
  const grouped = new Map<string, NormalizedFightOddsSnapshot[]>();
  for (const snapshot of candidates) grouped.set(snapshot.matchupIdentity, [...(grouped.get(snapshot.matchupIdentity) ?? []), snapshot]);
  const selected = [...grouped.values()].filter((snapshots) => snapshots.length === 1).map(([snapshot]) => snapshot);
  const matched = new Set(selected.map((snapshot) => snapshot.matchupIdentity));
  const selectedSourceEventIds = new Set(selected.map((snapshot) => snapshot.sourceEventId));
  const diagnostics = odds.diagnostics.flatMap((diagnostic) => {
    if (diagnostic.matchupIdentity) {
      const canonicalIdentity = boutIds.has(diagnostic.matchupIdentity)
        ? diagnostic.matchupIdentity
        : canonicalizeDiagnosticMatchup(diagnostic.matchupIdentity, event);
      return canonicalIdentity ? [{ ...diagnostic, matchupIdentity: canonicalIdentity }] : [];
    }
    if (diagnostic.sourceEventId) return selectedSourceEventIds.has(diagnostic.sourceEventId) ? [diagnostic] : [];
    return [diagnostic];
  });
  for (const [canonicalIdentity, snapshots] of grouped) {
    if (snapshots.length <= 1) continue;
    diagnostics.push({
      code: "ambiguous_matchup",
      severity: "error",
      message: "Multiple provider fights matched one monitored UFC bout.",
      matchupIdentity: canonicalIdentity,
    });
  }
  if (selected.length === 0 && !diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    diagnostics.push({ code: "invalid_event", severity: "error", message: "No provider fight confidently matched the monitored UFC card." });
  }
  return {
    ...odds,
    snapshots: selected,
    diagnostics,
    coverage: {
      providerEvents: selectedSourceEventIds.size,
      completeSnapshots: selected.length,
      missingSnapshots: Math.max(0, boutIds.size - matched.size),
    },
  };
}

const normalizedValue = (value: unknown): string => Array.isArray(value)
  ? `[${value.map(normalizedValue).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([name, item]) => `${JSON.stringify(name)}:${normalizedValue(item)}`).join(",")}}`
    : JSON.stringify(value);
const stableKey = (...values: unknown[]) => values.map((value) => String(value).toLowerCase().replace(/[^a-z0-9|:+-]+/g, "-").replace(/^-|-$/g, "")).join(":");

export function buildManualMonitoringPayload(input: {
  resolved: ResolvedMonitoringEvent;
  source: SourcePreview;
  scope: CardScope;
  odds: OddsAdapterResult;
  startedAt: string;
  completedAt: string;
  triggerKind?: MonitoringTriggerKind;
  suppressFindingKeys?: ReadonlySet<string>;
}): MonitoringRunPayload {
  const { resolved, source, scope, completedAt } = input;
  const canonical = resolved.selected;
  if (!sourceMatchesMonitoredEvent(source, canonical)) throw new Error("Source identity does not match the monitored Picks event.");
  const ignored = new Set(resolved.ignoredMatchupIdentities);
  const comparisonSource = ignored.size
    ? { ...source, bouts: source.bouts.filter((bout) => !ignored.has(matchupIdentity(bout))) }
    : source;
  const odds = filterOddsToMonitoredEvent(input.odds, canonical);
  const canonicalByMatchup = new Map(canonical.bouts.map((bout) => [matchupIdentity(bout), bout]));
  const findings: MonitoringFindingInput[] = buildCardChangeFindings({
    identity: resolved.identity,
    kind: resolved.kind,
    eventId: resolved.storageEventId,
    canonical,
    source: comparisonSource,
    scope,
    detectedAt: completedAt,
  });
  const matchedMatchups = new Set(odds.snapshots.map((snapshot) => snapshot.matchupIdentity));
  for (const snapshot of odds.snapshots) {
    const bout = canonicalByMatchup.get(snapshot.matchupIdentity);
    if (!bout) continue;
    const before = new Map([[fighterOddsIdentity(bout.red_fighter_name), bout.red_american_odds ?? null], [fighterOddsIdentity(bout.blue_fighter_name), bout.blue_american_odds ?? null]]);
    const after = new Map(snapshot.prices.map((price) => [price.fighterIdentity, price.americanOdds]));
    const identities = [...before.keys()].sort();
    const beforeValue = identities.map((fighter_identity) => ({ fighter_identity, american_odds: before.get(fighter_identity) }));
    const afterValue = identities.map((fighter_identity) => ({ fighter_identity, american_odds: after.get(fighter_identity) }));
    if (identities.some((identity) => before.get(identity) === null)) {
      const findingIdentity = stableKey(resolved.identity, "bout", bout.bout_id, "odds");
      findings.push({
        finding_key: stableKey(findingIdentity, snapshot.sportsbook, normalizedValue(afterValue)),
        finding_type: "odds_available",
        severity: "info",
        summary: "Current odds were found and applied automatically.",
        detected_at: completedAt,
        matchup_identity: snapshot.matchupIdentity,
        bout_id: bout.bout_id,
        before_value: beforeValue,
        after_value: afterValue,
        source_details: {
          sportsbook: snapshot.sportsbook,
          source_event_id: snapshot.sourceEventId,
          finding_identity: findingIdentity,
          change_field: "odds",
          automatically_applied: true,
        },
      });
    }
  }
  const providerBlocked = odds.diagnostics.some((diagnostic) => diagnostic.severity === "error" && !diagnostic.matchupIdentity);
  if (!providerBlocked) {
    for (const [matchup, bout] of canonicalByMatchup) {
      if (matchedMatchups.has(matchup)) continue;
      const findingIdentity = stableKey(resolved.identity, "bout", bout.bout_id, "unmatched_fight");
      findings.push({ finding_key: findingIdentity, finding_type: "unmatched_fight", severity: "warning", summary: "A monitored bout did not confidently match a provider snapshot.", detected_at: completedAt, matchup_identity: matchup, bout_id: bout.bout_id, source_details: { monitored_event_kind: resolved.kind, finding_identity: findingIdentity } });
    }
  }
  odds.diagnostics.forEach((diagnostic) => {
    const findingIdentity = stableKey(resolved.identity, "provider_error", diagnostic.code, diagnostic.sourceEventId ?? "event", diagnostic.matchupIdentity ?? "event");
    findings.push({ finding_key: findingIdentity, finding_type: "provider_error", severity: diagnostic.severity, summary: diagnostic.message, detected_at: completedAt, matchup_identity: diagnostic.matchupIdentity, source_details: { code: diagnostic.code, source_event_id: diagnostic.sourceEventId, finding_identity: findingIdentity } });
  });
  if (odds.quota.requestsRemaining !== null && odds.quota.requestsRemaining <= 5) {
    const findingIdentity = stableKey(resolved.identity, "quota_warning");
    findings.push({ finding_key: stableKey(findingIdentity, odds.quota.requestsRemaining === 0 ? "exhausted" : "low"), finding_type: "quota_warning", severity: odds.quota.requestsRemaining === 0 ? "error" : "warning", summary: odds.quota.requestsRemaining === 0 ? "Odds provider quota is exhausted." : "Odds provider quota is low.", detected_at: completedAt, source_details: { requests_remaining: odds.quota.requestsRemaining, finding_identity: findingIdentity } });
  }
  const retainedFindings = input.suppressFindingKeys
    ? findings.filter((finding) => !input.suppressFindingKeys?.has(finding.finding_key))
    : findings;
  const boutIds = resolved.storageEventId ? Object.fromEntries([...canonicalByMatchup].map(([matchup, bout]) => [matchup, bout.bout_id])) : {};
  const canonicalBouts = resolved.storageEventId ? Object.fromEntries([...canonicalByMatchup].map(([matchup, bout]) => [matchup, {
    boutId: bout.bout_id,
    redFighterSlug: bout.red_fighter_slug,
    redFighterIdentity: fighterOddsIdentity(bout.red_fighter_name),
    blueFighterSlug: bout.blue_fighter_slug,
    blueFighterIdentity: fighterOddsIdentity(bout.blue_fighter_name),
  }])) : {};
  return buildMonitoringRunPayload({ triggerKind: input.triggerKind ?? "manual", sourceEventIdentity: resolved.identity, eventId: resolved.storageEventId, locksAt: canonical.locks_at, startedAt: input.startedAt, completedAt, odds, cardSource: source.source, cardSourceUrl: source.source_url, findings: retainedFindings, boutIdByMatchup: boutIds, canonicalBoutByMatchup: canonicalBouts });
}

export interface MonitoringSummary { run_id: string; status: MonitoringRunPayload["status"]; canonical_event_id: string | null; source_event_identity: string; started_at: string; completed_at: string; findings: Record<string, number>; severities: Record<string, number>; coverage: MonitoringRunPayload["coverage"]; quota: MonitoringRunPayload["quota"]; stored_odds_snapshots: number }
export function monitoringSummary(runId: string, payload: MonitoringRunPayload): MonitoringSummary { const count = (field: "finding_type" | "severity") => Object.fromEntries([...new Set(payload.findings.map((finding) => finding[field]))].sort().map((value) => [value, payload.findings.filter((finding) => finding[field] === value).length])); return { run_id: runId, status: payload.status, canonical_event_id: payload.event_id ?? null, source_event_identity: payload.source_event_identity, started_at: payload.started_at, completed_at: payload.completed_at, findings: count("finding_type"), severities: count("severity"), coverage: payload.coverage, quota: payload.quota, stored_odds_snapshots: payload.odds_snapshots.length }; }