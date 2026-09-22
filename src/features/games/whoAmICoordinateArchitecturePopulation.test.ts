import { describe, expect, it } from "vitest";
import { getFootballWhoAmIUniverse } from "./whoAmIAuthority";
import { whoAmIProgressiveClues } from "./whoAmIEngine";
import {
  whoAmIMajorIdentityCoordinates,
  whoAmIRevealArchitectureSatisfied,
  whoAmIRevealCoordinateProgressionSatisfied,
} from "./whoAmIRevealArchitecture";

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function exposedCoordinateCount(
  clues: ReturnType<typeof whoAmIProgressiveClues>,
  league: "NFL" | "CFB",
  endExclusive: number,
) {
  return new Set(
    clues
      .slice(0, endExclusive)
      .flatMap((clue) => whoAmIMajorIdentityCoordinates(clue, league)),
  ).size;
}

describe("Who Am I football identity-coordinate architecture", () => {
  for (const league of ["CFB", "NFL"] as const) {
    it(`enforces progressive coordinate windows across all 200 ${league} subjects`, () => {
      const universe = getFootballWhoAmIUniverse(league);
      expect(universe.candidates).toHaveLength(200);

      const problems: string[] = [];

      for (const candidate of universe.candidates) {
        for (let seed = 1; seed <= 4; seed += 1) {
          const board = whoAmIProgressiveClues(candidate.clues, seededRandom(seed), league);
          if (board.length !== 10) {
            problems.push(`${candidate.id} seed ${seed}: only ${board.length} clues`);
            continue;
          }

          const firstFour = exposedCoordinateCount(board, league, 4);
          const firstSix = exposedCoordinateCount(board, league, 6);
          const firstEight = exposedCoordinateCount(board, league, 8);

          if (firstFour > 1) {
            problems.push(`${candidate.id} seed ${seed}: clues 1-4 expose ${firstFour} major coordinates`);
          }
          if (firstSix > 2) {
            problems.push(`${candidate.id} seed ${seed}: clues 1-6 expose ${firstSix} major coordinates`);
          }
          if (firstEight > 3) {
            problems.push(`${candidate.id} seed ${seed}: clues 1-8 expose ${firstEight} major coordinates`);
          }
          if (!whoAmIRevealCoordinateProgressionSatisfied(board, league)) {
            problems.push(`${candidate.id} seed ${seed}: coordinate progression is not satisfied`);
          }
          if (!whoAmIRevealArchitectureSatisfied(board, league)) {
            problems.push(`${candidate.id} seed ${seed}: standardized reveal architecture is not satisfied`);
          }

          const personalCount = board.filter((clue) => clue.facet === "off-field").length;
          if (personalCount > 1) {
            problems.push(`${candidate.id} seed ${seed}: ${personalCount} off-field clues`);
          }

          const strongLate = board
            .slice(6)
            .filter((clue) => clue.band === "strong" || clue.band === "giveaway")
            .length;
          if (strongLate < 3) {
            problems.push(`${candidate.id} seed ${seed}: only ${strongLate} strong/giveaway clues in 7-10`);
          }
        }
      }

      expect(problems, problems.join("\n")).toEqual([]);
    }, 150_000);
  }
});
