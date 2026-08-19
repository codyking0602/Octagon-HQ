import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import {
  HIT_THE_NUMBER_GENERATION_PROFILE,
  HIT_THE_NUMBER_MAX_PICKS,
  HIT_THE_NUMBER_MIN_PICKS,
  HIT_THE_NUMBER_STATS,
  createGeneratedHitTheNumberBoard,
  createHitTheNumberBoard,
  gradeHitTheNumberSelection,
  hitTheNumberEligibleFighters,
  hitTheNumberRandomPoolSize,
  hitTheNumberScore,
  rankedHitTheNumberStatRows,
  type HitTheNumberPublicSetup,
  type HitTheNumberStatId,
  type HitTheNumberStatRow,
} from "./hitTheNumberEngine";
import { playFighters } from "./playFighterPool";

const KO_TKO_METHODS = new Set(["ko-tko", "doctor-stoppage"]);
const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);
const TITLE_FIGHT_TYPES = new Set([
  "normal",
  "interim",
  "vacant-undisputed",
  "second-division-undisputed",
  "vacant-second-division",
]);

function expectedLongestWinStreak(
  fights: (typeof canonicalRankingInputs.fighters)[number]["facts"]["fights"],
) {
  let current = 0;
  let longest = 0;
  [...fights]
    .sort((left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id))
    .forEach((fight) => {
      if (fight.officialResult === "win") {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    });
  return longest;
}

function testStatRow(fighterId: string, wins: number): HitTheNumberStatRow {
  return {
    fighterId,
    values: {
      "ufc-fights": wins,
      "ufc-wins": wins,
      "ufc-decision-wins": 0,
      "ufc-finishes": wins,
      "ufc-ko-tko-wins": wins,
      "ufc-submission-wins": 0,
      "ufc-title-fights": 0,
      "ufc-title-fight-wins": 0,
      "ufc-active-years": wins,
      "ufc-winning-years": wins,
      "ufc-longest-win-streak": wins,
      "ufc-unique-opponents-beaten": wins,
    },
  };
}

function statValue(
  rows: readonly HitTheNumberStatRow[],
  fighterId: string,
  statId: HitTheNumberStatId,
) {
  return rows.find((row) => row.fighterId === fighterId)!.values[statId];
}

describe("Hit the Number foundation", () => {
  it("derives the expanded UFC fact catalog from the canonical ranking fight ledgers", () => {
    expect(rankedHitTheNumberStatRows).toHaveLength(canonicalRankingInputs.fighters.length);
    const byId = new Map(rankedHitTheNumberStatRows.map((row) => [row.fighterId, row]));

    for (const fighter of canonicalRankingInputs.fighters) {
      const fights = fighter.facts.fights;
      const wins = fights.filter((fight) => fight.officialResult === "win");
      const titleFights = fights.filter((fight) => (
        TITLE_FIGHT_TYPES.has(fight.championshipType) && fight.championshipEligible !== false
      ));
      expect(byId.get(fighter.presentation.slug)?.values).toEqual({
        "ufc-fights": fights.length,
        "ufc-wins": wins.length,
        "ufc-decision-wins": wins.filter((fight) => fight.methodCategory === "decision").length,
        "ufc-finishes": wins.filter((fight) => FINISH_METHODS.has(fight.methodCategory)).length,
        "ufc-ko-tko-wins": wins.filter((fight) => KO_TKO_METHODS.has(fight.methodCategory)).length,
        "ufc-submission-wins": wins.filter((fight) => fight.methodCategory === "submission").length,
        "ufc-title-fights": titleFights.length,
        "ufc-title-fight-wins": titleFights.filter((fight) => fight.officialResult === "win").length,
        "ufc-active-years": new Set(fights.map((fight) => fight.date.slice(0, 4))).size,
        "ufc-winning-years": new Set(wins.map((fight) => fight.date.slice(0, 4))).size,
        "ufc-longest-win-streak": expectedLongestWinStreak(fights),
        "ufc-unique-opponents-beaten": new Set(
          wins.map((fight) => fight.opponent.trim().toLowerCase()),
        ).size,
      });
    }
  });

  it("defines twelve ledger-backed UFC-only stats", () => {
    expect(HIT_THE_NUMBER_STATS.map((stat) => stat.id)).toEqual([
      "ufc-fights",
      "ufc-wins",
      "ufc-decision-wins",
      "ufc-finishes",
      "ufc-ko-tko-wins",
      "ufc-submission-wins",
      "ufc-title-fights",
      "ufc-title-fight-wins",
      "ufc-active-years",
      "ufc-winning-years",
      "ufc-longest-win-streak",
      "ufc-unique-opponents-beaten",
    ]);
  });

  it("keeps the new catalog inactive until the gameplay weighting PR", () => {
    expect(HIT_THE_NUMBER_GENERATION_PROFILE.stats).toEqual([
      { value: "ufc-wins", weight: 35 },
      { value: "ufc-finishes", weight: 30 },
      { value: "ufc-ko-tko-wins", weight: 25 },
      { value: "ufc-submission-wins", weight: 10 },
    ]);
    expect(HIT_THE_NUMBER_GENERATION_PROFILE.filters).toEqual([
      { value: "all", weight: 55 },
      { value: "division", weight: 45 },
    ]);
    expect(HIT_THE_NUMBER_GENERATION_PROFILE.picks).toEqual([
      { value: 4, weight: 15 },
      { value: 5, weight: 35 },
      { value: 6, weight: 35 },
      { value: 7, weight: 15 },
    ]);
    expect(HIT_THE_NUMBER_GENERATION_PROFILE.stats.reduce((sum, row) => sum + row.weight, 0)).toBe(100);
    expect(HIT_THE_NUMBER_GENERATION_PROFILE.filters.reduce((sum, row) => sum + row.weight, 0)).toBe(100);
    expect(HIT_THE_NUMBER_GENERATION_PROFILE.picks.reduce((sum, row) => sum + row.weight, 0)).toBe(100);
    expect(HIT_THE_NUMBER_STATS).toHaveLength(12);
  });

  it("can build exact open-roster boards for every ledger-backed stat", () => {
    for (const stat of HIT_THE_NUMBER_STATS) {
      const board = createHitTheNumberBoard({
        seed: `catalog-${stat.id}`,
        statId: stat.id,
        boardType: "open-roster",
        pickCount: 4,
      });
      expect(board.publicSetup.statId).toBe(stat.id);
      expect(board.publicSetup.target).toBeGreaterThan(0);
      expect(board.privateSetup.solutionFighterIds).toHaveLength(4);
    }
  });

  it("sizes Random Pool boards with meaningful decoys", () => {
    expect([4, 5, 6, 7].map((pickCount) => hitTheNumberRandomPoolSize(pickCount))).toEqual([8, 10, 12, 12]);
  });

  it("filters the canonical Play roster before building an open-roster board", () => {
    const board = createHitTheNumberBoard({
      seed: "lightweight-open-roster",
      statId: "ufc-wins",
      boardType: "open-roster",
      filter: { division: "Lightweight" },
      pickCount: 5,
    });
    const expected = hitTheNumberEligibleFighters("ufc-wins", { division: "Lightweight" });
    const byId = new Map(playFighters.map((fighter) => [fighter.id, fighter]));

    expect(board.publicSetup.fighterIds).toEqual(expected.map((fighter) => fighter.id));
    expect(board.publicSetup.fighterIds.length).toBeGreaterThanOrEqual(5);
    for (const fighterId of board.publicSetup.fighterIds) {
      expect(byId.get(fighterId)?.divisions).toContain("Lightweight");
    }
  });

  it("varies the required picks from four through seven and always creates an exact target", () => {
    const observed = new Set<number>();
    const byId = new Map(rankedHitTheNumberStatRows.map((row) => [row.fighterId, row]));

    for (let index = 0; index < 80; index += 1) {
      const board = createHitTheNumberBoard({
        seed: `dynamic-${index}`,
        statId: "ufc-wins",
        boardType: "open-roster",
      });
      observed.add(board.publicSetup.pickCount);
      expect(board.publicSetup.pickCount).toBeGreaterThanOrEqual(HIT_THE_NUMBER_MIN_PICKS);
      expect(board.publicSetup.pickCount).toBeLessThanOrEqual(HIT_THE_NUMBER_MAX_PICKS);
      expect(new Set(board.privateSetup.solutionFighterIds).size).toBe(board.publicSetup.pickCount);
      const total = board.privateSetup.solutionFighterIds.reduce(
        (sum, fighterId) => sum + byId.get(fighterId)!.values["ufc-wins"],
        0,
      );
      expect(total).toBe(board.publicSetup.target);
    }

    expect(observed).toEqual(new Set([4, 5, 6, 7]));
  });

  it("generates the whole casual challenge from only the seed and chosen board type", () => {
    const observedStats = new Set<string>();
    const observedPicks = new Set<number>();
    const observedFilters = new Set<string>();

    for (let index = 0; index < 160; index += 1) {
      const boardType = index % 2 === 0 ? "open-roster" : "random-pool";
      const board = createGeneratedHitTheNumberBoard({
        seed: `generated-${index}`,
        boardType,
      });
      const setup = board.publicSetup;
      observedStats.add(setup.statId);
      observedPicks.add(setup.pickCount);
      observedFilters.add(setup.filter.division ? "division" : "all");
      expect(setup.boardType).toBe(boardType);
      expect(setup.target).toBeGreaterThan(0);
      expect(board.privateSetup.solutionFighterIds).toHaveLength(setup.pickCount);
      if (boardType === "random-pool") {
        expect(setup.fighterIds).toHaveLength(hitTheNumberRandomPoolSize(setup.pickCount));
        expect(setup.fighterIds.length).toBeGreaterThan(setup.pickCount);
        expect(setup.fighterIds.length).toBeLessThanOrEqual(12);
      }
    }

    expect(observedStats).toEqual(new Set(HIT_THE_NUMBER_GENERATION_PROFILE.stats.map((stat) => stat.value)));
    expect(observedPicks).toEqual(new Set([4, 5, 6, 7]));
    expect(observedFilters).toEqual(new Set(["all", "division"]));
  });

  it("caps generated pick count to the positive fighter depth in narrow pools", () => {
    const fighters = playFighters.slice(0, 6);
    const rows = fighters.map((fighter, index) => testStatRow(fighter.id, index < 4 ? index + 1 : 0));
    const board = createHitTheNumberBoard({
      seed: "four-positive-fighters",
      statId: "ufc-wins",
      boardType: "open-roster",
      statRows: rows,
    });

    expect(board.publicSetup.pickCount).toBe(4);
    expect(board.privateSetup.solutionFighterIds).toHaveLength(4);
  });

  it("supports a curated target only when an exact solution exists", () => {
    const fighters = playFighters.slice(0, 8);
    const values = [5, 10, 15, 20, 25, 30, 35, 40];
    const rows = fighters.map((fighter, index) => testStatRow(fighter.id, values[index]!));
    const board = createHitTheNumberBoard({
      seed: "curated-fifty",
      statId: "ufc-ko-tko-wins",
      boardType: "open-roster",
      target: 50,
      pickCount: 4,
      statRows: rows,
    });

    expect(board.publicSetup.target).toBe(50);
    expect(board.publicSetup.pickCount).toBe(4);
    expect(board.privateSetup.solutionFighterIds).toHaveLength(4);
    expect(board.privateSetup.solutionFighterIds.reduce(
      (sum, fighterId) => sum + statValue(rows, fighterId, "ufc-ko-tko-wins"),
      0,
    )).toBe(50);

    expect(() => createHitTheNumberBoard({
      seed: "impossible-target",
      statId: "ufc-ko-tko-wins",
      boardType: "open-roster",
      target: 1,
      pickCount: 4,
      statRows: rows,
    })).toThrow("No exact ufc-ko-tko-wins solution exists for target 1.");
  });

  it("builds a random pool around the hidden exact solution without exposing values", () => {
    const board = createHitTheNumberBoard({
      seed: "random-pool",
      statId: "ufc-wins",
      boardType: "random-pool",
      pickCount: 6,
      randomPoolSize: 12,
    });

    expect(board.publicSetup.fighterIds).toHaveLength(12);
    expect(new Set(board.publicSetup.fighterIds).size).toBe(12);
    for (const fighterId of board.privateSetup.solutionFighterIds) {
      expect(board.publicSetup.fighterIds).toContain(fighterId);
    }
    expect(Object.keys(board.publicSetup)).not.toContain("solutionFighterIds");
    expect(JSON.stringify(board.publicSetup)).not.toContain("values");
  });

  it("rejects a Random Pool that would make every fighter mandatory", () => {
    expect(() => createHitTheNumberBoard({
      seed: "no-decoys",
      statId: "ufc-wins",
      boardType: "random-pool",
      pickCount: 4,
      randomPoolSize: 4,
    })).toThrow("Random Hit the Number pool must include at least one decoy.");
  });

  it("is deterministic for the same seed and board contract", () => {
    const options = {
      seed: "same-board",
      statId: "ufc-wins" as const,
      boardType: "random-pool" as const,
      filter: { gender: "men" as const },
    };
    expect(createHitTheNumberBoard(options)).toEqual(createHitTheNumberBoard(options));
    expect(createGeneratedHitTheNumberBoard({ seed: "generated-same", boardType: "open-roster" }))
      .toEqual(createGeneratedHitTheNumberBoard({ seed: "generated-same", boardType: "open-roster" }));
  });

  it("normalizes a good under result near 80 and makes busting meaningfully worse", () => {
    expect(hitTheNumberScore({
      status: "under",
      target: 93,
      distance: 5,
      pickCount: 7,
    })).toBe(81);
    expect(hitTheNumberScore({
      status: "under",
      target: 93,
      distance: 1,
      pickCount: 7,
    })).toBe(96);
    expect(hitTheNumberScore({
      status: "bust",
      target: 93,
      distance: 1,
      pickCount: 7,
    })).toBe(71);
    expect(hitTheNumberScore({
      status: "perfect",
      target: 93,
      distance: 0,
      pickCount: 7,
    })).toBe(100);
  });

  it("grades exact, under, and over totals with Price Is Right rules and the shared score curve", () => {
    const rows = [
      testStatRow("a", 11),
      testStatRow("b", 12),
      testStatRow("c", 13),
      testStatRow("d", 14),
      testStatRow("e", 15),
      testStatRow("f", 16),
    ];
    const setup: HitTheNumberPublicSetup = {
      version: "hit-the-number-v1",
      statId: "ufc-wins",
      boardType: "open-roster",
      target: 50,
      pickCount: 4,
      filter: {},
      fighterIds: rows.map((row) => row.fighterId),
    };

    expect(gradeHitTheNumberSelection(setup, ["a", "b", "c", "d"], rows)).toMatchObject({
      status: "perfect",
      total: 50,
      distance: 0,
      score: 100,
    });
    expect(gradeHitTheNumberSelection(setup, ["a", "b", "c", "e"], rows)).toMatchObject({
      status: "bust",
      total: 51,
      distance: 1,
      score: 71,
    });
    expect(() => gradeHitTheNumberSelection(setup, ["a", "b", "c", "a"], rows)).toThrow(
      "Hit the Number selections must be unique.",
    );

    const underRows = [
      testStatRow("a", 10),
      testStatRow("b", 10),
      testStatRow("c", 10),
      testStatRow("d", 19),
    ];
    expect(gradeHitTheNumberSelection(
      { ...setup, fighterIds: underRows.map((row) => row.fighterId) },
      ["a", "b", "c", "d"],
      underRows,
    )).toMatchObject({
      status: "under",
      total: 49,
      distance: 1,
      score: 96,
    });
  });
});
