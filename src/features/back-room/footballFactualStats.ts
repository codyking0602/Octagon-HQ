export type FootballFactScope = "nfl-player-career" | "cfb-team-season";

export type FootballFactMetricId =
  | "nfl-career-passing-yards"
  | "nfl-career-passing-touchdowns"
  | "nfl-ap-mvp-awards"
  | "nfl-super-bowl-titles"
  | "nfl-career-rushing-yards"
  | "nfl-career-rushing-touchdowns"
  | "cfb-team-wins"
  | "cfb-team-losses"
  | "cfb-team-points-for"
  | "cfb-team-points-against"
  | "cfb-team-points-per-game"
  | "cfb-team-srs"
  | "cfb-team-sos"
  | "cfb-national-title";

export type FootballFactUnit =
  | "count"
  | "yards"
  | "points"
  | "points-per-game"
  | "rating"
  | "flag";

export interface FootballFactMetricDefinition {
  id: FootballFactMetricId;
  label: string;
  unit: FootballFactUnit;
  decimals: 0 | 1 | 2;
}

export const footballFactMetricDefinitions: readonly FootballFactMetricDefinition[] = [
  { id: "nfl-career-passing-yards", label: "Career passing yards", unit: "yards", decimals: 0 },
  { id: "nfl-career-passing-touchdowns", label: "Career passing TD", unit: "count", decimals: 0 },
  { id: "nfl-ap-mvp-awards", label: "AP MVP awards", unit: "count", decimals: 0 },
  { id: "nfl-super-bowl-titles", label: "Super Bowl titles", unit: "count", decimals: 0 },
  { id: "nfl-career-rushing-yards", label: "Career rushing yards", unit: "yards", decimals: 0 },
  { id: "nfl-career-rushing-touchdowns", label: "Career rushing TD", unit: "count", decimals: 0 },
  { id: "cfb-team-wins", label: "Wins", unit: "count", decimals: 0 },
  { id: "cfb-team-losses", label: "Losses", unit: "count", decimals: 0 },
  { id: "cfb-team-points-for", label: "Points for", unit: "points", decimals: 0 },
  { id: "cfb-team-points-against", label: "Points against", unit: "points", decimals: 0 },
  { id: "cfb-team-points-per-game", label: "Points per game", unit: "points-per-game", decimals: 1 },
  { id: "cfb-team-srs", label: "SRS", unit: "rating", decimals: 2 },
  { id: "cfb-team-sos", label: "SOS", unit: "rating", decimals: 2 },
  { id: "cfb-national-title", label: "National title", unit: "flag", decimals: 0 },
] as const;

export type FootballFactSourceId =
  | "pfr-peyton-manning"
  | "pfr-dan-marino"
  | "pfr-john-elway"
  | "pfr-emmitt-smith"
  | "pfr-barry-sanders"
  | "cfr-2005-texas"
  | "cfr-2013-florida-state";

export interface FootballFactSource {
  id: FootballFactSourceId;
  publisher: string;
  title: string;
  url: string;
  reviewedOn: string;
  coverage: string;
}

export const footballFactSources: readonly FootballFactSource[] = [
  {
    id: "pfr-peyton-manning",
    publisher: "Pro Football Reference",
    title: "Peyton Manning player record",
    url: "https://www.pro-football-reference.com/players/M/MannPe00.htm",
    reviewedOn: "2026-08-22",
    coverage: "Completed NFL career through 2015",
  },
  {
    id: "pfr-dan-marino",
    publisher: "Pro Football Reference",
    title: "Dan Marino player record",
    url: "https://www.pro-football-reference.com/players/M/MariDa00.htm",
    reviewedOn: "2026-08-22",
    coverage: "Completed NFL career through 1999",
  },
  {
    id: "pfr-john-elway",
    publisher: "Pro Football Reference",
    title: "John Elway player record",
    url: "https://www.pro-football-reference.com/players/E/ElwaJo00.htm",
    reviewedOn: "2026-08-22",
    coverage: "Completed NFL career through 1998",
  },
  {
    id: "pfr-emmitt-smith",
    publisher: "Pro Football Reference",
    title: "Emmitt Smith player record",
    url: "https://www.pro-football-reference.com/players/S/SmitEm00.htm",
    reviewedOn: "2026-08-22",
    coverage: "Completed NFL career through 2004",
  },
  {
    id: "pfr-barry-sanders",
    publisher: "Pro Football Reference",
    title: "Barry Sanders player record",
    url: "https://www.pro-football-reference.com/players/S/SandBa00.htm",
    reviewedOn: "2026-08-22",
    coverage: "Completed NFL career through 1998",
  },
  {
    id: "cfr-2005-texas",
    publisher: "College Football at Sports-Reference",
    title: "2005 Texas Longhorns team record",
    url: "https://www.sports-reference.com/cfb/schools/texas/2005.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2005 season",
  },
  {
    id: "cfr-2013-florida-state",
    publisher: "College Football at Sports-Reference",
    title: "2013 Florida State Seminoles team record",
    url: "https://www.sports-reference.com/cfb/schools/florida-state/2013.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2013 season",
  },
] as const;

export interface FootballFactEvidence {
  sourceIds: readonly FootballFactSourceId[];
  kind: "reported" | "derived";
  formula?: string;
}

export interface FootballFactValue {
  metricId: FootballFactMetricId;
  value: number;
  evidence: FootballFactEvidence;
}

export interface FootballFactualRecord {
  subjectId: string;
  scope: FootballFactScope;
  facts: readonly FootballFactValue[];
}

const reported = (
  sourceId: FootballFactSourceId,
  metricId: FootballFactMetricId,
  value: number,
): FootballFactValue => ({
  metricId,
  value,
  evidence: { sourceIds: [sourceId], kind: "reported" },
});

export const footballFactualRecords: readonly FootballFactualRecord[] = [
  {
    subjectId: "peyton-manning",
    scope: "nfl-player-career",
    facts: [
      reported("pfr-peyton-manning", "nfl-career-passing-yards", 71940),
      reported("pfr-peyton-manning", "nfl-career-passing-touchdowns", 539),
      reported("pfr-peyton-manning", "nfl-ap-mvp-awards", 5),
      reported("pfr-peyton-manning", "nfl-super-bowl-titles", 2),
    ],
  },
  {
    subjectId: "dan-marino",
    scope: "nfl-player-career",
    facts: [
      reported("pfr-dan-marino", "nfl-career-passing-yards", 61361),
      reported("pfr-dan-marino", "nfl-career-passing-touchdowns", 420),
      reported("pfr-dan-marino", "nfl-ap-mvp-awards", 1),
      reported("pfr-dan-marino", "nfl-super-bowl-titles", 0),
    ],
  },
  {
    subjectId: "john-elway",
    scope: "nfl-player-career",
    facts: [
      reported("pfr-john-elway", "nfl-career-passing-yards", 51475),
      reported("pfr-john-elway", "nfl-career-passing-touchdowns", 300),
      reported("pfr-john-elway", "nfl-ap-mvp-awards", 1),
      reported("pfr-john-elway", "nfl-super-bowl-titles", 2),
    ],
  },
  {
    subjectId: "emmitt-smith",
    scope: "nfl-player-career",
    facts: [
      reported("pfr-emmitt-smith", "nfl-career-rushing-yards", 18355),
      reported("pfr-emmitt-smith", "nfl-career-rushing-touchdowns", 164),
    ],
  },
  {
    subjectId: "barry-sanders",
    scope: "nfl-player-career",
    facts: [
      reported("pfr-barry-sanders", "nfl-career-rushing-yards", 15269),
      reported("pfr-barry-sanders", "nfl-career-rushing-touchdowns", 99),
    ],
  },
  {
    subjectId: "2005-texas",
    scope: "cfb-team-season",
    facts: [
      reported("cfr-2005-texas", "cfb-team-wins", 13),
      reported("cfr-2005-texas", "cfb-team-losses", 0),
      reported("cfr-2005-texas", "cfb-team-points-for", 652),
      reported("cfr-2005-texas", "cfb-team-points-against", 213),
      reported("cfr-2005-texas", "cfb-team-points-per-game", 50.2),
      reported("cfr-2005-texas", "cfb-team-srs", 24.98),
      reported("cfr-2005-texas", "cfb-team-sos", 4.98),
      reported("cfr-2005-texas", "cfb-national-title", 1),
    ],
  },
  {
    subjectId: "2013-florida-state",
    scope: "cfb-team-season",
    facts: [
      reported("cfr-2013-florida-state", "cfb-team-wins", 14),
      reported("cfr-2013-florida-state", "cfb-team-losses", 0),
      reported("cfr-2013-florida-state", "cfb-team-points-for", 723),
      reported("cfr-2013-florida-state", "cfb-team-points-against", 170),
      reported("cfr-2013-florida-state", "cfb-team-points-per-game", 51.6),
      reported("cfr-2013-florida-state", "cfb-team-srs", 23.36),
      reported("cfr-2013-florida-state", "cfb-team-sos", 1.29),
      reported("cfr-2013-florida-state", "cfb-national-title", 1),
    ],
  },
] as const;

const recordsBySubjectId = new Map(footballFactualRecords.map((record) => [record.subjectId, record]));
const metricDefinitionsById = new Map(footballFactMetricDefinitions.map((metric) => [metric.id, metric]));
const sourcesById = new Map(footballFactSources.map((source) => [source.id, source]));

export function getFootballFactualRecord(subjectId: string) {
  return recordsBySubjectId.get(subjectId) ?? null;
}

export function getFootballFact(subjectId: string, metricId: FootballFactMetricId) {
  const record = getFootballFactualRecord(subjectId);
  const fact = record?.facts.find((row) => row.metricId === metricId);
  if (!record || !fact) return null;
  const definition = metricDefinitionsById.get(metricId);
  if (!definition) throw new Error(`Missing Football fact metric definition: ${metricId}`);
  const sources = fact.evidence.sourceIds.map((sourceId) => {
    const source = sourcesById.get(sourceId);
    if (!source) throw new Error(`Missing Football fact source: ${sourceId}`);
    return source;
  });
  return { record, fact, definition, sources };
}

export function formatFootballFact(metricId: FootballFactMetricId, value: number) {
  const definition = metricDefinitionsById.get(metricId);
  if (!definition) throw new Error(`Missing Football fact metric definition: ${metricId}`);
  if (definition.unit === "flag") return value === 1 ? "Yes" : "No";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: definition.decimals,
    maximumFractionDigits: definition.decimals,
  });
}
