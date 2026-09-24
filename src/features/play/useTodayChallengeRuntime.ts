import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTodayChallengeRepository,
  TodayChallengeRepositoryError,
  type TodayChallengeProjection,
  type TodayChallengeRepository,
} from "./todayChallengeRepository";
import type { PlaySport } from "./playRegistry";
import {
  todayChallengeLeaderboardQueryKey,
  todayChallengeStandingsQueryKey,
} from "./useTodayChallengeOverview";

export const todayChallengeRuntimeQueryKey = (
  profileId: string,
  sport: PlaySport = "ufc",
) => [
  "today-challenge-runtime",
  sport,
  profileId,
] as const;

export interface TodayChallengeAdvanceOptions {
  /**
   * Collapses repeated UI events for the same logical action while that action is
   * still queued. Callers should scope this to a concrete turn/question/slot.
   */
  dedupeKey?: string;
  /**
   * Optional browser-only transition. It may update presentation/public state,
   * but the hook always preserves the last acknowledged revision and official
   * attempt until the server confirms them.
   */
  optimisticUpdate?: (projection: TodayChallengeProjection) => TodayChallengeProjection;
}

interface QueuedDailyAction {
  id: string;
  action: Record<string, unknown>;
  options: TodayChallengeAdvanceOptions;
  resolve: (projection: TodayChallengeProjection | null) => void;
}

let fallbackActionSequence = 0;

function nextClientActionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  fallbackActionSequence += 1;
  return `daily-${Date.now().toString(36)}-${fallbackActionSequence.toString(36)}`;
}

function retryableDailyError(error: unknown) {
  if (!(error instanceof TodayChallengeRepositoryError)) return true;
  return !error.stale
    && !error.signInRequired
    && error.code !== "INVALID_DAILY_ACTION"
    && error.code !== "OFFICIAL_ATTEMPT_COMPLETE"
    && error.code !== "WEEKLY_AUCTION_REQUIRED";
}

function delay(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function safeOptimisticProjection(
  authoritative: TodayChallengeProjection,
  update: (projection: TodayChallengeProjection) => TodayChallengeProjection,
) {
  const candidate = update(authoritative);
  return {
    ...candidate,
    id: authoritative.id,
    centralDay: authoritative.centralDay,
    scheduleVersion: authoritative.scheduleVersion,
    gameType: authoritative.gameType,
    setupKey: authoritative.setupKey,
    contentVersion: authoritative.contentVersion,
    scoringVersion: authoritative.scoringVersion,
    progressRevision: authoritative.progressRevision,
    officialAttempt: authoritative.officialAttempt,
    revealSetup: authoritative.revealSetup,
    deploymentSha: authoritative.deploymentSha,
  };
}

export function useTodayChallengeRuntime({
  profileId,
  enabled,
  repository: suppliedRepository,
  sport = "ufc",
}: {
  profileId: string;
  enabled: boolean;
  repository?: TodayChallengeRepository | null;
  sport?: PlaySport;
}) {
  const queryClient = useQueryClient();
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

  const authoritativeRef = useRef<TodayChallengeProjection | null>(null);
  const queueRef = useRef<QueuedDailyAction[]>([]);
  const drainingRef = useRef(false);
  const cancelledRef = useRef(false);
  const dedupePromisesRef = useRef(new Map<string, Promise<TodayChallengeProjection | null>>());
  const [queueDepth, setQueueDepth] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<unknown>(null);
  const [optimisticProjection, setOptimisticProjection] = useState<TodayChallengeProjection | null>(null);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (query.data) authoritativeRef.current = query.data;
  }, [query.data]);

  const publishOfficialProjection = useCallback((projection: TodayChallengeProjection) => {
    authoritativeRef.current = projection;
    queryClient.setQueryData(queryKey, projection);
    if (!projection.officialAttempt) return;
    void queryClient.invalidateQueries({
      queryKey: todayChallengeStandingsQueryKey(profileId, sport),
      exact: true,
    });
    void queryClient.invalidateQueries({
      queryKey: todayChallengeLeaderboardQueryKey(
        profileId,
        projection.centralDay,
        projection.scheduleVersion,
        sport,
      ),
      exact: true,
    });
  }, [profileId, queryClient, queryKey, sport]);

  const rebuildOptimisticProjection = useCallback((authoritative: TodayChallengeProjection | null) => {
    if (!authoritative) {
      setOptimisticProjection(null);
      return;
    }
    let projected = authoritative;
    let changed = false;
    for (const item of queueRef.current) {
      if (!item.options.optimisticUpdate) continue;
      projected = safeOptimisticProjection(projected, item.options.optimisticUpdate);
      changed = true;
    }
    setOptimisticProjection(changed ? projected : null);
  }, []);

  const releaseItem = useCallback((item: QueuedDailyAction, value: TodayChallengeProjection | null) => {
    const key = item.options.dedupeKey;
    if (key) dedupePromisesRef.current.delete(key);
    item.resolve(value);
  }, []);

  const discardQueue = useCallback((value: TodayChallengeProjection | null) => {
    const pending = queueRef.current.splice(0);
    for (const item of pending) releaseItem(item, value);
    setQueueDepth(0);
    rebuildOptimisticProjection(authoritativeRef.current);
  }, [rebuildOptimisticProjection, releaseItem]);

  const drainQueueRef = useRef<() => Promise<void>>(async () => {});

  const drainQueue = useCallback(async () => {
    if (drainingRef.current || !repository || !enabled) return;
    drainingRef.current = true;
    setSyncing(true);
    setSyncError(null);
    try {
      while (queueRef.current.length && !cancelledRef.current) {
        const item = queueRef.current[0]!;
        const base = authoritativeRef.current;
        if (!base) break;

        let next: TodayChallengeProjection | null = null;
        let failure: unknown = null;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            next = await repository.advance(base, item.action, item.id);
            failure = null;
            break;
          } catch (error) {
            failure = error;
            if (error instanceof TodayChallengeRepositoryError && error.stale) break;
            if (!retryableDailyError(error) || attempt >= 2) break;
            await delay(attempt === 0 ? 120 : 420);
          }
        }

        if (next) {
          queueRef.current.shift();
          setQueueDepth(queueRef.current.length);
          publishOfficialProjection(next);
          releaseItem(item, next);
          if (next.officialAttempt) {
            discardQueue(null);
            rebuildOptimisticProjection(next);
            break;
          }
          rebuildOptimisticProjection(next);
          continue;
        }

        if (failure instanceof TodayChallengeRepositoryError && failure.stale) {
          try {
            const canonical = await repository.loadToday();
            publishOfficialProjection(canonical);
            discardQueue(canonical);
            setSyncError(null);
          } catch (refreshError) {
            setSyncError(refreshError);
          }
          break;
        }

        setSyncError(failure ?? new Error("Today’s Challenge could not sync this action."));
        break;
      }
    } finally {
      drainingRef.current = false;
      setSyncing(false);
    }
  }, [
    discardQueue,
    enabled,
    publishOfficialProjection,
    rebuildOptimisticProjection,
    releaseItem,
    repository,
  ]);

  drainQueueRef.current = drainQueue;

  const advance = useCallback((
    action: Record<string, unknown>,
    options: TodayChallengeAdvanceOptions = {},
  ): Promise<TodayChallengeProjection | null> => {
    const base = authoritativeRef.current ?? query.data ?? null;
    if (!base) return Promise.reject(new Error("Today’s Challenge is still loading."));
    if (base.officialAttempt) return Promise.resolve(base);

    const key = options.dedupeKey;
    if (key) {
      const existing = dedupePromisesRef.current.get(key);
      if (existing) return existing;
    }

    let resolveAction!: (projection: TodayChallengeProjection | null) => void;
    const promise = new Promise<TodayChallengeProjection | null>((resolve) => {
      resolveAction = resolve;
    });
    const item: QueuedDailyAction = {
      id: nextClientActionId(),
      action,
      options,
      resolve: resolveAction,
    };
    queueRef.current.push(item);
    if (key) dedupePromisesRef.current.set(key, promise);
    setQueueDepth(queueRef.current.length);
    rebuildOptimisticProjection(base);
    void drainQueueRef.current();
    return promise;
  }, [query.data, rebuildOptimisticProjection]);

  return {
    projection: optimisticProjection ?? query.data ?? null,
    authoritativeProjection: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: syncError ?? query.error ?? null,
    busy: queueDepth > 0 || syncing,
    syncing,
    pendingActionCount: queueDepth,
    configured: Boolean(repository),
    advance,
    retryPending: async () => {
      if (!queueRef.current.length) return;
      setSyncError(null);
      await drainQueueRef.current();
    },
    refresh: async () => {
      setSyncError(null);
      discardQueue(null);
      setOptimisticProjection(null);
      const refreshed = await query.refetch();
      if (refreshed.data) authoritativeRef.current = refreshed.data;
    },
  };
}
