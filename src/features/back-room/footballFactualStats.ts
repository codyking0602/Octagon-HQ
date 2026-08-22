export type FootballFactScope = "nfl-player-career" | "cfb-team-season";

export type FootballFactMetricId =
  | "nfl-career-games"
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
  { id: "nfl-career-games", label: "Career games", unit: "count", decimals: 0 },
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
  | "pfr-tom-brady"
  | "pfr-peyton-manning"
  | "pfr-drew-brees"
  | "pfr-dan-marino"
  | "pfr-john-elway"
  | "pfr-joe-montana"
  | "pfr-jim-brown"
  | "pfr-barry-sanders"
  | "pfr-walter-payton"
  | "pfr-emmitt-smith"
  | "cfr-2005-texas"
  | "cfr-2004-usc"
  | "cfr-2013-florida-state"
  | "cfr-2019-lsu"
  | "cfr-2020-alabama";

export interface FootballFactSource {
  id: FootballFactSourceId;
  publisher: string;
  title: string;
  url: string;
  reviewedOn: string;
  coverage: string;
}

const pfrSource = (
  id: FootballFactSourceId,
  title: string,
  url: string,
  coverage: string,
): FootballFactSource => ({
  id,
  publisher: "Pro Football Reference",
  title,
  url,
  reviewedOn: "2026-08-22",
  coverage,
});

const cfrSource = (
  id: FootballFactSourceId,
  title: string,
  url: string,
  coverage: string,
): FootballFactSource => ({
  id,
  publisher: "College Football at Sports-Reference",
  title,
  url,
  reviewedOn: "2026-08-22",
  coverage,
});

export const footballFactSources: readonly FootballFactSource[] = [
  pfrSource("pfr-tom-brady", "Tom Brady player record", "https://www.pro-football-reference.com/players/B/BradTo00.htm", "Completed NFL career through 2022"),
  pfrSource("pfr-peyton-manning", "Peyton Manning player record", "https://www.pro-football-reference.com/players/M/MannPe00.htm", "Completed NFL career through 2015"),
  pfrSource("pfr-drew-brees", "Drew Brees player record", "https://www.pro-football-reference.com/players/B/BreeDr00.htm", "Completed NFL career through 2020"),
  pfrSource("pfr-dan-marino", "Dan Marino player record", "https://www.pro-football-reference.com/players/M/MariDa00.htm", "Completed NFL career through 1999"),
  pfrSource("pfr-john-elway", "John Elway player record", "https://www.pro-football-reference.com/players/E/ElwaJo00.htm", "Completed NFL career through 1998"),
  pfrSource("pfr-joe-montana", "Joe Montana player record", "https://www.pro-football-reference.com/players/M/MontJo01.htm", "Completed NFL career through 1994"),
  pfrSource("pfr-jim-brown", "Jim Brown player record", "https://www.pro-football-reference.com/players/B/BrowJi00.htm", "Completed NFL career through 1965"),
  pfrSource("pfr-barry-sanders", "Barry Sanders player record", "https://www.pro-football-reference.com/players/S/SandBa00.htm", "Completed NFL career through 1998"),
  pfrSource("pfr-walter-payton", "Walter Payton player record", "https://www.pro-football-reference.com/players/P/PaytWa00.htm", "Completed NFL career through 1987"),
  pfrSource("pfr-emmitt-smith", "Emmitt Smith player record", "https://www.pro-football-reference.com/players/S/SmitEm00.htm", "Completed NFL career through 2004"),
  cfrSource("cfr-2005-texas", "2005 Texas Longhorns team record", "https://www.sports-reference.com/cfb/schools/texas/2005.html", "Completed 2005 season"),
  cfrSource("cfr-2004-usc", "2004 USC Trojans team record", "https://www.sports-reference.com/cfb/schools/southern-california/2004.html", "Completed 2004 season"),
  cfrSource("cfr-2013-florida-state", "2013 Florida State Seminoles team record", "https://www.sports-reference.com/cfb/schools/florida-state/2013.html", "Completed 2013 season"),
  cfrSource("cfr-2019-lsu", "2019 LSU Tigers team record", "https://www.sports-reference.com/cfb/schools/louisiana-state/2019.html", "Completed 2019 season"),
  cfrSource("cfr-2020-alabama", "2020 Alabama Crimson Tide team record", "https://www.sports-reference.com/cfb/schools/alabama/2020.html", "Completed 2020 season"),
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

const nflCareer = (
  subjectId: string,
  sourceId: FootballFactSourceId,
  facts: readonly [FootballFactMetricId, number][],
): FootballFactualRecord => ({
  subjectId,
  scope: "nfl-player-career",
  facts: facts.map(([metricId, value]) => reported(sourceId, metricId, value)),
});

const cfbTeamSeason = (
  subjectId: string,
  sourceId: FootballFactSourceId,
  wins: number,
  losses: number,
  pointsFor: number,
  pointsAgainst: number,
  pointsPerGame: number,
  srs: number,
  sos: number,
): FootballFactualRecord => ({
  subjectId,
  scope: "cfb-team-season",
  facts: [
    reported(sourceId, "cfb-team-wins", wins),
    reported(sourceId, "cfb-team-losses", losses),
    reported(sourceId, "cfb-team-points-for", pointsFor),
    reported(sourceId, "cfb-team-points-against", pointsAgainst),
    reported(sourceId, "cfb-team-points-per-game", pointsPerGame),
    reported(sourceId, "cfb-team-srs", srs),
    reported(sourceId, "cfb-team-sos", sos),
    reported(sourceId, "cfb-national-title", 1),
  ],
});

export const footballFactualRecords: readonly FootballFactualRecord[] = [
  nflCareer("tom-brady", "pfr-tom-brady", [
    ["nfl-career-passing-yards", 89214],
    ["nfl-career-passing-touchdowns", 649],
    ["nfl-ap-mvp-awards", 3],
    ["nfl-super-bowl-titles", 7],
  ]),
  nflCareer("peyton-manning", "pfr-peyton-manning", [
    ["nfl-career-passing-yards", 71940],
    ["nfl-career-passing-touchdowns", 539],
    ["nfl-ap-mvp-awards", 5],
    ["nfl-super-bowl-titles", 2],
  ]),
  nflCareer("drew-brees", "pfr-drew-brees", [
    ["nfl-career-passing-yards", 80358],
    ["nfl-career-passing-touchdowns", 571],
    ["nfl-ap-mvp-awards", 0],
    ["nfl-super-bowl-titles", 1],
  ]),
  nflCareer("dan-marino", "pfr-dan-marino", [
    ["nfl-career-passing-yards", 61361],
    ["nfl-career-passing-touchdowns", 420],
    ["nfl-ap-mvp-awards", 1],
    ["nfl-super-bowl-titles", 0],
  ]),
  nflCareer("john-elway", "pfr-john-elway", [
    ["nfl-career-passing-yards", 51475],
    ["nfl-career-passing-touchdowns", 300],
    ["nfl-ap-mvp-awards", 1],
    ["nfl-super-bowl-titles", 2],
  ]),
  nflCareer("joe-montana", "pfr-joe-montana", [
    ["nfl-career-passing-yards", 40551],
    ["nfl-career-passing-touchdowns", 273],
    ["nfl-ap-mvp-awards", 2],
    ["nfl-super-bowl-titles", 4],
  ]),
  nflCareer("jim-brown", "pfr-jim-brown", [
    ["nfl-career-games", 118],
    ["nfl-career-rushing-yards", 12312],
    ["nfl-career-rushing-touchdowns", 106],
    ["nfl-ap-mvp-awards", 3],
  ]),
  nflCareer("barry-sanders", "pfr-barry-sanders", [
    ["nfl-career-games", 153],
    ["nfl-career-rushing-yards", 15269],
    ["nfl-career-rushing-touchdowns", 99],
    ["nfl-ap-mvp-awards", 1],
  ]),
  nflCareer("walter-payton", "pfr-walter-payton", [
    ["nfl-career-games", 190],
    ["nfl-career-rushing-yards", 16726],
    ["nfl-career-rushing-touchdowns", 110],
    ["nfl-ap-mvp-awards", 1],
  ]),
  nflCareer("emmitt-smith", "pfr-emmitt-smith", [
    ["nfl-career-games", 226],
    ["nfl-career-rushing-yards", 18355],
    ["nfl-career-rushing-touchdowns", 164],
    ["nfl-ap-mvp-awards", 1],
  ]),
  cfbTeamSeason("2005-texas", "cfr-2005-texas", 13, 0, 652, 213, 50.2, 24.98, 4.98),
  cfbTeamSeason("2004-usc", "cfr-2004-usc", 13, 0, 496, 169, 38.2, 26.06, 8.22),
  cfbTeamSeason("2013-florida-state", "cfr-2013-florida-state", 14, 0, 723, 170, 51.6, 23.36, 1.29),
  cfbTeamSeason("2019-lsu", "cfr-2019-lsu", 15, 0, 726, 328, 48.4, 25.8, 6.6),
  cfbTeamSeason("2020-alabama", "cfr-2020-alabama", 13, 0, 630, 252, 48.5, 30.26, 9.72),
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
