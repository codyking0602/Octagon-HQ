import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PlaySport } from "./playRegistry";
import { createTodayChallengeRepository } from "./todayChallengeRepository";
import { summarizePlayV2History } from "./playV2Stats";

export function usePlayV2History(sport: PlaySport, profileId: string) {
  const repository = useMemo(() => createTodayChallengeRepository(undefined, sport), [sport]);
  const query = useQuery({
    queryKey: ["play-v2-official-history", sport, profileId],
    queryFn: () => repository!.loadHistory(),
    enabled: Boolean(repository) && Boolean(profileId),
    staleTime: 0,
  });
  const performance = useMemo(
    () => query.data ? summarizePlayV2History(query.data) : null,
    [query.data],
  );
  return {
    performance,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: () => query.refetch(),
  };
}
