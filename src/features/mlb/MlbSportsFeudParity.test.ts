import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const playoffsPage = readFileSync("src/features/mlb/MlbPlayoffsPage.tsx", "utf8");
const feudChallenge = readFileSync("src/features/mlb/MlbSportsFeudChallenge.tsx", "utf8");

describe("MLB Sports Feud result parity", () => {
  it("reuses the shared Daily Sports Feud drill-down instead of a separate MLB presentation", () => {
    expect(playoffsPage).toContain('import { DailyLeaderboardGameResult } from "../play/DailyLeaderboardGameResult"');
    expect(playoffsPage).toContain("mlbSportsFeudSharedResult");
    expect(playoffsPage).toContain("<DailyLeaderboardGameResult");
    expect(playoffsPage).toContain("projection={sharedSportsFeud.projection}");
    expect(playoffsPage).toContain("resultDetail={sharedSportsFeud.resultDetail}");
  });

  it("persists raw main-board and Fast Money submissions for future grading audits", () => {
    expect(feudChallenge).toContain("main_board_attempts");
    expect(feudChallenge).toContain("submitted_text");
    expect(feudChallenge).toContain("fastMoneyResults");
    expect(feudChallenge).toContain("public_state");
  });
});
