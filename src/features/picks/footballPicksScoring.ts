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
