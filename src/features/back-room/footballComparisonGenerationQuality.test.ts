import { describe, expect, it } from "vitest";
import {
  FOOTBALL_BLIND_RANK_ARCHETYPES,
  FOOTBALL_KEEP_CUT_BOARD_STYLES,
  buildFootballBlindRankBoard,
  buildFootballKeepCutBoard,
  footballKeepCutBoardIsCompetitive,
  footballKeepCutRequiredDistinctTiers,
} from "./footballComparisonGeneration";
import {
  footballGreatnessTierForItem,
  footballGreatnessTierLabel,
} from "./footballGreatnessTier";
import type { FootballRankFiveItem } from "./footballRankFiveModel";

type RecognizableItem = FootballRankFiveItem & { recognizabilityTier: "A" | "B" | "C" };

function item(id: string, rating: number, recognizabilityTier: "A" | "B" | "C" = "A"): RecognizableItem {
  return {
    id,
    name: id,
    subtitle: id,
    league: "NFL",
    rating,
    recognizabilityTier,
  };
}

function visibleTierLabel(
  row: FootballRankFiveItem,
  categoryItems: readonly FootballRankFiveItem[],
) {
  return footballGreatnessTierLabel(footballGreatnessTierForItem(row), categoryItems);
}

function lowerVisibleTierClump(
  items: readonly FootballRankFiveItem[],
  categoryItems: readonly FootballRankFiveItem[],
) {
  const labels = items.map((row) => visibleTierLabel(row, categoryItems));
  const tierFour = labels.filter((label) => label === "TIER 4").length;
  const tierFive = labels.filter((label) => label === "TIER 5").length;
  return Math.max(tierFour, tierFive);
}

function highlyRecognizable(items: readonly FootballRankFiveItem[]) {
  return items.filter((row) => {
    const tier = (row as RecognizableItem).recognizabilityTier;
    return tier === "A" || tier === "B";
  }).length;
}

const deepPool: readonly RecognizableItem[] = [
  ...[100, 98, 96, 94, 92, 92].map((rating, index) => item(`quality-elite-${index}`, rating, index % 2 ? "B" : "A")),
  ...[91, 89, 87, 85, 83, 82].map((rating, index) => item(`quality-great-${index}`, rating, index % 2 ? "C" : "A")),
  ...[81, 78, 75, 73, 71, 70].map((rating, index) => item(`quality-good-${index}`, rating, index % 2 ? "B" : "C")),
  ...[69, 66, 63, 60, 57, 55].map((rating, index) => item(`quality-average-${index}`, rating, index % 2 ? "C" : "A")),
  ...[54, 50, 46, 42, 38, 35].map((rating, index) => item(`quality-below-${index}`, rating, index % 2 ? "B" : "C")),
  ...[34, 28, 22, 16, 8, 0].map((rating, index) => item(`quality-bad-${index}`, rating, index % 2 ? "C" : "A")),
];

describe("Football comparison board tier quality", () => {
  it("keeps the weighted football-specific archetype tables normalized", () => {
    expect(FOOTBALL_BLIND_RANK_ARCHETYPES.reduce((sum, row) => sum + row.weight, 0)).toBeCloseTo(1, 8);
    expect(FOOTBALL_KEEP_CUT_BOARD_STYLES.reduce((sum, row) => sum + row.weight, 0)).toBeCloseTo(1, 8);
    expect(FOOTBALL_BLIND_RANK_ARCHETYPES.map((row) => row.id)).toEqual([
      "wild-card",
      "loaded",
      "middle-maze",
      "top-bottom",
      "knife-edge",
      "ladder",
    ]);
    expect(FOOTBALL_KEEP_CUT_BOARD_STYLES.map((row) => row.id)).toEqual([
      "wild-card",
      "loaded",
      "middle-maze",
      "top-bottom",
      "knife-edge",
      "ladder",
    ]);
  });

  it("keeps lower-tier clumping controlled across the new Keep/Cut distribution", () => {
    let totalClump = 0;
    let severeClumps = 0;

    for (let seedIndex = 0; seedIndex < 120; seedIndex += 1) {
      const board = buildFootballKeepCutBoard(deepPool, "quality-proof", `texture-${seedIndex}`);
      const clump = lowerVisibleTierClump(board.items, deepPool);
      totalClump += clump;
      severeClumps += Number(clump >= 6);
    }

    expect(totalClump / 120).toBeLessThan(4.5);
    expect(severeClumps / 120).toBeLessThan(0.25);
  });

  it("requires recognizable anchors whenever the category has healthy depth", () => {
    for (let seedIndex = 0; seedIndex < 96; seedIndex += 1) {
      const blind = buildFootballBlindRankBoard(deepPool, "recognition-proof", `blind-${seedIndex}`);
      const keepCut = buildFootballKeepCutBoard(deepPool, "recognition-proof", `keep-${seedIndex}`);
      expect(highlyRecognizable(blind.items)).toBeGreaterThanOrEqual(2);
      expect(highlyRecognizable(keepCut.items)).toBeGreaterThanOrEqual(3);
    }
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
      .map((rating, index) => item(`sparse-average-${index}`, rating, "C"));

    expect(footballKeepCutRequiredDistinctTiers(sparsePool)).toBe(1);
    expect(footballKeepCutBoardIsCompetitive(sparsePool, sparsePool)).toBe(true);
    expect(buildFootballKeepCutBoard(sparsePool, "sparse-proof", "sparse-seed").items).toHaveLength(8);
  });
});