import {
  footballFindLeaderMetricDefinitions as baseFootballFindLeaderMetricDefinitions,
  type FootballFindLeaderDomainId as BaseFootballFindLeaderDomainId,
  type FootballFindLeaderFamilyId as BaseFootballFindLeaderFamilyId,
  type FootballFindLeaderMetricId as BaseFootballFindLeaderMetricId,
  type FootballFindLeaderUnit,
} from "./footballFactualStatsCatalog";

/**
 * Canonical game-facing metric catalog for Football Find the Leader.
 * The factual catalog remains the authority for numbers; this layer owns which factual shapes the game may expose.
 */
export type FootballFindLeaderDomainId =
  | BaseFootballFindLeaderDomainId
  | "nfl-receiving-career"
  | "nfl-defense-career"
  | "cfb-player-rushing";

export type FootballFindLeaderLeagueId = "nfl" | "cfb";

export type FootballFindLeaderFamilyId =
  | BaseFootballFindLeaderFamilyId
  | "nfl-receiving"
  | "nfl-defense"
  | "cfb-rushing";

export type FootballFindLeaderMetricId =
  | BaseFootballFindLeaderMetricId
  | "nfl-receiving-receptions"
  | "nfl-receiving-yards"
  | "nfl-receiving-touchdowns"
  | "nfl-defense-sacks"
  | "nfl-defense-interceptions"
  | "cfb-player-rushing-yards"
  | "cfb-player-rushing-touchdowns";

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

const expandedFootballFindLeaderMetricDefinitions: readonly FootballFindLeaderMetricDefinition[] = [
  metric("nfl-receiving-receptions", "nfl-receiving-career", "nfl-receiving", "career receptions", "RECEPTIONS", "count", 0, "the most career receptions"),
  metric("nfl-receiving-yards", "nfl-receiving-career", "nfl-receiving", "career receiving yards", "REC YARDS", "yards", 0, "the most career receiving yards"),
  metric("nfl-receiving-touchdowns", "nfl-receiving-career", "nfl-receiving", "career receiving touchdowns", "REC TD", "count", 0, "the most career receiving touchdowns"),
  metric("nfl-defense-sacks", "nfl-defense-career", "nfl-defense", "career sacks", "SACKS", "count", 1, "the most career sacks"),
  metric("nfl-defense-interceptions", "nfl-defense-career", "nfl-defense", "career defensive interceptions", "INTERCEPTIONS", "count", 0, "the most career interceptions"),
  metric("cfb-player-rushing-yards", "cfb-player-rushing", "cfb-rushing", "best-season rushing yards", "RUSH YARDS", "yards", 0, "the most rushing yards in a season"),
  metric("cfb-player-rushing-touchdowns", "cfb-player-rushing", "cfb-rushing", "best-season rushing touchdowns", "RUSH TD", "count", 0, "the most rushing touchdowns in a season"),
] as const;

export const footballFindLeaderMetricDefinitions: readonly FootballFindLeaderMetricDefinition[] = [
  ...(baseFootballFindLeaderMetricDefinitions as readonly FootballFindLeaderMetricDefinition[]),
  ...expandedFootballFindLeaderMetricDefinitions,
] as const;

export const FOOTBALL_FIND_LEADER_METRIC_COUNT = footballFindLeaderMetricDefinitions.length;

export function footballFindLeaderLeagueForDomain(domainId: FootballFindLeaderDomainId): FootballFindLeaderLeagueId {
  return domainId.startsWith("cfb-") ? "cfb" : "nfl";
}
