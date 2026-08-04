import { describe, expect, it } from "vitest";
import {
  BLIND_RANK_ARCHETYPES,
  blindRankPacks,
  blindRankTier,
  createBlindRankLineup,
} from "./blindRankEngine";
import {
  blindRankPool,
  blindRankRating,
  rankedPlayFighters,
} from "./playFighterPool";

function boardBands(packId: Parameters<typeof blindRankPool>[0], fighterIds: readonly string[]) {
  const byId = new Map(blindRankPool(packId).map((fighter) => [fighter.id, fighter]));
  const rows = fighterIds.map((id) => {
    const fighter = byId.get(id);
    if (!fighter) throw new Error(`Missing ${id} from ${packId} pool.`);
    const score = blindRankRating(fighter, packId);
    return { score, tier: blindRankTier(score) };
  });
  const high = rows.filter(({ tier }) => tier === "elite" || tier === "great").length;
  const middle = rows.filter(({ tier }) => tier === "good" || tier === "average").length;
  const low = rows.filter(({ tier }) => tier === "below-average" || tier === "bad").length;
  const bad = rows.filter(({ tier }) => tier === "bad").length;
  const scores = rows.map(({ score }) => score);
  return { high, middle, low, bad, range: Math.max(...scores) - Math.min(...scores) };
}

describe("Blind Rank lineup archetype release proof", () => {
  it("builds every archetype for every supported category with its intended product contract", () => {
    for (const pack of blindRankPacks) {
      const validIds = new Set(blindRankPool(pack.id).map((fighter) => fighter.id));
      for (const archetype of BLIND_RANK_ARCHETYPES) {
        const first = createBlindRankLineup(pack.id, `release-proof:${pack.id}:${archetype.id}`, {
          archetype: archetype.id,
        });
        const second = createBlindRankLineup(pack.id, `release-proof:${pack.id}:${archetype.id}`, {
          archetype: archetype.id,
        });
        const ids = first.fighters.map((fighter) => fighter.id);
        const bands = boardBands(pack.id, ids);

        expect(first).toEqual(second);
        expect(first.archetype).toBe(archetype.id);
        expect(ids).toHaveLength(5);
        expect(new Set(ids).size).toBe(5);
        expect(ids.every((id) => validIds.has(id))).toBe(true);
        expect(bands.bad).toBeLessThanOrEqual(1);

        if (archetype.id === "balanced") {
          expect(bands.high).toBeGreaterThanOrEqual(1);
          expect(bands.high).toBeLessThanOrEqual(2);
          expect(bands.middle).toBeGreaterThanOrEqual(2);
          expect(bands.low).toBeGreaterThanOrEqual(1);
          expect(bands.low).toBeLessThanOrEqual(2);
          expect(bands.range).toBeGreaterThanOrEqual(32);
        } else if (archetype.id === "top-heavy") {
          expect(bands.high).toBeGreaterThanOrEqual(3);
          expect(bands.high).toBeLessThanOrEqual(4);
          expect(bands.middle).toBeGreaterThanOrEqual(1);
          expect(bands.low).toBeLessThanOrEqual(1);
          expect(bands.range).toBeGreaterThanOrEqual(18);
        } else if (archetype.id === "bottom-heavy") {
          expect(bands.high).toBeGreaterThanOrEqual(1);
          expect(bands.high).toBeLessThanOrEqual(2);
          expect(bands.middle).toBeGreaterThanOrEqual(1);
          expect(bands.low).toBeGreaterThanOrEqual(3);
          expect(bands.low).toBeLessThanOrEqual(4);
          expect(bands.range).toBeGreaterThanOrEqual(24);
        } else if (archetype.id === "middle-cluster") {
          expect(bands.high).toBeLessThanOrEqual(1);
          expect(bands.middle).toBeGreaterThanOrEqual(3);
          expect(bands.low).toBeLessThanOrEqual(1);
          expect(bands.range).toBeGreaterThanOrEqual(15);
        } else {
          expect(bands.high).toBeGreaterThanOrEqual(1);
          expect(bands.middle).toBeGreaterThanOrEqual(1);
          expect(bands.low).toBeGreaterThanOrEqual(1);
          expect(bands.range).toBeGreaterThanOrEqual(45);
        }
      }
    }
  });

  it("keeps repeated seeded boards unique with meaningful pool, band, ownership, and gender usage", () => {
    const sampleSize = 500;
    const validPool = blindRankPool("all-careers");
    const validIds = new Set(validPool.map((fighter) => fighter.id));
    const rankedIds = new Set(rankedPlayFighters.map((fighter) => fighter.id));
    const boardSignatures = new Set<string>();
    const fightersSeen = new Set<string>();
    let rankedAppearances = 0;
    let playOnlyAppearances = 0;
    let menAppearances = 0;
    let womenAppearances = 0;
    let middleAppearances = 0;
    let lowAppearances = 0;

    for (let index = 0; index < sampleSize; index += 1) {
      const lineup = createBlindRankLineup("all-careers", `release-simulation:${index}`);
      const ids = lineup.fighters.map((fighter) => fighter.id);
      expect(ids).toHaveLength(5);
      expect(new Set(ids).size).toBe(5);
      expect(ids.every((id) => validIds.has(id))).toBe(true);
      expect(lineup.badFighters).toBeLessThanOrEqual(1);

      boardSignatures.add([...ids].sort().join("|"));
      for (const fighter of lineup.fighters) {
        fightersSeen.add(fighter.id);
        if (rankedIds.has(fighter.id)) rankedAppearances += 1;
        else playOnlyAppearances += 1;
        if (fighter.gender === "men") menAppearances += 1;
        else womenAppearances += 1;
        const tier = blindRankTier(blindRankRating(fighter, "all-careers"));
        if (tier === "good" || tier === "average") middleAppearances += 1;
        if (tier === "below-average" || tier === "bad") lowAppearances += 1;
      }
    }

    const totalAppearances = sampleSize * 5;
    expect(boardSignatures.size).toBe(sampleSize);
    expect(fightersSeen.size).toBeGreaterThanOrEqual(Math.floor(validPool.length * 0.6));
    expect(rankedAppearances).toBeGreaterThan(totalAppearances * 0.2);
    expect(playOnlyAppearances).toBeGreaterThan(totalAppearances * 0.2);
    expect(menAppearances).toBeGreaterThan(totalAppearances * 0.5);
    expect(womenAppearances).toBeGreaterThan(totalAppearances * 0.1);
    expect(middleAppearances).toBeGreaterThan(totalAppearances * 0.25);
    expect(lowAppearances).toBeGreaterThan(totalAppearances * 0.1);
  });
});
