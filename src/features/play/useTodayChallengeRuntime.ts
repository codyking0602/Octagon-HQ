import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTodayChallengeRepository,
  TodayChallengeRepositoryError,
  type TodayChallengeProjection,
  type TodayChallengeRepository,
} from "./todayChallengeRepository";

export const todayChallengeRuntimeQueryKey = (profileId: string) => [
  "today-challenge-runtime",
  profileId,
] as const;

export function useTodayChallengeRuntime({
  profileId,
  enabled,
  repository: suppliedRepository,
}: {
  profileId: string;
  enabled: boolean;
  repository?: TodayChallengeRepository | null;
}) {
  const queryClient = useQueryClient();
  const repository = useMemo(
    () => suppliedRepository === undefined
      ? createTodayChallengeRepository()
      : suppliedRepository,
    [suppliedRepository],
  );
  const queryKey = todayChallengeRuntimeQueryKey(profileId);
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
    mutationFn: async ({
      projection,
      action,
    }: {
      projection: TodayChallengeProjection;
      action: Record<string, unknown>;
    }) => {
      if (!repository) throw new Error("Today’s Challenge is not connected on this build.");
      return repository.advance(projection, action);
    },
    onSuccess: (projection) => {
      queryClient.setQueryData(queryKey, projection);
    },
    onError: (error) => {
      if (error instanceof TodayChallengeRepositoryError && error.stale) {
        void queryClient.invalidateQueries({ queryKey, exact: true });
      }
    },
  });

  return {
    projection: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: mutation.error ?? query.error ?? null,
    busy: mutation.isPending,
    configured: Boolean(repository),
    advance: async (action: Record<string, unknown>) => {
      if (!query.data) throw new Error("Today’s Challenge is still loading.");
      return mutation.mutateAsync({ projection: query.data, action });
    },
    refresh: async () => {
      await query.refetch();
    },
  };
}
