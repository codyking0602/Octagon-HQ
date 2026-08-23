import { describe, expect, it, vi } from "vitest";
import { createTodayChallengeRepository } from "./todayChallengeRepository";

const dailyId = "22222222-2222-4222-8222-222222222222";

function projection(overrides: Record<string, unknown> = {}) {
  return {
    available: true,
    sport: "football",
    id: dailyId,
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

const standings = {
  player_count: 1,
  current_user_rank: 1,
  current_user_wins: 1,
  current_week_start: "2026-08-17",
  current_week_end: "2026-08-23",
  entries: [{
    rank: 1,
    profile_id: "33333333-3333-4333-8333-333333333333",
    display_name: "Cody",
    initials: "CK",
    avatar_photo_data: null,
    wins: 1,
    played: 1,
    average_score: 90,
    current_streak: 1,
    best_streak: 1,
    game_averages: {
      find_leader: 90,
      wavelength: null,
      blind_resume: null,
      blind_rank_5: null,
      keep_4_cut_4: null,
      hit_the_number: null,
    },
    is_current_user: true,
    weekly_rank: 1,
    weekly_wins: 1,
    weekly_played: 1,
    weekly_average_score: 90,
    total_wins: 1,
    all_time_played: 1,
    all_time_average_score: 90,
    longest_streak: 1,
    weekly_titles: 0,
  }],
};

describe("Football Today’s Challenge repository", () => {
  it("uses the shared Edge owner while the server owns restored action history", async () => {
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
        daily_challenge_id: dailyId,
        revision: 0,
        action: { eliminated_id: "peyton-manning" },
      },
    });
    expect(next.actionHistory).toEqual([{ eliminated_id: "peyton-manning" }]);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("routes Football history, streak, standings, and leaderboard through the shared sport-aware RPCs", async () => {
    const rpc = vi.fn(async (name: string) => {
      if (name === "list_my_daily_challenge_history") return { data: [{
        day: "2026-08-22",
        schedule_version: "football-daily-v1",
        game_type: "find_leader",
        native_score: 9,
        normalized_score: 90,
        completed_at: "2026-08-22T18:00:00Z",
        public_result: {},
      }], error: null };
      if (name === "get_my_daily_challenge_streak") return { data: { current_streak: 1, best_streak: 1 }, error: null };
      if (name === "get_daily_challenge_standings") return { data: standings, error: null };
      return { data: {
        unlocked: true,
        player_count: 1,
        entries: [{
          rank: 1,
          profile_id: "33333333-3333-4333-8333-333333333333",
          display_name: "Cody",
          initials: "CK",
          avatar_photo_data: null,
          game_type: "find_leader",
          native_score: 9,
          normalized_score: 90,
          completed_at: "2026-08-22T18:00:00Z",
          public_result: {},
          progress_revision: 9,
          public_state: {},
          is_current_user: true,
        }],
      }, error: null };
    });
    const repository = createTodayChallengeRepository({ functions: { invoke: vi.fn() }, rpc } as never, "football")!;

    await expect(repository.loadHistory()).resolves.toHaveLength(1);
    await expect(repository.loadStreak()).resolves.toEqual({ currentStreak: 1, bestStreak: 1 });
    await expect(repository.loadStandings()).resolves.toMatchObject({ playerCount: 1, currentUserRank: 1 });
    await expect(repository.loadDailyLeaderboard("2026-08-22", "football-daily-v1"))
      .resolves.toMatchObject({ unlocked: true, playerCount: 1 });

    expect(rpc).toHaveBeenNthCalledWith(1, "list_my_daily_challenge_history", { p_sport: "football" });
    expect(rpc).toHaveBeenNthCalledWith(2, "get_my_daily_challenge_streak", { p_sport: "football" });
    expect(rpc).toHaveBeenNthCalledWith(3, "get_daily_challenge_standings", { p_sport: "football" });
    expect(rpc).toHaveBeenNthCalledWith(4, "get_daily_challenge_leaderboard", {
      p_day: "2026-08-22",
      p_schedule_version: "football-daily-v1",
      p_sport: "football",
    });
  });
});
