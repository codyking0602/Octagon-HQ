import { describe, expect, it } from "vitest";
import { canonicalRankingInputs, historicalRankingMigrationInputs } from "./rankingInputs";
import { calculatedRankingProjection, getFighter } from "../rankingModel";
import {
  calculateApex,
  calculateChampionship,
  calculateEraDepth,
  calculateLongevity,
  calculateLossContext,
  calculateOpponentQuality,
  calculatePrimeDominance,
} from "../engine/categoryCalculators";
import { resolveEraWindow } from "../engine/eraWindow";
import { buildRankingProjection } from "../engine/rankingEngine";
import { rankingContract } from "../engine/rankingContract";

const fighterNames = [
  "Petr Yan",
  "Merab Dvalishvili",
  "Alexander Volkanovski",
  "Deiveson Figueiredo",
  "Rafael dos Anjos",
] as const;
type FighterName = (typeof fighterNames)[number];

function fighter(name: FighterName) {
  const row = canonicalRankingInputs.fighters.find((input) => input.fighter === name);
  if (!row) throw new Error(`Missing UFC all-time fighter: ${name}`);
  return row;
}

/**
 * Reconstruct ONLY the five pre-refresh inputs while retaining the October 27
 * model cutoff already live on main (including Gane and Natalia Silva).
 * This runs the SAME V2 category calculators and
 * ranking projection on both sides; no manually chosen ranks or scores.
 */
function beforeOctoberProjection() {
  const baseline = new Map(
    historicalRankingMigrationInputs.fighters.map((input) => [input.fighter, input]),
  );
  const earlier = canonicalRankingInputs.fighters.map((current) => {
    if (fighterNames.includes(current.fighter as FighterName) &&
        current.fighter !== "Rafael dos Anjos") {
      return baseline.get(current.fighter) ?? current;
    }
    if (current.fighter === "Rafael dos Anjos") {
      return {
        ...current,
        facts: {
          ...current.facts,
          fights: current.facts.fights.filter(
            (fight) => fight.id !== "2026-10-03-alexander-hernandez",
          ),
        },
      };
    }
    return current;
  });

  const seeds = earlier.map((input) => {
    const eraWindow = resolveEraWindow(input.facts.fights, input.era.window);
    const championship = calculateChampionship(input.judgments.championship);
    const opponentQuality = calculateOpponentQuality(input.judgments.opponentQuality);
    const primeDominance = calculatePrimeDominance({
      fighter: input.fighter,
      fights: input.facts.fights,
      window: eraWindow,
    });
    const longevity = calculateLongevity({
      fighter: input.fighter,
      fights: input.facts.fights,
      window: eraWindow,
      modelAsOfDate: canonicalRankingInputs.source.modelAsOfDate,
      statusMultiplier: input.era.statusMultiplier,
      divisionMultiplier: input.era.divisionMultiplier,
    });
    const apex = calculateApex(input.judgments.apex);
    const penalty = calculateLossContext({
      fighter: input.fighter,
      fights: input.facts.fights,
      window: eraWindow,
      divisionMultiplier: input.era.divisionMultiplier,
    });
    const eraDepth = calculateEraDepth(input.eraDepth);
    return {
      fighter: input.fighter,
      board: input.board,
      categories: {
        championship: championship.score,
        opponentQuality: opponentQuality.score,
        primeDominance: primeDominance.score,
        longevity: longevity.score,
      },
      modifiers: {
        apex: apex.score,
        penalty: penalty.penalty,
        eraDepth: eraDepth.adjustment,
      },
    };
  });
  return buildRankingProjection(seeds, rankingContract).rows;
}

const beforeRows = beforeOctoberProjection();
const afterRows = calculatedRankingProjection.rows;
function find(rows: typeof beforeRows, name: FighterName) {
  const row = rows.find((candidate) => candidate.fighter === name);
  if (!row) throw new Error(`Ranking projection missing ${name}`);
  return row;
}
function divisionalPosition(rows: typeof beforeRows, name: FighterName) {
  const current = fighter(name);
  return rows.filter((row) =>
    row.board === current.board &&
    canonicalRankingInputs.fighters.some(
      (input) => input.fighter === row.fighter &&
                 input.facts.identity.primaryDivision === current.facts.identity.primaryDivision,
    ),
  ).sort((a, b) => a.rank - b.rank).findIndex((row) => row.fighter === name) + 1;
}
function neighbors(rows: typeof beforeRows, name: FighterName) {
  const board = rows.filter((row) => row.board === fighter(name).board)
    .sort((a, b) => a.rank - b.rank);
  const index = board.findIndex((row) => row.fighter === name);
  return { above: board[index - 1]?.fighter ?? null, below: board[index + 1]?.fighter ?? null };
}

describe("October 27, 2026: UFC all-time five-fighter refresh", () => {
  it("preserves the sealed roster size, distinct IDs and historical fighter ownership", () => {
    expect(canonicalRankingInputs.counts).toEqual({ fighters: 84, men: 68, women: 16 });
    // Preserve Gane and Natalia Silva already incorporated on main.
    expect(canonicalRankingInputs.fighters.some((row) => row.fighter === "Ciryl Gane")).toBe(true);
    expect(canonicalRankingInputs.fighters.some((row) => row.fighter === "Natalia Silva")).toBe(true);
    for (const name of fighterNames) {
      expect(canonicalRankingInputs.fighters.filter((row) => row.fighter === name)).toHaveLength(1);
      const ids = fighter(name).facts.fights.map((fight) => fight.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("records both UFC 333 title fights exactly once and credits only Yan and Volk", () => {
    const titleFights = [
      ["Petr Yan", "Merab Dvalishvili", "win"],
      ["Merab Dvalishvili", "Petr Yan", "loss"],
      ["Alexander Volkanovski", "Movsar Evloev", "win"],
    ] as const;
    titleFights.forEach(([name, opponent, result]) => {
      const matches = fighter(name).facts.fights.filter(
        (row) => row.date === "2026-10-24" && row.opponent === opponent,
      );
      expect(matches).toHaveLength(1);
      expect(matches[0]).toMatchObject({
        officialResult: result,
        division: name === "Alexander Volkanovski" ? "Featherweight" : "Bantamweight",
        championshipType: "normal",
      });
    });
    expect(fighter("Petr Yan").judgments.championship.inputs.filter(
      (row) => row.fightId === "2026-10-24-merab-dvalishvili",
    )).toHaveLength(1);
    expect(fighter("Alexander Volkanovski").judgments.championship.inputs.filter(
      (row) => row.fightId === "2026-10-24-movsar-evloev",
    )).toHaveLength(1);
    expect(fighter("Merab Dvalishvili").judgments.championship.inputs).toHaveLength(4);
    expect(fighter("Petr Yan").judgments.opponentQuality.inputs.filter(
      (row) => row.fightId === "2026-10-24-merab-dvalishvili",
    )).toHaveLength(1);
    expect(fighter("Alexander Volkanovski").judgments.opponentQuality.inputs.filter(
      (row) => row.fightId === "2026-10-24-movsar-evloev",
    )).toHaveLength(1);
    expect(fighter("Petr Yan").facts.fights.filter(
      (row) => row.opponent === "Merab Dvalishvili" && row.officialResult === "win",
    )).toHaveLength(2);
  });

  it("preserves historical flyweight/lightweight peaks after UFC 332 KO losses", () => {
    for (const [name, opponent] of [
      ["Deiveson Figueiredo", "Payton Talbott"],
      ["Rafael dos Anjos", "Alexander Hernandez"],
    ] as const) {
      expect(fighter(name).facts.fights.filter((row) =>
        row.date === "2026-10-03" && row.opponent === opponent,
      )).toEqual([expect.objectContaining({
        officialResult: "loss",
        methodCategory: "ko-tko",
        championshipType: "none",
      })]);
    }
    expect(fighter("Deiveson Figueiredo").facts.primeWindow).toMatchObject({
      endFightId: "2024-11-23-petr-yan", open: false,
    });
    expect(fighter("Rafael dos Anjos").facts.primeWindow).toMatchObject({
      endFightId: "2019-07-20-leon-edwards", open: false,
    });
    expect(fighter("Deiveson Figueiredo").judgments.championship.inputs).toHaveLength(3);
    expect(fighter("Rafael dos Anjos").judgments.championship.inputs).toHaveLength(2);
  });

  it("uses the actual V2 engine for before/after ranks, scores and neighbors", () => {
    const report = fighterNames.map((name) => {
      const before = find(beforeRows, name);
      const after = find(afterRows, name);
      expect(Number.isFinite(before.totals.totalScore)).toBe(true);
      expect(Number.isFinite(after.totals.totalScore)).toBe(true);
      return {
        fighter: name,
        before: { score: before.totals.totalScore, overall: before.rank,
          division: divisionalPosition(beforeRows, name), ...neighbors(beforeRows, name) },
        after: { score: after.totals.totalScore, overall: after.rank,
          division: divisionalPosition(afterRows, name), ...neighbors(afterRows, name) },
      };
    });
    // CI prints the full calculated table; PR body can use its exact numbers.
    console.info("UFC_OCTOBER_2026_V2_BEFORE_AFTER=" + JSON.stringify(report));
    expect(report).toHaveLength(5);
    expect(find(afterRows, "Petr Yan").totals.totalScore).toBeGreaterThan(
      find(beforeRows, "Petr Yan").totals.totalScore,
    );
    expect(find(afterRows, "Alexander Volkanovski").totals.totalScore).toBeGreaterThan(
      find(beforeRows, "Alexander Volkanovski").totals.totalScore,
    );
    // Neither late-career loss should rewrite a sealed prime.
    for (const name of ["Deiveson Figueiredo", "Rafael dos Anjos"] as const) {
      expect(find(afterRows, name).categories.primeDominance).toBe(
        find(beforeRows, name).categories.primeDominance,
      );
    }
    expect(getFighter("petr-yan")?.visibleStats.titleFightWins).toBe(4);
    expect(getFighter("merab-dvalishvili")?.visibleStats.titleFightWins).toBe(4);
    expect(getFighter("alexander-volkanovski")?.visibleStats.titleFightWins).toBe(9);
  });
});
