import contextJson from "../../../data/generated/football/find-leader-peak-season-context.json";
import type { FootballFactMetricId } from "./footballFactualStatsCore";

type PeakRow = readonly [subjectId: string, metricId: FootballFactMetricId, value: number, year: number, school: string];
const peakRows = new Map<string, PeakRow>(
  (contextJson.rows as readonly PeakRow[]).map((row) => [`${row[0]}:${row[1]}`, row]),
);

// Suppress missing or stale attribution rather than assigning a guessed season or team.
export function footballFindLeaderCfbPeakContext(subjectId: string, metricId: FootballFactMetricId, value: number) {
  const row = peakRows.get(`${subjectId}:${metricId}`);
  if (!row || row[2] !== value || !Number.isInteger(row[3]) || !row[4]) return null;
  return { season: row[3], school: row[4] };
}
