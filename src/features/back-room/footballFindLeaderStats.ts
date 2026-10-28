import {
  footballFindLeaderMetricDefinitions as baseFootballFindLeaderMetricDefinitions,
  type FootballFindLeaderDomainId as BaseFootballFindLeaderDomainId,
  type FootballFindLeaderFamilyId as BaseFootballFindLeaderFamilyId,
  type FootballFindLeaderMetricId as BaseFootballFindLeaderMetricId,
  type FootballFindLeaderUnit,
} from "./footballFactualStatsCatalog";

export { footballFindLeaderSubjects } from "./footballFactualStatsCatalog";

/**
 * Canonical game-facing metric catalog for Football Find the Leader.
 * The factual catalog remains the authority for numbers; this layer owns which factual shapes the game may expose.
 */
export type FootballFindLeaderDomainId =
  | BaseFootballFindLeaderDomainId
  | "nfl-receiving-career"
  | "nfl-defense-career"
  | "cfb-player-rushing"
  | "cfb-player-receiving"
  | "cfb-coach-career";

export type FootballFindLeaderLeagueId = "nfl" | "cfb";
export type FootballFindLeaderDirection = "higher" | "lower";

export type FootballFindLeaderFamilyId =
  | BaseFootballFindLeaderFamilyId
  | "nfl-receiving"
  | "nfl-defense"
  | "cfb-rushing"
  | "cfb-receiving"
  | "cfb-coaching";

export type FootballFindLeaderMetricId =
  | BaseFootballFindLeaderMetricId
  | "nfl-receiving-receptions"
  | "nfl-receiving-yards"
  | "nfl-receiving-touchdowns"
  | "nfl-defense-sacks"
  | "nfl-defense-interceptions"
  | "cfb-player-rushing-yards"
  | "cfb-player-rushing-touchdowns"
  | "cfb-player-receptions"
  | "cfb-player-receiving-yards"
  | "cfb-player-receiving-touchdowns"
  | "cfb-coach-career-wins"
  | "cfb-team-season-losses";

export type { FootballFindLeaderUnit };

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

const lowerIsBetterQuestionLead: Readonly<Partial<Record<FootballFindLeaderMetricId, string>>> = {
  "qb-season-interceptions": "the fewest interceptions thrown in the season",
  "nfl-team-losses": "the fewest overall losses",
  "cfb-points-against": "the fewest points allowed",
  "cfb-opponent-points-per-game": "the fewest opponent points per game",
  "cfb-team-season-losses": "the fewest losses in the season",
};

export function footballFindLeaderMetricDirection(metricId: FootballFindLeaderMetricId): FootballFindLeaderDirection {
  return lowerIsBetterQuestionLead[metricId] ? "lower" : "higher";
}

export function footballFindLeaderQuestionLead(definition: FootballFindLeaderMetricDefinition) {
  return lowerIsBetterQuestionLead[definition.id] ?? definition.questionLead;
}

const expandedFootballFindLeaderMetricDefinitions: readonly FootballFindLeaderMetricDefinition[] = [
  metric("nfl-receiving-receptions", "nfl-receiving-career", "nfl-receiving", "career receptions", "RECEPTIONS", "count", 0, "the most career receptions"),
  metric("nfl-receiving-yards", "nfl-receiving-career", "nfl-receiving", "career receiving yards", "REC YARDS", "yards", 0, "the most career receiving yards"),
  metric("nfl-receiving-touchdowns", "nfl-receiving-career", "nfl-receiving", "career receiving touchdowns", "REC TD", "count", 0, "the most career receiving touchdowns"),
  metric("nfl-defense-sacks", "nfl-defense-career", "nfl-defense", "career sacks", "SACKS", "count", 1, "the most career sacks"),
  metric("nfl-defense-interceptions", "nfl-defense-career", "nfl-defense", "career defensive interceptions", "INTERCEPTIONS", "count", 0, "the most career interceptions"),
  metric("cfb-player-rushing-yards", "cfb-player-rushing", "cfb-rushing", "best-season rushing yards", "RUSH YARDS", "yards", 0, "the most rushing yards in a season"),
  metric("cfb-player-rushing-touchdowns", "cfb-player-rushing", "cfb-rushing", "best-season rushing touchdowns", "RUSH TD", "count", 0, "the most rushing touchdowns in a season"),
  metric("cfb-player-receptions", "cfb-player-receiving", "cfb-receiving", "best-season receptions", "RECEPTIONS", "count", 0, "the most receptions in a season"),
  metric("cfb-player-receiving-yards", "cfb-player-receiving", "cfb-receiving", "best-season receiving yards", "REC YARDS", "yards", 0, "the most receiving yards in a season"),
  metric("cfb-player-receiving-touchdowns", "cfb-player-receiving", "cfb-receiving", "best-season receiving touchdowns", "REC TD", "count", 0, "the most receiving touchdowns in a season"),
  metric("cfb-coach-career-wins", "cfb-coach-career", "cfb-coaching", "career wins", "WINS", "count", 0, "the most career wins"),
  metric("cfb-team-season-losses", "cfb-team-season", "cfb-team-season", "season losses", "LOSSES", "count", 0, "the most losses in the season"),
] as const;

/**
 * Numerical quality is necessary but not sufficient. These shapes are factual yet too database-like,
 * negatively framed, or redundant to earn a live Find the Leader slot.
 */
const editoriallyMutedMetricIds = new Set<FootballFindLeaderMetricId>([
  "qb-interceptions",
  "qb-completions-per-game",
  "qb-attempts-per-game",
  "rb-rushing-touchdowns-per-game",
  "rb-receptions-per-game",
  "rb-receiving-yards-per-game",
  "rb-scrimmage-yards-per-game",
  "cfb-differential-rate-pct",
  "cfb-points-ratio",
  "cfb-total-points",
]);

export function footballFindLeaderMetricEditoriallyEligible(metricId: FootballFindLeaderMetricId) {
  return !editoriallyMutedMetricIds.has(metricId);
}

export const footballFindLeaderMetricDefinitions: readonly FootballFindLeaderMetricDefinition[] = [
  ...baseFootballFindLeaderMetricDefinitions,
  ...expandedFootballFindLeaderMetricDefinitions,
] as const;

export const FOOTBALL_FIND_LEADER_METRIC_COUNT = footballFindLeaderMetricDefinitions.length;

export function footballFindLeaderLeagueForDomain(domainId: FootballFindLeaderDomainId): FootballFindLeaderLeagueId {
  return domainId.startsWith("cfb-") ? "cfb" : "nfl";
}
