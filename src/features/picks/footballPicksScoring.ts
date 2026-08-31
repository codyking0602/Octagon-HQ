export type AtsOutcome = "win" | "loss" | "push" | "unresolved";

export interface FootballGameFact {
  pickedTeam: "home" | "away";
  homeScore: number | null;
  awayScore: number | null;
  frozenSpreadHome: number;
  isFinal: boolean;
  isCancelled?: boolean;
  isLock?: boolean;
}

export interface FootballWeekScore {
  weekId: string;
  points: number;
  wins: number;
  losses: number;
  pushes: number;
}

export const FOOTBALL_FUTURES_RULES = {
  cfb: {
    power4Champions: { selections: 4, pointsEach: 2 },
    playoffTeams: { selections: 12, pointsEach: 1 },
    semifinalists: { selections: 4, pointsEach: 2 },
    heisman: { selections: 1, pointsEach: 3 },
    nationalChampion: { selections: 1, pointsEach: 7 },
  },
  nfl: {
    divisionChampions: { selections: 8, pointsEach: 1 },
    playoffTeams: { selections: 14, pointsEach: 1 },
    conferenceChampionshipTeams: { selections: 4, pointsEach: 2 },
    mvp: { selections: 1, pointsEach: 3 },
    superBowlChampion: { selections: 1, pointsEach: 7 },
  },
} as const;

function futuresRuleMax(rule: { selections: number; pointsEach: number }) {
  return rule.selections * rule.pointsEach;
}

export const FOOTBALL_FUTURES_MAX_POINTS = {
  cfb: Object.values(FOOTBALL_FUTURES_RULES.cfb).reduce((sum, rule) => sum + futuresRuleMax(rule), 0),
  nfl: Object.values(FOOTBALL_FUTURES_RULES.nfl).reduce((sum, rule) => sum + futuresRuleMax(rule), 0),
  total: 0,
} as const satisfies { cfb: number; nfl: number; total: number };

// Keep the overall maximum derived from the canonical category rules rather than a second scoring table.
export const FOOTBALL_FUTURES_TOTAL_POINTS = FOOTBALL_FUTURES_MAX_POINTS.cfb + FOOTBALL_FUTURES_MAX_POINTS.nfl;

export interface FootballFuturesPicks {
  cfbPower4Champions: readonly string[];
  cfbPlayoffTeams: readonly string[];
  cfbSemifinalists: readonly string[];
  cfbHeisman: string;
  cfbNationalChampion: string;
  nflDivisionChampions: readonly string[];
  nflPlayoffTeams: readonly string[];
  nflConferenceChampionshipTeams: readonly string[];
  nflMvp: string;
  nflSuperBowlChampion: string;
}

export interface FootballFuturesResults {
  cfbPower4Champions: readonly string[];
  cfbPlayoffTeams: readonly string[];
  cfbSemifinalists: readonly string[];
  cfbHeisman: string | null;
  cfbNationalChampion: string | null;
  nflDivisionChampions: readonly string[];
  nflPlayoffTeams: readonly string[];
  nflConferenceChampionshipTeams: readonly string[];
  nflMvp: string | null;
  nflSuperBowlChampion: string | null;
}

function countUniqueMatches(picks: readonly string[], results: readonly string[]) {
  const resultSet = new Set(results.filter(Boolean));
  return new Set(picks.filter(Boolean)).size
    ? [...new Set(picks.filter(Boolean))].filter(pick => resultSet.has(pick)).length
    : 0;
}

function scoreSingleFuture(pick: string, result: string | null, points: number) {
  return result && pick === result ? points : 0;
}

export function scoreFootballFutures(picks: FootballFuturesPicks, results: FootballFuturesResults) {
  const cfb = {
    power4Champions: countUniqueMatches(picks.cfbPower4Champions, results.cfbPower4Champions)
      * FOOTBALL_FUTURES_RULES.cfb.power4Champions.pointsEach,
    playoffTeams: countUniqueMatches(picks.cfbPlayoffTeams, results.cfbPlayoffTeams)
      * FOOTBALL_FUTURES_RULES.cfb.playoffTeams.pointsEach,
    semifinalists: countUniqueMatches(picks.cfbSemifinalists, results.cfbSemifinalists)
      * FOOTBALL_FUTURES_RULES.cfb.semifinalists.pointsEach,
    heisman: scoreSingleFuture(picks.cfbHeisman, results.cfbHeisman, FOOTBALL_FUTURES_RULES.cfb.heisman.pointsEach),
    nationalChampion: scoreSingleFuture(
      picks.cfbNationalChampion,
      results.cfbNationalChampion,
      FOOTBALL_FUTURES_RULES.cfb.nationalChampion.pointsEach,
    ),
  };
  const nfl = {
    divisionChampions: countUniqueMatches(picks.nflDivisionChampions, results.nflDivisionChampions)
      * FOOTBALL_FUTURES_RULES.nfl.divisionChampions.pointsEach,
    playoffTeams: countUniqueMatches(picks.nflPlayoffTeams, results.nflPlayoffTeams)
      * FOOTBALL_FUTURES_RULES.nfl.playoffTeams.pointsEach,
    conferenceChampionshipTeams: countUniqueMatches(
      picks.nflConferenceChampionshipTeams,
      results.nflConferenceChampionshipTeams,
    ) * FOOTBALL_FUTURES_RULES.nfl.conferenceChampionshipTeams.pointsEach,
    mvp: scoreSingleFuture(picks.nflMvp, results.nflMvp, FOOTBALL_FUTURES_RULES.nfl.mvp.pointsEach),
    superBowlChampion: scoreSingleFuture(
      picks.nflSuperBowlChampion,
      results.nflSuperBowlChampion,
      FOOTBALL_FUTURES_RULES.nfl.superBowlChampion.pointsEach,
    ),
  };
  const cfbTotal = Object.values(cfb).reduce((sum, points) => sum + points, 0);
  const nflTotal = Object.values(nfl).reduce((sum, points) => sum + points, 0);
  return { cfb: { ...cfb, total: cfbTotal }, nfl: { ...nfl, total: nflTotal }, total: cfbTotal + nflTotal };
}

export function footballLockAllowance(gameCount: number) {
  if (gameCount >= 12) return 3;
  if (gameCount >= 6) return 2;
  if (gameCount >= 2) return 1;
  return 0;
}

/** Grades only immutable publication facts; a market/closing line is deliberately not accepted. */
export function gradeFootballAts(fact: FootballGameFact): { outcome: AtsOutcome; points: number } {
  if (!fact.isFinal || fact.isCancelled || fact.homeScore === null || fact.awayScore === null) {
    return { outcome: "unresolved", points: 0 };
  }
  const homeMarginAts = fact.homeScore - fact.awayScore + fact.frozenSpreadHome;
  const pickedMargin = fact.pickedTeam === "home" ? homeMarginAts : -homeMarginAts;
  if (pickedMargin === 0) return { outcome: "push", points: 0.5 };
  if (pickedMargin < 0) return { outcome: "loss", points: 0 };
  return { outcome: "win", points: fact.isLock ? 3 : 1 };
}

export function footballChampionship(weeks: readonly FootballWeekScore[]) {
  const rawPoints = weeks.reduce((sum, week) => sum + week.points, 0);
  const droppedWeek = weeks.length
    ? weeks.reduce((lowest, week) => week.points < lowest.points ? week : lowest)
    : null;
  const wins = weeks.reduce((sum, week) => sum + week.wins, 0);
  const losses = weeks.reduce((sum, week) => sum + week.losses, 0);
  const pushes = weeks.reduce((sum, week) => sum + week.pushes, 0);
  const decisions = wins + losses;
  return {
    adjustedPoints: rawPoints - (droppedWeek?.points ?? 0), rawPoints, droppedWeekId: droppedWeek?.weekId ?? null,
    wins, losses, pushes, atsPercentage: decisions ? wins / decisions : 0,
  };
}

export function rankFootballChampionship<T extends { adjustedPoints: number }>(rows: readonly T[]) {
  return rows.slice().sort((a, b) => b.adjustedPoints - a.adjustedPoints);
}
