import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { footballCareerCfbDisplayProgram } from "./footballCareerMediaContext";
import {
  buildFootballBlindRankBoard,
  buildFootballKeepCutBoard,
  footballBlindRankBoardTypeForSeed,
  footballKeepCutBoardTypeForSeed,
  FOOTBALL_BLIND_RANK_ARCHETYPES,
  FOOTBALL_KEEP_CUT_BOARD_STYLES,
  type FootballBoardTypeId,
} from "./footballComparisonGeneration";
import {
  footballGreatnessTierForItem,
  footballGreatnessTiersForCategory,
  scoreFootballBlindRankTierOrder,
} from "./footballGreatnessTier";
import { scoreFootballKeepCutSelection } from "./footballKeepCutModel";
import {
  footballRankFivePacks,
  getFootballRankFivePack,
  type FootballRankFiveItem,
  type FootballRankFivePackId,
} from "./footballRankFivePlayableModel";
import { footballSubjectAsset } from "./footballSubjectAssets";
import { getFootballSubject } from "./footballSubjectRegistry";

type RecognizableItem = FootballRankFiveItem & { recognizabilityTier?: "A" | "B" | "C" | "D" };

const RETIRED_RANK_FIVE_IDS = [
  "nfl-defensive-players",
  "nfl-qb-seasons",
  "nfl-team-seasons",
  "college-programs",
  "college-team-seasons",
] as const;

const FOCUSED_CONTENT_PACK_IDS = [
  "college-running-backs",
  "college-head-coaches",
  "nfl-team-eras",
] as const satisfies readonly FootballRankFivePackId[];

function tierSignature(board: readonly FootballRankFiveItem[], pool: readonly FootballRankFiveItem[]) {
  return footballGreatnessTiersForCategory(pool)
    .map((tier) => board.filter((item) => footballGreatnessTierForItem(item) === tier).length)
    .join("-");
}

function recognizableCount(items: readonly RecognizableItem[]) {
  return items.filter((item) => item.recognizabilityTier === "A" || item.recognizabilityTier === "B").length;
}

function countBoardTypes(game: "blind" | "keep-cut", sampleSize: number) {
  const counts = new Map<FootballBoardTypeId, number>();
  for (let index = 0; index < sampleSize; index += 1) {
    const row = game === "blind"
      ? footballBlindRankBoardTypeForSeed("frequency-audit", `seed-${index}`)
      : footballKeepCutBoardTypeForSeed("frequency-audit", `seed-${index}`);
    counts.set(row.id, (counts.get(row.id) ?? 0) + 1);
  }
  return counts;
}

function expectWeights(
  rows: readonly { id: FootballBoardTypeId; weight: number }[],
  counts: ReadonlyMap<FootballBoardTypeId, number>,
  sampleSize: number,
) {
  for (const row of rows) {
    const actual = (counts.get(row.id) ?? 0) / sampleSize;
    expect(Math.abs(actual - row.weight), `${row.id}: expected ${row.weight}, got ${actual}`).toBeLessThan(0.015);
  }
}

function item(id: string, rating: number, recognizabilityTier?: RecognizableItem["recognizabilityTier"]): RecognizableItem {
  return {
    id,
    name: id,
    subtitle: "test",
    league: "NFL",
    rating,
    ...(recognizabilityTier ? { recognizabilityTier } : {}),
  };
}

function normalizedName(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function focusedContentSummary() {
  return FOCUSED_CONTENT_PACK_IDS.map((packId) => {
    const pack = getFootballRankFivePack(packId);
    const tiers = footballGreatnessTiersForCategory(pack.items);
    const subjectsByTier = Object.fromEntries(tiers.map((tier) => [
      tier,
      pack.items
        .filter((candidate) => footballGreatnessTierForItem(candidate) === tier)
        .map((candidate) => candidate.name),
    ]));
    return {
      id: pack.id,
      name: pack.name,
      subjectCount: pack.items.length,
      recognizableCount: recognizableCount(pack.items as readonly RecognizableItem[]),
      tierCounts: Object.fromEntries(tiers.map((tier) => [tier, subjectsByTier[tier]?.length ?? 0])),
      strongestTier: tiers[0] ?? null,
      strongestSubjects: tiers[0] ? subjectsByTier[tiers[0]] : [],
      weakestTier: tiers.at(-1) ?? null,
      weakestSubjects: tiers.at(-1) ? subjectsByTier[tiers.at(-1)!] : [],
      subjectsByTier,
    };
  });
}

describe("Football Blind Rank 5 + Keep 4 / Cut 4 readiness", () => {
  it("derives the readiness universe from the canonical playable pack owner and excludes retired IDs", () => {
    expect(footballRankFivePacks).toHaveLength(12);
    expect(new Set(footballRankFivePacks.map((pack) => pack.id)).size).toBe(footballRankFivePacks.length);

    const playableIds = new Set(footballRankFivePacks.map((pack) => pack.id));
    for (const retiredId of RETIRED_RANK_FIVE_IDS) {
      expect(playableIds.has(retiredId as FootballRankFivePackId), retiredId).toBe(false);
      expect(() => getFootballRankFivePack(retiredId as FootballRankFivePackId), retiredId).toThrow();
    }
  });

  it("keeps the three final-review pools free of duplicate subject names", () => {
    for (const packId of FOCUSED_CONTENT_PACK_IDS) {
      const pack = getFootballRankFivePack(packId);
      expect(
        new Set(pack.items.map((candidate) => normalizedName(candidate.name))).size,
        `${pack.name} duplicate names`,
      ).toBe(pack.items.length);
    }
  });

  it("uses the requested football-specific weighted board lottery", () => {
    expect(FOOTBALL_BLIND_RANK_ARCHETYPES.map(({ id, weight }) => [id, weight])).toEqual([
      ["wild-card", 0.35],
      ["loaded", 0.15],
      ["middle-maze", 0.15],
      ["top-bottom", 0.10],
      ["knife-edge", 0.15],
      ["ladder", 0.10],
    ]);
    expect(FOOTBALL_KEEP_CUT_BOARD_STYLES.map(({ id, weight }) => [id, weight])).toEqual([
      ["wild-card", 0.30],
      ["loaded", 0.15],
      ["middle-maze", 0.15],
      ["top-bottom", 0.15],
      ["knife-edge", 0.20],
      ["ladder", 0.05],
    ]);

    const sampleSize = 12_000;
    expectWeights(FOOTBALL_BLIND_RANK_ARCHETYPES, countBoardTypes("blind", sampleSize), sampleSize);
    expectWeights(FOOTBALL_KEEP_CUT_BOARD_STYLES, countBoardTypes("keep-cut", sampleSize), sampleSize);
  });

  it("treats same-tier swaps as equal in Blind Rank even when raw ratings disagree", () => {
    const tierCorrect = [
      item("tom-brady", 1),
      item("lawrence-taylor", 2),
      item("drew-brees", 5),
      item("derrick-henry", 100),
      item("eli-manning", 99),
    ];
    const swappedEquals = [tierCorrect[0]!, tierCorrect[1]!, tierCorrect[3]!, tierCorrect[2]!, tierCorrect[4]!];

    expect(footballGreatnessTierForItem(tierCorrect[2]!)).toBe("great");
    expect(footballGreatnessTierForItem(tierCorrect[3]!)).toBe("great");
    expect(scoreFootballBlindRankTierOrder(tierCorrect).normalizedScore).toBe(100);
    expect(scoreFootballBlindRankTierOrder(swappedEquals).normalizedScore).toBe(100);
  });

  it("gives Keep/Cut full credit to any valid choice inside a tied cutoff tier", () => {
    const board = [
      item("lawrence-taylor", 1),
      item("reggie-white", 2),
      item("derrick-brooks", 100),
      item("junior-seau", 1),
      item("terrell-suggs", 99),
      item("patrick-willis", 2),
      item("clay-matthews", 100),
      item("ryan-kerrigan", 1),
    ];
    const firstEqualChoice = scoreFootballKeepCutSelection(board, [
      "lawrence-taylor", "reggie-white", "derrick-brooks", "junior-seau",
    ]);
    const secondEqualChoice = scoreFootballKeepCutSelection(board, [
      "lawrence-taylor", "reggie-white", "terrell-suggs", "patrick-willis",
    ]);

    expect(firstEqualChoice.score).toBe(100);
    expect(secondEqualChoice.score).toBe(100);
    expect(firstEqualChoice.correctComparisons).toBe(16);
    expect(secondEqualChoice.correctComparisons).toBe(16);
  });

  it("simulates both games deterministically across every current playable pack", () => {
    const seedsPerPack = 64;
    let totalBlindBoards = 0;
    let totalKeepCutBoards = 0;
    let knifeEdgeBoards = 0;
    let tiedKnifeEdges = 0;

    for (const pack of footballRankFivePacks) {
      const pool = pack.items as readonly RecognizableItem[];
      expect(pool.length, `${pack.name} pool`).toBeGreaterThanOrEqual(8);
      expect(new Set(pool.map((candidate) => candidate.id)).size, `${pack.name} duplicate IDs`).toBe(pool.length);

      const availableTierCount = footballGreatnessTiersForCategory(pool).length;
      const recognizable = recognizableCount(pool);
      const blindTextures = new Set<string>();
      const keepCutTextures = new Set<string>();

      for (let index = 0; index < seedsPerPack; index += 1) {
        const seed = `readiness-${pack.id}-${index}`;
        const blind = buildFootballBlindRankBoard(pool, pack.id, seed);
        const repeatBlind = buildFootballBlindRankBoard(pool, pack.id, seed);
        const keepCut = buildFootballKeepCutBoard(pool, pack.id, seed);
        const repeatKeepCut = buildFootballKeepCutBoard(pool, pack.id, seed);

        totalBlindBoards += 1;
        totalKeepCutBoards += 1;

        expect(blind.items, `${pack.name} blind count`).toHaveLength(5);
        expect(new Set(blind.items.map((row) => row.id)).size, `${pack.name} blind unique`).toBe(5);
        expect(repeatBlind.items.map((row) => row.id), `${pack.name} blind deterministic`)
          .toEqual(blind.items.map((row) => row.id));
        expect(repeatBlind.boardType, `${pack.name} blind board type deterministic`).toBe(blind.boardType);
        if (availableTierCount > 1) {
          expect(new Set(blind.items.map(footballGreatnessTierForItem)).size, `${pack.name} blind tier diversity`).toBeGreaterThan(1);
        }

        expect(keepCut.items, `${pack.name} keep/cut count`).toHaveLength(8);
        expect(new Set(keepCut.items.map((row) => row.id)).size, `${pack.name} keep/cut unique`).toBe(8);
        expect(repeatKeepCut.items.map((row) => row.id), `${pack.name} keep/cut deterministic`)
          .toEqual(keepCut.items.map((row) => row.id));
        expect(repeatKeepCut.boardType, `${pack.name} keep/cut board type deterministic`).toBe(keepCut.boardType);
        if (availableTierCount > 1) {
          expect(new Set(keepCut.items.map(footballGreatnessTierForItem)).size, `${pack.name} keep/cut tier diversity`).toBeGreaterThan(1);
        }

        if (pool.length >= 10 && recognizable >= 4) {
          expect(recognizableCount(blind.items as RecognizableItem[]), `${pack.name} blind recognizability`).toBeGreaterThanOrEqual(2);
        }
        if (pool.length >= 16 && recognizable >= 6) {
          expect(recognizableCount(keepCut.items as RecognizableItem[]), `${pack.name} keep/cut recognizability`).toBeGreaterThanOrEqual(3);
        }

        if (keepCut.boardType === "knife-edge") {
          knifeEdgeBoards += 1;
          if (keepCut.cutoffGap === 0) tiedKnifeEdges += 1;
        }

        blindTextures.add(tierSignature(blind.items, pool));
        keepCutTextures.add(tierSignature(keepCut.items, pool));
      }

      if (pool.length >= 16 && availableTierCount >= 3) {
        expect(blindTextures.size, `${pack.name} blind texture variety`).toBeGreaterThan(1);
        expect(keepCutTextures.size, `${pack.name} keep/cut texture variety`).toBeGreaterThan(1);
      }
    }

    expect(totalBlindBoards).toBe(footballRankFivePacks.length * seedsPerPack);
    expect(totalKeepCutBoards).toBe(footballRankFivePacks.length * seedsPerPack);
    expect(knifeEdgeBoards).toBeGreaterThan(0);
    expect(tiedKnifeEdges / knifeEdgeBoards).toBeGreaterThan(0.5);

    console.info("Football Blind/Keep deterministic readiness", JSON.stringify({
      playablePackCount: footballRankFivePacks.length,
      seedsPerPack,
      totalBlindBoards,
      totalKeepCutBoards,
      knifeEdgeBoards,
      tiedKnifeEdges,
      tiedKnifeEdgeShare: tiedKnifeEdges / knifeEdgeBoards,
      focusedContent: focusedContentSummary(),
    }));
  });

  it("keeps reveal order variable independently from a fixed board composition", () => {
    const pool = [
      item("tom-brady", 1),
      item("randy-moss", 100),
      item("lawrence-taylor", 2),
      item("shannon-sharpe", 99),
      item("drew-brees", 3),
    ];
    const positions = new Set<number>();
    for (let index = 0; index < 160; index += 1) {
      const board = buildFootballBlindRankBoard(pool, "reveal-independence", `reveal-${index}`, "wild-card");
      positions.add(board.items.findIndex((row) => row.id === "tom-brady"));
    }
    expect(positions).toEqual(new Set([0, 1, 2, 3, 4]));
  });

  it("relaxes tier-target distance inside the same generator for genuinely sparse tier distributions", () => {
    const blindSparse = [
      item("derrick-brooks", 1),
      item("junior-seau", 2),
      item("terrell-suggs", 3),
      item("patrick-willis", 4),
      item("clay-matthews", 100),
    ];
    const keepCutSparse = [
      ...blindSparse,
      item("ndamukong-suh", 5),
      item("steve-atwater", 6),
      item("ryan-kerrigan", 99),
    ];

    const blind = buildFootballBlindRankBoard(blindSparse, "sparse", "blind-sparse", "wild-card");
    const keepCut = buildFootballKeepCutBoard(keepCutSparse, "sparse", "keep-sparse");
    expect(blind.items).toHaveLength(5);
    expect(new Set(blind.items.map((row) => row.id)).size).toBe(5);
    expect(new Set(blind.items.map(footballGreatnessTierForItem)).size).toBe(2);
    expect(keepCut.items).toHaveLength(8);
    expect(new Set(keepCut.items.map((row) => row.id)).size).toBe(8);
    expect(new Set(keepCut.items.map(footballGreatnessTierForItem)).size).toBe(2);
  });

  it("can intentionally put the Keep/Cut boundary through an equal Knife Edge tier", () => {
    const pool = [
      item("lawrence-taylor", 1),
      item("reggie-white", 2),
      item("derrick-brooks", 100),
      item("junior-seau", 1),
      item("terrell-suggs", 99),
      item("patrick-willis", 2),
      item("clay-matthews", 100),
      item("ryan-kerrigan", 1),
    ];
    let knifeSeed = "";
    for (let index = 0; index < 100 && !knifeSeed; index += 1) {
      const seed = `knife-${index}`;
      if (footballKeepCutBoardTypeForSeed("knife-proof", seed).id === "knife-edge") knifeSeed = seed;
    }
    expect(knifeSeed).not.toBe("");
    const board = buildFootballKeepCutBoard(pool, "knife-proof", knifeSeed);
    expect(board.boardType).toBe("knife-edge");
    expect(board.cutoffGap).toBe(0);
  });

  it("uses the same canonical generator for the first Keep/Cut board, new rounds, and preserved shared boards", () => {
    const source = readFileSync("src/features/back-room/FootballKeepCutPage.tsx", "utf8");
    expect(source).toContain("sharedRun ?? createRandomFootballKeepCutRun()");
    expect(source).toContain("reset(createRandomFootballKeepCutRun(run.pack.id))");
    expect(source).toContain("if (!sharedRun || run.identity.challengeId === sharedRun.identity.challengeId) return;");
    expect(source).toContain("setRun(sharedRun);");
    expect(source).toContain("if (shared) reset(run);");
    expect(source).toContain("const lineup = lineupIds.flatMap((id) => items.get(id) ? [items.get(id)!] : []);");
  });

  it("keeps CFB career text and logos on the same canonical representative-program relationship", () => {
    const runningBacks = getFootballRankFivePack("college-running-backs");
    const expectedPrograms = new Map([
      ["Aaron Jones", "UTEP"],
      ["Devin Singletary", "Florida Atlantic"],
      ["Chuba Hubbard", "Oklahoma State"],
    ]);

    for (const [name, expectedProgram] of expectedPrograms) {
      const runtimeItem = runningBacks.items.find((row) => row.name === name);
      expect(runtimeItem, name).toBeTruthy();
      const subject = getFootballSubject(runtimeItem!.id);
      expect(subject?.kind, name).toBe("player-career");
      const displayProgram = footballCareerCfbDisplayProgram(subject!);
      expect(displayProgram, name).toBe(expectedProgram);
      expect(runtimeItem!.subtitle, name).toContain(expectedProgram);
      expect(footballSubjectAsset(runtimeItem!.id)?.label, name).toBe(expectedProgram);
    }

    const quarterbacks = getFootballRankFivePack("college-quarterbacks");
    const jayden = quarterbacks.items.find((row) => row.name === "Jayden Daniels");
    expect(jayden).toBeTruthy();
    const jaydenSubject = getFootballSubject(jayden!.id)!;
    const jaydenProgram = footballCareerCfbDisplayProgram(jaydenSubject);
    expect(jaydenProgram).toBeTruthy();
    expect(jayden!.subtitle).toContain(jaydenProgram!);
    expect(footballSubjectAsset(jayden!.id)?.label).toBe(jaydenProgram);
  });

  it("reserves structural media and text lanes for long Keep/Cut names on mobile", () => {
    const css = readFileSync("src/styles/football-visual-assets.css", "utf8");
    expect(css).toContain("grid-template-columns: 74px minmax(0, 1fr) minmax(110px, auto)");
    expect(css).toContain(".football-keep-cut-current > .football-subject-visual");
    expect(css).toContain("min-width: 74px");
    expect(css).toContain(".football-keep-cut-current > div:not(.football-keep-cut-current__actions)");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain("grid-template-columns: 74px minmax(0, 1fr) !important");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
  });

  it("keeps the live product packs on one comparison owner", () => {
    expect(footballRankFivePacks.every((pack) => pack.items.length >= 8)).toBe(true);
    expect(readFileSync("src/features/games/gameSourceAuthority.ts", "utf8"))
      .toContain('owners: ["football-comparison-authority"]');
  });
});
