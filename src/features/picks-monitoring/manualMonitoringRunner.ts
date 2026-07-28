import { sourceChanges } from "../../../supabase/functions/sync-next-ufc-event/cardChanges.ts";
import { matchCanonicalEventIdentity } from "../../../supabase/functions/sync-next-ufc-event/eventIdentity.ts";
import { fightOddsMatchupIdentity, fighterOddsIdentity, type OddsAdapterResult } from "./oddsModel.ts";
import { buildMonitoringRunPayload, type MonitoringFindingInput, type MonitoringRunPayload, type MonitoringTriggerKind } from "./monitoringStorageModel.ts";

export type CardScope = "main" | "full";
export interface MonitoringBout {
  bout_id: string;
  red_fighter_slug: string;
  red_fighter_name: string;
  blue_fighter_slug: string;
  blue_fighter_name: string;
  red_american_odds?: number | null;
  blue_american_odds?: number | null;
  included_in_picks?: boolean;
}
export interface MonitoringEvent { event_id: string; source_event_key?: string; name: string; subtitle: string; starts_at: string; locks_at: string; bouts: MonitoringBout[] }
export interface SourcePreview extends MonitoringEvent { source: string; source_url: string; source_event_key: string; warnings?: string[] }
export interface ResolvedMonitoringEvent { selected: MonitoringEvent; kind: "staged" | "current"; storageEventId?: string; identity: string; ignoredMatchupIdentities: string[] }

function stableEventMatch(left: MonitoringEvent, right: MonitoringEvent) {
  return matchCanonicalEventIdentity(
    { name: left.name, subtitle: left.subtitle, venue: "", location: "", starts_at: left.starts_at },
    { name: right.name, subtitle: right.subtitle, venue: "", location: "", starts_at: right.starts_at },
  );
}

const matchupIdentity = (bout: MonitoringBout) => fightOddsMatchupIdentity(bout.red_fighter_name, bout.blue_fighter_name);
const includedBouts = (event: MonitoringEvent) => event.bouts.filter((bout) => bout.included_in_picks !== false);

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
  const selected = odds.snapshots.filter((snapshot) => (
    Math.abs(Date.parse(snapshot.commenceTime) - eventTime) <= 18 * 60 * 60 * 1000
    && boutIds.has(snapshot.matchupIdentity)
  ));
  const matched = new Set(selected.map((snapshot) => snapshot.matchupIdentity));
  const selectedSourceEventIds = new Set(selected.map((snapshot) => snapshot.sourceEventId));
  const diagnostics = odds.diagnostics.filter((diagnostic) => {
    if (diagnostic.matchupIdentity) return boutIds.has(diagnostic.matchupIdentity);
    if (diagnostic.sourceEventId) return selectedSourceEventIds.has(diagnostic.sourceEventId);
    return true;
  });
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
  const cardReference = input.scope === "main" ? { ...canonical, bouts: canonical.bouts.filter((bout) => !/^(?:early-)?prelim-/.test(bout.bout_id)) } : canonical;
  const findings: MonitoringFindingInput[] = sourceChanges(cardReference, comparisonSource as never, input.scope).map((summary) => ({ finding_key: stableKey(resolved.identity, "card_change", summary), finding_type: "card_change", severity: "warning", summary, detected_at: completedAt, source_details: { source_event_identity: resolved.identity, monitored_event_kind: resolved.kind } }));
  const matchedMatchups = new Set(odds.snapshots.map((snapshot) => snapshot.matchupIdentity));
  for (const snapshot of odds.snapshots) {
    const bout = canonicalByMatchup.get(snapshot.matchupIdentity);
    if (!bout) continue;
    const before = new Map([[fighterOddsIdentity(bout.red_fighter_name), bout.red_american_odds ?? null], [fighterOddsIdentity(bout.blue_fighter_name), bout.blue_american_odds ?? null]]);
    const after = new Map(snapshot.prices.map((price) => [price.fighterIdentity, price.americanOdds]));
    const identities = [...before.keys()].sort();
    const beforeValue = identities.map((fighter_identity) => ({ fighter_identity, american_odds: before.get(fighter_identity) }));
    const afterValue = identities.map((fighter_identity) => ({ fighter_identity, american_odds: after.get(fighter_identity) }));
    const findingType = identities.some((identity) => before.get(identity) === null) ? "odds_available" : identities.some((identity) => before.get(identity) !== after.get(identity)) ? "odds_change" : null;
    if (findingType) findings.push({ finding_key: stableKey(resolved.identity, findingType, bout.bout_id, snapshot.sportsbook, normalizedValue(beforeValue), normalizedValue(afterValue)), finding_type: findingType, severity: findingType === "odds_available" ? "info" : "warning", summary: findingType === "odds_available" ? "Current odds are available for a monitored bout without stored odds." : "American odds changed for a monitored bout.", detected_at: completedAt, matchup_identity: snapshot.matchupIdentity, bout_id: bout.bout_id, before_value: beforeValue, after_value: afterValue, source_details: { sportsbook: snapshot.sportsbook, source_event_id: snapshot.sourceEventId } });
  }
  const providerBlocked = odds.diagnostics.some((diagnostic) => diagnostic.severity === "error" && !diagnostic.matchupIdentity);
  if (!providerBlocked) {
    for (const [matchup, bout] of canonicalByMatchup) {
      if (matchedMatchups.has(matchup)) continue;
      findings.push({ finding_key: stableKey(resolved.identity, "unmatched_fight", matchup), finding_type: "unmatched_fight", severity: "warning", summary: "A monitored bout did not confidently match a provider snapshot.", detected_at: completedAt, matchup_identity: matchup, bout_id: bout.bout_id, source_details: { monitored_event_kind: resolved.kind } });
    }
  }
  odds.diagnostics.forEach((diagnostic) => findings.push({ finding_key: stableKey(resolved.identity, "provider_error", diagnostic.code, diagnostic.sourceEventId ?? "event", diagnostic.matchupIdentity ?? "event"), finding_type: "provider_error", severity: diagnostic.severity, summary: diagnostic.message, detected_at: completedAt, matchup_identity: diagnostic.matchupIdentity, source_details: { code: diagnostic.code, source_event_id: diagnostic.sourceEventId } }));
  if (odds.quota.requestsRemaining !== null && odds.quota.requestsRemaining <= 5) findings.push({ finding_key: stableKey(resolved.identity, "quota_warning", odds.quota.requestsRemaining === 0 ? "exhausted" : "low"), finding_type: "quota_warning", severity: odds.quota.requestsRemaining === 0 ? "error" : "warning", summary: odds.quota.requestsRemaining === 0 ? "Odds provider quota is exhausted." : "Odds provider quota is low.", detected_at: completedAt, source_details: { requests_remaining: odds.quota.requestsRemaining } });
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
export function monitoringSummary(runId: string, payload: MonitoringRunPayload): MonitoringSummary { const count = (field: "finding_type" | "severity") => Object.fromEntries([...new Set(payload.findings.map((finding) => finding[field]))].sort().map((value) => [value, payload.findings.filter((finding) => finding[field] === value).length])); return { run_id: runId, status: payload.status, canonical_event_id: payload.event_id ?? null, source_event_identity: payload.source_event_identity, started_at: payload.started_at, completed_at, findings: count("finding_type"), severities: count("severity"), coverage: payload.coverage, quota: payload.quota, stored_odds_snapshots: payload.odds_snapshots.length }; }
