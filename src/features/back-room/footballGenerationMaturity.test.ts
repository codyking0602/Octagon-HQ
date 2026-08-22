import { describe, expect, it } from "vitest";
import {
  FOOTBALL_BLIND_RANK_ARCHETYPES,
  FOOTBALL_KEEP_CUT_BOARD_STYLES,
  buildFootballBlindRankBoard,
  buildFootballKeepCutBoard,
  footballBlindRankArchetypeForSeed,
  footballComparisonTier,
  footballKeepCutBoardIsCompetitive,
  footballKeepCutBoardStyleForSeed,
  footballKeepCutEliteCap,
  footballKeepCutRequiredDistinctTiers,
} from "./footballComparisonGeneration";
import {
  buildFootballKeepCutLineup,
  scoreFootballKeepCutSelection,
} from "./footballKeepCutModel";
import {
  buildFootballRankFiveLineup,
  footballRankFivePacks,
  type FootballRankFiveItem,
} from "./footballRankFiveModel";

const BOARDS_PER_PACK = 128;

function strongestFirst(items: readonly FootballRankFiveItem[]) {
  return [...items].sort((left, right) => right.rating - left.rating || left.id.localeCompare(right.id));
}

function share(value: number, total: number) {
  return total === 0 ? 0 : value / total;
}

function maximumSubjectExposure(boardSize: number, poolSize: number) {
  const unavoidableAverageExposure = boardSize / poolSize;
  return Math.min(0.9, Math.max(0.45, unavoidableAverageExposure * 1.8));
}

function expectTierBalancedExposure(
  pack: (typeof footballRankFivePacks)[number],
  appearances: ReadonlyMap<string, number>,
  boardSize: number,
  label: string,
) {
  const globalFloor = maximumSubjectExposure(boardSize, pack.items.length);
  const tiers = new Set(pack.items.map(footballComparisonTier));

  for (const tier of tiers) {
    const tierItems = pack.items.filter((item) => footballComparisonTier(item) === tier);
    if (tierItems.length < 2) continue;
    const tierAppearances = tierItems.reduce(
      (sum, item) => sum + (appearances.get(item.id) ?? 0),
      0,
    );
    const averageTierExposure = share(tierAppearances, BOARDS_PER_PACK * tierItems.length);
    const tierCeiling = Math.min(0.9, Math.max(globalFloor, averageTierExposure * 1.5 + 0.05));

    for (const item of tierItems) {
      expect(
        share(appearances.get(item.id) ?? 0, BOARDS_PER_PACK),
        `${pack.id} ${label} ${tier} exposure: ${item.id}`,
      ).toBeLessThan(tierCeiling);
    }
  }
}

function relativeThirdIds(items: readonly FootballRankFiveItem[], side: "high" | "low") {
  const ordered = strongestFirst(items);
  const size = Math.max(1, Math.ceil(ordered.length / 3));
  const rows = side === "high" ? ordered.slice(0, size) : ordered.slice(-size);
  return new Set(rows.map((item) => item.id));
}

describe("Football comparison generation maturity", () => {
  it("owns the UFC-style Blind Rank archetype and Keep/Cut board-style weights", () => {
    expect(FOOTBALL_BLIND_RANK_ARCHETYPES.map(({ id, name, weight }) => ({ id, name, weight }))).toEqual([
      { id: "balanced", name: "Balanced", weight: 0.1 },
      { id: "top-heavy", name: "Top-heavy", weight: 0.1 },
      { id: "bottom-heavy", name: "Bottom-heavy", weight: 0.12 },
      { id: "middle-cluster", name: "Middle cluster", weight: 0.18 },
      { id: "chaos", name: "Chaos", weight: 0.5 },
    ]);
    expect(FOOTBALL_KEEP_CUT_BOARD_STYLES.map(({ id, name, weight }) => ({ id, name, weight }))).toEqual([
      { id: "knife-edge", name: "Knife Edge", weight: 0.4 },
      { id: "messy-middle", name: "Messy Middle", weight: 0.3 },
      { id: "one-superstar", name: "One Superstar", weight: 0.15 },
      { id: "bottom-grind", name: "Bottom Grind", weight: 0.1 },
      { id: "classic-spread", name: "Classic Spread", weight: 0.05 },
    ]);
    expect(FOOTBALL_BLIND_RANK_ARCHETYPES.reduce((sum, row) => sum + row.weight, 0)).toBeCloseTo(1, 10);
    expect(FOOTBALL_KEEP_CUT_BOARD_STYLES.reduce((sum, row) => sum + row.weight, 0)).toBeCloseTo(1, 10);
  });

  it("supports every Blind Rank archetype in every canonical Football pack and stays deterministic", () => {
    for (const pack of footballRankFivePacks) {
      for (const archetype of FOOTBALL_BLIND_RANK_ARCHETYPES) {
        const seed = `forced-${pack.id}-${archetype.id}`;
        const first = buildFootballBlindRankBoard(pack.items, pack.id, seed, archetype.id);
        const second = buildFootballBlindRankBoard(pack.items, pack.id, seed, archetype.id);
        expect(first.archetype).toBe(archetype.id);
        expect(first.items.map((item) => item.id)).toEqual(second.items.map((item) => item.id));
        expect(first.items).toHaveLength(5);
        expect(new Set(first.items.map((item) => item.id)).size).toBe(5);
        expect(first.badItems).toBeLessThanOrEqual(1);
      }

      const seed = `public-rank-five-${pack.id}`;
      expect(buildFootballRankFiveLineup(pack.id, seed).map((item) => item.id)).toEqual(
        buildFootballRankFiveLineup(pack.id, seed).map((item) => item.id),
      );
    }
  });

  it("holds Blind Rank frequency, texture, replayability, coverage, and overexposure thresholds over thousands of subjects", () => {
    const archetypeCounts = Object.fromEntries(
      FOOTBALL_BLIND_RANK_ARCHETYPES.map((row) => [row.id, 0]),
    ) as Record<string, number>;
    const signatures = new Set<string>();
    const appearancesByPack = new Map<string, Map<string, number>>();
    const seenByPack = new Map<string, Set<string>>();
    let badEligibleBoards = 0;
    let badBoards = 0;
    let lowBoards = 0;
    let multipleLowBoards = 0;
    let highLowContrastBoards = 0;
    let eliteFloodBoards = 0;
    let totalBoards = 0;

    for (const pack of footballRankFivePacks) {
      const highIds = relativeThirdIds(pack.items, "high");
      const lowIds = relativeThirdIds(pack.items, "low");
      const packAppearances = new Map<string, number>();
      const packSeen = new Set<string>();
      appearancesByPack.set(pack.id, packAppearances);
      seenByPack.set(pack.id, packSeen);
      const hasBad = pack.items.some((item) => footballComparisonTier(item) === "bad");

      for (let index = 0; index < BOARDS_PER_PACK; index += 1) {
        const seed = `blind-simulation-${pack.id}-${index}`;
        const expectedArchetype = footballBlindRankArchetypeForSeed(pack.id, seed);
        const board = buildFootballBlindRankBoard(pack.items, pack.id, seed);
        const repeat = buildFootballBlindRankBoard(pack.items, pack.id, seed);
        const ids = board.items.map((item) => item.id);
        const lowCount = ids.filter((id) => lowIds.has(id)).length;
        const highCount = ids.filter((id) => highIds.has(id)).length;
        const badCount = board.items.filter((item) => footballComparisonTier(item) === "bad").length;
        const eliteCount = board.items.filter((item) => footballComparisonTier(item) === "elite").length;

        totalBoards += 1;
        archetypeCounts[board.archetype] = (archetypeCounts[board.archetype] ?? 0) + 1;
        expect(board.archetype).toBe(expectedArchetype.id);
        expect(repeat.items.map((item) => item.id)).toEqual(ids);
        expect(ids).toHaveLength(5);
        expect(new Set(ids).size).toBe(5);
        expect(badCount).toBeLessThanOrEqual(1);
        signatures.add(`${pack.id}:${[...ids].sort().join("|")}`);
        if (lowCount >= 1) lowBoards += 1;
        if (lowCount >= 2) multipleLowBoards += 1;
        if (lowCount >= 1 && highCount >= 1) highLowContrastBoards += 1;
        if (eliteCount >= 3) eliteFloodBoards += 1;
        if (hasBad) {
          badEligibleBoards += 1;
          if (badCount >= 1) badBoards += 1;
        }

        for (const item of board.items) {
          packSeen.add(item.id);
          packAppearances.set(item.id, (packAppearances.get(item.id) ?? 0) + 1);
        }
      }
    }

    for (const [packId, seen] of seenByPack) {
      const pack = footballRankFivePacks.find((row) => row.id === packId)!;
      expect(share(seen.size, pack.items.length), `${packId} Blind Rank coverage`).toBeGreaterThanOrEqual(0.65);
      const maxAppearances = Math.max(...appearancesByPack.get(packId)!.values());
      const exposureCeiling = maximumSubjectExposure(5, pack.items.length);
      expect(share(maxAppearances, BOARDS_PER_PACK), `${packId} Blind Rank max exposure`).toBeLessThan(exposureCeiling);
    }

    expect(signatures.size).toBeGreaterThan(totalBoards * 0.92);
    expect(share(lowBoards, totalBoards)).toBeGreaterThanOrEqual(0.62);
    expect(share(multipleLowBoards, totalBoards)).toBeGreaterThanOrEqual(0.32);
    expect(share(highLowContrastBoards, totalBoards)).toBeGreaterThanOrEqual(0.55);
    expect(share(eliteFloodBoards, totalBoards)).toBeLessThan(0.3);
    expect(share(badBoards, badEligibleBoards)).toBeGreaterThanOrEqual(0.08);
    expect(share(badBoards, badEligibleBoards)).toBeLessThanOrEqual(0.45);

    expect(share(archetypeCounts.balanced!, totalBoards)).toBeGreaterThanOrEqual(0.07);
    expect(share(archetypeCounts.balanced!, totalBoards)).toBeLessThanOrEqual(0.13);
    expect(share(archetypeCounts["top-heavy"]!, totalBoards)).toBeGreaterThanOrEqual(0.07);
    expect(share(archetypeCounts["top-heavy"]!, totalBoards)).toBeLessThanOrEqual(0.13);
    expect(share(archetypeCounts["bottom-heavy"]!, totalBoards)).toBeGreaterThanOrEqual(0.09);
    expect(share(archetypeCounts["bottom-heavy"]!, totalBoards)).toBeLessThanOrEqual(0.15);
    expect(share(archetypeCounts["middle-cluster"]!, totalBoards)).toBeGreaterThanOrEqual(0.14);
    expect(share(archetypeCounts["middle-cluster"]!, totalBoards)).toBeLessThanOrEqual(0.22);
    expect(share(archetypeCounts.chaos!, totalBoards)).toBeGreaterThanOrEqual(0.46);
    expect(share(archetypeCounts.chaos!, totalBoards)).toBeLessThanOrEqual(0.54);
  });

  it("holds Keep/Cut style, cutoff, tier, texture, replayability, and exposure thresholds across every pack", () => {
    const styleCounts = Object.fromEntries(
      FOOTBALL_KEEP_CUT_BOARD_STYLES.map((row) => [row.id, 0]),
    ) as Record<string, number>;
    const signatures = new Set<string>();
    const appearancesByPack = new Map<string, Map<string, number>>();
    const seenByPack = new Map<string, Set<string>>();
    let badEligibleBoards = 0;
    let badBoards = 0;
    let twoBadBoards = 0;
    let eliteEligibleBoards = 0;
    let eliteBoards = 0;
    let twoEliteBoards = 0;
    let tightCutoffBoards = 0;
    let cutoffTotal = 0;
    let totalBoards = 0;

    for (const pack of footballRankFivePacks) {
      const packAppearances = new Map<string, number>();
      const packSeen = new Set<string>();
      appearancesByPack.set(pack.id, packAppearances);
      seenByPack.set(pack.id, packSeen);
      const hasBad = pack.items.some((item) => footballComparisonTier(item) === "bad");
      const hasElite = pack.items.some((item) => footballComparisonTier(item) === "elite");

      for (let index = 0; index < BOARDS_PER_PACK; index += 1) {
        const seed = `keep-cut-simulation-${pack.id}-${index}`;
        const expectedStyle = footballKeepCutBoardStyleForSeed(pack.id, seed);
        const board = buildFootballKeepCutBoard(pack.items, pack.id, seed);
        const repeat = buildFootballKeepCutBoard(pack.items, pack.id, seed);
        const publicLineup = buildFootballKeepCutLineup(pack.id, seed);
        const ids = board.items.map((item) => item.id);
        const ordered = strongestFirst(board.items);

        totalBoards += 1;
        styleCounts[board.style] = (styleCounts[board.style] ?? 0) + 1;
        expect(board.style).toBe(expectedStyle.id);
        expect(repeat.items.map((item) => item.id)).toEqual(ids);
        expect(publicLineup.map((item) => item.id)).toEqual(ids);
        expect(ids).toHaveLength(8);
        expect(new Set(ids).size).toBe(8);
        expect(footballKeepCutBoardIsCompetitive(board.items, pack.items)).toBe(true);
        expect(board.badItems).toBeLessThanOrEqual(2);
        expect(board.eliteItems).toBeLessThanOrEqual(footballKeepCutEliteCap(pack.items));
        expect(board.distinctTiers).toBeGreaterThanOrEqual(footballKeepCutRequiredDistinctTiers(pack.items));
        expect(board.cutoffGap).toBeLessThanOrEqual(8);
        if (board.cutoffGap <= 4) tightCutoffBoards += 1;
        cutoffTotal += board.cutoffGap;
        signatures.add(`${pack.id}:${[...ids].sort().join("|")}`);

        if (hasBad) {
          badEligibleBoards += 1;
          if (board.badItems >= 1) badBoards += 1;
          if (board.badItems === 2) twoBadBoards += 1;
        }
        if (hasElite) {
          eliteEligibleBoards += 1;
          if (board.eliteItems >= 1) eliteBoards += 1;
          if (board.eliteItems === 2) twoEliteBoards += 1;
        }

        const perfect = scoreFootballKeepCutSelection(board.items, ordered.slice(0, 4).map((item) => item.id));
        expect(perfect.score).toBe(100);
        expect(perfect.topFourKept).toBe(4);

        for (const item of board.items) {
          packSeen.add(item.id);
          packAppearances.set(item.id, (packAppearances.get(item.id) ?? 0) + 1);
        }
      }
    }

    for (const [packId, seen] of seenByPack) {
      const pack = footballRankFivePacks.find((row) => row.id === packId)!;
      expect(share(seen.size, pack.items.length), `${packId} Keep/Cut coverage`).toBeGreaterThanOrEqual(0.6);
      expectTierBalancedExposure(pack, appearancesByPack.get(packId)!, 8, "Keep/Cut");
    }

    expect(signatures.size).toBeGreaterThan(totalBoards * 0.9);
    expect(share(tightCutoffBoards, totalBoards)).toBeGreaterThanOrEqual(0.8);
    expect(cutoffTotal / totalBoards).toBeLessThanOrEqual(4.2);
    expect(share(badBoards, badEligibleBoards)).toBeGreaterThanOrEqual(0.2);
    expect(share(badBoards, badEligibleBoards)).toBeLessThanOrEqual(0.5);
    expect(share(twoBadBoards, badEligibleBoards)).toBeGreaterThanOrEqual(0.01);
    expect(share(eliteBoards, eliteEligibleBoards)).toBeGreaterThanOrEqual(0.12);
    expect(share(twoEliteBoards, eliteEligibleBoards)).toBeLessThanOrEqual(0.08);

    expect(share(styleCounts["knife-edge"]!, totalBoards)).toBeGreaterThanOrEqual(0.36);
    expect(share(styleCounts["knife-edge"]!, totalBoards)).toBeLessThanOrEqual(0.44);
    expect(share(styleCounts["messy-middle"]!, totalBoards)).toBeGreaterThanOrEqual(0.26);
    expect(share(styleCounts["messy-middle"]!, totalBoards)).toBeLessThanOrEqual(0.34);
    expect(share(styleCounts["one-superstar"]!, totalBoards)).toBeGreaterThanOrEqual(0.12);
    expect(share(styleCounts["one-superstar"]!, totalBoards)).toBeLessThanOrEqual(0.18);
    expect(share(styleCounts["bottom-grind"]!, totalBoards)).toBeGreaterThanOrEqual(0.07);
    expect(share(styleCounts["bottom-grind"]!, totalBoards)).toBeLessThanOrEqual(0.13);
    expect(share(styleCounts["classic-spread"]!, totalBoards)).toBeGreaterThanOrEqual(0.03);
    expect(share(styleCounts["classic-spread"]!, totalBoards)).toBeLessThanOrEqual(0.08);
  });
});
