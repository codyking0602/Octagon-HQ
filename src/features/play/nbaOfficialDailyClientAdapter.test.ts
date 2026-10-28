import { describe, expect, it, vi } from "vitest";
import { createTodayChallengeRepository, parseNbaTodayChallengeProjection } from "./todayChallengeRepository";
import { todayChallengeAdapter } from "./todaysChallengeAdapters";
import resultHubSource from "./TodayChallengeHub.tsx?raw";
import { nbaHigherLowerOfficialResultRows } from "../nba/NbaHigherLowerLeaderboardResult";

const challengeId = "11111111-1111-4111-8111-111111111111";
const profileId = "22222222-2222-4222-8222-222222222222";
const official = (revision: number) => ({
  available: true,
  sport: "nba",
  id: challengeId,
  central_day: "2026-11-17",
  schedule_version: "nba-daily-regular-v1",
  game_type: "higher_lower",
  setup_key: "nba-higher-lower-official-v1",
  content_version: "nba-higher-lower-official-v1",
  scoring_version: "official-score-v1",
  fallback_reason: null,
  public_setup: { league: "NBA", question_count: 10 },
  progress_revision: revision,
  public_state: { index: revision, complete: false },
  reveal_setup: null,
  official_attempt: null,
  deployment_sha: "verified-head",
  action_history: [],
});

describe("NBA official Daily client transport and answer-safe scoreboard", () => {
  it("accepts NBA server identity and uses the existing progress queue without local grading", async () => {
    const invoke = vi.fn()
      .mockResolvedValueOnce({ data: official(0), error: null })
      .mockResolvedValueOnce({ data: official(1), error: null });
    const rpc = vi.fn();
    const repo = createTodayChallengeRepository({ functions: { invoke }, rpc } as never, "nba")!;
    const today = await repo.loadToday();
    expect(today).toMatchObject({
      sport: "nba", gameType: "higher_lower",
      scheduleVersion: "nba-daily-regular-v1", progressRevision: 0,
    });
    const advanced = await repo.advance(today, { choice: "higher" }, "nba-client-action-1");
    expect(advanced.progressRevision).toBe(1);
    expect(invoke).toHaveBeenNthCalledWith(2, "daily-challenge-runtime", {
      body: {
        mode: "advance", sport: "nba", daily_challenge_id: challengeId,
        revision: 0, action: { choice: "higher" },
        client_action_id: "nba-client-action-1",
      },
    });
    expect(rpc).not.toHaveBeenCalled();
    expect(todayChallengeAdapter("higher_lower")?.dailyRoute).toBe("/nba/today");
  });

  it("parses only publicly authorized NBA evidence, not server grading secrets", () => {
    const parsed = parseNbaTodayChallengeProjection({
      ...official(0), private_setup_evidence: { hidden_value: 100 },
      private_grading_evidence: { correct_choices: ["higher"] },
    });
    expect(parsed).not.toHaveProperty("privateSetupEvidence");
    expect(parsed).not.toHaveProperty("privateGradingEvidence");
  });

  it("gets an NBA leaderboard only through the completed-viewer-gated RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        unlocked: true, player_count: 1,
        entries: [{
          rank: 1, profile_id: profileId, display_name: "NBA FAN", initials: "NF",
          avatar_photo_data: null, game_type: "higher_lower",
          native_score: 8, normalized_score: 80,
          completed_at: "2026-11-17T15:00:00Z",
          public_result: { correct_count: 8 },
          progress_revision: 10, public_state: { complete: true },
          result_detail: { answers: [], reveal_questions: [] },
          is_current_user: false,
        }],
      }, error: null,
    });
    const repo = createTodayChallengeRepository({
      functions: { invoke: vi.fn() }, rpc,
    } as never, "nba")!;
    const leaderboard = await repo.loadDailyLeaderboard("2026-11-17", "nba-daily-regular-v1");
    expect(rpc).toHaveBeenCalledWith("get_daily_challenge_leaderboard", {
      p_day: "2026-11-17", p_schedule_version: "nba-daily-regular-v1", p_sport: "nba",
    });
    expect(leaderboard.entries[0]?.gameType).toBe("higher_lower");
    expect(leaderboard.entries[0]?.resultDetail).toEqual({ answers: [], reveal_questions: [] });
    expect(nbaHigherLowerOfficialResultRows({
      unlocked: false, normalizedScore: 80, answers: [], revealQuestions: [],
    })).toEqual([]);
  });

  it("routes NBA two-game and Higher or Lower drilldowns without reusing UFC results", () => {
    expect(resultHubSource).toContain("sport={sport}");
    expect(resultHubSource).toContain('sport === "nba" && entry.gameType === "higher_lower"');
    expect(resultHubSource).toContain("NbaHigherLowerLeaderboardResult");
    expect(resultHubSource).toContain('sport === "nba" ? "/nba/today"');
  });
});
