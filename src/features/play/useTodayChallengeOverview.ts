import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createTodayChallengeRepository,
  type TodayChallengeProjection,
  type TodayChallengeRepository,
} from "./todayChallengeRepository";

export const todayChallengeHistoryQueryKey = (profileId: string) => [
  "today-challenge-history",
  profileId,
] as const;

export const todayChallengeStreakQueryKey = (profileId: string) => [
  "today-challenge-streak",
  profileId,
] as const;

export const todayChallengeLeaderboardQueryKey = (
  profileId: string,
  day: string,
  scheduleVersion: string,
) => [
  "today-challenge-leaderboard",
  profileId,
  day,
  scheduleVersion,
] as const;

export function useTodayChallengeOverview({
  profileId,
  enabled,
  projection,
  repository: suppliedRepository,
}: {
  profileId: string;
  enabled: boolean;
  projection: TodayChallengeProjection | null;
  repository?: TodayChallengeRepository | null;
}) {
  const repository = useMemo(
    () => suppliedRepository === undefined
      ? createTodayChallengeRepository()
      : suppliedRepository,
    [suppliedRepository],
  );
  const ready = enabled && Boolean(profileId) && Boolean(repository);
  const history = useQuery({
    queryKey: todayChallengeHistoryQueryKey(profileId),
    queryFn: () => repository!.loadHistory(),
    enabled: ready,
  });
  const streak = useQuery({
    queryKey: todayChallengeStreakQueryKey(profileId),
    queryFn: () => repository!.loadStreak(),
    enabled: ready,
  });
  const leaderboard = useQuery({
    queryKey: todayChallengeLeaderboardQueryKey(
      profileId,
      projection?.centralDay ?? "unavailable",
      projection?.scheduleVersion ?? "unavailable",
    ),
    queryFn: () => repository!.loadDailyLeaderboard(
      projection!.centralDay,
      projection!.scheduleVersion,
    ),
    enabled: ready && Boolean(projection),
  });

  return {
    configured: Boolean(repository),
    history: history.data ?? [],
    streak: streak.data ?? { currentStreak: 0, bestStreak: 0 },
    leaderboard: leaderboard.data ?? null,
    loading: history.isLoading || streak.isLoading || leaderboard.isLoading,
    error: history.error ?? streak.error ?? leaderboard.error ?? null,
    refresh: async () => {
      await Promise.all([
        history.refetch(),
        streak.refetch(),
        projection ? leaderboard.refetch() : Promise.resolve(),
      ]);
    },
  };
}
