import { describe, expect, it } from "vitest";
import { getFootballWhoAmIUniverse } from "./whoAmIAuthority";
import { whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues } from "./whoAmIEngine";
import {
  whoAmIRevealArchitectureSatisfied,
  whoAmIRevealProfile,
} from "./whoAmIRevealArchitecture";
import { whoAmIQualityCompatibleReplayTargets } from "./whoAmIRevealPlanner";
import {
  whoAmICluesShareInformation,
  whoAmISemanticIndependentCapacity,
  whoAmISemanticSetKey,
} from "./whoAmISemanticQuality";

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

function exposedCoordinateCount(board: ReturnType<typeof whoAmIProgressiveClues>, clueCount: number) {
  return new Set(
    board.slice(0, clueCount).flatMap((clue) => clue.revealCoordinates ?? []),
  ).size;
}

describe("Who Am I football reveal-coordinate architecture", () => {
  for (const league of ["CFB", "NFL"] as const) {
    it(`keeps all 200 ${league} subjects inside progressive coordinate windows across replay seeds`, () => {
      const universe = getFootballWhoAmIUniverse(league);
      expect(universe.candidates).toHaveLength(200);

      const problems: string[] = [];

      for (const candidate of universe.candidates) {
        const semanticCapacity = whoAmISemanticIndependentCapacity(candidate.clues, 13);
        const boards = Array.from({ length: 6 }, (_value, index) => (
          whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1))
        ));
        const replayTargets = whoAmIQualityCompatibleReplayTargets(candidate.clues, boards);

        for (let seedIndex = 0; seedIndex < boards.length; seedIndex += 1) {
          const seed = seedIndex + 1;
          const board = boards[seedIndex]!;
          if (board.length !== WHO_AM_I_CLUE_LIMIT) {
            problems.push(`${candidate.id} seed ${seed}: only ${board.length} clues`);
            continue;
          }

          const firstFour = exposedCoordinateCount(board, 4);
          const firstSix = exposedCoordinateCount(board, 6);
          const firstEight = exposedCoordinateCount(board, 8);
          if (firstFour > 1) {
            problems.push(`${candidate.id} seed ${seed}: clues 1-4 expose ${firstFour} major coordinates`);
          }
          if (firstSix > 2) {
            problems.push(`${candidate.id} seed ${seed}: clues 1-6 expose ${firstSix} major coordinates`);
          }
          if (firstEight > 3) {
            problems.push(`${candidate.id} seed ${seed}: clues 1-8 expose ${firstEight} major coordinates`);
          }
          if (!whoAmIRevealArchitectureSatisfied(board)) {
            problems.push(`${candidate.id} seed ${seed}: board violates standardized reveal architecture`);
          }

          const profiles = board.map(whoAmIRevealProfile);
          const personalCount = profiles.filter(({ category }) => category === "personal-biography").length;
          if (personalCount > 1) {
            problems.push(`${candidate.id} seed ${seed}: ${personalCount} personal-biography clues`);
          }

          const sportsIdentityCount = board
            .map(whoAmIClueSelectionClass)
            .filter((selectionClass) => selectionClass === "sports-identity").length;
          if (sportsIdentityCount < 7) {
            problems.push(`${candidate.id} seed ${seed}: only ${sportsIdentityCount} sports-identity clues`);
          }

          const strongFinish = board.slice(-4)
            .filter((clue) => clue.band === "strong" || clue.band === "giveaway").length;
          if (strongFinish < 3) {
            problems.push(`${candidate.id} seed ${seed}: only ${strongFinish} strong clues in clues 7-10`);
          }

          if (semanticCapacity >= WHO_AM_I_CLUE_LIMIT) {
            for (let left = 0; left < board.length; left += 1) {
              for (let right = left + 1; right < board.length; right += 1) {
                if (whoAmICluesShareInformation(board[left]!, board[right]!)) {
                  problems.push(
                    `${candidate.id} seed ${seed}: semantic repeat — "${board[left]!.text}" / "${board[right]!.text}"`,
                  );
                }
              }
            }
          }
        }

        if (
          replayTargets.boards > 1
          && new Set(boards.map(whoAmISemanticSetKey)).size <= 1
        ) {
          problems.push(`${candidate.id}: replay does not rotate semantic information`);
        }
      }

      expect(problems, problems.join("\n")).toEqual([]);
    }, 150_000);
  }
});
