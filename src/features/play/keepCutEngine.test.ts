import { describe, expect, it } from "vitest";
import {
  KEEP_CUT_PACKS,
  createKeepCutLineup,
  keepCutPool,
  keepCutRating,
  keepCutScoreLabel,
  keepCutTier,
  resolveKeepCutChallenge,
  scoreKeepCutSelection,
} from "./keepCutEngine";
import { rankedPlayFighters } from "./playFighterPool";

describe("Keep 4, Cut 4 engine", () => {
  it("generates eight unique category-valid fighters through the canonical pools", () => {
    for (const pack of KEEP_CUT_PACKS) {
      const lineup = createKeepCutLineup(pack.id, `unique-${pack.id}`);
      const validIds = new Set(keepCutPool(pack.id).map((fighter) => fighter.id));
      const ids = lineup.fighters.map((fighter) => fighter.id);
      expect(ids).toHaveLength(8);
      expect(new Set(ids).size).toBe(8);
      expect(ids.every((id) => validIds.has(id))).toBe(true);
      expect(lineup.attemptsUsed).toBeGreaterThan(0);
      expect(lineup.attemptsUsed).toBeLessThanOrEqual(18);
    }
  });

  it("requires exactly four keeps and classifies kept and cut fighters", () => {
    const lineup = createKeepCutLineup("all-careers", "selection-proof");
    const ids = lineup.fighters.map((fighter) => fighter.id);
    expect(() => scoreKeepCutSelection("all-careers", lineup.fighters, ids.slice(0, 3))).toThrow("exactly four");
    expect(() => scoreKeepCutSelection("all-careers", lineup.fighters, ids.slice(0, 5))).toThrow("exactly four");
    const result = scoreKeepCutSelection("all-careers", lineup.fighters, ids.slice(0, 4));
    expect(result.keptIds).toEqual(ids.slice(0, 4));
    expect(result.cutIds).toEqual(ids.slice(4));
  });

  it("scores deterministically and rewards stronger groups", () => {
    const lineup = createKeepCutLineup("all-careers", "score-proof");
    const sorted = [...lineup.fighters].sort((a, b) => keepCutRating("all-careers", b) - keepCutRating("all-careers", a));
    const strong = scoreKeepCutSelection("all-careers", lineup.fighters, sorted.slice(0, 4).map((fighter) => fighter.id));
    const weak = scoreKeepCutSelection("all-careers", lineup.fighters, sorted.slice(4).map((fighter) => fighter.id));
    expect(scoreKeepCutSelection("all-careers", lineup.fighters, strong.keptIds)).toEqual(strong);
    expect(strong.score).toBeGreaterThan(weak.score);
  });

  it("maps score labels to deterministic bands", () => {
    expect(keepCutScoreLabel(95)).toBe("Legendary four");
    expect(keepCutScoreLabel(80)).toBe("Excellent keeps");
    expect(keepCutScoreLabel(70)).toBe("Solid card");
    expect(keepCutScoreLabel(50)).toBe("Tough cuts");
    expect(keepCutScoreLabel(20)).toBe("Rough room");
  });

  it("hydrates exact challenge boards by stable fighter IDs", () => {
    const lineup = createKeepCutLineup("ufc-careers", "challenge-proof");
    const ids = lineup.fighters.map((fighter) => fighter.id);
    expect(resolveKeepCutChallenge("ufc-careers", ids)?.map((fighter) => fighter.id)).toEqual(ids);
    expect(resolveKeepCutChallenge("ufc-careers", [...ids.slice(1), ids[0]])?.map((fighter) => fighter.id)).toEqual([...ids.slice(1), ids[0]]);
  });

  it("proves deterministic simulation fairness and score distribution", () => {
    const sampleSize = 320;
    const rankedIds = new Set(rankedPlayFighters.map((fighter) => fighter.id));
    const boardSignatures = new Set<string>();
    let ranked = 0, playOnly = 0, men = 0, women = 0, strong = 0, middle = 0, weaker = 0, badBoards = 0;
    const scores = { weak: 0, average: 0, good: 0, excellent: 0 };
    for (let index = 0; index < sampleSize; index += 1) {
      const pack = KEEP_CUT_PACKS[index % KEEP_CUT_PACKS.length]!;
      const lineup = createKeepCutLineup(pack.id, `simulation-${index}`);
      const ids = lineup.fighters.map((fighter) => fighter.id);
      const validIds = new Set(keepCutPool(pack.id).map((fighter) => fighter.id));
      expect(ids).toHaveLength(8);
      expect(new Set(ids).size).toBe(8);
      expect(ids.every((id) => validIds.has(id))).toBe(true);
      expect(lineup.attemptsUsed).toBeLessThanOrEqual(18);
      boardSignatures.add([...ids].sort().join("|"));
      const sorted = [...lineup.fighters].sort((a, b) => keepCutRating(pack.id, b) - keepCutRating(pack.id, a));
      const strongResult = scoreKeepCutSelection(pack.id, lineup.fighters, sorted.slice(0, 4).map((fighter) => fighter.id));
      const weakResult = scoreKeepCutSelection(pack.id, lineup.fighters, sorted.slice(4).map((fighter) => fighter.id));
      expect(strongResult.score).toBeGreaterThan(weakResult.score);
      for (const score of [strongResult.score, weakResult.score, scoreKeepCutSelection(pack.id, lineup.fighters, [sorted[0]!, sorted[2]!, sorted[4]!, sorted[6]!].map((fighter) => fighter.id)).score]) {
        if (score < 45) scores.weak += 1;
        else if (score < 62) scores.average += 1;
        else if (score < 78) scores.good += 1;
        else scores.excellent += 1;
      }
      let boardBad = 0;
      for (const fighter of lineup.fighters) {
        if (rankedIds.has(fighter.id)) ranked += 1; else playOnly += 1;
        if (fighter.gender === "men") men += 1; else women += 1;
        const tier = keepCutTier(keepCutRating(pack.id, fighter));
        if (tier === "elite" || tier === "great") strong += 1;
        if (tier === "good" || tier === "average") middle += 1;
        if (tier === "below-average" || tier === "bad") weaker += 1;
        if (tier === "bad") boardBad += 1;
      }
      expect(boardBad).toBeLessThanOrEqual(2);
      if (boardBad > 0) badBoards += 1;
    }
    expect(boardSignatures.size).toBeGreaterThan(sampleSize * 0.9);
    expect(ranked).toBeGreaterThan(600);
    expect(playOnly).toBeGreaterThan(500);
    expect(men).toBeGreaterThan(women);
    expect(women).toBeGreaterThan(150);
    expect(strong).toBeGreaterThan(250);
    expect(middle).toBeGreaterThan(800);
    expect(weaker).toBeGreaterThan(250);
    expect(badBoards).toBeGreaterThan(10);
    expect(scores.weak).toBeGreaterThan(0);
    expect(scores.average).toBeGreaterThan(0);
    expect(scores.good).toBeGreaterThan(0);
    expect(scores.excellent).toBeGreaterThan(0);
  });
});
