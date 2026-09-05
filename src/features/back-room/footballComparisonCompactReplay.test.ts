import { describe, expect, it } from "vitest";
import {
  buildFootballBlindRankBoard,
  footballComparisonTier,
} from "./footballComparisonGeneration";
import { getFootballRankFivePack } from "./footballRankFiveModel";

describe("Football compact Blind Rank tier safety", () => {
  it("does not leak bad-tier subjects into archetypes without a bad slot", () => {
    const pack = getFootballRankFivePack("college-quarterbacks");

    expect(pack.items.some((item) => footballComparisonTier(item) === "bad")).toBe(true);

    for (let index = 0; index < 64; index += 1) {
      const board = buildFootballBlindRankBoard(
        pack.items,
        pack.id,
        `compact-tier-safety-${index}`,
        "balanced",
      );

      expect(board.badItems).toBe(0);
      expect(board.items.some((item) => footballComparisonTier(item) === "bad")).toBe(false);
    }
  });
});
