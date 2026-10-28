import { describe, expect, it } from "vitest";
import { buildFootballBlindRankBoard } from "./footballComparisonGeneration";
import {
  footballGreatnessTierForItem,
  footballGreatnessTiersForCategory,
} from "./footballGreatnessTier";
import { getFootballRankFivePack } from "./footballRankFiveModel";

describe("Football compact Blind Rank tier safety", () => {
  it("uses the new Loaded board type without collapsing the board into one tier", () => {
    const pack = getFootballRankFivePack("college-quarterbacks");
    const tierLadder = footballGreatnessTiersForCategory(pack.items);
    expect(tierLadder.length).toBeGreaterThan(1);

    for (let index = 0; index < 64; index += 1) {
      const board = buildFootballBlindRankBoard(
        pack.items,
        pack.id,
        `compact-tier-safety-${index}`,
        "loaded",
      );

      expect(board.boardType).toBe("loaded");
      expect(board.items).toHaveLength(5);
      expect(new Set(board.items.map((item) => item.id)).size).toBe(5);
      expect(new Set(board.items.map(footballGreatnessTierForItem)).size).toBeGreaterThan(1);
    }
  });
});
