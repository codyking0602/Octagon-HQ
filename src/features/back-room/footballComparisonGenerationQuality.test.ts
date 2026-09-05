import { describe, expect, it } from "vitest";
import {
  buildFootballKeepCutBoard,
  footballKeepCutBoardIsCompetitive,
  footballKeepCutRequiredDistinctTiers,
} from "./footballComparisonGeneration";
import {
  footballGreatnessTierForItem,
  footballGreatnessTierLabel,
} from "./footballGreatnessTier";
import type { FootballRankFiveItem } from "./footballRankFiveModel";

function item(id: string, rating: number): FootballRankFiveItem {
  return {
    id,
    name: id,
    subtitle: id,
    league: "NFL",
    rating,
  };
}

function visibleTierLabel(row: FootballRankFiveItem) {
  return footballGreatnessTierLabel(footballGreatnessTierForItem(row));
}

function lowerVisibleTierClump(items: readonly FootballRankFiveItem[]) {
  const labels = items.map(visibleTierLabel);
  const tierFour = labels.filter((label) => label === "TIER 4").length;
  const tierFive = labels.filter((label) => label === "TIER 5").length;
  return Math.max(tierFour, tierFive);
}

const deepPool: readonly FootballRankFiveItem[] = [
  ...[100, 98, 96, 94, 92, 92].map((rating, index) => item(`quality-elite-${index}`, rating)),
  ...[91, 89, 87, 85, 83, 82].map((rating, index) => item(`quality-great-${index}`, rating)),
  ...[81, 78, 75, 73, 71, 70].map((rating, index) => item(`quality-good-${index}`, rating)),
  ...[69, 66, 63, 60, 57, 55].map((rating, index) => item(`quality-average-${index}`, rating)),
  ...[54, 50, 46, 42, 38, 35].map((rating, index) => item(`quality-below-${index}`, rating)),
  ...[34, 28, 22, 16, 8, 0].map((rating, index) => item(`quality-bad-${index}`, rating)),
];

describe("Football comparison board tier quality", () => {
  it("prefers less-clumped visible Tier 4 / Tier 5 Keep/Cut boards without changing board-style ownership", () => {
    let nonBottomGrindBoards = 0;

    for (let seedIndex = 0; seedIndex < 48; seedIndex += 1) {
      const board = buildFootballKeepCutBoard(deepPool, "quality-proof", `texture-${seedIndex}`);
      if (board.style === "bottom-grind") continue;

      nonBottomGrindBoards += 1;
      expect(lowerVisibleTierClump(board.items)).toBeLessThanOrEqual(4);
    }

    expect(nonBottomGrindBoards).toBeGreaterThan(30);
  });

  it("keeps the existing internal-tier competitiveness floor instead of hard-rejecting playable boards", () => {
    expect(footballKeepCutRequiredDistinctTiers(deepPool)).toBe(3);

    const playable = [
      item("playable-elite", 92),
      item("playable-great", 82),
      item("playable-good", 70),
      item("playable-average-1", 69),
      item("playable-average-2", 68),
      item("playable-average-3", 67),
      item("playable-average-4", 66),
      item("playable-below", 54),
    ];

    expect(footballKeepCutBoardIsCompetitive(playable, deepPool)).toBe(true);
  });

  it("preserves sparse-pool flexibility rather than manufacturing tier diversity", () => {
    const sparsePool = [69, 68, 67, 66, 65, 64, 63, 62]
      .map((rating, index) => item(`sparse-average-${index}`, rating));

    expect(footballKeepCutRequiredDistinctTiers(sparsePool)).toBe(1);
    expect(footballKeepCutBoardIsCompetitive(sparsePool, sparsePool)).toBe(true);
    expect(buildFootballKeepCutBoard(sparsePool, "sparse-proof", "sparse-seed").items).toHaveLength(8);
  });
});
