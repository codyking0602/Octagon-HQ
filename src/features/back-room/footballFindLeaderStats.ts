import {
  FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE,
  footballCfbChampionSeasonRows,
  footballFactualCatalogSubjects,
  footballFactualStatLineSources,
  footballNflQbCareerRows,
  footballNflRbCareerRows,
  type FootballCfbChampionSeasonRow,
  type FootballFactualDomainId,
  type FootballNflQbCareerRow,
  type FootballNflRbCareerRow,
} from "./footballFactualCatalog";

export type FootballFindLeaderDomainId = FootballFactualDomainId;
export type FootballFindLeaderLeagueId = "nfl" | "cfb";

export type FootballFindLeaderFamilyId =
  | "qb-volume"
  | "qb-efficiency"
  | "rb-rushing"
  | "rb-receiving"
  | "rb-scrimmage"
  | "cfb-offense"
  | "cfb-defense"
  | "cfb-strength";

export type FootballFindLeaderMetricId =
  | "qb-games"
  | "qb-completions"
  | "qb-attempts"
  | "qb-passing-yards"
  | "qb-passing-touchdowns"
  | "qb-interceptions"
  | "qb-passer-rating"
  | "qb-completion-pct"
  | "qb-yards-per-attempt"
  | "qb-touchdown-pct"
  | "qb-passing-yards-per-game"
  | "qb-passing-touchdowns-per-game"
  | "qb-completions-per-game"
  | "qb-attempts-per-game"
  | "qb-td-int-ratio"
  | "rb-games"
  | "rb-rushing-attempts"
  | "rb-rushing-yards"
  | "rb-rushing-touchdowns"
  | "rb-receptions"
  | "rb-receiving-yards"
  | "rb-receiving-touchdowns"
  | "rb-rush-yards-per-attempt"
  | "rb-rushing-yards-per-game"
  | "rb-rushing-touchdowns-per-game"
  | "rb-receptions-per-game"
  | "rb-receiving-yards-per-game"
  | "rb-scrimmage-yards"
  | "rb-scrimmage-yards-per-game"
  | "rb-scrimmage-touchdowns"
  | "cfb-points-for"
  | "cfb-points-against"
  | "cfb-points-per-game"
  | "cfb-opponent-points-per-game"
  | "cfb-point-differential"
  | "cfb-scoring-margin-per-game"
  | "cfb-points-ratio"
  | "cfb-differential-rate-pct"
  | "cfb-total-points"
  | "cfb-srs"
  | "cfb-sos";

export type FootballFindLeaderUnit =
  | "count"
  | "yards"
  | "rating"
  | "percent"
  | "per-game"
  | "per-attempt"
  | "ratio"
  | "points";

export interface FootballFindLeaderMetricDefinition {
  id: FootballFindLeaderMetricId;
  domainId: FootballFindLeaderDomainId;
  family: FootballFindLeaderFamilyId;
  label: string;
  shortLabel: string;
  unit: FootballFindLeaderUnit;
  decimals: 0 | 1 | 2;
  questionLead: string;
}

const metric = (
  id: FootballFindLeaderMetricId,
  domainId: FootballFindLeaderDomainId,
  family: FootballFindLeaderFamilyId,
  label: string,
  shortLabel: string,
  unit: FootballFindLeaderUnit,
  decimals: 0 | 1 | 2,
  questionLead: string,
): FootballFindLeaderMetricDefinition => ({
  id,
  domainId,
  family,
  label,
  shortLabel,
  unit,
  decimals,
  questionLead,
});

export const footballFindLeaderMetricDefinitions: readonly FootballFindLeaderMetricDefinition[] = [
  metric("qb-games", "nfl-qb-career", "qb-volume", "career games", "GAMES", "count", 0, "the most career games"),
  metric("qb-completions", "nfl-qb-career", "qb-volume", "career completions", "COMPLETIONS", "count", 0, "the most career completions"),
  metric("qb-attempts", "nfl-qb-career", "qb-volume", "career pass attempts", "ATTEMPTS", "count", 0, "the most career pass attempts"),
  metric("qb-passing-yards", "nfl-qb-career", "qb-volume", "career passing yards", "PASS YARDS", "yards", 0, "the most career passing yards"),
  metric("qb-passing-touchdowns", "nfl-qb-career", "qb-volume", "career passing touchdowns", "PASS TD", "count", 0, "the most career passing touchdowns"),
  metric("qb-interceptions", "nfl-qb-career", "qb-volume", "career interceptions thrown", "INTERCEPTIONS", "count", 0, "the most career interceptions thrown"),
  metric("qb-passer-rating", "nfl-qb-career", "qb-efficiency", "career passer rating", "PASSER RATING", "rating", 1, "the highest career passer rating"),
  metric("qb-completion-pct", "nfl-qb-career", "qb-efficiency", "career completion percentage", "COMP %", "percent", 1, "the highest career completion percentage"),
  metric("qb-yards-per-attempt", "nfl-qb-career", "qb-efficiency", "career yards per attempt", "Y/A", "per-attempt", 2, "the most career passing yards per attempt"),
  metric("qb-touchdown-pct", "nfl-qb-career", "qb-efficiency", "touchdown rate", "TD %", "percent", 2, "the highest career touchdown rate"),
  metric("qb-passing-yards-per-game", "nfl-qb-career", "qb-efficiency", "passing yards per game", "PASS YDS/G", "per-game", 1, "the most career passing yards per game"),
  metric("qb-passing-touchdowns-per-game", "nfl-qb-career", "qb-efficiency", "passing touchdowns per game", "PASS TD/G", "per-game", 2, "the most career passing touchdowns per game"),
  metric("qb-completions-per-game", "nfl-qb-career", "qb-efficiency", "completions per game", "CMP/G", "per-game", 1, "the most career completions per game"),
  metric("qb-attempts-per-game", "nfl-qb-career", "qb-efficiency", "pass attempts per game", "ATT/G", "per-game", 1, "the most career pass attempts per game"),
  metric("qb-td-int-ratio", "nfl-qb-career", "qb-efficiency", "touchdown-to-interception ratio", "TD:INT", "ratio", 2, "the best career touchdown-to-interception ratio"),
  metric("rb-games", "nfl-rb-career", "rb-rushing", "career games", "GAMES", "count", 0, "the most career games"),
  metric("rb-rushing-attempts", "nfl-rb-career", "rb-rushing", "career rushing attempts", "CARRIES", "count", 0, "the most career rushing attempts"),
  metric("rb-rushing-yards", "nfl-rb-career", "rb-rushing", "career rushing yards", "RUSH YARDS", "yards", 0, "the most career rushing yards"),
  metric("rb-rushing-touchdowns", "nfl-rb-career", "rb-rushing", "career rushing touchdowns", "RUSH TD", "count", 0, "the most career rushing touchdowns"),
  metric("rb-rush-yards-per-attempt", "nfl-rb-career", "rb-rushing", "career rushing yards per attempt", "Y/C", "per-attempt", 2, "the most career rushing yards per attempt"),
  metric("rb-rushing-yards-per-game", "nfl-rb-career", "rb-rushing", "rushing yards per game", "RUSH YDS/G", "per-game", 1, "the most career rushing yards per game"),
  metric("rb-rushing-touchdowns-per-game", "nfl-rb-career", "rb-rushing", "rushing touchdowns per game", "RUSH TD/G", "per-game", 2, "the most career rushing touchdowns per game"),
  metric("rb-receptions", "nfl-rb-career", "rb-receiving", "career receptions", "RECEPTIONS", "count", 0, "the most career receptions"),
  metric("rb-receiving-yards", "nfl-rb-career", "rb-receiving", "career receiving yards", "REC YARDS", "yards", 0, "the most career receiving yards"),
  metric("rb-receiving-touchdowns", "nfl-rb-career", "rb-receiving", "career receiving touchdowns", "REC TD", "count", 0, "the most career receiving touchdowns"),
  metric("rb-receptions-per-game", "nfl-rb-career", "rb-receiving", "receptions per game", "REC/G", "per-game", 1, "the most career receptions per game"),
  metric("rb-receiving-yards-per-game", "nfl-rb-career", "rb-receiving", "receiving yards per game", "REC YDS/G", "per-game", 1, "the most career receiving yards per game"),
  metric("rb-scrimmage-yards", "nfl-rb-career", "rb-scrimmage", "career scrimmage yards", "SCRIMMAGE YDS", "yards", 0, "the most career yards from scrimmage"),
  metric("rb-scrimmage-yards-per-game", "nfl-rb-career", "rb-scrimmage", "scrimmage yards per game", "SCRIM YDS/G", "per-game", 1, "the most career scrimmage yards per game"),
  metric("rb-scrimmage-touchdowns", "nfl-rb-career", "rb-scrimmage", "career scrimmage touchdowns", "SCRIMMAGE TD", "count", 0, "the most career rushing plus receiving touchdowns"),
  metric("cfb-points-for", "cfb-champion-season", "cfb-offense", "season points scored", "POINTS FOR", "points", 0, "the most points scored"),
  metric("cfb-points-per-game", "cfb-champion-season", "cfb-offense", "points per game", "PPG", "per-game", 1, "the most points per game"),
  metric("cfb-point-differential", "cfb-champion-season", "cfb-offense", "season point differential", "POINT DIFF", "points", 0, "the largest total point differential"),
  metric("cfb-differential-rate-pct", "cfb-champion-season", "cfb-offense", "point differential as a share of points scored", "DIFF RATE", "percent", 1, "the highest point-differential rate"),
  metric("cfb-points-against", "cfb-champion-season", "cfb-defense", "season points allowed", "POINTS ALLOWED", "points", 0, "the most points allowed"),
  metric("cfb-opponent-points-per-game", "cfb-champion-season", "cfb-defense", "opponent points per game", "OPP PPG", "per-game", 1, "the most opponent points per game"),
  metric("cfb-scoring-margin-per-game", "cfb-champion-season", "cfb-defense", "scoring margin per game", "MARGIN/G", "per-game", 1, "the largest scoring margin per game"),
  metric("cfb-points-ratio", "cfb-champion-season", "cfb-defense", "points-for to points-against ratio", "PF:PA", "ratio", 2, "the best points-for to points-against ratio"),
  metric("cfb-total-points", "cfb-champion-season", "cfb-strength", "combined points in the season", "TOTAL POINTS", "points", 0, "the most combined points scored and allowed"),
  metric("cfb-srs", "cfb-champion-season", "cfb-strength", "Simple Rating System score", "SRS", "rating", 2, "the highest SRS"),
  metric("cfb-sos", "cfb-champion-season", "cfb-strength", "strength of schedule", "SOS", "rating", 2, "the highest strength of schedule"),
] as const;

export const FOOTBALL_FIND_LEADER_METRIC_COUNT = footballFindLeaderMetricDefinitions.length;

export interface FootballFindLeaderSubject {
  id: string;
  name: string;
  subtitle: string;
  domainId: FootballFindLeaderDomainId;
}

const subtitleForDomain: Record<FootballFindLeaderDomainId, string> = {
  "nfl-qb-career": "Retired NFL quarterback",
  "nfl-rb-career": "Retired NFL running back",
  "cfb-champion-season": "National-championship season",
};

export const footballFindLeaderSubjects: readonly FootballFindLeaderSubject[] = footballFactualCatalogSubjects.map(
  (subject) => ({
    id: subject.id,
    name: subject.name,
    subtitle: subtitleForDomain[subject.domainId],
    domainId: subject.domainId,
  }),
);

export const FOOTBALL_FIND_LEADER_SUBJECT_COUNT = footballFindLeaderSubjects.length;
export const FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE = FOOTBALL_FACTUAL_DOMAIN_POOL_SIZE;

const qbById = new Map(footballNflQbCareerRows.map((row) => [row.id, row]));
const rbById = new Map(footballNflRbCareerRows.map((row) => [row.id, row]));
const cfbById = new Map(footballCfbChampionSeasonRows.map((row) => [row.id, row]));
const metricById = new Map(footballFindLeaderMetricDefinitions.map((row) => [row.id, row]));

export const footballFindLeaderSources = footballFactualStatLineSources;

function nflPasserRating(row: FootballNflQbCareerRow) {
  const a = Math.min(2.375, Math.max(0, (row.completions / row.attempts - 0.3) * 5));
  const b = Math.min(2.375, Math.max(0, (row.passingYards / row.attempts - 3) * 0.25));
  const c = Math.min(2.375, Math.max(0, row.passingTouchdowns / row.attempts * 20));
  const d = Math.min(2.375, Math.max(0, 2.375 - row.interceptions / row.attempts * 25));
  return (a + b + c + d) / 6 * 100;
}

function qbValue(row: FootballNflQbCareerRow, metricId: FootballFindLeaderMetricId): number | null {
  switch (metricId) {
    case "qb-games": return row.games;
    case "qb-completions": return row.completions;
    case "qb-attempts": return row.attempts;
    case "qb-passing-yards": return row.passingYards;
    case "qb-passing-touchdowns": return row.passingTouchdowns;
    case "qb-interceptions": return row.interceptions;
    case "qb-passer-rating": return nflPasserRating(row);
    case "qb-completion-pct": return row.completions / row.attempts * 100;
    case "qb-yards-per-attempt": return row.passingYards / row.attempts;
    case "qb-touchdown-pct": return row.passingTouchdowns / row.attempts * 100;
    case "qb-passing-yards-per-game": return row.passingYards / row.games;
    case "qb-passing-touchdowns-per-game": return row.passingTouchdowns / row.games;
    case "qb-completions-per-game": return row.completions / row.games;
    case "qb-attempts-per-game": return row.attempts / row.games;
    case "qb-td-int-ratio": return row.passingTouchdowns / row.interceptions;
    default: return null;
  }
}

function rbValue(row: FootballNflRbCareerRow, metricId: FootballFindLeaderMetricId): number | null {
  const scrimmageYards = row.rushingYards + row.receivingYards;
  switch (metricId) {
    case "rb-games": return row.games;
    case "rb-rushing-attempts": return row.rushingAttempts;
    case "rb-rushing-yards": return row.rushingYards;
    case "rb-rushing-touchdowns": return row.rushingTouchdowns;
    case "rb-receptions": return row.receptions;
    case "rb-receiving-yards": return row.receivingYards;
    case "rb-receiving-touchdowns": return row.receivingTouchdowns;
    case "rb-rush-yards-per-attempt": return row.rushingYards / row.rushingAttempts;
    case "rb-rushing-yards-per-game": return row.rushingYards / row.games;
    case "rb-rushing-touchdowns-per-game": return row.rushingTouchdowns / row.games;
    case "rb-receptions-per-game": return row.receptions / row.games;
    case "rb-receiving-yards-per-game": return row.receivingYards / row.games;
    case "rb-scrimmage-yards": return scrimmageYards;
    case "rb-scrimmage-yards-per-game": return scrimmageYards / row.games;
    case "rb-scrimmage-touchdowns": return row.rushingTouchdowns + row.receivingTouchdowns;
    default: return null;
  }
}

function cfbValue(row: FootballCfbChampionSeasonRow, metricId: FootballFindLeaderMetricId): number | null {
  switch (metricId) {
    case "cfb-points-for": return row.pointsFor;
    case "cfb-points-against": return row.pointsAgainst;
    case "cfb-points-per-game": return row.pointsPerGame;
    case "cfb-opponent-points-per-game": return row.opponentPointsPerGame;
    case "cfb-point-differential": return row.pointsFor - row.pointsAgainst;
    case "cfb-scoring-margin-per-game": return row.pointsPerGame - row.opponentPointsPerGame;
    case "cfb-points-ratio": return row.pointsFor / row.pointsAgainst;
    case "cfb-differential-rate-pct": return (row.pointsFor - row.pointsAgainst) / row.pointsFor * 100;
    case "cfb-total-points": return row.pointsFor + row.pointsAgainst;
    case "cfb-srs": return row.srs;
    case "cfb-sos": return row.sos;
    default: return null;
  }
}

export function footballFindLeaderLeagueForDomain(domainId: FootballFindLeaderDomainId): FootballFindLeaderLeagueId {
  return domainId === "cfb-champion-season" ? "cfb" : "nfl";
}

export function getFootballFindLeaderFact(subjectId: string, metricId: FootballFindLeaderMetricId) {
  const definition = metricById.get(metricId);
  if (!definition) return null;

  const value = definition.domainId === "nfl-qb-career"
    ? qbById.has(subjectId) ? qbValue(qbById.get(subjectId)!, metricId) : null
    : definition.domainId === "nfl-rb-career"
      ? rbById.has(subjectId) ? rbValue(rbById.get(subjectId)!, metricId) : null
      : cfbById.has(subjectId) ? cfbValue(cfbById.get(subjectId)!, metricId) : null;

  if (value === null || !Number.isFinite(value)) return null;
  const source = definition.domainId === "cfb-champion-season"
    ? footballFindLeaderSources[1]
    : footballFindLeaderSources[0];
  return { definition, value, sources: [source] };
}

export function formatFootballFindLeaderFact(metricId: FootballFindLeaderMetricId, value: number) {
  const definition = metricById.get(metricId);
  if (!definition) throw new Error(`Unknown Football Find the Leader metric: ${metricId}`);
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: definition.decimals,
    maximumFractionDigits: definition.decimals,
  });
  return definition.unit === "percent" ? `${formatted}%` : formatted;
}
