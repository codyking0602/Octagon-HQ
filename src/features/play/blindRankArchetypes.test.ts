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

type PackId = Parameters<typeof blindRankPool>[0];

function boardBands(packId: PackId, fighterIds: readonly string[]) {
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

function expectArchetypeContract(
  packId: PackId,
  lineup: ReturnType<typeof createBlindRankLineup>,
) {
  const ids = lineup.fighters.map((fighter) => fighter.id);
  const validIds = new Set(blindRankPool(packId).map((fighter) => fighter.id));
  const archetype = BLIND_RANK_ARCHETYPES.find((row) => row.id === lineup.archetype)!;
  const bands = boardBands(packId, ids);

  expect(ids).toHaveLength(5);
  expect(new Set(ids).size).toBe(5);
  expect(ids.every((id) => validIds.has(id))).toBe(true);
  expect(bands.bad).toBeLessThanOrEqual(1);
  expect(bands.range).toBeGreaterThanOrEqual(archetype.minRange);
  if (archetype.minHigh !== undefined) expect(bands.high).toBeGreaterThanOrEqual(archetype.minHigh);
  if (archetype.maxHigh !== undefined) expect(bands.high).toBeLessThanOrEqual(archetype.maxHigh);
  if (archetype.minMiddle !== undefined) expect(bands.middle).toBeGreaterThanOrEqual(archetype.minMiddle);
  if (archetype.maxMiddle !== undefined) expect(bands.middle).toBeLessThanOrEqual(archetype.maxMiddle);
  if (archetype.minLow !== undefined) expect(bands.low).toBeGreaterThanOrEqual(archetype.minLow);
  if (archetype.maxLow !== undefined) expect(bands.low).toBeLessThanOrEqual(archetype.maxLow);
}

describe("Blind Rank lineup archetype release proof", () => {
  it("builds every broad-pool archetype and uses one deterministic Balanced degradation for narrow pools", () => {
    for (const archetype of BLIND_RANK_ARCHETYPES) {
      const first = createBlindRankLineup(
        "all-careers",
        `release-proof:all-careers:${archetype.id}`,
        { archetype: archetype.id },
      );
      const second = createBlindRankLineup(
        "all-careers",
        `release-proof:all-careers:${archetype.id}`,
        { archetype: archetype.id },
      );
      expect(first).toEqual(second);
      expect(first.archetype).toBe(archetype.id);
      expectArchetypeContract("all-careers", first);
    }

    for (const pack of blindRankPacks) {
      for (const archetype of BLIND_RANK_ARCHETYPES) {
        const seed = `release-proof:${pack.id}:${archetype.id}`;
        const first = createBlindRankLineup(pack.id, seed, { archetype: archetype.id });
        const second = createBlindRankLineup(pack.id, seed, { archetype: archetype.id });
        expect(first).toEqual(second);
        expect([archetype.id, "balanced"]).toContain(first.archetype);
        expectArchetypeContract(pack.id, first);
      }
    }

    const degradedHeavyweight = createBlindRankLineup(
      "heavyweight",
      "release-proof:heavyweight:middle-cluster",
      { archetype: "middle-cluster" },
    );
    expect(degradedHeavyweight.archetype).toBe("balanced");
    expectArchetypeContract("heavyweight", degradedHeavyweight);
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
      expectArchetypeContract("all-careers", lineup);

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
