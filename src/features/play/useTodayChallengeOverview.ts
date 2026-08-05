import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createTodayChallengeRepository,
  type TodayChallengeProjection,
  type TodayChallengeRepository,
} from "./todayChallengeRepository";

export const todayChallengeStandingsQueryKey = (profileId: string) => [
  "daily-challenge-standings",
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
  const standings = useQuery({
    queryKey: todayChallengeStandingsQueryKey(profileId),
    queryFn: () => repository!.loadStandings(),
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
    standings: standings.data ?? null,
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
