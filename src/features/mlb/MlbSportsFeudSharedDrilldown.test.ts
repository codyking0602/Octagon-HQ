import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/features/mlb/MlbPlayoffsPage.tsx", "utf8");

describe("MLB Sports Feud drilldown parity", () => {
  it("uses the canonical Daily Sports Feud result component and shell", () => {
    expect(source).toContain('import { DailyLeaderboardGameResult } from "../play/DailyLeaderboardGameResult"');
    expect(source).toContain("sharedSportsFeudResult");
    expect(source).toContain('className="today-hub-official-result__body official-daily-page"');
    expect(source).toContain("<DailyLeaderboardGameResult");
  });

  it("does not route Sports Feud through the MLB result-card shell", () => {
    const sharedBranchStart = source.indexOf("if (isSportsFeud && sharedSportsFeud)");
    const legacyReturnStart = source.indexOf("className=\"today-hub-official-result mlb-play-result-detail\"");
    expect(sharedBranchStart).toBeGreaterThan(-1);
    expect(legacyReturnStart).toBeGreaterThan(sharedBranchStart);
  });
});
