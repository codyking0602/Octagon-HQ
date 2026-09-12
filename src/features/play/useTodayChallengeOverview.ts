import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PlaySport } from "./playRegistry";
import {
  createTodayChallengeRepository,
  loadHqDailyChallengeStreak,
  type TodayChallengeProjection,
  type TodayChallengeRepository,
} from "./todayChallengeRepository";

export const todayChallengeStandingsQueryKey = (
  profileId: string,
  sport: PlaySport = "ufc",
) => [
  "daily-challenge-standings",
  sport,
  profileId,
] as const;

export const hqDailyChallengeStreakQueryKey = (profileId: string) => [
  "hq-daily-challenge-streak",
  profileId,
] as const;

export const todayChallengeLeaderboardQueryKey = (
  profileId: string,
  day: string,
  scheduleVersion: string,
  sport: PlaySport = "ufc",
) => [
  "today-challenge-leaderboard",
  sport,
  profileId,
  day,
  scheduleVersion,
] as const;

export function useTodayChallengeOverview({
  profileId,
  enabled,
  projection,
  repository: suppliedRepository,
  sport = "ufc",
}: {
  profileId: string;
  enabled: boolean;
  projection: TodayChallengeProjection | null;
  repository?: TodayChallengeRepository | null;
  sport?: PlaySport;
}) {
  const repository = useMemo(
    () => suppliedRepository === undefined
      ? createTodayChallengeRepository(undefined, sport)
      : suppliedRepository,
    [sport, suppliedRepository],
  );
  const ready = enabled && Boolean(profileId) && Boolean(repository);
  const standings = useQuery({
    queryKey: todayChallengeStandingsQueryKey(profileId, sport),
    queryFn: () => repository!.loadStandings(),
    enabled: ready,
  });
  const leaderboard = useQuery({
    queryKey: todayChallengeLeaderboardQueryKey(
      profileId,
      projection?.centralDay ?? "unavailable",
      projection?.scheduleVersion ?? "unavailable",
      sport,
    ),
    queryFn: () => repository!.loadDailyLeaderboard(
      projection!.centralDay,
      projection!.scheduleVersion,
    ),
    enabled: ready && Boolean(projection),
  });
  const currentEntry = standings.data?.entries.find((entry) => entry.isCurrentUser) ?? null;

  return {
    configured: Boolean(repository),
    standings: standings.data ?? null,
    streak: {
      currentStreak: currentEntry?.currentStreak ?? 0,
      bestStreak: currentEntry?.bestStreak ?? 0,
    },
    leaderboard: leaderboard.data ?? null,
    standingsLoading: standings.isLoading,
    leaderboardLoading: leaderboard.isLoading,
    loading: standings.isLoading || leaderboard.isLoading,
    error: standings.error ?? leaderboard.error ?? null,
    refresh: async () => {
      await Promise.all([
        standings.refetch(),
        projection ? leaderboard.refetch() : Promise.resolve(),
      ]);
    },
  };
}

export function useHqDailyChallengeStreak({
  profileId,
  enabled,
}: {
  profileId: string;
  enabled: boolean;
}) {
  const query = useQuery({
    queryKey: hqDailyChallengeStreakQueryKey(profileId),
    queryFn: async () => {
      const streak = await loadHqDailyChallengeStreak();
      if (!streak) throw new Error("Octagon HQ could not load the HQ Daily Streak.");
      return streak;
    },
    enabled: enabled && Boolean(profileId),
  });

  return {
    streak: query.data ?? { currentStreak: 0, bestStreak: 0 },
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}
