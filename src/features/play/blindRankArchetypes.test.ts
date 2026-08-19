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

function lowBoardClass(archetypeId: (typeof BLIND_RANK_ARCHETYPES)[number]["id"]) {
  const archetype = BLIND_RANK_ARCHETYPES.find((row) => row.id === archetypeId)!;
  if ((archetype.minLow ?? 0) >= 1) return "requires-low" as const;
  if ((archetype.maxLow ?? 5) === 0) return "forbids-low" as const;
  throw new Error(`${archetype.id} must explicitly own a low-end board class.`);
}

describe("Blind Rank lineup archetype release proof", () => {
  it("locks the chaos-first board-style mix and elite exposure", () => {
    const expectedWeights = {
      balanced: 0.1,
      "top-heavy": 0.1,
      "bottom-heavy": 0.12,
      "middle-cluster": 0.18,
      chaos: 0.5,
    } as const;
    const totalWeight = BLIND_RANK_ARCHETYPES.reduce((sum, row) => sum + row.weight, 0);
    const lowBoardWeight = BLIND_RANK_ARCHETYPES
      .filter((row) => lowBoardClass(row.id) === "requires-low")
      .reduce((sum, row) => sum + row.weight, 0);
    const multipleLowWeight = BLIND_RANK_ARCHETYPES
      .filter((row) => (row.minLow ?? 0) >= 2)
      .reduce((sum, row) => sum + row.weight, 0);
    const eliteWeight = (count: number) => BLIND_RANK_ARCHETYPES
      .filter((row) => row.targets.filter((tier) => tier === "elite").length === count)
      .reduce((sum, row) => sum + row.weight, 0);

    for (const archetype of BLIND_RANK_ARCHETYPES) {
      expect(archetype.weight, archetype.id).toBe(expectedWeights[archetype.id]);
    }
    expect(totalWeight).toBeCloseTo(1, 10);
    expect(lowBoardWeight).toBeCloseTo(0.72, 10);
    expect(multipleLowWeight).toBeCloseTo(0.62, 10);
    expect(eliteWeight(0)).toBeCloseTo(0.3, 10);
    expect(eliteWeight(1)).toBeCloseTo(0.6, 10);
    expect(eliteWeight(2)).toBeCloseTo(0.1, 10);
  });

  it("adds the approved Heavyweight depth batch to the canonical Blind Rank pool", () => {
    const expected = {
      "mark-hunt": { career: 64, striking: 82, grappling: 44 },
      "tai-tuivasa": { career: 60, striking: 79, grappling: 34 },
      "ben-rothwell": { career: 62, striking: 68, grappling: 69 },
      "travis-browne": { career: 63, striking: 76, grappling: 52 },
      "gabriel-gonzaga": { career: 61, striking: 66, grappling: 78 },
      "marcin-tybura": { career: 67, striking: 62, grappling: 74 },
      "matt-mitrione": { career: 57, striking: 72, grappling: 43 },
      "jairzinho-rozenstruik": { career: 64, striking: 81, grappling: 36 },
      "brendan-schaub": { career: 52, striking: 56, grappling: 61 },
      "walt-harris": { career: 42, striking: 58, grappling: 35 },
      "antonio-silva": { career: 54, striking: 62, grappling: 61 },
      "chase-sherman": { career: 30, striking: 45, grappling: 30 },
    } as const;
    const heavyweightPool = blindRankPool("heavyweight");
    const byId = new Map(heavyweightPool.map((fighter) => [fighter.id, fighter]));

    for (const [id, ratings] of Object.entries(expected)) {
      const fighter = byId.get(id);
      expect(fighter, id).toBeDefined();
      expect(fighter?.ratings, id).toEqual(ratings);
    }

    const averageCount = heavyweightPool.filter(
      (fighter) => blindRankTier(blindRankRating(fighter, "heavyweight")) === "average",
    ).length;
    expect(averageCount).toBeGreaterThan(0);
    expect(new Set(heavyweightPool.map((fighter) => fighter.id)).size).toBe(heavyweightPool.length);
    expect(new Set(heavyweightPool.map((fighter) => fighter.name.toLowerCase())).size).toBe(heavyweightPool.length);
  });

  it("adds Heavyweight depth at the Good tier", () => {
    const expected = {
      "frank-mir": { career: 80, striking: 68, grappling: 91 },
      "andrei-arlovski": { career: 79, striking: 81, grappling: 52 },
      "alistair-overeem": { career: 78, striking: 89, grappling: 68 },
      "tim-sylvia": { career: 77, striking: 78, grappling: 50 },
      "derrick-lewis": { career: 74, striking: 87, grappling: 34 },
      "shane-carwin": { career: 73, striking: 88, grappling: 74 },
      "josh-barnett": { career: 72, striking: 64, grappling: 84 },
      "antonio-rodrigo-nogueira": { career: 71, striking: 62, grappling: 91 },
    } as const;
    const heavyweightPool = blindRankPool("heavyweight");
    const byId = new Map(heavyweightPool.map((fighter) => [fighter.id, fighter]));

    for (const [id, ratings] of Object.entries(expected)) {
      const fighter = byId.get(id);
      expect(fighter, id).toBeDefined();
      expect(fighter?.ratings, id).toEqual(ratings);
    }

    const goodCount = heavyweightPool.filter(
      (fighter) => blindRankTier(blindRankRating(fighter, "heavyweight")) === "good",
    ).length;
    expect(goodCount).toBe(10);
    expect(new Set(heavyweightPool.map((fighter) => fighter.id)).size).toBe(heavyweightPool.length);
    expect(new Set(heavyweightPool.map((fighter) => fighter.name.toLowerCase())).size).toBe(heavyweightPool.length);
  });
  it("adds Lightweight depth at the Below Average and Bad tiers", () => {
  const expected = {
    "efrain-escudero": { career: 48, striking: 52, grappling: 64 },
    "mac-danzig": { career: 50, striking: 55, grappling: 61 },
    "daron-cruickshank": { career: 49, striking: 68, grappling: 38 },
    "ramsey-nijem": { career: 46, striking: 50, grappling: 62 },
    "danny-castillo": { career: 53, striking: 55, grappling: 64 },
    "sam-stout": { career: 54, striking: 69, grappling: 35 },
    "frank-camacho": { career: 30, striking: 60, grappling: 32 },
    "marcin-held": { career: 30, striking: 38, grappling: 70 },
    "justin-jaynes": { career: 27, striking: 58, grappling: 38 },
    "cody-pfister": { career: 24, striking: 40, grappling: 46 },
    "rafaello-oliveira": { career: 27, striking: 44, grappling: 48 },
    "thibault-gouti": { career: 26, striking: 54, grappling: 35 },
  } as const;
  const lightweightPool = blindRankPool("lightweight");
  const byId = new Map(lightweightPool.map((fighter) => [fighter.id, fighter]));

  for (const [id, ratings] of Object.entries(expected)) {
    const fighter = byId.get(id);
    expect(fighter, id).toBeDefined();
    expect(fighter?.ratings, id).toEqual(ratings);
  }

  const tierCounts = lightweightPool.reduce<Record<string, number>>((counts, fighter) => {
    const tier = blindRankTier(blindRankRating(fighter, "lightweight"));
    counts[tier] = (counts[tier] ?? 0) + 1;
    return counts;
  }, {});
  expect(tierCounts["below-average"]).toBe(9);
  expect(tierCounts.bad).toBe(6);
  expect(new Set(lightweightPool.map((fighter) => fighter.id)).size).toBe(lightweightPool.length);
  expect(new Set(lightweightPool.map((fighter) => fighter.name.toLowerCase())).size).toBe(lightweightPool.length);
});

  it("adds Women’s career depth at the missing Good and Bad tiers", () => {
  const expected = {
    "tatiana-suarez": { career: 80, striking: 65, grappling: 93 },
    "manon-fiorot": { career: 81, striking: 88, grappling: 60 },
    "erin-blanchfield": { career: 78, striking: 70, grappling: 89 },
    "yan-xiaonan": { career: 79, striking: 86, grappling: 58 },
    "virna-jandiroba": { career: 78, striking: 58, grappling: 91 },
    "irene-aldana": { career: 72, striking: 84, grappling: 49 },
    "hannah-cifers": { career: 31, striking: 58, grappling: 28 },
    "pearl-gonzalez": { career: 18, striking: 42, grappling: 49 },
    "bec-rawlings": { career: 32, striking: 57, grappling: 42 },
    "rachael-ostovich": { career: 25, striking: 43, grappling: 48 },
    "jessamyn-duke": { career: 27, striking: 53, grappling: 39 },
    "alexis-dufresne": { career: 16, striking: 34, grappling: 50 },
  } as const;
  const womensPool = blindRankPool("womens-careers");
  const byId = new Map(womensPool.map((fighter) => [fighter.id, fighter]));

  for (const [id, ratings] of Object.entries(expected)) {
    const fighter = byId.get(id);
    expect(fighter, id).toBeDefined();
    expect(fighter?.ratings, id).toEqual(ratings);
  }

  const tierCounts = womensPool.reduce<Record<string, number>>((counts, fighter) => {
    const tier = blindRankTier(blindRankRating(fighter, "womens-careers"));
    counts[tier] = (counts[tier] ?? 0) + 1;
    return counts;
  }, {});
  expect(tierCounts.good).toBe(6);
  expect(tierCounts.bad).toBe(6);
  expect(new Set(womensPool.map((fighter) => fighter.id)).size).toBe(womensPool.length);
  expect(new Set(womensPool.map((fighter) => fighter.name.toLowerCase())).size).toBe(womensPool.length);
});

  it("builds every broad-pool archetype and preserves the requested low-end class when a narrow pack degrades", () => {
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
        expect(lowBoardClass(first.archetype)).toBe(lowBoardClass(archetype.id));
        expectArchetypeContract(pack.id, first);
      }
    }
  });

  it("keeps low-end surprise frequency healthy in every Blind Rank category", () => {
    const sampleSize = 500;

    for (const pack of blindRankPacks) {
      let lowBoards = 0;
      let multipleLowBoards = 0;

      for (let index = 0; index < sampleSize; index += 1) {
        const lineup = createBlindRankLineup(pack.id, `pack-distribution:${pack.id}:${index}`);
        const bands = boardBands(pack.id, lineup.fighters.map((fighter) => fighter.id));
        if (bands.low >= 1) lowBoards += 1;
        if (bands.low >= 2) multipleLowBoards += 1;
        expectArchetypeContract(pack.id, lineup);
      }

      const lowBoardShare = lowBoards / sampleSize;
      const multipleLowBoardShare = multipleLowBoards / sampleSize;
      // Exact long-run intent is owned by the 72% archetype-weight contract above. This
      // finite deterministic sample catches pack-specific fallback skew without pretending
      // 500 seeded boards must land exactly on the theoretical percentage.
      expect(lowBoardShare, `${pack.id} low-end board share`).toBeGreaterThanOrEqual(0.64);
      expect(lowBoardShare, `${pack.id} low-end board share`).toBeLessThanOrEqual(0.8);
      expect(multipleLowBoardShare, `${pack.id} multiple-low board share`).toBeGreaterThanOrEqual(0.5);
    }
  });

  it("keeps repeated broad-pool boards unique with meaningful pool, ownership, and gender usage", () => {
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