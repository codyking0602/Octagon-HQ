import factualProjectionJson from "../../../data/generated/football/factual-universe-projection.json";
import { getFootballFact, type FootballFactMetricId } from "./footballFactualStats";

type PeakSeasonContextRow = readonly [
  subjectId: string,
  metricId: FootballFactMetricId,
  canonicalValue: number,
  seasons: readonly number[],
];

const projection = factualProjectionJson as unknown as {
  hitTheNumberPeakSeasonContext?: readonly PeakSeasonContextRow[];
};

const contextByFact = new Map(
  (projection.hitTheNumberPeakSeasonContext ?? []).map((row) => [`${row[0]}:${row[1]}`, row] as const),
);

/**
 * Presentation-only context for Hit the Number best-season facts.
 * The canonical factual ledger still owns the value; stale context is ignored if that value changes.
 */
export function footballHitTheNumberPeakSeasons(subjectId: string, metricId: FootballFactMetricId) {
  const resolved = getFootballFact(subjectId, metricId);
  if (!resolved) return [];
  const context = contextByFact.get(`${resolved.record.subjectId}:${metricId}`);
  if (!context || context[2] !== resolved.fact.value) return [];
  return [...context[3]];
}
