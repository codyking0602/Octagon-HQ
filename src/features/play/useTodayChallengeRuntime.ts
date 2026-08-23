import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlaySport } from "./playRegistry";
import {
  createTodayChallengeRepository,
  TodayChallengeRepositoryError,
  type TodayChallengeProjection,
  type TodayChallengeRepository,
} from "./todayChallengeRepository";
import {
  todayChallengeLeaderboardQueryKey,
  todayChallengeStandingsQueryKey,
} from "./useTodayChallengeOverview";

export const todayChallengeRuntimeQueryKey = (profileId: string, sport: PlaySport = "ufc") => [
  "today-challenge-runtime",
  sport,
  profileId,
] as const;

export function useTodayChallengeRuntime({
  profileId,
  enabled,
  sport = "ufc",
  repository: suppliedRepository,
}: {
  profileId: string;
  enabled: boolean;
  sport?: PlaySport;
  repository?: TodayChallengeRepository | null;
}) {
  const queryClient = useQueryClient();
  const actionLocked = useRef(false);
  const [actionPending, setActionPending] = useState(false);
  const repository = useMemo(
    () => suppliedRepository === undefined
      ? createTodayChallengeRepository(undefined, sport)
      : suppliedRepository,
    [sport, suppliedRepository],
  );
  const queryKey = todayChallengeRuntimeQueryKey(profileId, sport);
  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!repository) throw new Error("Today’s Challenge is not connected on this build.");
      return repository.loadToday();
    },
    enabled: enabled && Boolean(profileId) && Boolean(repository),
    retry: (failureCount, error) => {
      if (error instanceof TodayChallengeRepositoryError && error.signInRequired) return false;
      return failureCount < 1;
    },
  });
  const mutation = useMutation({
    mutationFn: async ({ projection, action }: { projection: TodayChallengeProjection; action: Record<string, unknown> }) => {
      if (!repository) throw new Error("Today’s Challenge is not connected on this build.");
      return repository.advance(projection, action);
    },
    onSuccess: (projection) => {
      queryClient.setQueryData(queryKey, projection);
      if (!projection.officialAttempt || sport !== "ufc") return;
      void queryClient.invalidateQueries({ queryKey: todayChallengeStandingsQueryKey(profileId), exact: true });
      void queryClient.invalidateQueries({
        queryKey: todayChallengeLeaderboardQueryKey(profileId, projection.centralDay, projection.scheduleVersion),
        exact: true,
      });
    },
  });

  return {
    projection: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: mutation.error ?? query.error ?? null,
    busy: actionPending || mutation.isPending,
    configured: Boolean(repository),
    advance: async (action: Record<string, unknown>) => {
      if (!query.data) throw new Error("Today’s Challenge is still loading.");
      if (actionLocked.current) return null;
      actionLocked.current = true;
      setActionPending(true);
      try {
        return await mutation.mutateAsync({ projection: query.data, action });
      } catch (error) {
        if (error instanceof TodayChallengeRepositoryError && error.stale) {
          await queryClient.refetchQueries({ queryKey, exact: true });
          mutation.reset();
          return queryClient.getQueryData<TodayChallengeProjection>(queryKey) ?? null;
        }
        return null;
      } finally {
        actionLocked.current = false;
        setActionPending(false);
      }
    },
    refresh: async () => {
      mutation.reset();
      await query.refetch();
    },
  };
}
