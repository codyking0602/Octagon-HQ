import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { PropsWithChildren } from "react";
import {
  TodayChallengeRepositoryError,
  type TodayChallengeProjection,
  type TodayChallengeRepository,
} from "./todayChallengeRepository";
import { useTodayChallengeRuntime } from "./useTodayChallengeRuntime";

function projection(revision: number): TodayChallengeProjection {
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
    publicState: { guesses: revision > 1 ? [50, 60] : [50] },
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test-sha",
  };
}

function wrapper(client: QueryClient) {
  return function RuntimeWrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useTodayChallengeRuntime", () => {
  it("refreshes canonical cross-device state after a stale optimistic revision", async () => {
    const loadToday = vi.fn()
      .mockResolvedValueOnce(projection(1))
      .mockResolvedValueOnce(projection(2));
    const advance = vi.fn().mockRejectedValue(new TodayChallengeRepositoryError(
      "STALE_PROGRESS",
      "Official daily progress changed on another device.",
    ));
    const repository: TodayChallengeRepository = {
      loadToday,
      advance,
      loadHistory: vi.fn().mockResolvedValue([]),
      loadStreak: vi.fn().mockResolvedValue({ currentStreak: 0, bestStreak: 0 }),
      loadDailyLeaderboard: vi.fn().mockResolvedValue({ unlocked: false, playerCount: 0, entries: [] }),
    };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useTodayChallengeRuntime({
      profileId: "profile-one",
      enabled: true,
      repository,
    }), { wrapper: wrapper(client) });

    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(1));
    await act(async () => {
      await expect(result.current.advance({ guess: 60 })).resolves.toMatchObject({
        progressRevision: 2,
      });
    });

    expect(advance).toHaveBeenCalledWith(projection(1), { guess: 60 });
    expect(loadToday).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current.projection?.progressRevision).toBe(2));
    expect(result.current.error).toBeNull();
  });

  it("does not read or mutate official state while disabled", () => {
    const repository: TodayChallengeRepository = {
      loadToday: vi.fn(),
      advance: vi.fn(),
      loadHistory: vi.fn(),
      loadStreak: vi.fn(),
      loadDailyLeaderboard: vi.fn(),
    };
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
