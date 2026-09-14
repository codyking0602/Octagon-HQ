import generated from "../../../data/generated/football/who-am-i-daily-universes.json";
import {
  createWhoAmIRound,
  type WhoAmIRound,
  type WhoAmIUniverse,
} from "./whoAmIEngine";

type FootballWhoAmIDailyLeague = "NFL" | "CFB";

interface GeneratedFootballWhoAmIDailyUniverses {
  version: string;
  universes: Record<FootballWhoAmIDailyLeague, WhoAmIUniverse>;
}

const dailyUniverses = (generated as GeneratedFootballWhoAmIDailyUniverses).universes;

export function getFootballWhoAmIDailyUniverse(league: FootballWhoAmIDailyLeague) {
  return dailyUniverses[league];
}

export function createFootballWhoAmIDailyRound(
  random: () => number = Math.random,
): WhoAmIRound {
  const league: FootballWhoAmIDailyLeague = random() < 0.5 ? "NFL" : "CFB";
  return createWhoAmIRound(getFootballWhoAmIDailyUniverse(league), random);
}
