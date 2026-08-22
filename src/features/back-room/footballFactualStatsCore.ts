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
  | "pfr-pass-yards-career"
  | "pfr-rush-yards-career"
  | "cfr-1995-nebraska"
  | "cfr-2001-miami"
  | "cfr-2005-texas"
  | "cfr-2008-florida"
  | "cfr-2010-auburn"
  | "cfr-2013-florida-state"
  | "cfr-2014-ohio-state"
  | "cfr-2018-clemson"
  | "cfr-2019-lsu"
  | "cfr-2020-alabama"
  | "cfr-2022-georgia";

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
    id: "pfr-pass-yards-career",
    publisher: "Pro Football Reference",
    title: "NFL Passing Yards Career Leaders",
    url: "https://www.pro-football-reference.com/leaders/pass_yds_career.htm",
    reviewedOn: "2026-08-22",
    coverage: "Career passing-yard totals for completed NFL careers used by Football Hit the Number",
  },
  {
    id: "pfr-rush-yards-career",
    publisher: "Pro Football Reference",
    title: "NFL Rushing Yards Career Leaders",
    url: "https://www.pro-football-reference.com/leaders/rush_yds_career.htm",
    reviewedOn: "2026-08-22",
    coverage: "Career rushing-yard totals for completed NFL careers used by Football Hit the Number",
  },
  {
    id: "cfr-1995-nebraska",
    publisher: "College Football at Sports-Reference",
    title: "1995 Nebraska Cornhuskers team record",
    url: "https://www.sports-reference.com/cfb/schools/nebraska/1995.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 1995 season",
  },
  {
    id: "cfr-2001-miami",
    publisher: "College Football at Sports-Reference",
    title: "2001 Miami (FL) Hurricanes team record",
    url: "https://www.sports-reference.com/cfb/schools/miami-fl/2001.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2001 season",
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
    id: "cfr-2008-florida",
    publisher: "College Football at Sports-Reference",
    title: "2008 Florida Gators team record",
    url: "https://www.sports-reference.com/cfb/schools/florida/2008.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2008 season",
  },
  {
    id: "cfr-2010-auburn",
    publisher: "College Football at Sports-Reference",
    title: "2010 Auburn Tigers team record",
    url: "https://www.sports-reference.com/cfb/schools/auburn/2010.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2010 season",
  },
  {
    id: "cfr-2013-florida-state",
    publisher: "College Football at Sports-Reference",
    title: "2013 Florida State Seminoles team record",
    url: "https://www.sports-reference.com/cfb/schools/florida-state/2013.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2013 season",
  },
  {
    id: "cfr-2014-ohio-state",
    publisher: "College Football at Sports-Reference",
    title: "2014 Ohio State Buckeyes team record",
    url: "https://www.sports-reference.com/cfb/schools/ohio-state/2014.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2014 season",
  },
  {
    id: "cfr-2018-clemson",
    publisher: "College Football at Sports-Reference",
    title: "2018 Clemson Tigers team record",
    url: "https://www.sports-reference.com/cfb/schools/clemson/2018.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2018 season",
  },
  {
    id: "cfr-2019-lsu",
    publisher: "College Football at Sports-Reference",
    title: "2019 LSU Fighting Tigers team record",
    url: "https://www.sports-reference.com/cfb/schools/louisiana-state/2019.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2019 season",
  },
  {
    id: "cfr-2020-alabama",
    publisher: "College Football at Sports-Reference",
    title: "2020 Alabama Crimson Tide team record",
    url: "https://www.sports-reference.com/cfb/schools/alabama/2020.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2020 season",
  },
  {
    id: "cfr-2022-georgia",
    publisher: "College Football at Sports-Reference",
    title: "2022 Georgia Bulldogs team record",
    url: "https://www.sports-reference.com/cfb/schools/georgia/2022.html",
    reviewedOn: "2026-08-22",
    coverage: "Completed 2022 season",
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

const nflPassingYards = (subjectId: string, value: number): FootballFactualRecord => ({
  subjectId,
  scope: "nfl-player-career",
  facts: [reported("pfr-pass-yards-career", "nfl-career-passing-yards", value)],
});

const nflRushingYards = (subjectId: string, value: number): FootballFactualRecord => ({
  subjectId,
  scope: "nfl-player-career",
  facts: [reported("pfr-rush-yards-career", "nfl-career-rushing-yards", value)],
});

const cfbSeason = (
  sourceId: FootballFactSourceId,
  subjectId: string,
  wins: number,
  pointsPerGame: number,
): FootballFactualRecord => ({
  subjectId,
  scope: "cfb-team-season",
  facts: [
    reported(sourceId, "cfb-team-wins", wins),
    reported(sourceId, "cfb-team-points-per-game", pointsPerGame),
    reported(sourceId, "cfb-national-title", 1),
  ],
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
  nflPassingYards("drew-brees", 80358),
  nflPassingYards("brett-favre", 71838),
  nflPassingYards("ben-roethlisberger", 64088),
  nflPassingYards("matt-ryan", 62792),
  nflPassingYards("eli-manning", 57023),
  nflPassingYards("warren-moon", 49325),
  nflPassingYards("steve-young", 33124),
  nflPassingYards("troy-aikman", 32942),
  nflPassingYards("kurt-warner", 32344),
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
  nflRushingYards("walter-payton", 16726),
  nflRushingYards("frank-gore", 16000),
  nflRushingYards("adrian-peterson", 14918),
  nflRushingYards("curtis-martin", 14101),
  nflRushingYards("ladainian-tomlinson", 13684),
  nflRushingYards("jerome-bettis", 13662),
  nflRushingYards("eric-dickerson", 13259),
  nflRushingYards("tony-dorsett", 12739),
  nflRushingYards("jim-brown", 12312),
  nflRushingYards("marshall-faulk", 12279),
  cfbSeason("cfr-1995-nebraska", "1995-nebraska", 12, 52.4),
  cfbSeason("cfr-2001-miami", "2001-miami", 12, 43.2),
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
  cfbSeason("cfr-2008-florida", "2008-florida", 13, 43.6),
  cfbSeason("cfr-2010-auburn", "2010-auburn", 14, 41.2),
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
  cfbSeason("cfr-2014-ohio-state", "2014-ohio-state", 14, 44.8),
  cfbSeason("cfr-2018-clemson", "2018-clemson", 15, 44.3),
  cfbSeason("cfr-2019-lsu", "2019-lsu", 15, 48.4),
  cfbSeason("cfr-2020-alabama", "2020-alabama", 13, 48.5),
  cfbSeason("cfr-2022-georgia", "2022-georgia", 15, 41.1),
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
