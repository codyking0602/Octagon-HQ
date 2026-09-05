import { describe, expect, it } from "vitest";
import {
  FOOTBALL_BLIND_RANK_ARCHETYPES,
  buildFootballBlindRankBoard,
  footballComparisonTier,
  footballKeepCutBoardIsCompetitive,
  footballKeepCutRequiredDistinctTiers,
  type FootballComparisonTierId,
} from "./footballComparisonGeneration";
import type { FootballRankFiveItem } from "./footballRankFiveModel";

const NON_EXTREME_TIERS: readonly FootballComparisonTierId[] = [
  "great",
  "good",
  "average",
  "below-average",
];

function item(id: string, rating: number): FootballRankFiveItem {
  return {
    id,
    name: id,
    subtitle: id,
    league: "NFL",
    rating,
  };
}

function tierCount(items: readonly FootballRankFiveItem[], tier: FootballComparisonTierId) {
  return items.filter((row) => footballComparisonTier(row) === tier).length;
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
  it("keeps every Blind Rank archetype from collapsing into one middle tier when pool depth supports texture", () => {
    for (const archetype of FOOTBALL_BLIND_RANK_ARCHETYPES) {
      for (let seedIndex = 0; seedIndex < 8; seedIndex += 1) {
        const board = buildFootballBlindRankBoard(
          deepPool,
          "quality-proof",
          `${archetype.id}-${seedIndex}`,
          archetype.id,
        );
        const maxNonExtremeTierCount = Math.max(
          ...NON_EXTREME_TIERS.map((tier) => tierCount(board.items, tier)),
        );
        expect(maxNonExtremeTierCount).toBeLessThanOrEqual(2);
      }
    }
  });

  it("requires four realized tiers from deep Keep/Cut pools and rejects four-player middle-tier clumps", () => {
    expect(footballKeepCutRequiredDistinctTiers(deepPool)).toBe(4);

    const clumped = [
      item("clump-elite", 92),
      item("clump-great", 82),
      item("clump-good", 70),
      item("clump-average-1", 69),
      item("clump-average-2", 68),
      item("clump-average-3", 67),
      item("clump-average-4", 66),
      item("clump-below", 54),
    ];
    expect(footballKeepCutBoardIsCompetitive(clumped, deepPool)).toBe(false);

    const textured = [
      item("texture-elite", 92),
      item("texture-great", 82),
      item("texture-good", 70),
      item("texture-average-1", 69),
      item("texture-average-2", 68),
      item("texture-average-3", 67),
      item("texture-below-1", 54),
      item("texture-below-2", 53),
    ];
    expect(footballKeepCutBoardIsCompetitive(textured, deepPool)).toBe(true);
  });

  it("does not force artificial tier variety when a sparse pool cannot support it", () => {
    const sparsePool = [69, 68, 67, 66, 65, 64, 63, 62]
      .map((rating, index) => item(`sparse-average-${index}`, rating));

    expect(footballKeepCutRequiredDistinctTiers(sparsePool)).toBe(1);
    expect(footballKeepCutBoardIsCompetitive(sparsePool, sparsePool)).toBe(true);
  });
});
