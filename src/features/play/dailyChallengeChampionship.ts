import type {
  TodayChallengeStandings,
  TodayChallengeStandingsEntry,
} from "./todayChallengeRepository";

export interface DailyChallengeChampionshipSnapshot {
  rank: number;
  weeklyTitles: number;
}

export function rankDailyChallengeChampionship(
  entries: readonly TodayChallengeStandingsEntry[],
) {
  const ordered = [...entries].sort((a, b) =>
    b.weeklyTitles - a.weeklyTitles
      || b.wins - a.wins
      || b.averageScore - a.averageScore
      || b.played - a.played
      || a.displayName.localeCompare(b.displayName));

  const ranks = new Map<string, number>();
  let previousTitles: number | null = null;
  let rank = 0;

  ordered.forEach((entry, index) => {
    if (entry.weeklyTitles !== previousTitles) rank = index + 1;
    ranks.set(entry.profileId, rank);
    previousTitles = entry.weeklyTitles;
  });

  return { ordered, ranks };
}

export function currentDailyChallengeChampionship(
  standings: TodayChallengeStandings | null,
): DailyChallengeChampionshipSnapshot | null {
  if (!standings) return null;
  const current = standings.entries.find((entry) => entry.isCurrentUser) ?? null;
  if (!current) return null;

  const { ranks } = rankDailyChallengeChampionship(standings.entries);
  const rank = ranks.get(current.profileId);
  if (!rank) return null;

  return {
    rank,
    weeklyTitles: current.weeklyTitles,
  };
}
