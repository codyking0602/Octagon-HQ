import factualProjectionJson from "../../../data/generated/football/factual-universe-projection.json";
import { getFootballFact, type FootballFactMetricId } from "./footballFactualStats";
import { getFootballSubject } from "./footballSubjectRegistry";

type PeakSeasonContextRow = readonly [
  subjectId: string,
  metricId: FootballFactMetricId,
  canonicalValue: number,
  seasons: readonly number[],
];

const projection = factualProjectionJson as unknown as {
  hitTheNumberPeakSeasonContext?: readonly PeakSeasonContextRow[];
};

const contextByFact = new Map<string, PeakSeasonContextRow[]>();
for (const row of projection.hitTheNumberPeakSeasonContext ?? []) {
  const canonicalSubjectId = getFootballSubject(row[0])?.id ?? row[0];
  const key = `${canonicalSubjectId}:${row[1]}`;
  const rows = contextByFact.get(key) ?? [];
  rows.push(row);
  contextByFact.set(key, rows);
}

/**
 * Presentation-only context for Hit the Number best-season facts.
 * The canonical factual ledger still owns the value; stale context is ignored if that value changes.
 */
export function footballHitTheNumberPeakSeasons(subjectId: string, metricId: FootballFactMetricId) {
  const resolved = getFootballFact(subjectId, metricId);
  if (!resolved) return [];
  const contexts = contextByFact.get(`${resolved.record.subjectId}:${metricId}`) ?? [];
  return [...new Set(
    contexts
      .filter((context) => context[2] === resolved.fact.value)
      .flatMap((context) => context[3]),
  )].sort((left, right) => left - right);
}
