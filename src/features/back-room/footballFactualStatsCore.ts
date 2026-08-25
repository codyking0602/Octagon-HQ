import {
  footballFindLeaderSubjects,
  getFootballFindLeaderFact,
  type FootballFindLeaderMetricId,
} from "./footballFactualStatsCatalog";
import {
  expandedFootballFactSources,
  expandedFootballFactualRecords,
} from "./footballFactualStatsExpansion";

export type FootballFactScope =
  | "nfl-player-career"
  | "nfl-player-season"
  | "nfl-team-season"
  | "cfb-player-career"
  | "cfb-team-season"
  | "cfb-coach-career"
  | "cfb-program"
  | "cfb-program-era";

export type FootballFactMetricId =
  | "nfl-career-passing-yards"
  | "nfl-career-passing-touchdowns"
  | "nfl-ap-mvp-awards"
  | "nfl-super-bowl-titles"
  | "nfl-career-rushing-yards"
  | "nfl-career-rushing-touchdowns"
  | "nfl-career-receptions"
  | "nfl-career-receiving-yards"
  | "nfl-career-receiving-touchdowns"
  | "nfl-career-sacks"
  | "nfl-career-interceptions"
  | "nfl-defensive-player-of-year-awards"
  | "nfl-first-team-all-pros"
  | "nfl-season-passing-yards"
  | "nfl-season-passing-touchdowns"
  | "nfl-season-interceptions"
  | "nfl-season-passer-rating"
  | "nfl-team-overall-wins"
  | "nfl-team-overall-losses"
  | "nfl-team-points-per-game"
  | "nfl-team-opponent-points-per-game"
  | "nfl-super-bowl-title"
  | "cfb-best-season-passing-yards"
  | "cfb-best-season-passing-touchdowns"
  | "cfb-best-season-interceptions"
  | "cfb-best-season-passer-rating"
  | "cfb-best-season-rushing-yards"
  | "cfb-best-season-rushing-touchdowns"
  | "cfb-best-season-receptions"
  | "cfb-best-season-receiving-yards"
  | "cfb-best-season-receiving-touchdowns"
  | "cfb-best-season-sacks"
  | "cfb-best-season-tackles-for-loss"
  | "cfb-best-season-defensive-interceptions"
  | "cfb-heisman-awards"
  | "cfb-team-wins"
  | "cfb-team-losses"
  | "cfb-team-points-for"
  | "cfb-team-points-against"
  | "cfb-team-points-per-game"
  | "cfb-team-srs"
  | "cfb-team-sos"
  | "cfb-national-title"
  | "cfb-coach-career-wins"
  | "cfb-coach-career-losses"
  | "cfb-coach-career-ties"
  | "cfb-coach-national-titles"
  | "cfb-coach-conference-titles"
  | "cfb-program-wins-since-2000"
  | "cfb-program-losses-since-2000"
  | "cfb-program-national-titles-since-2000"
  | "cfb-program-conference-titles-since-2000"
  | "cfb-program-cfp-appearances"
  | "cfb-program-title-game-appearances-since-2000"
  | "cfb-era-wins"
  | "cfb-era-losses"
  | "cfb-era-national-titles"
  | "cfb-era-conference-titles"
  | "cfb-era-cfp-appearances"
  | "cfb-era-title-game-appearances";

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

const metric = (
  id: FootballFactMetricId,
  label: string,
  unit: FootballFactUnit,
  decimals: 0 | 1 | 2,
): FootballFactMetricDefinition => ({ id, label, unit, decimals });

export const footballFactMetricDefinitions: readonly FootballFactMetricDefinition[] = [
  metric("nfl-career-passing-yards", "Career passing yards", "yards", 0),
  metric("nfl-career-passing-touchdowns", "Career passing TD", "count", 0),
  metric("nfl-ap-mvp-awards", "AP MVP awards", "count", 0),
  metric("nfl-super-bowl-titles", "Super Bowl titles", "count", 0),
  metric("nfl-career-rushing-yards", "Career rushing yards", "yards", 0),
  metric("nfl-career-rushing-touchdowns", "Career rushing TD", "count", 0),
  metric("nfl-career-receptions", "Career receptions", "count", 0),
  metric("nfl-career-receiving-yards", "Career receiving yards", "yards", 0),
  metric("nfl-career-receiving-touchdowns", "Career receiving TD", "count", 0),
  metric("nfl-career-sacks", "Career sacks", "count", 1),
  metric("nfl-career-interceptions", "Career defensive interceptions", "count", 0),
  metric("nfl-defensive-player-of-year-awards", "Defensive Player of the Year awards", "count", 0),
  metric("nfl-first-team-all-pros", "First-team All-Pro selections", "count", 0),
  metric("nfl-season-passing-yards", "Season passing yards", "yards", 0),
  metric("nfl-season-passing-touchdowns", "Season passing TD", "count", 0),
  metric("nfl-season-interceptions", "Season interceptions thrown", "count", 0),
  metric("nfl-season-passer-rating", "Season passer rating", "rating", 1),
  metric("nfl-team-overall-wins", "Overall wins", "count", 0),
  metric("nfl-team-overall-losses", "Overall losses", "count", 0),
  metric("nfl-team-points-per-game", "Points per game", "points-per-game", 1),
  metric("nfl-team-opponent-points-per-game", "Opponent points per game", "points-per-game", 1),
  metric("nfl-super-bowl-title", "Super Bowl title", "flag", 0),
  metric("cfb-best-season-passing-yards", "Best-season passing yards", "yards", 0),
  metric("cfb-best-season-passing-touchdowns", "Best-season passing TD", "count", 0),
  metric("cfb-best-season-interceptions", "Best-season interceptions thrown", "count", 0),
  metric("cfb-best-season-passer-rating", "Best-season passer rating", "rating", 1),
  metric("cfb-best-season-rushing-yards", "Best-season rushing yards", "yards", 0),
  metric("cfb-best-season-rushing-touchdowns", "Best-season rushing TD", "count", 0),
  metric("cfb-best-season-receptions", "Best-season receptions", "count", 0),
  metric("cfb-best-season-receiving-yards", "Best-season receiving yards", "yards", 0),
  metric("cfb-best-season-receiving-touchdowns", "Best-season receiving TD", "count", 0),
  metric("cfb-best-season-sacks", "Best-season sacks", "count", 1),
  metric("cfb-best-season-tackles-for-loss", "Best-season tackles for loss", "count", 1),
  metric("cfb-best-season-defensive-interceptions", "Best-season defensive interceptions", "count", 0),
  metric("cfb-heisman-awards", "Heisman Trophy wins", "count", 0),
  metric("cfb-team-wins", "Wins", "count", 0),
  metric("cfb-team-losses", "Losses", "count", 0),
  metric("cfb-team-points-for", "Points for", "points", 0),
  metric("cfb-team-points-against", "Points against", "points", 0),
  metric("cfb-team-points-per-game", "Points per game", "points-per-game", 1),
  metric("cfb-team-srs", "SRS", "rating", 2),
  metric("cfb-team-sos", "SOS", "rating", 2),
  metric("cfb-national-title", "National title", "flag", 0),
  metric("cfb-coach-career-wins", "Career wins", "count", 0),
  metric("cfb-coach-career-losses", "Career losses", "count", 0),
  metric("cfb-coach-career-ties", "Career ties", "count", 0),
  metric("cfb-coach-national-titles", "National titles", "count", 0),
  metric("cfb-coach-conference-titles", "Conference titles", "count", 0),
  metric("cfb-program-wins-since-2000", "Wins since 2000", "count", 0),
  metric("cfb-program-losses-since-2000", "Losses since 2000", "count", 0),
  metric("cfb-program-national-titles-since-2000", "National titles since 2000", "count", 0),
  metric("cfb-program-conference-titles-since-2000", "Conference titles since 2000", "count", 0),
  metric("cfb-program-cfp-appearances", "CFP appearances", "count", 0),
  metric("cfb-program-title-game-appearances-since-2000", "National title-game appearances since 2000", "count", 0),
  metric("cfb-era-wins", "Era wins", "count", 0),
  metric("cfb-era-losses", "Era losses", "count", 0),
  metric("cfb-era-national-titles", "Era national titles", "count", 0),
  metric("cfb-era-conference-titles", "Era conference titles", "count", 0),
  metric("cfb-era-cfp-appearances", "Era CFP appearances", "count", 0),
  metric("cfb-era-title-game-appearances", "Era national title-game appearances", "count", 0),
] as const;

export type FootballFactSourceId =
  | "pfr-peyton-manning"
  | "pfr-dan-marino"
  | "pfr-john-elway"
  | "pfr-emmitt-smith"
  | "pfr-barry-sanders"
  | "pfr-pass-yards-career"
  | "pfr-rush-yards-career"
  | "cfr-champion-season-stat-lines"
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
  | "cfr-2022-georgia"
  | "pfr-receiving-career"
  | "pfr-defensive-career"
  | "pfr-player-season-stat-lines"
  | "pfr-team-season-records"
  | "cfr-player-stat-lines"
  | "cfr-coach-records"
  | "cfr-program-records"
  | "cfr-team-season-records";

export interface FootballFactSource {
  id: FootballFactSourceId;
  publisher: string;
  title: string;
  url: string;
  reviewedOn: string;
  coverage: string;
}

const seedSources: readonly FootballFactSource[] = [
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
    coverage: "Career passing totals for the canonical 25-quarterback compatibility pool",
  },
  {
    id: "pfr-rush-yards-career",
    publisher: "Pro Football Reference",
    title: "NFL Rushing Yards Career Leaders",
    url: "https://www.pro-football-reference.com/leaders/rush_yds_career.htm",
    reviewedOn: "2026-08-22",
    coverage: "Career rushing totals for the canonical 25-running-back compatibility pool",
  },
  {
    id: "cfr-champion-season-stat-lines",
    publisher: "College Football at Sports-Reference",
    title: "National-champion season stat lines",
    url: "https://www.sports-reference.com/cfb/",
    reviewedOn: "2026-08-25",
    coverage: "Completed national-champion team seasons retained by the compatibility factual catalog",
  },
  { id: "cfr-1995-nebraska", publisher: "College Football at Sports-Reference", title: "1995 Nebraska team record", url: "https://www.sports-reference.com/cfb/schools/nebraska/1995.html", reviewedOn: "2026-08-22", coverage: "Completed 1995 season" },
  { id: "cfr-2001-miami", publisher: "College Football at Sports-Reference", title: "2001 Miami team record", url: "https://www.sports-reference.com/cfb/schools/miami-fl/2001.html", reviewedOn: "2026-08-22", coverage: "Completed 2001 season" },
  { id: "cfr-2005-texas", publisher: "College Football at Sports-Reference", title: "2005 Texas team record", url: "https://www.sports-reference.com/cfb/schools/texas/2005.html", reviewedOn: "2026-08-22", coverage: "Completed 2005 season" },
  { id: "cfr-2008-florida", publisher: "College Football at Sports-Reference", title: "2008 Florida team record", url: "https://www.sports-reference.com/cfb/schools/florida/2008.html", reviewedOn: "2026-08-22", coverage: "Completed 2008 season" },
  { id: "cfr-2010-auburn", publisher: "College Football at Sports-Reference", title: "2010 Auburn team record", url: "https://www.sports-reference.com/cfb/schools/auburn/2010.html", reviewedOn: "2026-08-22", coverage: "Completed 2010 season" },
  { id: "cfr-2013-florida-state", publisher: "College Football at Sports-Reference", title: "2013 Florida State team record", url: "https://www.sports-reference.com/cfb/schools/florida-state/2013.html", reviewedOn: "2026-08-22", coverage: "Completed 2013 season" },
  { id: "cfr-2014-ohio-state", publisher: "College Football at Sports-Reference", title: "2014 Ohio State team record", url: "https://www.sports-reference.com/cfb/schools/ohio-state/2014.html", reviewedOn: "2026-08-22", coverage: "Completed 2014 season" },
  { id: "cfr-2018-clemson", publisher: "College Football at Sports-Reference", title: "2018 Clemson team record", url: "https://www.sports-reference.com/cfb/schools/clemson/2018.html", reviewedOn: "2026-08-22", coverage: "Completed 2018 season" },
  { id: "cfr-2019-lsu", publisher: "College Football at Sports-Reference", title: "2019 LSU team record", url: "https://www.sports-reference.com/cfb/schools/louisiana-state/2019.html", reviewedOn: "2026-08-22", coverage: "Completed 2019 season" },
  { id: "cfr-2020-alabama", publisher: "College Football at Sports-Reference", title: "2020 Alabama team record", url: "https://www.sports-reference.com/cfb/schools/alabama/2020.html", reviewedOn: "2026-08-22", coverage: "Completed 2020 season" },
  { id: "cfr-2022-georgia", publisher: "College Football at Sports-Reference", title: "2022 Georgia team record", url: "https://www.sports-reference.com/cfb/schools/georgia/2022.html", reviewedOn: "2026-08-22", coverage: "Completed 2022 season" },
] as const;

export const footballFactSources: readonly FootballFactSource[] = [
  ...seedSources,
  ...expandedFootballFactSources,
];

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

const specificQbSource: Readonly<Record<string, FootballFactSourceId>> = {
  "peyton-manning": "pfr-peyton-manning",
  "dan-marino": "pfr-dan-marino",
  "john-elway": "pfr-john-elway",
};
const specificRbSource: Readonly<Record<string, FootballFactSourceId>> = {
  "emmitt-smith": "pfr-emmitt-smith",
  "barry-sanders": "pfr-barry-sanders",
};
const specificCfbSource: Readonly<Record<string, FootballFactSourceId>> = {
  "1995-nebraska": "cfr-1995-nebraska",
  "2001-miami": "cfr-2001-miami",
  "2005-texas": "cfr-2005-texas",
  "2008-florida": "cfr-2008-florida",
  "2010-auburn": "cfr-2010-auburn",
  "2013-florida-state": "cfr-2013-florida-state",
  "2014-ohio-state": "cfr-2014-ohio-state",
  "2018-clemson": "cfr-2018-clemson",
  "2019-lsu": "cfr-2019-lsu",
  "2020-alabama": "cfr-2020-alabama",
  "2022-georgia": "cfr-2022-georgia",
};

const championRecords: Readonly<Record<string, readonly [wins: number, losses: number]>> = {
  "1995-nebraska": [12, 0],
  "1996-florida": [12, 1],
  "1997-michigan": [12, 0],
  "1998-tennessee": [13, 0],
  "1999-florida-state": [12, 0],
  "2000-oklahoma": [13, 0],
  "2001-miami": [12, 0],
  "2002-ohio-state": [14, 0],
  "2003-lsu": [13, 1],
  "2004-usc": [13, 0],
  "2005-texas": [13, 0],
  "2006-florida": [13, 1],
  "2007-lsu": [12, 2],
  "2008-florida": [13, 1],
  "2009-alabama": [14, 0],
  "2010-auburn": [14, 0],
  "2011-alabama": [12, 1],
  "2012-alabama": [13, 1],
  "2013-florida-state": [14, 0],
  "2014-ohio-state": [14, 1],
  "2015-alabama": [14, 1],
  "2017-alabama": [13, 1],
  "2018-clemson": [15, 0],
  "2019-lsu": [15, 0],
  "2020-alabama": [13, 0],
  "2021-georgia": [14, 1],
  "2022-georgia": [15, 0],
};

function requiredCompatibilityValue(subjectId: string, metricId: FootballFindLeaderMetricId) {
  const row = getFootballFindLeaderFact(subjectId, metricId);
  if (!row) throw new Error(`Missing canonical compatibility fact: ${subjectId}:${metricId}`);
  return row.value;
}

function legacyExtras(subjectId: string, sourceId: FootballFactSourceId): FootballFactValue[] {
  switch (subjectId) {
    case "peyton-manning": return [
      reported(sourceId, "nfl-ap-mvp-awards", 5),
      reported(sourceId, "nfl-super-bowl-titles", 2),
    ];
    case "dan-marino": return [
      reported(sourceId, "nfl-ap-mvp-awards", 1),
      reported(sourceId, "nfl-super-bowl-titles", 0),
    ];
    case "john-elway": return [
      reported(sourceId, "nfl-ap-mvp-awards", 1),
      reported(sourceId, "nfl-super-bowl-titles", 2),
    ];
    case "emmitt-smith": return [reported(sourceId, "nfl-career-rushing-touchdowns", 164)];
    case "barry-sanders": return [reported(sourceId, "nfl-career-rushing-touchdowns", 99)];
    default: return [];
  }
}

const compatibilityFactualRecords: readonly FootballFactualRecord[] = footballFindLeaderSubjects.map((subject) => {
  if (subject.domainId === "nfl-qb-career") {
    const sourceId = specificQbSource[subject.id] ?? "pfr-pass-yards-career";
    return {
      subjectId: subject.id,
      scope: "nfl-player-career",
      facts: [
        reported(sourceId, "nfl-career-passing-yards", requiredCompatibilityValue(subject.id, "qb-passing-yards")),
        reported(sourceId, "nfl-career-passing-touchdowns", requiredCompatibilityValue(subject.id, "qb-passing-touchdowns")),
        ...legacyExtras(subject.id, sourceId),
      ],
    };
  }
  if (subject.domainId === "nfl-rb-career") {
    const sourceId = specificRbSource[subject.id] ?? "pfr-rush-yards-career";
    return {
      subjectId: subject.id,
      scope: "nfl-player-career",
      facts: [
        reported(sourceId, "nfl-career-rushing-yards", requiredCompatibilityValue(subject.id, "rb-rushing-yards")),
        reported(sourceId, "nfl-career-rushing-touchdowns", requiredCompatibilityValue(subject.id, "rb-rushing-touchdowns")),
        ...legacyExtras(subject.id, sourceId).filter((row) => row.metricId !== "nfl-career-rushing-touchdowns"),
      ],
    };
  }

  const sourceId = specificCfbSource[subject.id] ?? "cfr-champion-season-stat-lines";
  const record = championRecords[subject.id];
  return {
    subjectId: subject.id,
    scope: "cfb-team-season",
    facts: [
      ...(record == null ? [] : [
        reported(sourceId, "cfb-team-wins", record[0]),
        reported(sourceId, "cfb-team-losses", record[1]),
      ]),
      reported(sourceId, "cfb-team-points-for", requiredCompatibilityValue(subject.id, "cfb-points-for")),
      reported(sourceId, "cfb-team-points-against", requiredCompatibilityValue(subject.id, "cfb-points-against")),
      reported(sourceId, "cfb-team-points-per-game", requiredCompatibilityValue(subject.id, "cfb-points-per-game")),
      reported(sourceId, "cfb-team-srs", requiredCompatibilityValue(subject.id, "cfb-srs")),
      reported(sourceId, "cfb-team-sos", requiredCompatibilityValue(subject.id, "cfb-sos")),
      reported(sourceId, "cfb-national-title", 1),
    ],
  };
});

/**
 * Canonical reusable quantitative Football ledger.
 * Compatibility facts are normalized from the existing factual catalog; broader families live in
 * a data-only expansion partition but use this module's metrics, sources, evidence and lookup owner.
 */
export const footballFactualRecords: readonly FootballFactualRecord[] = [
  ...compatibilityFactualRecords,
  ...expandedFootballFactualRecords,
] as const;

const recordIds = footballFactualRecords.map((record) => record.subjectId);
if (new Set(recordIds).size !== recordIds.length) {
  throw new Error("Canonical Football factual ledger contains duplicate subject records.");
}

const recordsBySubjectId = new Map(footballFactualRecords.map((record) => [record.subjectId, record]));
const metricDefinitionsById = new Map(footballFactMetricDefinitions.map((row) => [row.id, row]));
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
