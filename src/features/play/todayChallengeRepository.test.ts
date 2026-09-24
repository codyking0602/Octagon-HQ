import { describe, expect, it, vi } from "vitest";
import {
  createTodayChallengeRepository,
  loadHqDailyChallengeStreak,
  parseTodayChallengeProjection,
} from "./todayChallengeRepository";

const dailyId = "11111111-1111-4111-8111-111111111111";

function runtimeProjection(overrides: Record<string, unknown> = {}) {
  return {
    available: true,
    id: dailyId,
    central_day: "2026-08-05",
    schedule_version: "find-leader-v1",
    game_type: "find_leader",
    setup_key: "find-leader:test",
    content_version: "find-leader-v4",
    scoring_version: "play-official-score-v1",
    fallback_reason: null,
    public_setup: { question: "Who has the most wins?" },
    progress_revision: 2,
    public_state: { complete: false, eliminated_ids: ["one"] },
    reveal_setup: null,
    official_attempt: null,
    deployment_sha: "abc123",
    ...overrides,
  };
}

function clientWithResponses(responses: Array<{ data: unknown; error: unknown }>) {
  const invoke = vi.fn();
  for (const response of responses) invoke.mockResolvedValueOnce(response);
  return {
    client: {
      functions: { invoke },
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    },
    invoke,
  };
}

describe("Today’s Challenge runtime repository", () => {
  it("parses only the safe browser-facing runtime projection", () => {
    const parsed = parseTodayChallengeProjection(runtimeProjection({
      private_setup_evidence: { leader_id: "hidden" },
      private_grading_evidence: { ratings: { hidden: 99 } },
    }));

    expect(parsed.gameType).toBe("find_leader");
    expect(parsed.progressRevision).toBe(2);
    expect(parsed.publicState).toEqual({ complete: false, eliminated_ids: ["one"] });
    expect(parsed).not.toHaveProperty("privateSetupEvidence");
    expect(parsed).not.toHaveProperty("privateGradingEvidence");
  });

  it("uses one sport-aware Edge Function owner for reads and optimistic progress writes", async () => {
    const { client, invoke } = clientWithResponses([
      { data: runtimeProjection(), error: null },
      { data: runtimeProjection({ progress_revision: 3, public_state: { eliminated_ids: ["one", "two"] } }), error: null },
    ]);
    const repository = createTodayChallengeRepository(client as never)!;

    const today = await repository.loadToday();
    const advanced = await repository.advance(today, { eliminated_id: "two" });

    expect(invoke).toHaveBeenNthCalledWith(1, "daily-challenge-runtime", {
      body: { mode: "get-today", sport: "ufc" },
    });
    expect(invoke).toHaveBeenNthCalledWith(2, "daily-challenge-runtime", {
      body: {
        mode: "advance",
        sport: "ufc",
        daily_challenge_id: dailyId,
        revision: 2,
        action: { eliminated_id: "two" },
      },
    });
    expect(advanced.progressRevision).toBe(3);
  });

  it("sends exactly one Football backend request per Hit the Number toggle", async () => {
    const football = (revision: number, selectedIds: string[]) => runtimeProjection({
      sport: "football",
      game_type: "hit_the_number",
      setup_key: "football-hit-the-number:test",
      content_version: "football-hit-the-number-daily-v3",
      public_setup: {
        metric_id: "nfl-team-points-per-game",
        pick_count: 5,
        candidates: [],
      },
      progress_revision: revision,
      public_state: { complete: false, selected_ids: selectedIds },
      action_history: selectedIds.map((fighter_id) => ({ fighter_id })),
    });
    const { client, invoke } = clientWithResponses([
      { data: football(3, ["2007-ne"]), error: null },
      { data: football(4, []), error: null },
    ]);
    const repository = createTodayChallengeRepository(client as never, "football")!;

    const first = await repository.advance(
      { id: dailyId, progressRevision: 2, actionHistory: [] },
      { fighter_id: "2007-ne" },
    );
    await repository.advance(first, { fighter_id: "2007-ne" });

    expect(invoke).toHaveBeenCalledTimes(2);
    expect(invoke).toHaveBeenNthCalledWith(1, "daily-challenge-runtime", {
      body: {
        mode: "advance",
        sport: "football",
        daily_challenge_id: dailyId,
        revision: 2,
        action: { fighter_id: "2007-ne" },
      },
    });
    expect(invoke).toHaveBeenNthCalledWith(2, "daily-challenge-runtime", {
      body: {
        mode: "advance",
        sport: "football",
        daily_challenge_id: dailyId,
        revision: 3,
        action: { fighter_id: "2007-ne" },
      },
    });
  });

  it("loads one cross-sport HQ streak through the canonical daily repository client", async () => {
    const { client } = clientWithResponses([]);
    const rpc = vi.fn().mockResolvedValue({
      data: { current_streak: 7, best_streak: 11 },
      error: null,
    });
    client.rpc = rpc;

    await expect(loadHqDailyChallengeStreak(client as never)).resolves.toEqual({
      currentStreak: 7,
      bestStreak: 11,
    });
    expect(rpc).toHaveBeenCalledWith("get_my_hq_daily_challenge_streak", undefined);
  });

  it("surfaces stale cross-device revisions without inventing a fallback write", async () => {
    const response = new Response(JSON.stringify({
      code: "STALE_PROGRESS",
      message: "Official daily progress changed on another device.",
    }), { status: 409, headers: { "Content-Type": "application/json" } });
    const { client } = clientWithResponses([
      { data: null, error: { message: "Edge Function returned a non-2xx status code", context: response } },
    ]);
    const repository = createTodayChallengeRepository(client as never)!;

    await expect(repository.advance({ id: dailyId, progressRevision: 4 }, { guess: 50 }))
      .rejects.toMatchObject({
        code: "STALE_PROGRESS",
        stale: true,
      });
  });
  it("carries sanitized completed-game details through Daily leaderboard entries", async () => {
    const { client } = clientWithResponses([]);
    client.rpc = vi.fn().mockResolvedValue({
      data: {
        unlocked: true,
        player_count: 1,
        entries: [{
          rank: 1,
          profile_id: "22222222-2222-4222-8222-222222222222",
          display_name: "SHANE",
          initials: "S",
          avatar_photo_data: null,
          game_type: "millionaire",
          native_score: 23,
          normalized_score: 23,
          completed_at: "2026-09-24T14:00:00Z",
          public_result: { outcome: "lost" },
          progress_revision: 3,
          public_state: { complete: true },
          result_detail: {
            action_history: [
              { type: "answer", choice_id: "A" },
              { type: "use_lifeline", lifeline: "fifty-fifty" },
              { type: "answer", choice_id: "C" },
            ],
          },
          is_current_user: false,
        }],
      },
      error: null,
    });

    const repository = createTodayChallengeRepository(client as never, "football")!;
    const leaderboard = await repository.loadDailyLeaderboard(
      "2026-09-24",
      "football-daily-v15-weighted-sep24",
    );

    expect(leaderboard.entries[0]?.resultDetail).toEqual({
      action_history: [
        { type: "answer", choice_id: "A" },
        { type: "use_lifeline", lifeline: "fifty-fifty" },
        { type: "answer", choice_id: "C" },
      ],
    });
    expect(client.rpc).toHaveBeenCalledWith("get_daily_challenge_leaderboard", {
      p_day: "2026-09-24",
      p_schedule_version: "football-daily-v15-weighted-sep24",
      p_sport: "football",
    });
  });

});
