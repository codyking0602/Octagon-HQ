import type {
  PickHistory,
  PickSeasonStanding,
  PickSport,
} from "./picksModel";

function aggregateFallbackStandings(history: PickHistory): PickSeasonStanding[] {
  const totals = new Map<string, Omit<PickSeasonStanding, "rank">>();

  history.events.forEach((event) => {
    event.groupResults.forEach((result) => {
      const key = result.profileId ?? `name:${result.displayName.trim().toLowerCase()}`;
      const current = totals.get(key) ?? {
        profileId: result.profileId ?? null,
        displayName: result.displayName,
        isCurrentUser: result.isCurrentUser,
        eventsEntered: 0,
        correct: 0,
        incorrect: 0,
        missing: 0,
        excluded: 0,
        basePoints: 0,
        lockBonus: 0,
        totalPoints: 0,
      };

      totals.set(key, {
        ...current,
        profileId: result.profileId ?? current.profileId,
        displayName: result.displayName,
        isCurrentUser: current.isCurrentUser || result.isCurrentUser,
        eventsEntered: current.eventsEntered + 1,
        correct: current.correct + result.correct,
        incorrect: current.incorrect + result.incorrect,
        missing: current.missing + result.missing,
        excluded: current.excluded + result.excluded,
        basePoints: current.basePoints + result.basePoints,
        lockBonus: current.lockBonus + result.lockBonus,
        totalPoints: current.totalPoints + result.totalPoints,
      });
    });
  });

  const ordered = Array.from(totals.values()).sort((left, right) => (
    right.totalPoints - left.totalPoints
    || left.displayName.localeCompare(right.displayName)
  ));

  let previousPoints: number | null = null;
  let previousRank = 0;
  return ordered.map((standing, index) => {
    const rank = previousPoints === standing.totalPoints ? previousRank : index + 1;
    previousPoints = standing.totalPoints;
    previousRank = rank;
    return { ...standing, rank };
  });
}

function rerankFootballStandings(standings: readonly PickSeasonStanding[]) {
  const ordered = standings.slice().sort((left, right) => (
    right.totalPoints - left.totalPoints
    || left.displayName.localeCompare(right.displayName)
  ));
  let previousPoints: number | null = null;
  let previousRank = 0;

  return ordered.map((standing, index) => {
    const rank = previousPoints === standing.totalPoints ? previousRank : index + 1;
    previousPoints = standing.totalPoints;
    previousRank = rank;
    return { ...standing, rank };
  });
}

export function picksSeasonStandings(
  history: PickHistory | null | undefined,
  sport: PickSport = "mma",
): PickSeasonStanding[] {
  if (!history) return [];
  const canonicalStandings = history.seasonStandings ?? [];
  const source = canonicalStandings.length
    ? canonicalStandings
    : aggregateFallbackStandings(history);

  return sport === "football" ? rerankFootballStandings(source) : source;
}
