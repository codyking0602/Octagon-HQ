import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { PropsWithChildren } from "react";
import {
  TodayChallengeRepositoryError,
  type TodayChallengeProjection,
  type TodayChallengeRepository,
} from "./todayChallengeRepository";
import { todayChallengeRuntimeQueryKey, useTodayChallengeRuntime } from "./useTodayChallengeRuntime";

function projection(
  revision: number,
  guesses: number[] = revision > 1 ? [50, 60] : [50],
): TodayChallengeProjection {
  return {
    available: true,
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-09-23",
    scheduleVersion: "responsive-test-v1",
    gameType: "wavelength",
    setupKey: "wavelength:test",
    contentVersion: "wavelength-v1",
    scoringVersion: "play-official-score-v1",
    fallbackReason: null,
    publicSetup: {},
    progressRevision: revision,
    publicState: { guesses },
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test-sha",
  };
}

function completedProjection(revision: number): TodayChallengeProjection {
  return {
    ...projection(revision, [50, 60]),
    officialAttempt: {
      nativeScore: 88,
      normalizedScore: 88,
      completedAt: "2026-09-23T20:00:00Z",
      publicResult: { score: 88 },
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
  let reject!: (reason?: unknown) => void;
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
  currentWeekStart: "2026-09-21",
  currentWeekEnd: "2026-09-27",
  entries: [],
};

function makeRepository(
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

function optimisticGuess(value: number) {
  return (current: TodayChallengeProjection): TodayChallengeProjection => ({
    ...current,
    publicState: {
      guesses: [
        ...((current.publicState.guesses as number[] | undefined) ?? []),
        value,
      ],
    },
  });
}

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

  it("queues rapid optimistic actions and sends them strictly in authoritative revision order", async () => {
    const firstSave = deferred<TodayChallengeProjection>();
    const secondSave = deferred<TodayChallengeProjection>();
    const advance = vi.fn<TodayChallengeRepository["advance"]>()
      .mockImplementationOnce(() => firstSave.promise)
      .mockImplementationOnce(() => secondSave.promise);
    const repository = makeRepository(vi.fn().mockResolvedValue(projection(1)), advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(1));

    let first!: Promise<TodayChallengeProjection | null>;
    let second!: Promise<TodayChallengeProjection | null>;
    act(() => {
      first = result.current.advance(
        { guess: 60 },
        { dedupeKey: "round-1", optimisticUpdate: optimisticGuess(60) },
      );
      second = result.current.advance(
        { guess: 70 },
        { dedupeKey: "round-2", optimisticUpdate: optimisticGuess(70) },
      );
    });

    await waitFor(() => expect(advance).toHaveBeenCalledTimes(1));
    expect(result.current.pendingActionCount).toBe(2);
    expect(result.current.projection?.publicState).toEqual({ guesses: [50, 60, 70] });
    const firstActionId = advance.mock.calls[0]![2];
    expect(firstActionId).toEqual(expect.any(String));

    act(() => firstSave.resolve(projection(2, [50, 60])));
    await expect(first).resolves.toMatchObject({ progressRevision: 2 });
    await waitFor(() => expect(advance).toHaveBeenCalledTimes(2));
    expect(advance.mock.calls[1]![0].progressRevision).toBe(2);
    expect(advance.mock.calls[1]![1]).toEqual({ guess: 70 });
    expect(advance.mock.calls[1]![2]).not.toBe(firstActionId);

    act(() => secondSave.resolve(projection(3, [50, 60, 70])));
    await expect(second).resolves.toMatchObject({ progressRevision: 3 });
    await waitFor(() => expect(result.current.pendingActionCount).toBe(0));
    expect(result.current.projection?.progressRevision).toBe(3);
  });

  it("collapses duplicate taps for the same semantic action", async () => {
    const save = deferred<TodayChallengeProjection>();
    const advance = vi.fn<TodayChallengeRepository["advance"]>().mockImplementation(() => save.promise);
    const repository = makeRepository(vi.fn().mockResolvedValue(projection(1)), advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection).not.toBeNull());
    let first!: Promise<TodayChallengeProjection | null>;
    let duplicate!: Promise<TodayChallengeProjection | null>;
    act(() => {
      first = result.current.advance(
        { guess: 60 },
        { dedupeKey: "same-step", optimisticUpdate: optimisticGuess(60) },
      );
      duplicate = result.current.advance(
        { guess: 60 },
        { dedupeKey: "same-step", optimisticUpdate: optimisticGuess(60) },
      );
    });

    expect(duplicate).toBe(first);
    expect(advance).toHaveBeenCalledTimes(1);
    expect(result.current.pendingActionCount).toBe(1);

    act(() => save.resolve(projection(2, [50, 60])));
    await expect(first).resolves.toMatchObject({ progressRevision: 2 });
    await waitFor(() => expect(result.current.pendingActionCount).toBe(0));
  });

  it("retries transient failures with the exact same client action id", async () => {
    const advance = vi.fn<TodayChallengeRepository["advance"]>()
      .mockRejectedValueOnce(new Error("network reset"))
      .mockResolvedValueOnce(projection(2, [50, 60]));
    const repository = makeRepository(vi.fn().mockResolvedValue(projection(1)), advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection).not.toBeNull());
    await act(async () => {
      await result.current.advance(
        { guess: 60 },
        { dedupeKey: "retry-step", optimisticUpdate: optimisticGuess(60) },
      );
    });

    expect(advance).toHaveBeenCalledTimes(2);
    expect(advance.mock.calls[0]![2]).toBe(advance.mock.calls[1]![2]);
    expect(result.current.projection?.progressRevision).toBe(2);
    expect(result.current.error).toBeNull();
  });

  it("keeps a failed transient action queued for explicit retry", async () => {
    const advance = vi.fn<TodayChallengeRepository["advance"]>()
      .mockRejectedValueOnce(new Error("offline-1"))
      .mockRejectedValueOnce(new Error("offline-2"))
      .mockRejectedValueOnce(new Error("offline-3"))
      .mockResolvedValueOnce(projection(2, [50, 60]));
    const repository = makeRepository(vi.fn().mockResolvedValue(projection(1)), advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection).not.toBeNull());
    act(() => {
      void result.current.advance(
        { guess: 60 },
        { dedupeKey: "offline-step", optimisticUpdate: optimisticGuess(60) },
      );
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error), { timeout: 2500 });
    expect(result.current.pendingActionCount).toBe(1);
    const actionId = advance.mock.calls[0]![2];

    await act(async () => {
      await result.current.retryPending();
    });

    await waitFor(() => expect(result.current.pendingActionCount).toBe(0));
    expect(advance).toHaveBeenCalledTimes(4);
    expect(advance.mock.calls[3]![2]).toBe(actionId);
    expect(result.current.projection?.progressRevision).toBe(2);
  });

  it("refreshes canonical cross-device state after a stale optimistic revision and drops dependent actions", async () => {
    const loadToday = vi.fn()
      .mockResolvedValueOnce(projection(1))
      .mockResolvedValueOnce(projection(5, [50, 55, 65]));
    const advance = vi.fn<TodayChallengeRepository["advance"]>().mockRejectedValue(
      new TodayChallengeRepositoryError(
        "STALE_PROGRESS",
        "Official daily progress changed on another device.",
      ),
    );
    const repository = makeRepository(loadToday, advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(1));
    let first!: Promise<TodayChallengeProjection | null>;
    let second!: Promise<TodayChallengeProjection | null>;
    act(() => {
      first = result.current.advance(
        { guess: 60 },
        { dedupeKey: "stale-1", optimisticUpdate: optimisticGuess(60) },
      );
      second = result.current.advance(
        { guess: 70 },
        { dedupeKey: "stale-2", optimisticUpdate: optimisticGuess(70) },
      );
    });

    await expect(first).resolves.toMatchObject({ progressRevision: 5 });
    await expect(second).resolves.toMatchObject({ progressRevision: 5 });
    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(5));
    expect(loadToday).toHaveBeenCalledTimes(2);
    expect(advance).toHaveBeenCalledTimes(1);
    expect(result.current.pendingActionCount).toBe(0);
    expect(result.current.projection?.publicState).toEqual({ guesses: [50, 55, 65] });
  });

  it("keeps optimistic state out of the canonical cache so a reload cannot fabricate progress", async () => {
    const save = deferred<TodayChallengeProjection>();
    const repository = makeRepository(
      vi.fn().mockResolvedValue(projection(1)),
      vi.fn().mockImplementation(() => save.promise),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const hook = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(hook.result.current.projection).not.toBeNull());
    act(() => {
      void hook.result.current.advance(
        { guess: 99 },
        { dedupeKey: "pending-reload", optimisticUpdate: optimisticGuess(99) },
      );
    });

    expect(hook.result.current.projection?.publicState).toEqual({ guesses: [50, 99] });
    expect(client.getQueryData<TodayChallengeProjection>(
      todayChallengeRuntimeQueryKey("profile-one"),
    )?.publicState).toEqual({ guesses: [50] });

    hook.unmount();
    const secondClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const secondRepository = makeRepository(
      vi.fn().mockResolvedValue(projection(1)),
      vi.fn(),
    );
    const second = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository: secondRepository,
    }), { wrapper: wrapper(secondClient) });

    await waitFor(() => expect(second.result.current.projection?.publicState).toEqual({ guesses: [50] }));
  });

  it("reconciles an authoritative server response that differs from the optimistic state", async () => {
    const repository = makeRepository(
      vi.fn().mockResolvedValue(projection(1)),
      vi.fn().mockResolvedValue(projection(2, [50, 61])),
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection).not.toBeNull());
    await act(async () => {
      await result.current.advance(
        { guess: 60 },
        { dedupeKey: "server-diff", optimisticUpdate: optimisticGuess(60) },
      );
    });

    expect(result.current.projection?.publicState).toEqual({ guesses: [50, 61] });
  });

  it("settles a completed official attempt exactly once and discards actions queued behind it", async () => {
    const save = deferred<TodayChallengeProjection>();
    const advance = vi.fn<TodayChallengeRepository["advance"]>().mockImplementation(() => save.promise);
    const repository = makeRepository(vi.fn().mockResolvedValue(projection(1)), advance);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection).not.toBeNull());
    let first!: Promise<TodayChallengeProjection | null>;
    let second!: Promise<TodayChallengeProjection | null>;
    act(() => {
      first = result.current.advance(
        { guess: 60 },
        { dedupeKey: "final-1", optimisticUpdate: optimisticGuess(60) },
      );
      second = result.current.advance(
        { guess: 70 },
        { dedupeKey: "final-2", optimisticUpdate: optimisticGuess(70) },
      );
    });

    act(() => save.resolve(completedProjection(2)));
    await expect(first).resolves.toMatchObject({ officialAttempt: { normalizedScore: 88 } });
    await expect(second).resolves.toBeNull();
    await waitFor(() => expect(result.current.pendingActionCount).toBe(0));
    expect(advance).toHaveBeenCalledTimes(1);
    expect(result.current.projection?.officialAttempt?.normalizedScore).toBe(88);
  });

  it("does not read or mutate official state while disabled", () => {
    const repository = makeRepository(vi.fn(), vi.fn());
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
