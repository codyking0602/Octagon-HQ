import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import {
  HIT_THE_NUMBER_GENERATION_PROFILE,
  HIT_THE_NUMBER_MAX_PICKS,
  HIT_THE_NUMBER_MIN_PICKS,
  HIT_THE_NUMBER_STATS,
  HIT_THE_NUMBER_VERSION,
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
import { deriveUfcCareerStats } from "./ufcCareerStats";

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
  const value = rows.find((row) => row.fighterId === fighterId)?.values[statId];
  if (!Number.isInteger(value) || value == null) {
    throw new Error(`Missing ${statId} in test row ${fighterId}.`);
  }
  return value;
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
      const shared = deriveUfcCareerStats(fights, "official");
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
        ...(shared.mainEvents == null ? {} : { "ufc-main-events": shared.mainEvents }),
        ...(shared.bonusAwards == null ? {} : { "ufc-bonus-awards": shared.bonusAwards }),
        ...(shared.firstRoundFinishes == null ? {} : { "ufc-first-round-finishes": shared.firstRoundFinishes }),
        ...(shared.knockdownsFor == null ? {} : { "ufc-knockdowns-landed": shared.knockdownsFor }),
      });
    }
  });

  it("defines and activates a balanced sixteen-stat UFC-only mix", () => {
    const statIds = HIT_THE_NUMBER_STATS.map((stat) => stat.id);
    expect(statIds).toEqual([
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
      "ufc-main-events",
      "ufc-bonus-awards",
      "ufc-first-round-finishes",
      "ufc-knockdowns-landed",
    ]);
    expect(HIT_THE_NUMBER_GENERATION_PROFILE.stats).toEqual([
      { value: "ufc-fights", weight: 8 },
      { value: "ufc-wins", weight: 8 },
      { value: "ufc-decision-wins", weight: 5 },
      { value: "ufc-finishes", weight: 8 },
      { value: "ufc-ko-tko-wins", weight: 7 },
      { value: "ufc-submission-wins", weight: 5 },
      { value: "ufc-title-fights", weight: 7 },
      { value: "ufc-title-fight-wins", weight: 6 },
      { value: "ufc-active-years", weight: 5 },
      { value: "ufc-winning-years", weight: 4 },
      { value: "ufc-longest-win-streak", weight: 6 },
      { value: "ufc-unique-opponents-beaten", weight: 5 },
      { value: "ufc-main-events", weight: 7 },
      { value: "ufc-bonus-awards", weight: 7 },
      { value: "ufc-first-round-finishes", weight: 5 },
      { value: "ufc-knockdowns-landed", weight: 7 },
    ]);
    expect(HIT_THE_NUMBER_GENERATION_PROFILE.stats.map((stat) => stat.value)).toEqual(statIds);
    expect(Math.max(...HIT_THE_NUMBER_GENERATION_PROFILE.stats.map((stat) => stat.weight))).toBeLessThanOrEqual(8);
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
    expect(HIT_THE_NUMBER_STATS).toHaveLength(16);
  });

  it("can build exact open-roster boards for every activated stat", () => {
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

  it("keeps unavailable supplemental facts out of only the affected stat pool", () => {
    const fighters = playFighters.slice(0, 5);
    const rows = fighters.map((fighter, index) => ({
      ...testStatRow(fighter.id, index + 1),
      values: {
        ...testStatRow(fighter.id, index + 1).values,
        ...(index === 0 ? {} : { "ufc-main-events": index }),
      },
    }));

    expect(hitTheNumberEligibleFighters("ufc-wins", {}, rows).map((fighter) => fighter.id))
      .toEqual(fighters.map((fighter) => fighter.id));
    expect(hitTheNumberEligibleFighters("ufc-main-events", {}, rows).map((fighter) => fighter.id))
      .toEqual(fighters.slice(1).map((fighter) => fighter.id));
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
        (sum, fighterId) => sum + statValue(rankedHitTheNumberStatRows, fighterId, "ufc-wins"),
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

    for (let index = 0; index < 400; index += 1) {
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
      version: HIT_THE_NUMBER_VERSION,
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
