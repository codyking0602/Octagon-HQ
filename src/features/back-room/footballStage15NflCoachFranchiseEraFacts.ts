import nflCoachSeasonsJson from "../../../data/generated/football/relationships/nfl-coach-seasons-1999-2025.json";
import nflTeamSeasonResultsJson from "../../../data/generated/football/relationships/nfl-team-season-results-1999-2025.json";
import recognizabilityProjectionJson from "../../../data/generated/football/recognizability-projection.json";
import type {
  FootballFactMetricId,
  FootballFactValue,
  FootballFactualRecord,
} from "./footballFactualStatsCore";
import { footballRecognitionEvidenceSubjects } from "./footballRecognitionEvidence";

const RELATIONSHIP_SOURCE_ID = "football-relationships-factual-universe";
const NFL_SOURCE_START = 1999;
const NFL_SOURCE_END = 2025;

type TablePayload = {
  columns: readonly string[];
  rows: readonly (readonly unknown[])[];
};
type Row = Readonly<Record<string, unknown>>;
type RecognitionProjectionRecord = {
  id: string;
  kind: string;
  league: "NFL" | "CFB";
  sourceProvider: string;
  sourceId: string;
};

function tableRows(payload: TablePayload): readonly Row[] {
  return payload.rows.map((values) => Object.fromEntries(
    payload.columns.map((column, index) => [column, values[index]]),
  ));
}

function numberValue(row: Row, key: string) {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function stringValue(row: Row, key: string) {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

function booleanValue(row: Row, key: string) {
  return row[key] === true;
}

function derivedFact(metricId: FootballFactMetricId, value: number, formula: string): FootballFactValue {
  return {
    metricId,
    value,
    evidence: {
      sourceIds: [RELATIONSHIP_SOURCE_ID],
      kind: "derived",
      formula,
    },
  };
}

function winPercentage(rows: readonly Row[]) {
  const games = rows.reduce((sum, row) => sum + numberValue(row, "regularSeasonGames"), 0);
  if (games <= 0) return null;
  const wins = rows.reduce((sum, row) => sum + numberValue(row, "regularSeasonWins"), 0);
  const ties = rows.reduce((sum, row) => sum + numberValue(row, "regularSeasonTies"), 0);
  return (wins + ties * 0.5) / games * 100;
}

function rowsBySeason(rows: readonly Row[]) {
  const bySeason = new Map<number, Row[]>();
  for (const row of rows) {
    const season = numberValue(row, "season");
    const values = bySeason.get(season) ?? [];
    values.push(row);
    bySeason.set(season, values);
  }
  return bySeason;
}

function bestSeasonWinPercentage(rows: readonly Row[]) {
  const seasonRows = [...rowsBySeason(rows).values()];
  const qualifying = seasonRows.filter((values) => (
    values.reduce((sum, row) => sum + numberValue(row, "regularSeasonGames"), 0) >= 8
  ));
  const pool = qualifying.length > 0 ? qualifying : seasonRows;
  const values = pool.flatMap((season) => {
    const percentage = winPercentage(season);
    return percentage == null ? [] : [percentage];
  });
  return values.length > 0 ? Math.max(...values) : null;
}

function postseasonOutcomePoints(rows: readonly Row[]) {
  const seasons = [...rowsBySeason(rows).values()];
  return seasons.reduce((sum, seasonRows) => {
    const champion = seasonRows.some((row) => booleanValue(row, "superBowlChampion"));
    const superBowl = seasonRows.some((row) => booleanValue(row, "superBowlAppearance"));
    const conferenceTitleGame = seasonRows.some((row) => booleanValue(row, "conferenceChampionshipGame"));
    const playoffs = seasonRows.some((row) => booleanValue(row, "playoffBerth"));
    return sum + (champion ? 4 : superBowl ? 2 : conferenceTitleGame ? 1 : playoffs ? 0.25 : 0);
  }, 0);
}

const coachRows = tableRows(nflCoachSeasonsJson as TablePayload);
const teamRows = tableRows(nflTeamSeasonResultsJson as TablePayload);

function buildCoachRecords(): readonly FootballFactualRecord[] {
  const byCoach = new Map<string, Row[]>();
  for (const row of coachRows) {
    const coachId = stringValue(row, "sourceCoachNameKey");
    if (!coachId) continue;
    const values = byCoach.get(coachId) ?? [];
    values.push(row);
    byCoach.set(coachId, values);
  }

  return [...byCoach.entries()].flatMap(([subjectId, rows]) => {
    const seasonCount = rowsBySeason(rows).size;
    const careerWinPercentage = winPercentage(rows);
    const bestWinPercentage = bestSeasonWinPercentage(rows);
    if (seasonCount === 0 || careerWinPercentage == null || bestWinPercentage == null) return [];
    return [{
      subjectId,
      scope: "nfl-coach-career" as const,
      facts: [
        derivedFact("nfl-coach-seasons-since-1999", seasonCount, "distinct NFL head-coach seasons represented in the pinned 1999-2025 coach-season relationship corpus"),
        derivedFact("nfl-coach-win-percentage-since-1999", careerWinPercentage, "(regular-season wins + 0.5 * ties) / regular-season games * 100 across represented NFL head-coach seasons"),
        derivedFact("nfl-coach-best-season-win-percentage-since-1999", bestWinPercentage, "best regular-season win percentage among represented NFL head-coach seasons; 8+ game seasons are preferred when available"),
        derivedFact("nfl-coach-postseason-resume-since-1999", postseasonOutcomePoints(rows), "sum of one exclusive postseason result per represented season: Super Bowl title 4, Super Bowl loss 2, conference-title-game loss 1, other playoff berth 0.25"),
      ],
    }];
  });
}

const franchiseProjectionRecords = (recognizabilityProjectionJson.records as readonly RecognitionProjectionRecord[])
  .filter((record) => record.kind === "franchise" && record.league === "NFL" && record.sourceProvider === "nflverse");

function buildFranchiseRecords(): readonly FootballFactualRecord[] {
  return franchiseProjectionRecords.flatMap((projection) => {
    const rows = teamRows.filter((row) => stringValue(row, "franchiseId") === projection.sourceId);
    const seasonCount = rowsBySeason(rows).size;
    const franchiseWinPercentage = winPercentage(rows);
    const bestWinPercentage = bestSeasonWinPercentage(rows);
    if (seasonCount === 0 || franchiseWinPercentage == null || bestWinPercentage == null) return [];
    return [{
      subjectId: projection.id,
      scope: "nfl-franchise" as const,
      facts: [
        derivedFact("nfl-franchise-seasons-since-1999", seasonCount, "distinct franchise seasons represented in the pinned 1999-2025 NFL team-season corpus"),
        derivedFact("nfl-franchise-win-percentage-since-1999", franchiseWinPercentage, "(regular-season wins + 0.5 * ties) / regular-season games * 100 across represented franchise seasons"),
        derivedFact("nfl-franchise-best-season-win-percentage-since-1999", bestWinPercentage, "best regular-season win percentage among represented franchise seasons"),
        derivedFact("nfl-franchise-postseason-resume-since-1999", postseasonOutcomePoints(rows), "sum of one exclusive postseason result per represented franchise season: Super Bowl title 4, Super Bowl loss 2, conference-title-game loss 1, other playoff berth 0.25"),
      ],
    }];
  });
}

function buildBoundedEraRecords(): readonly FootballFactualRecord[] {
  return footballRecognitionEvidenceSubjects.flatMap((subject) => {
    if (subject.kind !== "era" || subject.league !== "NFL") return [];
    if (subject.startSeason == null || subject.endSeason == null) return [];
    if (subject.startSeason < NFL_SOURCE_START || subject.endSeason > NFL_SOURCE_END) return [];
    const franchises = subject.franchises ?? [];
    if (franchises.length === 0) return [];
    const rows = teamRows.filter((row) => (
      franchises.includes(stringValue(row, "franchiseId"))
      && numberValue(row, "season") >= subject.startSeason!
      && numberValue(row, "season") <= subject.endSeason!
    ));
    const expectedSeasonCount = (subject.endSeason - subject.startSeason + 1) * franchises.length;
    if (rows.length !== expectedSeasonCount) return [];
    const eraWinPercentage = winPercentage(rows);
    const bestWinPercentage = bestSeasonWinPercentage(rows);
    if (eraWinPercentage == null || bestWinPercentage == null) return [];
    const seasonCount = rowsBySeason(rows).size;
    const postseasonRate = seasonCount > 0 ? postseasonOutcomePoints(rows) / seasonCount : 0;
    return [{
      subjectId: subject.id,
      scope: "nfl-franchise-era" as const,
      facts: [
        derivedFact("nfl-franchise-era-season-count", seasonCount, "distinct fully covered NFL seasons inside the reviewed bounded era"),
        derivedFact("nfl-franchise-era-win-percentage", eraWinPercentage, "(regular-season wins + 0.5 * ties) / regular-season games * 100 inside the reviewed bounded era only"),
        derivedFact("nfl-franchise-era-best-season-win-percentage", bestWinPercentage, "best regular-season win percentage inside the reviewed bounded era only"),
        derivedFact("nfl-franchise-era-postseason-resume", postseasonRate, "exclusive postseason outcome points inside the era divided by era seasons; title 4, Super Bowl loss 2, conference-title-game loss 1, other playoff berth 0.25"),
      ],
    }];
  });
}

export const footballStage15NflCoachFranchiseEraFactualRecords: readonly FootballFactualRecord[] = [
  ...buildCoachRecords(),
  ...buildFranchiseRecords(),
  ...buildBoundedEraRecords(),
];
