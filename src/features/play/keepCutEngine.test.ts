import { describe, expect, it } from "vitest";
import {
  KEEP_CUT_BOARD_STYLES,
  KEEP_CUT_PACKS,
  createKeepCutLineup,
  keepCutBoardIsCompetitive,
  keepCutBoardStyleForSeed,
  keepCutPool,
  keepCutRating,
  keepCutScoreLabel,
  keepCutTier,
  resolveKeepCutChallenge,
  scoreKeepCutSelection,
} from "./keepCutEngine";
import { rankedPlayFighters, type PlayFighter } from "./playFighterPool";

function strongestBoardFirst(packId: (typeof KEEP_CUT_PACKS)[number]["id"], fighters: readonly PlayFighter[]) {
  return [...fighters].sort((left, right) => {
    const ratingDifference = keepCutRating(packId, right) - keepCutRating(packId, left);
    return ratingDifference || left.id.localeCompare(right.id);
  });
}

describe("Keep 4, Cut 4 engine", () => {
  it("owns the exact Keep/Cut board-style weights instead of Blind Rank archetypes", () => {
    expect(KEEP_CUT_BOARD_STYLES.map(({ id, name, weight }) => ({ id, name, weight }))).toEqual([
      { id: "knife-edge", name: "Knife Edge", weight: 0.4 },
      { id: "messy-middle", name: "Messy Middle", weight: 0.3 },
      { id: "one-superstar", name: "One Superstar", weight: 0.15 },
      { id: "bottom-grind", name: "Bottom Grind", weight: 0.1 },
      { id: "classic-spread", name: "Classic Spread", weight: 0.05 },
    ]);
    expect(KEEP_CUT_BOARD_STYLES.reduce((sum, style) => sum + style.weight, 0)).toBeCloseTo(1, 10);
  });

  it("generates eight unique category-valid competitive fighters through canonical owners", () => {
    for (const pack of KEEP_CUT_PACKS) {
      const lineup = createKeepCutLineup(pack.id, `unique-${pack.id}`);
      const validIds = new Set(keepCutPool(pack.id).map((fighter) => fighter.id));
      const ids = lineup.fighters.map((fighter) => fighter.id);
      expect(ids).toHaveLength(8);
      expect(new Set(ids).size).toBe(8);
      expect(ids.every((id) => validIds.has(id))).toBe(true);
      expect(keepCutBoardIsCompetitive(pack.id, lineup.fighters)).toBe(true);
      expect(lineup.attemptsUsed).toBeGreaterThan(0);
      expect(lineup.attemptsUsed).toBeLessThanOrEqual(120);
    }
  });

  it("is deterministic for the same seed while shuffling reveal order", () => {
    let ratingSortedRevealOrders = 0;
    const sampleSize = 128;

    for (let index = 0; index < sampleSize; index += 1) {
      const pack = KEEP_CUT_PACKS[index % KEEP_CUT_PACKS.length]!;
      const seed = `determinism-${index}`;
      const first = createKeepCutLineup(pack.id, seed);
      const second = createKeepCutLineup(pack.id, seed);
      const firstIds = first.fighters.map((fighter) => fighter.id);
      expect(second.fighters.map((fighter) => fighter.id)).toEqual(firstIds);
      expect(second.shape).toBe(first.shape);
      expect(keepCutBoardStyleForSeed(pack.id, seed).id).toBe(keepCutBoardStyleForSeed(pack.id, seed).id);

      if (firstIds.join("|") === strongestBoardFirst(pack.id, first.fighters).map((fighter) => fighter.id).join("|")) {
        ratingSortedRevealOrders += 1;
      }
    }

    expect(ratingSortedRevealOrders).toBeLessThan(sampleSize * 0.05);
  });

  it("requires exactly four unique keeps from the board and classifies the other four as cuts", () => {
    const lineup = createKeepCutLineup("all-careers", "selection-proof");
    const ids = lineup.fighters.map((fighter) => fighter.id);
    expect(() => scoreKeepCutSelection("all-careers", lineup.fighters, ids.slice(0, 3))).toThrow("exactly four");
    expect(() => scoreKeepCutSelection("all-careers", lineup.fighters, ids.slice(0, 5))).toThrow("exactly four");
    expect(() => scoreKeepCutSelection("all-careers", lineup.fighters, [ids[0]!, ids[0]!, ids[1]!, ids[2]!])).toThrow("exactly four");
    expect(() => scoreKeepCutSelection("all-careers", lineup.fighters, [ids[0]!, ids[1]!, ids[2]!, "not-on-board"])).toThrow("from the board");
    const result = scoreKeepCutSelection("all-careers", lineup.fighters, ids.slice(0, 4));
    expect(result.keptIds).toEqual(ids.slice(0, 4));
    expect(result.cutIds).toEqual(ids.slice(4));
    expect(result.kept).toHaveLength(4);
    expect(result.cut).toHaveLength(4);
  });

  it("gives 100 when the player keeps the board's four strongest fighters", () => {
    for (const pack of KEEP_CUT_PACKS) {
      const lineup = createKeepCutLineup(pack.id, `perfect-${pack.id}`);
      const sorted = strongestBoardFirst(pack.id, lineup.fighters);
      const result = scoreKeepCutSelection(pack.id, lineup.fighters, sorted.slice(0, 4).map((fighter) => fighter.id));
      expect(result.correctComparisons).toBe(16);
      expect(result.modelTopFourKept).toBe(4);
      expect(result.score).toBe(100);
      expect(result.label).toBe("Legendary four");
    }
  });

  it("keeps the existing sixteen-comparison scoring contract unchanged", () => {
    const packId = "all-careers";
    const lineup = createKeepCutLineup(packId, "comparison-proof");
    const sorted = strongestBoardFirst(packId, lineup.fighters);
    const keptIds = [sorted[0]!, sorted[2]!, sorted[4]!, sorted[6]!].map((fighter) => fighter.id);
    const result = scoreKeepCutSelection(packId, lineup.fighters, keptIds);
    const keptSet = new Set(keptIds);
    const kept = lineup.fighters.filter((fighter) => keptSet.has(fighter.id));
    const cut = lineup.fighters.filter((fighter) => !keptSet.has(fighter.id));
    const expectedComparisons = kept.reduce((count, keptFighter) => count + cut.filter((cutFighter) => (
      keepCutRating(packId, keptFighter) >= keepCutRating(packId, cutFighter) - 1
    )).length, 0);

    expect(result.correctComparisons).toBe(expectedComparisons);
    expect(result.score).toBe(Math.round(expectedComparisons * 6.25));
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("scores deterministically, independently of selection order and display-only fields", () => {
    const lineup = createKeepCutLineup("all-careers", "score-proof");
    const sorted = strongestBoardFirst("all-careers", lineup.fighters);
    const strongIds = sorted.slice(0, 4).map((fighter) => fighter.id);
    const weakIds = sorted.slice(4).map((fighter) => fighter.id);
    const strong = scoreKeepCutSelection("all-careers", lineup.fighters, strongIds);
    const reordered = scoreKeepCutSelection("all-careers", lineup.fighters, [...strongIds].reverse());
    const renamedAndReorderedBoard = [...lineup.fighters]
      .reverse()
      .map((fighter) => ({ ...fighter, name: `DISPLAY ${fighter.id}` }));
    const displayChanged = scoreKeepCutSelection("all-careers", renamedAndReorderedBoard, strongIds);
    const weak = scoreKeepCutSelection("all-careers", lineup.fighters, weakIds);
    expect(reordered.score).toBe(strong.score);
    expect(reordered.correctComparisons).toBe(strong.correctComparisons);
    expect(reordered.label).toBe(strong.label);
    expect(displayChanged.score).toBe(strong.score);
    expect(displayChanged.correctComparisons).toBe(strong.correctComparisons);
    expect(displayChanged.label).toBe(strong.label);
    expect(strong.score).toBe(100);
    expect(strong.score).toBeGreaterThan(weak.score);
  });

  it("maps every whole-number score to one gapless deterministic label band", () => {
    const expected = (score: number) => {
      if (score >= 90) return "Legendary four";
      if (score >= 78) return "Excellent keeps";
      if (score >= 62) return "Solid card";
      if (score >= 45) return "Tough cuts";
      return "Rough room";
    };
    const labels = Array.from({ length: 101 }, (_, score) => keepCutScoreLabel(score));
    labels.forEach((label, score) => expect(label).toBe(expected(score)));
    expect(new Set(labels)).toEqual(new Set([
      "Legendary four",
      "Excellent keeps",
      "Solid card",
      "Tough cuts",
      "Rough room",
    ]));
  });

  it("hydrates the exact challenge board and reveal order from stable fighter IDs", () => {
    const lineup = createKeepCutLineup("ufc-careers", "challenge-proof");
    const ids = lineup.fighters.map((fighter) => fighter.id);
    expect(resolveKeepCutChallenge("ufc-careers", ids)?.map((fighter) => fighter.id)).toEqual(ids);
    expect(resolveKeepCutChallenge("ufc-careers", [...ids.slice(1), ids[0]])?.map((fighter) => fighter.id)).toEqual([...ids.slice(1), ids[0]]);
    expect(resolveKeepCutChallenge("ufc-careers", ids.slice(0, 7))).toBeNull();
  });

  it("holds the Keep/Cut style and cutoff distribution contract over 1,024 deterministic boards", () => {
    const sampleSize = 1_024;
    const rankedIds = new Set(rankedPlayFighters.map((fighter) => fighter.id));
    const allEligibleIds = new Set(KEEP_CUT_PACKS.flatMap((pack) => keepCutPool(pack.id).map((fighter) => fighter.id)));
    const boardSignatures = new Set<string>();
    const fightersSeen = new Set<string>();
    const appearanceCounts = new Map<string, number>();
    const nonPerfectScores = new Set<number>();
    const categoryBoards: Record<string, number> = {};
    const categoryWomen: Record<string, number> = {};
    const styleCounts = Object.fromEntries(KEEP_CUT_BOARD_STYLES.map((style) => [style.id, 0])) as Record<string, number>;
    const eliteCounts = [0, 0, 0, 0];
    const badCounts = [0, 0, 0];
    let ranked = 0;
    let playOnly = 0;
    let men = 0;
    let women = 0;
    let fallbackBoards = 0;
    let coreChoiceBoards = 0;
    let competitiveCutoffBoards = 0;
    let ratingSortedRevealOrders = 0;
    let minimumDistinctTiers = Number.POSITIVE_INFINITY;
    let maxCutoffGap = 0;
    let cutoffGapTotal = 0;

    for (let index = 0; index < sampleSize; index += 1) {
      const pack = KEEP_CUT_PACKS[index % KEEP_CUT_PACKS.length]!;
      const seed = `simulation-${index}`;
      const style = keepCutBoardStyleForSeed(pack.id, seed);
      const lineup = createKeepCutLineup(pack.id, seed);
      const repeat = createKeepCutLineup(pack.id, seed);
      const ids = lineup.fighters.map((fighter) => fighter.id);
      const validIds = new Set(keepCutPool(pack.id).map((fighter) => fighter.id));

      styleCounts[style.id] = (styleCounts[style.id] ?? 0) + 1;
      expect(repeat.fighters.map((fighter) => fighter.id)).toEqual(ids);
      expect(ids).toHaveLength(8);
      expect(new Set(ids).size).toBe(8);
      expect(ids.every((id) => validIds.has(id))).toBe(true);
      expect(keepCutBoardIsCompetitive(pack.id, lineup.fighters)).toBe(true);
      expect(lineup.attemptsUsed).toBeLessThanOrEqual(120);
      if (lineup.fallbackUsed) fallbackBoards += 1;
      categoryBoards[pack.id] = (categoryBoards[pack.id] ?? 0) + 1;
      boardSignatures.add([...ids].sort().join("|"));

      const sorted = strongestBoardFirst(pack.id, lineup.fighters);
      if (ids.join("|") === sorted.map((fighter) => fighter.id).join("|")) ratingSortedRevealOrders += 1;
      const scores = sorted.map((fighter) => keepCutRating(pack.id, fighter));
      const cutoffGap = Math.abs(scores[3]! - scores[4]!);
      cutoffGapTotal += cutoffGap;
      maxCutoffGap = Math.max(maxCutoffGap, cutoffGap);
      if (cutoffGap <= 8) competitiveCutoffBoards += 1;

      const tiers = lineup.fighters.map((fighter) => keepCutTier(keepCutRating(pack.id, fighter)));
      const elite = tiers.filter((tier) => tier === "elite").length;
      const bad = tiers.filter((tier) => tier === "bad").length;
      const coreChoices = tiers.filter((tier) => (
        tier === "good" || tier === "average" || tier === "below-average"
      )).length;
      const distinctTiers = new Set(tiers).size;
      eliteCounts[Math.min(elite, 3)]! += 1;
      badCounts[Math.min(bad, 2)]! += 1;
      if (coreChoices >= 4) coreChoiceBoards += 1;
      minimumDistinctTiers = Math.min(minimumDistinctTiers, distinctTiers);

      const strongResult = scoreKeepCutSelection(pack.id, lineup.fighters, sorted.slice(0, 4).map((fighter) => fighter.id));
      const weakResult = scoreKeepCutSelection(pack.id, lineup.fighters, sorted.slice(4).map((fighter) => fighter.id));
      const mixedResult = scoreKeepCutSelection(pack.id, lineup.fighters, [sorted[0]!, sorted[2]!, sorted[4]!, sorted[6]!].map((fighter) => fighter.id));
      const middleResult = scoreKeepCutSelection(pack.id, lineup.fighters, sorted.slice(2, 6).map((fighter) => fighter.id));
      expect(strongResult.score).toBe(100);
      expect(strongResult.correctComparisons).toBe(16);
      expect(strongResult.modelTopFourKept).toBe(4);
      expect(strongResult.score).toBeGreaterThan(weakResult.score);
      for (const result of [weakResult, mixedResult, middleResult]) {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.correctComparisons).toBeGreaterThanOrEqual(0);
        expect(result.correctComparisons).toBeLessThanOrEqual(16);
        if (result.score < 100) nonPerfectScores.add(result.score);
      }

      for (const fighter of lineup.fighters) {
        fightersSeen.add(fighter.id);
        appearanceCounts.set(fighter.id, (appearanceCounts.get(fighter.id) ?? 0) + 1);
        if (rankedIds.has(fighter.id)) ranked += 1;
        else playOnly += 1;
        if (fighter.gender === "men") men += 1;
        else {
          women += 1;
          categoryWomen[pack.id] = (categoryWomen[pack.id] ?? 0) + 1;
        }
      }
    }

    const totalAppearances = sampleSize * 8;
    const sortedAppearances = [...appearanceCounts.entries()].sort((left, right) => right[1] - left[1]);
    const topTenAppearances = sortedAppearances.slice(0, 10).reduce((sum, [, count]) => sum + count, 0);
    const maxFighterAppearances = sortedAppearances[0]?.[1] ?? 0;
    const share = (count: number) => Number((count / sampleSize).toFixed(4));
    const metrics = {
      sampleSize,
      categoryBoards,
      styleShares: Object.fromEntries(Object.entries(styleCounts).map(([id, count]) => [id, share(count)])),
      eliteShares: {
        none: share(eliteCounts[0]!),
        exactlyOne: share(eliteCounts[1]!),
        exactlyTwo: share(eliteCounts[2]!),
        threePlus: share(eliteCounts[3]!),
      },
      badShares: {
        none: share(badCounts[0]!),
        exactlyOne: share(badCounts[1]!),
        exactlyTwo: share(badCounts[2]!),
      },
      coreChoiceBoardShare: share(coreChoiceBoards),
      cutoffGapAtMostEightShare: share(competitiveCutoffBoards),
      averageCutoffGap: Number((cutoffGapTotal / sampleSize).toFixed(2)),
      maxCutoffGap,
      minimumDistinctTiers,
      ratingSortedRevealOrders,
      uniqueBoards: boardSignatures.size,
      eligibleFighters: allEligibleIds.size,
      fightersSeen: fightersSeen.size,
      ranked,
      playOnly,
      men,
      women,
      categoryWomen,
      fallbackBoards,
      nonPerfectScores: [...nonPerfectScores].sort((a, b) => a - b),
      maxFighterAppearances,
      maxFighterBoardShare: Number((maxFighterAppearances / sampleSize).toFixed(4)),
      topTenAppearanceShare: Number((topTenAppearances / totalAppearances).toFixed(4)),
      topFighters: sortedAppearances.slice(0, 10),
    };
    console.info("KEEP_CUT_SIMULATION", JSON.stringify(metrics));

    expect(styleCounts["knife-edge"]! / sampleSize).toBeGreaterThanOrEqual(0.36);
    expect(styleCounts["knife-edge"]! / sampleSize).toBeLessThanOrEqual(0.44);
    expect(styleCounts["messy-middle"]! / sampleSize).toBeGreaterThanOrEqual(0.26);
    expect(styleCounts["messy-middle"]! / sampleSize).toBeLessThanOrEqual(0.34);
    expect(styleCounts["one-superstar"]! / sampleSize).toBeGreaterThanOrEqual(0.12);
    expect(styleCounts["one-superstar"]! / sampleSize).toBeLessThanOrEqual(0.18);
    expect(styleCounts["bottom-grind"]! / sampleSize).toBeGreaterThanOrEqual(0.07);
    expect(styleCounts["bottom-grind"]! / sampleSize).toBeLessThanOrEqual(0.13);
    expect(styleCounts["classic-spread"]! / sampleSize).toBeGreaterThanOrEqual(0.03);
    expect(styleCounts["classic-spread"]! / sampleSize).toBeLessThanOrEqual(0.08);

    expect(eliteCounts[0]! / sampleSize).toBeGreaterThanOrEqual(0.56);
    expect(eliteCounts[0]! / sampleSize).toBeLessThanOrEqual(0.64);
    expect(eliteCounts[1]! / sampleSize).toBeGreaterThanOrEqual(0.31);
    expect(eliteCounts[1]! / sampleSize).toBeLessThanOrEqual(0.39);
    expect(eliteCounts[2]! / sampleSize).toBeGreaterThanOrEqual(0.03);
    expect(eliteCounts[2]! / sampleSize).toBeLessThanOrEqual(0.07);
    expect(eliteCounts[3]).toBe(0);

    expect(badCounts[0]! / sampleSize).toBeGreaterThanOrEqual(0.535);
    expect(badCounts[0]! / sampleSize).toBeLessThanOrEqual(0.615);
    expect(badCounts[1]! / sampleSize).toBeGreaterThanOrEqual(0.335);
    expect(badCounts[1]! / sampleSize).toBeLessThanOrEqual(0.415);
    expect(badCounts[2]! / sampleSize).toBeGreaterThanOrEqual(0.03);
    expect(badCounts[2]! / sampleSize).toBeLessThanOrEqual(0.07);

    expect(coreChoiceBoards / sampleSize).toBeGreaterThanOrEqual(0.85);
    expect(competitiveCutoffBoards / sampleSize).toBeGreaterThanOrEqual(0.95);
    expect(maxCutoffGap).toBeLessThanOrEqual(8);
    expect(minimumDistinctTiers).toBeGreaterThanOrEqual(3);
    expect(ratingSortedRevealOrders).toBeLessThan(sampleSize * 0.05);

    expect(Object.values(categoryBoards)).toEqual(Array(KEEP_CUT_PACKS.length).fill(sampleSize / KEEP_CUT_PACKS.length));
    expect(boardSignatures.size).toBeGreaterThan(sampleSize * 0.9);
    expect(fightersSeen.size).toBeGreaterThan(allEligibleIds.size * 0.55);
    expect(ranked).toBeGreaterThan(totalAppearances * 0.15);
    expect(playOnly).toBeGreaterThan(totalAppearances * 0.15);
    expect(men).toBeGreaterThan(totalAppearances * 0.5);
    expect(women).toBeGreaterThan(totalAppearances * 0.1);
    expect(categoryWomen["womens-careers"]).toBe(categoryBoards["womens-careers"] * 8);
    expect(nonPerfectScores.size).toBeGreaterThan(8);
    expect(maxFighterAppearances / sampleSize).toBeLessThan(0.3);
    expect(topTenAppearances / totalAppearances).toBeLessThan(0.25);
  });
});
