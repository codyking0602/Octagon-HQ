import { describe, expect, it } from "vitest";
import {
  KEEP_CUT_PACKS,
  createKeepCutLineup,
  keepCutBoardIsCompetitive,
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
      expect(lineup.attemptsUsed).toBeLessThanOrEqual(36);
    }
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

  it("scores the blind board through sixteen kept-versus-cut comparisons", () => {
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

  it("proves deterministic board fairness and board-relative scoring over 1,024 boards", () => {
    const sampleSize = 1_024;
    const rankedIds = new Set(rankedPlayFighters.map((fighter) => fighter.id));
    const allEligibleIds = new Set(KEEP_CUT_PACKS.flatMap((pack) => keepCutPool(pack.id).map((fighter) => fighter.id)));
    const boardSignatures = new Set<string>();
    const fightersSeen = new Set<string>();
    const appearanceCounts = new Map<string, number>();
    const nonPerfectScores = new Set<number>();
    const categoryBoards: Record<string, number> = {};
    const categoryWomen: Record<string, number> = {};
    let ranked = 0;
    let playOnly = 0;
    let men = 0;
    let women = 0;
    let strong = 0;
    let middle = 0;
    let weaker = 0;
    let badBoards = 0;
    let fallbackBoards = 0;

    for (let index = 0; index < sampleSize; index += 1) {
      const pack = KEEP_CUT_PACKS[index % KEEP_CUT_PACKS.length]!;
      const lineup = createKeepCutLineup(pack.id, `simulation-${index}`);
      const repeat = createKeepCutLineup(pack.id, `simulation-${index}`);
      const ids = lineup.fighters.map((fighter) => fighter.id);
      const validIds = new Set(keepCutPool(pack.id).map((fighter) => fighter.id));
      expect(repeat.fighters.map((fighter) => fighter.id)).toEqual(ids);
      expect(ids).toHaveLength(8);
      expect(new Set(ids).size).toBe(8);
      expect(ids.every((id) => validIds.has(id))).toBe(true);
      expect(keepCutBoardIsCompetitive(pack.id, lineup.fighters)).toBe(true);
      expect(lineup.attemptsUsed).toBeLessThanOrEqual(36);
      if (lineup.fallbackUsed) fallbackBoards += 1;
      categoryBoards[pack.id] = (categoryBoards[pack.id] ?? 0) + 1;
      boardSignatures.add([...ids].sort().join("|"));

      const sorted = strongestBoardFirst(pack.id, lineup.fighters);
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

      let boardBad = 0;
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
        const tier = keepCutTier(keepCutRating(pack.id, fighter));
        if (tier === "elite" || tier === "great") strong += 1;
        if (tier === "good" || tier === "average") middle += 1;
        if (tier === "below-average" || tier === "bad") weaker += 1;
        if (tier === "bad") boardBad += 1;
      }
      expect(boardBad).toBeLessThanOrEqual(2);
      if (boardBad > 0) badBoards += 1;
    }

    const totalAppearances = sampleSize * 8;
    const sortedAppearances = [...appearanceCounts.entries()].sort((left, right) => right[1] - left[1]);
    const topTenAppearances = sortedAppearances.slice(0, 10).reduce((sum, [, count]) => sum + count, 0);
    const maxFighterAppearances = sortedAppearances[0]?.[1] ?? 0;
    const metrics = {
      sampleSize,
      categoryBoards,
      uniqueBoards: boardSignatures.size,
      eligibleFighters: allEligibleIds.size,
      fightersSeen: fightersSeen.size,
      ranked,
      playOnly,
      men,
      women,
      categoryWomen,
      strong,
      middle,
      weaker,
      badBoards,
      fallbackBoards,
      nonPerfectScores: [...nonPerfectScores].sort((a, b) => a - b),
      maxFighterAppearances,
      maxFighterBoardShare: Number((maxFighterAppearances / sampleSize).toFixed(4)),
      topTenAppearanceShare: Number((topTenAppearances / totalAppearances).toFixed(4)),
      topFighters: sortedAppearances.slice(0, 10),
    };
    console.info("KEEP_CUT_SIMULATION", JSON.stringify(metrics));

    expect(Object.values(categoryBoards)).toEqual(Array(KEEP_CUT_PACKS.length).fill(sampleSize / KEEP_CUT_PACKS.length));
    expect(boardSignatures.size).toBeGreaterThan(sampleSize * 0.9);
    expect(fightersSeen.size).toBeGreaterThan(allEligibleIds.size * 0.55);
    expect(ranked).toBeGreaterThan(totalAppearances * 0.15);
    expect(playOnly).toBeGreaterThan(totalAppearances * 0.15);
    expect(men).toBeGreaterThan(totalAppearances * 0.5);
    expect(women).toBeGreaterThan(totalAppearances * 0.1);
    expect(categoryWomen["womens-careers"]).toBe(categoryBoards["womens-careers"] * 8);
    expect(strong).toBeGreaterThan(totalAppearances * 0.1);
    expect(middle).toBeGreaterThan(totalAppearances * 0.3);
    expect(weaker).toBeGreaterThan(totalAppearances * 0.1);
    expect(badBoards).toBeGreaterThan(20);
    expect(nonPerfectScores.size).toBeGreaterThan(8);
    expect(maxFighterAppearances / sampleSize).toBeLessThan(0.3);
    expect(topTenAppearances / totalAppearances).toBeLessThan(0.25);
  });
});
