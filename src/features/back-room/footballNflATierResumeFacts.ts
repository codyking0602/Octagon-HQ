import type {
  FootballFactMetricId,
  FootballFactSourceId,
  FootballFactValue,
  FootballFactualRecord,
} from "./footballFactualStatsCore";

const reported = (
  sourceId: FootballFactSourceId,
  metricId: FootballFactMetricId,
  value: number,
): FootballFactValue => ({
  metricId,
  value,
  evidence: { sourceIds: [sourceId], kind: "reported" },
});

const record = (
  subjectId: string,
  sourceId: FootballFactSourceId,
  values: readonly (readonly [FootballFactMetricId, number])[],
): FootballFactualRecord => ({
  subjectId,
  scope: "nfl-player-career",
  facts: values.map(([metricId, value]) => reported(sourceId, metricId, value)),
});

/**
 * Focused PR 3 resume enrichment for locked NFL A-tier Who Am I identities.
 * These rows reuse the existing Pro Football Reference source owners and metric vocabulary;
 * they are canonical factual-ledger inputs, not a Who Am I roster or presentation layer.
 */
export const footballNflATierResumeFactualRecords: readonly FootballFactualRecord[] = [
  // Modern offensive-line careers.
  record("nfl-alan-faneca", "pfr-offensive-line-career", [
    ["nfl-career-games", 206],
    ["nfl-first-team-all-pros", 6],
    ["nfl-super-bowl-titles", 1],
  ]),
  record("nfl-jason-kelce", "pfr-offensive-line-career", [
    ["nfl-career-games", 193],
    ["nfl-first-team-all-pros", 6],
    ["nfl-super-bowl-titles", 1],
  ]),
  record("nfl-joe-thomas", "pfr-offensive-line-career", [
    ["nfl-career-games", 167],
    ["nfl-first-team-all-pros", 6],
    ["nfl-super-bowl-titles", 0],
  ]),
  record("nfl-jonathan-ogden", "pfr-offensive-line-career", [
    ["nfl-career-games", 177],
    ["nfl-first-team-all-pros", 4],
    ["nfl-super-bowl-titles", 1],
  ]),
  record("nfl-kevin-mawae", "pfr-offensive-line-career", [
    ["nfl-career-games", 241],
    ["nfl-first-team-all-pros", 3],
    ["nfl-super-bowl-titles", 0],
  ]),
  record("nfl-marshal-yanda", "pfr-offensive-line-career", [
    ["nfl-career-games", 177],
    ["nfl-first-team-all-pros", 2],
    ["nfl-super-bowl-titles", 1],
  ]),
  record("nfl-orlando-pace", "pfr-offensive-line-career", [
    ["nfl-career-games", 169],
    ["nfl-first-team-all-pros", 3],
    ["nfl-super-bowl-titles", 1],
  ]),
  record("nfl-steve-hutchinson", "pfr-offensive-line-career", [
    ["nfl-career-games", 169],
    ["nfl-first-team-all-pros", 5],
    ["nfl-super-bowl-titles", 0],
  ]),
  record("nfl-trent-williams", "pfr-offensive-line-career", [
    ["nfl-career-games", 204],
    ["nfl-first-team-all-pros", 3],
    ["nfl-super-bowl-titles", 0],
  ]),
  record("nfl-tyron-smith", "pfr-offensive-line-career", [
    ["nfl-career-games", 171],
    ["nfl-first-team-all-pros", 2],
    ["nfl-super-bowl-titles", 0],
  ]),

  // Historical A-tier identities that were within one to three honest facts of the target.
  record("nfl-jim-thorpe", "pfr-career-stat-lines", [
    ["nfl-career-games", 52],
    ["nfl-career-field-goals-made", 4],
  ]),
  record("nfl-alan-page", "pfr-defensive-career", [
    ["nfl-career-games", 218],
    ["nfl-defensive-player-of-year-awards", 2],
  ]),
  record("nfl-deacon-jones", "pfr-defensive-career", [
    ["nfl-career-games", 191],
    ["nfl-defensive-player-of-year-awards", 2],
  ]),
  record("nfl-joe-greene", "pfr-defensive-career", [
    ["nfl-career-games", 181],
    ["nfl-defensive-player-of-year-awards", 2],
  ]),
  record("deion-sanders", "pfr-defensive-career", [
    ["nfl-career-games", 188],
  ]),
  record("nfl-dick-night-train-lane", "pfr-defensive-career", [
    ["nfl-career-games", 157],
    ["nfl-first-team-all-pros", 3],
  ]),
  record("nfl-emlen-tunnell", "pfr-defensive-career", [
    ["nfl-career-games", 167],
    ["nfl-first-team-all-pros", 4],
  ]),
  record("nfl-ronnie-lott", "pfr-defensive-career", [
    ["nfl-career-games", 192],
  ]),
] as const;
