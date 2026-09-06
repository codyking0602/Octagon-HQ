import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { footballGameComparisonCandidates } from "../games/gameSourceAuthority";
import {
  buildFootballBlindRankBoard,
  buildFootballKeepCutBoard,
  footballBlindRankBoardTypeForSeed,
  footballKeepCutBoardTypeForSeed,
  FOOTBALL_BLIND_RANK_ARCHETYPES,
  FOOTBALL_KEEP_CUT_BOARD_STYLES,
  type FootballBoardTypeId,
} from "./footballComparisonGeneration";
import { footballCareerCfbDisplayProgram } from "./footballCareerMediaContext";
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

const AUDIT_PACKS = [
  ["nfl-quarterbacks", "NFL QB Careers"],
  ["nfl-running-backs", "NFL RB Careers"],
  ["nfl-wide-receivers", "NFL WR Careers"],
  ["nfl-tight-ends", "NFL TE Careers"],
  ["nfl-defensive-players", "NFL Defensive Careers"],
  ["nfl-head-coaches", "NFL Head Coaches"],
  ["nfl-qb-seasons", "NFL QB Seasons"],
  ["nfl-team-seasons", "NFL Team Seasons"],
  ["college-quarterbacks", "College QBs"],
  ["college-head-coaches", "CFB Head Coaches"],
  ["college-programs", "Programs Since 2000"],
  ["college-program-eras", "CFB Program Eras"],
  ["college-team-seasons", "CFB Team Seasons"],
] as const satisfies readonly (readonly [FootballRankFivePackId, string])[];

const auditPools = new Map<FootballRankFivePackId, readonly RecognizableItem[]>(
  AUDIT_PACKS.map(([packId]) => [packId, footballGameComparisonCandidates(packId) as readonly RecognizableItem[]]),
);

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

describe("Football Blind Rank 5 + Keep 4 / Cut 4 readiness", () => {
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

  it("audits deterministic boards across all 13 canonical comparison packs", () => {
    for (const [packId, label] of AUDIT_PACKS) {
      const pool = auditPools.get(packId)!;
      expect(pool.length, `${label} pool`).toBeGreaterThanOrEqual(8);
      const availableTierCount = footballGreatnessTiersForCategory(pool).length;
      const recognizable = recognizableCount(pool);
      const blindTextures = new Set<string>();
      const keepCutTextures = new Set<string>();

      for (let index = 0; index < 32; index += 1) {
        const seed = `readiness-${packId}-${index}`;
        const blind = buildFootballBlindRankBoard(pool, packId, seed);
        const keepCut = buildFootballKeepCutBoard(pool, packId, seed);

        expect(blind.items, `${label} blind count`).toHaveLength(5);
        expect(new Set(blind.items.map((row) => row.id)).size, `${label} blind unique`).toBe(5);
        if (availableTierCount > 1) {
          expect(new Set(blind.items.map(footballGreatnessTierForItem)).size, `${label} blind tier diversity`).toBeGreaterThan(1);
        }
        expect(keepCut.items, `${label} keep/cut count`).toHaveLength(8);
        expect(new Set(keepCut.items.map((row) => row.id)).size, `${label} keep/cut unique`).toBe(8);

        if (pool.length >= 10 && recognizable >= 4) {
          expect(recognizableCount(blind.items as RecognizableItem[]), `${label} blind recognizability`).toBeGreaterThanOrEqual(2);
        }
        if (pool.length >= 16 && recognizable >= 6) {
          expect(recognizableCount(keepCut.items as RecognizableItem[]), `${label} keep/cut recognizability`).toBeGreaterThanOrEqual(3);
        }

        blindTextures.add(tierSignature(blind.items, pool));
        keepCutTextures.add(tierSignature(keepCut.items, pool));
      }

      if (pool.length >= 16 && availableTierCount >= 3) {
        expect(blindTextures.size, `${label} blind texture variety`).toBeGreaterThan(1);
        expect(keepCutTextures.size, `${label} keep/cut texture variety`).toBeGreaterThan(1);
      }
    }
  });

  it("keeps reveal position independent from tier strength", () => {
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

  it("relaxes shape constraints inside the same generator for genuinely sparse tier distributions", () => {
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
    expect(source).toContain("if (sharedRun) reset(run)");
    expect(source).toContain("const lineup = itemIds.map((id) => pack.items.find((item) => item.id === id))");
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
