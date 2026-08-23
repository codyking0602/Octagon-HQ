import { describe, expect, it, vi } from "vitest";
import {
  createTodayChallengeRepository,
  TodayChallengeRepositoryError,
} from "./todayChallengeRepository";

function projection(overrides: Record<string, unknown> = {}) {
  return {
    available: true,
    sport: "football",
    id: "football:football-daily-v1:2026-08-22:find_leader",
    central_day: "2026-08-22",
    schedule_version: "football-daily-v1",
    game_type: "find_leader",
    setup_key: "football-find-leader:test",
    content_version: "football-find-leader-v1",
    scoring_version: "play-official-score-v1",
    fallback_reason: null,
    public_setup: { question: "Who leads?" },
    progress_revision: 0,
    public_state: { complete: false, eliminated_ids: [] },
    reveal_setup: null,
    official_attempt: null,
    action_history: [],
    deployment_sha: "abc123",
    ...overrides,
  };
}

describe("Football Today’s Challenge repository", () => {
  it("uses the shared Edge owner and replays only the server-issued action history", async () => {
    const invoke = vi.fn()
      .mockResolvedValueOnce({ data: projection(), error: null })
      .mockResolvedValueOnce({
        data: projection({
          progress_revision: 1,
          action_history: [{ eliminated_id: "peyton-manning" }],
          public_state: { complete: false, eliminated_ids: ["peyton-manning"] },
        }),
        error: null,
      });
    const rpc = vi.fn();
    const repository = createTodayChallengeRepository({ functions: { invoke }, rpc } as never, "football")!;

    const today = await repository.loadToday();
    const next = await repository.advance(today, { eliminated_id: "peyton-manning" });

    expect(invoke).toHaveBeenNthCalledWith(1, "daily-challenge-runtime", {
      body: { mode: "get-today", sport: "football" },
    });
    expect(invoke).toHaveBeenNthCalledWith(2, "daily-challenge-runtime", {
      body: {
        mode: "advance",
        sport: "football",
        daily_challenge_id: today.id,
        revision: 0,
        action_history: [],
        action: { eliminated_id: "peyton-manning" },
      },
    });
    expect(next.actionHistory).toEqual([{ eliminated_id: "peyton-manning" }]);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not route Football history or standings into UFC persistence RPCs", async () => {
    const repository = createTodayChallengeRepository({
      functions: { invoke: vi.fn() },
      rpc: vi.fn(),
    } as never, "football")!;

    await expect(repository.loadHistory()).rejects.toBeInstanceOf(TodayChallengeRepositoryError);
    await expect(repository.loadStandings()).rejects.toMatchObject({ code: "FOOTBALL_DAILY_RECORDS_DEFERRED" });
  });
});
