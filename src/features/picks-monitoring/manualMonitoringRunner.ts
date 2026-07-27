import { sourceChanges } from "../../../supabase/functions/sync-next-ufc-event/cardChanges.ts";
import { matchCanonicalEventIdentity } from "../../../supabase/functions/sync-next-ufc-event/eventIdentity.ts";
import { fightOddsMatchupIdentity, fighterOddsIdentity, type OddsAdapterResult } from "./oddsModel.ts";
import { buildMonitoringRunPayload, type MonitoringFindingInput, type MonitoringRunPayload } from "./monitoringStorageModel.ts";

export type CardScope = "main" | "full";
export interface MonitoringBout { bout_id: string; red_fighter_name: string; blue_fighter_name: string; red_american_odds?: number | null; blue_american_odds?: number | null }
export interface MonitoringEvent { event_id: string; source_event_key?: string; name: string; subtitle: string; starts_at: string; locks_at: string; bouts: MonitoringBout[] }
export interface SourcePreview extends MonitoringEvent { source: string; source_url: string; source_event_key: string; warnings?: string[] }
export interface ResolvedMonitoringEvent { selected: MonitoringEvent; kind: "staged" | "current"; storageEventId?: string; identity: string }

function stableEventMatch(left: MonitoringEvent, right: MonitoringEvent) {
  return matchCanonicalEventIdentity(
    { name: left.name, subtitle: left.subtitle, venue: "", location: "", starts_at: left.starts_at },
    { name: right.name, subtitle: right.subtitle, venue: "", location: "", starts_at: right.starts_at },
  );
}

export function resolveMonitoringEvent(staged?: MonitoringEvent | null, current?: MonitoringEvent | null): ResolvedMonitoringEvent {
  const valid = (event: MonitoringEvent | null | undefined) => Boolean(event?.name?.trim() && event?.subtitle?.trim() && Number.isFinite(Date.parse(event.starts_at)) && Number.isFinite(Date.parse(event.locks_at)) && event.bouts?.length);
  staged = valid(staged) ? staged : null;
  current = valid(current) ? current : null;
  if (staged && current && !stableEventMatch(staged, current)) throw new Error("Staged and current event identities conflict.");
  if (staged) return { selected: staged, kind: "staged", identity: `ufc:${staged.source_event_key || staged.starts_at.slice(0, 10)}` };
  if (current) return { selected: current, kind: "current", storageEventId: current.event_id, identity: `ufc:${current.source_event_key || current.starts_at.slice(0, 10)}` };
  throw new Error("No monitorable staged or current Picks event exists.");
}

export function sourceMatchesMonitoredEvent(source: SourcePreview, monitored: MonitoringEvent) { return stableEventMatch(source, monitored); }

export function filterOddsToMonitoredEvent(odds: OddsAdapterResult, event: MonitoringEvent): OddsAdapterResult {
  const eventTime = Date.parse(event.starts_at);
  const boutIds = new Set(event.bouts.map((bout) => fightOddsMatchupIdentity(bout.red_fighter_name, bout.blue_fighter_name)));
  const inWindow = odds.snapshots.filter((snapshot) => Math.abs(Date.parse(snapshot.commenceTime) - eventTime) <= 18 * 60 * 60 * 1000);
  if (!inWindow.some((snapshot) => boutIds.has(snapshot.matchupIdentity))) {
    return { ...odds, snapshots: [], coverage: { providerEvents: 0, completeSnapshots: 0, missingSnapshots: 0 }, diagnostics: [...odds.diagnostics, { code: "invalid_event", severity: "error", message: "No provider event confidently matched the monitored UFC card." }] };
  }
  const matched = new Set(inWindow.filter((snapshot) => boutIds.has(snapshot.matchupIdentity)).map((snapshot) => snapshot.matchupIdentity));
  return { ...odds, snapshots: inWindow, diagnostics: odds.diagnostics.filter((diagnostic) => !diagnostic.sourceEventId || inWindow.some((snapshot) => snapshot.sourceEventId === diagnostic.sourceEventId)), coverage: { providerEvents: new Set(inWindow.map((snapshot) => snapshot.sourceEventId)).size, completeSnapshots: inWindow.length, missingSnapshots: Math.max(0, boutIds.size - matched.size) } };
}

const normalizedValue = (value: unknown): string => Array.isArray(value)
  ? `[${value.map(normalizedValue).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([name, item]) => `${JSON.stringify(name)}:${normalizedValue(item)}`).join(",")}}`
    : JSON.stringify(value);
const stableKey = (...values: unknown[]) => values.map((value) => String(value).toLowerCase().replace(/[^a-z0-9|:+-]+/g, "-").replace(/^-|-$/g, "")).join(":");

export function buildManualMonitoringPayload(input: { resolved: ResolvedMonitoringEvent; source: SourcePreview; scope: CardScope; odds: OddsAdapterResult; startedAt: string; completedAt: string }): MonitoringRunPayload {
  const { resolved, source, scope, completedAt } = input;
  const canonical = resolved.selected;
  if (!sourceMatchesMonitoredEvent(source, canonical)) throw new Error("Source identity does not match the monitored Picks event.");
  const odds = filterOddsToMonitoredEvent(input.odds, canonical);
  const canonicalByMatchup = new Map(canonical.bouts.map((bout) => [fightOddsMatchupIdentity(bout.red_fighter_name, bout.blue_fighter_name), bout]));
  const cardReference = scope === "main" ? { ...canonical, bouts: canonical.bouts.filter((bout) => !/^(?:early-)?prelim-/.test(bout.bout_id)) } : canonical;
  const findings: MonitoringFindingInput[] = sourceChanges(cardReference, source as never, scope).map((summary) => ({ finding_key: stableKey(resolved.identity, "card_change", summary), finding_type: "card_change", severity: "warning", summary, detected_at: completedAt, source_details: { source_event_identity: resolved.identity, monitored_event_kind: resolved.kind } }));
  for (const snapshot of odds.snapshots) {
    const bout = canonicalByMatchup.get(snapshot.matchupIdentity);
    if (!bout) { findings.push({ finding_key: stableKey(resolved.identity, "unmatched_fight", snapshot.matchupIdentity), finding_type: "unmatched_fight", severity: "warning", summary: "Provider fight did not confidently match a monitored bout.", detected_at: completedAt, matchup_identity: snapshot.matchupIdentity, source_details: { source_event_id: snapshot.sourceEventId } }); continue; }
    const before = new Map([[fighterOddsIdentity(bout.red_fighter_name), bout.red_american_odds ?? null], [fighterOddsIdentity(bout.blue_fighter_name), bout.blue_american_odds ?? null]]);
    const after = new Map(snapshot.prices.map((price) => [price.fighterIdentity, price.americanOdds]));
    const identities = [...before.keys()].sort();
    const beforeValue = identities.map((fighter_identity) => ({ fighter_identity, american_odds: before.get(fighter_identity) }));
    const afterValue = identities.map((fighter_identity) => ({ fighter_identity, american_odds: after.get(fighter_identity) }));
    const findingType = identities.some((identity) => before.get(identity) === null) ? "odds_available" : identities.some((identity) => before.get(identity) !== after.get(identity)) ? "odds_change" : null;
    if (findingType) findings.push({ finding_key: stableKey(resolved.identity, findingType, bout.bout_id, snapshot.sportsbook, normalizedValue(beforeValue), normalizedValue(afterValue)), finding_type: findingType, severity: findingType === "odds_available" ? "info" : "warning", summary: findingType === "odds_available" ? "Current odds are available for a monitored bout without stored odds." : "American odds changed for a monitored bout.", detected_at: completedAt, matchup_identity: snapshot.matchupIdentity, bout_id: bout.bout_id, before_value: beforeValue, after_value: afterValue, source_details: { sportsbook: snapshot.sportsbook, source_event_id: snapshot.sourceEventId } });
  }
  odds.diagnostics.forEach((diagnostic) => findings.push({ finding_key: stableKey(resolved.identity, "provider_error", diagnostic.code, diagnostic.matchupIdentity ?? "event"), finding_type: "provider_error", severity: diagnostic.severity, summary: diagnostic.message, detected_at: completedAt, matchup_identity: diagnostic.matchupIdentity, source_details: { code: diagnostic.code } }));
  if (odds.quota.requestsRemaining !== null && odds.quota.requestsRemaining <= 5) findings.push({ finding_key: stableKey(resolved.identity, "quota_warning", odds.quota.requestsRemaining === 0 ? "exhausted" : "low"), finding_type: "quota_warning", severity: odds.quota.requestsRemaining === 0 ? "error" : "warning", summary: odds.quota.requestsRemaining === 0 ? "Odds provider quota is exhausted." : "Odds provider quota is low.", detected_at: completedAt, source_details: { requests_remaining: odds.quota.requestsRemaining } });
  const boutIds = resolved.storageEventId ? Object.fromEntries([...canonicalByMatchup].map(([matchup, bout]) => [matchup, bout.bout_id])) : {};
  return buildMonitoringRunPayload({ triggerKind: "manual", sourceEventIdentity: resolved.identity, eventId: resolved.storageEventId, locksAt: canonical.locks_at, startedAt: input.startedAt, completedAt, odds, cardSource: source.source, cardSourceUrl: source.source_url, findings, boutIdByMatchup: boutIds });
}

export interface MonitoringSummary { run_id: string; status: MonitoringRunPayload["status"]; canonical_event_id: string | null; source_event_identity: string; started_at: string; completed_at: string; findings: Record<string, number>; severities: Record<string, number>; coverage: MonitoringRunPayload["coverage"]; quota: MonitoringRunPayload["quota"]; stored_odds_snapshots: number }
export function monitoringSummary(runId: string, payload: MonitoringRunPayload): MonitoringSummary { const count = (field: "finding_type" | "severity") => Object.fromEntries([...new Set(payload.findings.map((finding) => finding[field]))].sort().map((value) => [value, payload.findings.filter((finding) => finding[field] === value).length])); return { run_id: runId, status: payload.status, canonical_event_id: payload.event_id ?? null, source_event_identity: payload.source_event_identity, started_at: payload.started_at, completed_at: payload.completed_at, findings: count("finding_type"), severities: count("severity"), coverage: payload.coverage, quota: payload.quota, stored_odds_snapshots: payload.odds_snapshots.length }; }
