import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PropsWithChildren } from "react";
import {
  TodayChallengeRepositoryError,
  type TodayChallengeProjection,
  type TodayChallengeRepository,
} from "./todayChallengeRepository";
import { todayChallengeRuntimeQueryKey, useTodayChallengeRuntime } from "./useTodayChallengeRuntime";

function projection(
  revision: number,
  publicState: Record<string, unknown> = { guesses: revision > 1 ? [50, 60] : [50] },
): TodayChallengeProjection {
  return {
    available: true,
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-08-05",
    scheduleVersion: "find-leader-v1",
    gameType: "wavelength",
    setupKey: "wavelength:test",
    contentVersion: "wavelength-v1",
    scoringVersion: "play-official-score-v1",
    fallbackReason: null,
    publicSetup: {},
    progressRevision: revision,
    publicState,
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test-sha",
  };
}

function completedProjection(revision: number): TodayChallengeProjection {
  return {
    ...projection(revision, { complete: true, guesses: [50, 60] }),
    officialAttempt: {
      nativeScore: 80,
      normalizedScore: 80,
      completedAt: "2026-08-05T18:00:00Z",
      publicResult: { score: 80 },
    },
  };
}

function wrapper(client: QueryClient) {
  return function RuntimeWrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const emptyStandings = {
  playerCount: 0,
  currentUserRank: null,
  currentUserWins: 0,
  currentWeekStart: "2026-08-03",
  currentWeekEnd: "2026-08-09",
  entries: [],
};

function repositoryWith(
  loadToday: TodayChallengeRepository["loadToday"],
  advance: TodayChallengeRepository["advance"],
): TodayChallengeRepository {
  return {
    loadToday,
    advance,
    loadHistory: vi.fn().mockResolvedValue([]),
    loadStreak: vi.fn().mockResolvedValue({ currentStreak: 0, bestStreak: 0 }),
    loadStandings: vi.fn().mockResolvedValue(emptyStandings),
    loadDailyLeaderboard: vi.fn().mockResolvedValue({ unlocked: false, playerCount: 0, entries: [] }),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useTodayChallengeRuntime", () => {
  it("keeps UFC and Football daily runtime caches isolated under the shared owner", () => {
    expect(todayChallengeRuntimeQueryKey("profile-one")).toEqual([
      "today-challenge-runtime",
      "ufc",
      "profile-one",
    ]);
    expect(todayChallengeRuntimeQueryKey("profile-one", "football")).toEqual([
      "today-challenge-runtime",
      "football",
      "profile-one",
    ]);
  });

  it("queues rapid sequential actions and sends them strictly in acknowledged revision order", async () => {
    const first = projection(1);
    const second = projection(2);
    const third = projection(3, { guesses: [50, 60, 70] });
    const firstSave = deferred<TodayChallengeProjection>();
    const advance = vi.fn<TodayChallengeRepository["advance"]>()
      .mockImplementationOnce(() => firstSave.promise)
      .mockResolvedValueOnce(third);
    const repository = repositoryWith(vi.fn().mockResolvedValue(first), advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(1));

    let firstAction!: Promise<TodayChallengeProjection | null>;
    let secondAction!: Promise<TodayChallengeProjection | null>;
    act(() => {
      firstAction = result.current.advance({ guess: 60 });
      secondAction = result.current.advance({ guess: 70 });
    });

    await waitFor(() => expect(advance).toHaveBeenCalledTimes(1));
    expect(result.current.pendingActionCount).toBe(2);
    expect(advance).toHaveBeenNthCalledWith(1, first, { guess: 60 }, expect.any(String));

    await act(async () => {
      firstSave.resolve(second);
      await firstAction;
    });

    await waitFor(() => expect(advance).toHaveBeenCalledTimes(2));
    expect(advance).toHaveBeenNthCalledWith(2, second, { guess: 70 }, expect.any(String));
    await act(async () => {
      await secondAction;
    });

    expect(result.current.projection?.progressRevision).toBe(3);
    expect(result.current.pendingActionCount).toBe(0);
    expect(result.current.busy).toBe(false);
    expect(advance.mock.calls[0]?.[2]).not.toBe(advance.mock.calls[1]?.[2]);
  });

  it("collapses duplicate taps for the same logical pending action", async () => {
    const first = projection(1);
    const second = projection(2);
    const save = deferred<TodayChallengeProjection>();
    const advance = vi.fn<TodayChallengeRepository["advance"]>().mockImplementation(() => save.promise);
    const repository = repositoryWith(vi.fn().mockResolvedValue(first), advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(1));

    let one!: Promise<TodayChallengeProjection | null>;
    let duplicate!: Promise<TodayChallengeProjection | null>;
    act(() => {
      one = result.current.advance({ guess: 60 }, { dedupeKey: "wavelength:guess:2" });
      duplicate = result.current.advance({ guess: 60 }, { dedupeKey: "wavelength:guess:2" });
    });

    expect(duplicate).toBe(one);
    await waitFor(() => expect(advance).toHaveBeenCalledTimes(1));
    expect(result.current.pendingActionCount).toBe(1);

    await act(async () => {
      save.resolve(second);
      await one;
    });
    expect(result.current.pendingActionCount).toBe(0);
  });

  it("refreshes canonical cross-device state and safely discards queued intent after a stale revision", async () => {
    const first = projection(1);
    const canonical = projection(4, { guesses: [50, 55, 58, 61] });
    const loadToday = vi.fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(canonical);
    const advance = vi.fn().mockRejectedValue(new TodayChallengeRepositoryError(
      "STALE_PROGRESS",
      "Official daily progress changed on another device.",
    ));
    const repository = repositoryWith(loadToday, advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(1));

    let firstAction!: Promise<TodayChallengeProjection | null>;
    let queuedAction!: Promise<TodayChallengeProjection | null>;
    act(() => {
      firstAction = result.current.advance({ guess: 60 });
      queuedAction = result.current.advance({ guess: 70 });
    });

    await expect(firstAction).resolves.toMatchObject({ progressRevision: 4 });
    await expect(queuedAction).resolves.toMatchObject({ progressRevision: 4 });
    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(4));
    expect(advance).toHaveBeenCalledTimes(1);
    expect(loadToday).toHaveBeenCalledTimes(2);
    expect(result.current.pendingActionCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it("retries a transient failure with the same idempotency key before advancing the queue", async () => {
    vi.useFakeTimers();
    const first = projection(1);
    const second = projection(2);
    const advance = vi.fn<TodayChallengeRepository["advance"]>()
      .mockRejectedValueOnce(new Error("temporary network failure"))
      .mockResolvedValueOnce(second);
    const repository = repositoryWith(vi.fn().mockResolvedValue(first), advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });
    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(1));

    let pending!: Promise<TodayChallengeProjection | null>;
    act(() => {
      pending = result.current.advance({ guess: 60 });
    });
    await waitFor(() => expect(advance).toHaveBeenCalledTimes(1));
    const firstId = advance.mock.calls[0]?.[2];

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120);
      await pending;
    });

    expect(advance).toHaveBeenCalledTimes(2);
    expect(advance.mock.calls[1]?.[2]).toBe(firstId);
    expect(result.current.projection?.progressRevision).toBe(2);
    expect(result.current.error).toBeNull();
  });

  it("keeps unsynced optimistic state out of the canonical query cache and reconciles a differing server response", async () => {
    const first = projection(1, { guesses: [50] });
    const authoritative = projection(2, { guesses: [50, 60] });
    const save = deferred<TodayChallengeProjection>();
    const advance = vi.fn<TodayChallengeRepository["advance"]>().mockImplementation(() => save.promise);
    const repository = repositoryWith(vi.fn().mockResolvedValue(first), advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(1));
    let pending!: Promise<TodayChallengeProjection | null>;
    act(() => {
      pending = result.current.advance(
        { guess: 999 },
        {
          optimisticUpdate: (current) => ({
            ...current,
            publicState: { guesses: [50, 999] },
            progressRevision: 999,
            officialAttempt: completedProjection(999).officialAttempt,
          }),
        },
      );
    });

    await waitFor(() => expect(result.current.projection?.publicState).toEqual({ guesses: [50, 999] }));
    expect(result.current.projection?.progressRevision).toBe(1);
    expect(result.current.projection?.officialAttempt).toBeNull();
    expect(client.getQueryData<TodayChallengeProjection>(
      todayChallengeRuntimeQueryKey("profile-one"),
    )?.publicState).toEqual({ guesses: [50] });

    await act(async () => {
      save.resolve(authoritative);
      await pending;
    });

    await waitFor(() => expect(result.current.projection?.publicState).toEqual({ guesses: [50, 60] }));
    expect(result.current.projection?.progressRevision).toBe(2);
  });

  it("never persists an unsynced optimistic transition across a reload", async () => {
    const first = projection(1, { guesses: [50] });
    const save = deferred<TodayChallengeProjection>();
    const advance = vi.fn<TodayChallengeRepository["advance"]>().mockImplementation(() => save.promise);
    const loadToday = vi.fn().mockResolvedValue(first);
    const repository = repositoryWith(loadToday, advance);

    const firstClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const mounted = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(firstClient) });
    await waitFor(() => expect(mounted.result.current.projection?.progressRevision).toBe(1));

    act(() => {
      void mounted.result.current.advance(
        { guess: 999 },
        { optimisticUpdate: (current) => ({ ...current, publicState: { guesses: [50, 999] } }) },
      );
    });
    await waitFor(() => expect(mounted.result.current.projection?.publicState).toEqual({ guesses: [50, 999] }));
    mounted.unmount();

    const secondClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const reloaded = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(secondClient) });

    await waitFor(() => expect(reloaded.result.current.projection?.publicState).toEqual({ guesses: [50] }));
    expect(reloaded.result.current.projection?.officialAttempt).toBeNull();

    save.resolve(projection(2));
    reloaded.unmount();
  });

  it("accepts a completed authoritative response exactly once and blocks further official writes", async () => {
    const first = projection(1);
    const complete = completedProjection(2);
    const advance = vi.fn<TodayChallengeRepository["advance"]>().mockResolvedValue(complete);
    const repository = repositoryWith(vi.fn().mockResolvedValue(first), advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(1));
    await act(async () => {
      await result.current.advance({ type: "finish" }, { dedupeKey: "finish" });
    });
    await waitFor(() => expect(result.current.projection?.officialAttempt?.normalizedScore).toBe(80));

    await act(async () => {
      await expect(result.current.advance({ type: "finish" }, { dedupeKey: "finish" }))
        .resolves.toMatchObject({ officialAttempt: { normalizedScore: 80 } });
    });
    expect(advance).toHaveBeenCalledTimes(1);
  });

  it("does not read or mutate official state while disabled", () => {
    const repository = repositoryWith(vi.fn(), vi.fn());
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "signed-out",
      enabled: false,
      repository,
    }), { wrapper: wrapper(client) });

    expect(result.current.projection).toBeNull();
    expect(repository.loadToday).not.toHaveBeenCalled();
    expect(repository.advance).not.toHaveBeenCalled();
  });
});
