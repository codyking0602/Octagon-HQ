import { describe, expect, it } from "vitest";
import { dailyTwoGameLeaderboardPublicState } from "./DailyTwoGameStatus";

describe("two-game Daily leaderboard result state", () => {
  it("flattens the completed active game while preserving the aggregate series", () => {
    const state = dailyTwoGameLeaderboardPublicState(
      {
        format_version: "daily-two-game-average-v1",
        complete: true,
        round_index: 1,
        round_count: 2,
        round_scores: [96, 82],
        score: 89,
        active_round: {
          complete: true,
          guesses: [78, 62, 50, 55],
          reveal: {
            target: 46,
            clues: [
              { id: "one", text: "Ryan Tannehill", category: "SYSTEM QB PERCEPTION", rating: 49 },
            ],
          },
        },
      },
      {
        daily_series: {
          format_version: "daily-two-game-average-v1",
          round_scores: [96, 82],
          average_score: 89,
          rounds: [
            { normalized_score: 96 },
            { normalized_score: 82 },
          ],
        },
      },
    );

    expect(state.guesses).toEqual([78, 62, 50, 55]);
    expect(state.reveal).toEqual(expect.objectContaining({ target: 46 }));
    expect(state.daily_series).toEqual(expect.objectContaining({
      game_index: 1,
      game_number: 2,
      game_count: 2,
      complete: true,
      round_scores: [96, 82],
      average_score: 89,
    }));
  });

  it("leaves ordinary single-game leaderboard state untouched", () => {
    const state = { complete: true, score: 90 };
    expect(dailyTwoGameLeaderboardPublicState(state, {})).toBe(state);
  });
});
