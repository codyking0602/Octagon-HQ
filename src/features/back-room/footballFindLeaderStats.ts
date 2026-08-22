import { getFootballFact } from "./footballFactualStatsCore";

export type FootballFindLeaderDomainId = "nfl-qb-career" | "nfl-rb-career" | "cfb-champion-season";

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

export type FootballFindLeaderUnit = "count" | "yards" | "rating" | "percent" | "per-game" | "per-attempt" | "ratio" | "points";

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
): FootballFindLeaderMetricDefinition => ({ id, domainId, family, label, shortLabel, unit, decimals, questionLead });

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

interface QbCareerRow { id: string; games: number; completions: number; attempts: number; passingTouchdowns: number; interceptions: number; passerRating: number; }
interface RbCareerRow { id: string; games: number; rushingAttempts: number; rushingTouchdowns: number; receptions: number; receivingYards: number; receivingTouchdowns: number; }
interface CfbChampionRow { id: string; pointsFor: number; pointsAgainst: number; pointsPerGame: number; opponentPointsPerGame: number; srs: number; sos: number; }

const qbRows: readonly QbCareerRow[] = [
  { id: "drew-brees", games: 287, completions: 7142, attempts: 10551, passingTouchdowns: 571, interceptions: 243, passerRating: 98.7 },
  { id: "peyton-manning", games: 266, completions: 6125, attempts: 9380, passingTouchdowns: 539, interceptions: 251, passerRating: 96.5 },
  { id: "brett-favre", games: 302, completions: 6300, attempts: 10169, passingTouchdowns: 508, interceptions: 336, passerRating: 86.0 },
  { id: "ben-roethlisberger", games: 249, completions: 5440, attempts: 8443, passingTouchdowns: 418, interceptions: 211, passerRating: 93.5 },
  { id: "matt-ryan", games: 234, completions: 5551, attempts: 8464, passingTouchdowns: 381, interceptions: 183, passerRating: 93.6 },
  { id: "dan-marino", games: 242, completions: 4967, attempts: 8358, passingTouchdowns: 420, interceptions: 252, passerRating: 86.4 },
  { id: "eli-manning", games: 236, completions: 4895, attempts: 8119, passingTouchdowns: 366, interceptions: 244, passerRating: 84.1 },
  { id: "john-elway", games: 234, completions: 4123, attempts: 7250, passingTouchdowns: 300, interceptions: 226, passerRating: 79.9 },
  { id: "warren-moon", games: 208, completions: 3988, attempts: 6823, passingTouchdowns: 291, interceptions: 233, passerRating: 80.9 },
  { id: "steve-young", games: 169, completions: 2667, attempts: 4149, passingTouchdowns: 232, interceptions: 107, passerRating: 96.8 },
  { id: "troy-aikman", games: 165, completions: 2898, attempts: 4715, passingTouchdowns: 165, interceptions: 141, passerRating: 81.6 },
  { id: "kurt-warner", games: 124, completions: 2666, attempts: 4070, passingTouchdowns: 208, interceptions: 128, passerRating: 93.7 },
] as const;

const rbRows: readonly RbCareerRow[] = [
  { id: "emmitt-smith", games: 226, rushingAttempts: 4409, rushingTouchdowns: 164, receptions: 515, receivingYards: 3224, receivingTouchdowns: 11 },
  { id: "walter-payton", games: 190, rushingAttempts: 3838, rushingTouchdowns: 110, receptions: 492, receivingYards: 4538, receivingTouchdowns: 15 },
  { id: "frank-gore", games: 241, rushingAttempts: 3735, rushingTouchdowns: 81, receptions: 484, receivingYards: 3985, receivingTouchdowns: 18 },
  { id: "barry-sanders", games: 153, rushingAttempts: 3062, rushingTouchdowns: 99, receptions: 352, receivingYards: 2921, receivingTouchdowns: 10 },
  { id: "adrian-peterson", games: 184, rushingAttempts: 3230, rushingTouchdowns: 120, receptions: 305, receivingYards: 2474, receivingTouchdowns: 6 },
  { id: "curtis-martin", games: 168, rushingAttempts: 3518, rushingTouchdowns: 90, receptions: 484, receivingYards: 3329, receivingTouchdowns: 10 },
  { id: "ladainian-tomlinson", games: 170, rushingAttempts: 3174, rushingTouchdowns: 145, receptions: 624, receivingYards: 4772, receivingTouchdowns: 17 },
  { id: "jerome-bettis", games: 192, rushingAttempts: 3479, rushingTouchdowns: 91, receptions: 200, receivingYards: 1449, receivingTouchdowns: 3 },
  { id: "eric-dickerson", games: 146, rushingAttempts: 2996, rushingTouchdowns: 90, receptions: 281, receivingYards: 2137, receivingTouchdowns: 6 },
  { id: "tony-dorsett", games: 173, rushingAttempts: 2936, rushingTouchdowns: 77, receptions: 398, receivingYards: 3554, receivingTouchdowns: 13 },
  { id: "jim-brown", games: 118, rushingAttempts: 2359, rushingTouchdowns: 106, receptions: 262, receivingYards: 2499, receivingTouchdowns: 20 },
  { id: "marshall-faulk", games: 176, rushingAttempts: 2836, rushingTouchdowns: 100, receptions: 767, receivingYards: 6875, receivingTouchdowns: 36 },
] as const;

const cfbRows: readonly CfbChampionRow[] = [
  { id: "1995-nebraska", pointsFor: 576, pointsAgainst: 150, pointsPerGame: 52.4, opponentPointsPerGame: 13.6, srs: 26.86, sos: 3.78 },
  { id: "2001-miami", pointsFor: 475, pointsAgainst: 103, pointsPerGame: 43.2, opponentPointsPerGame: 9.4, srs: 26.17, sos: 5.08 },
  { id: "2005-texas", pointsFor: 652, pointsAgainst: 213, pointsPerGame: 50.2, opponentPointsPerGame: 16.4, srs: 24.98, sos: 4.98 },
  { id: "2008-florida", pointsFor: 611, pointsAgainst: 181, pointsPerGame: 43.6, opponentPointsPerGame: 12.9, srs: 25.37, sos: 5.58 },
  { id: "2010-auburn", pointsFor: 577, pointsAgainst: 337, pointsPerGame: 41.2, opponentPointsPerGame: 24.1, srs: 20.66, sos: 5.95 },
  { id: "2013-florida-state", pointsFor: 723, pointsAgainst: 170, pointsPerGame: 51.6, opponentPointsPerGame: 12.1, srs: 23.36, sos: 1.29 },
  { id: "2014-ohio-state", pointsFor: 672, pointsAgainst: 330, pointsPerGame: 44.8, opponentPointsPerGame: 22.0, srs: 20.43, sos: 5.17 },
  { id: "2018-clemson", pointsFor: 664, pointsAgainst: 197, pointsPerGame: 44.3, opponentPointsPerGame: 13.1, srs: 26.45, sos: 5.19 },
  { id: "2019-lsu", pointsFor: 726, pointsAgainst: 328, pointsPerGame: 48.4, opponentPointsPerGame: 21.9, srs: 25.80, sos: 6.60 },
  { id: "2020-alabama", pointsFor: 630, pointsAgainst: 252, pointsPerGame: 48.5, opponentPointsPerGame: 19.4, srs: 30.26, sos: 9.72 },
  { id: "2022-georgia", pointsFor: 616, pointsAgainst: 214, pointsPerGame: 41.1, opponentPointsPerGame: 14.3, srs: 25.48, sos: 6.28 },
] as const;

const qbById = new Map(qbRows.map((row) => [row.id, row]));
const rbById = new Map(rbRows.map((row) => [row.id, row]));
const cfbById = new Map(cfbRows.map((row) => [row.id, row]));
const metricById = new Map(footballFindLeaderMetricDefinitions.map((row) => [row.id, row]));

export const footballFindLeaderSources = [
  { id: "pfr-career-stat-lines", publisher: "Pro Football Reference", title: "NFL player career stat lines", url: "https://www.pro-football-reference.com/players/", reviewedOn: "2026-08-22" },
  { id: "cfr-champion-season-stat-lines", publisher: "College Football at Sports-Reference", title: "College football champion-season stat lines", url: "https://www.sports-reference.com/cfb/", reviewedOn: "2026-08-22" },
] as const;

function requiredCoreValue(subjectId: string, metricId: "nfl-career-passing-yards" | "nfl-career-passing-touchdowns" | "nfl-career-rushing-yards" | "nfl-career-rushing-touchdowns") {
  return getFootballFact(subjectId, metricId)?.fact.value ?? null;
}

function qbValue(row: QbCareerRow, metricId: FootballFindLeaderMetricId): number | null {
  const yards = requiredCoreValue(row.id, "nfl-career-passing-yards");
  const touchdowns = requiredCoreValue(row.id, "nfl-career-passing-touchdowns") ?? row.passingTouchdowns;
  if (yards === null) return null;
  switch (metricId) {
    case "qb-games": return row.games;
    case "qb-completions": return row.completions;
    case "qb-attempts": return row.attempts;
    case "qb-passing-yards": return yards;
    case "qb-passing-touchdowns": return touchdowns;
    case "qb-interceptions": return row.interceptions;
    case "qb-passer-rating": return row.passerRating;
    case "qb-completion-pct": return row.completions / row.attempts * 100;
    case "qb-yards-per-attempt": return yards / row.attempts;
    case "qb-touchdown-pct": return touchdowns / row.attempts * 100;
    case "qb-passing-yards-per-game": return yards / row.games;
    case "qb-passing-touchdowns-per-game": return touchdowns / row.games;
    case "qb-completions-per-game": return row.completions / row.games;
    case "qb-attempts-per-game": return row.attempts / row.games;
    case "qb-td-int-ratio": return touchdowns / row.interceptions;
    default: return null;
  }
}

function rbValue(row: RbCareerRow, metricId: FootballFindLeaderMetricId): number | null {
  const yards = requiredCoreValue(row.id, "nfl-career-rushing-yards");
  const rushingTouchdowns = requiredCoreValue(row.id, "nfl-career-rushing-touchdowns") ?? row.rushingTouchdowns;
  if (yards === null) return null;
  const scrimmageYards = yards + row.receivingYards;
  switch (metricId) {
    case "rb-games": return row.games;
    case "rb-rushing-attempts": return row.rushingAttempts;
    case "rb-rushing-yards": return yards;
    case "rb-rushing-touchdowns": return rushingTouchdowns;
    case "rb-receptions": return row.receptions;
    case "rb-receiving-yards": return row.receivingYards;
    case "rb-receiving-touchdowns": return row.receivingTouchdowns;
    case "rb-rush-yards-per-attempt": return yards / row.rushingAttempts;
    case "rb-rushing-yards-per-game": return yards / row.games;
    case "rb-rushing-touchdowns-per-game": return rushingTouchdowns / row.games;
    case "rb-receptions-per-game": return row.receptions / row.games;
    case "rb-receiving-yards-per-game": return row.receivingYards / row.games;
    case "rb-scrimmage-yards": return scrimmageYards;
    case "rb-scrimmage-yards-per-game": return scrimmageYards / row.games;
    case "rb-scrimmage-touchdowns": return rushingTouchdowns + row.receivingTouchdowns;
    default: return null;
  }
}

function cfbValue(row: CfbChampionRow, metricId: FootballFindLeaderMetricId): number | null {
  switch (metricId) {
    case "cfb-points-for": return row.pointsFor;
    case "cfb-points-against": return row.pointsAgainst;
    case "cfb-points-per-game": return getFootballFact(row.id, "cfb-team-points-per-game")?.fact.value ?? row.pointsPerGame;
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

export function getFootballFindLeaderFact(subjectId: string, metricId: FootballFindLeaderMetricId) {
  const definition = metricById.get(metricId);
  if (!definition) return null;
  const value = definition.domainId === "nfl-qb-career"
    ? qbById.has(subjectId) ? qbValue(qbById.get(subjectId)!, metricId) : null
    : definition.domainId === "nfl-rb-career"
      ? rbById.has(subjectId) ? rbValue(rbById.get(subjectId)!, metricId) : null
      : cfbById.has(subjectId) ? cfbValue(cfbById.get(subjectId)!, metricId) : null;
  if (value === null || !Number.isFinite(value)) return null;
  const source = definition.domainId === "cfb-champion-season" ? footballFindLeaderSources[1] : footballFindLeaderSources[0];
  return { definition, value, sources: [source] };
}

export function formatFootballFindLeaderFact(metricId: FootballFindLeaderMetricId, value: number) {
  const definition = metricById.get(metricId);
  if (!definition) throw new Error(`Unknown Football Find the Leader metric: ${metricId}`);
  const formatted = value.toLocaleString("en-US", { minimumFractionDigits: definition.decimals, maximumFractionDigits: definition.decimals });
  return definition.unit === "percent" ? `${formatted}%` : formatted;
}
