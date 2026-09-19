import { describe, expect, it } from "vitest";
import { getFootballWhoAmIUniverse, getUfcWhoAmIUniverse } from "./whoAmIAuthority";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues } from "./whoAmIEngine";
import {
  whoAmIClueEditorialIssues,
  whoAmICluesShareInformation,
  whoAmISemanticIndependentCapacity,
  whoAmISemanticSetKey,
} from "./whoAmISemanticQuality";
import { whoAmIQualityCompatibleReplayTargets } from "./whoAmIRevealPlanner";
import {
  whoAmIRevealArchitectureCanOrder,
  whoAmIRevealArchitectureSatisfied,
  whoAmIRevealProfile,
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

const DEFAULT_TARGETS = [
  "Derwin James",
  "Bruce Smith",
  "Barry Switzer",
  "Tyrann Mathieu",
  "Aaron Donald",
];

const requestedTargets = (process.env.WHO_AM_I_AUDIT_SUBJECTS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const targets = requestedTargets.length ? requestedTargets : DEFAULT_TARGETS;
const requestedLeagues = new Set(
  (process.env.WHO_AM_I_AUDIT_LEAGUES ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean),
);

describe("Who Am I fast targeted editorial gate", () => {
  it("validates only requested subjects without running the 500-subject simulation shards", () => {
    const universes = [
      getUfcWhoAmIUniverse(),
      getFootballWhoAmIUniverse("NFL"),
      getFootballWhoAmIUniverse("CFB"),
    ].filter((universe) => requestedLeagues.size === 0 || requestedLeagues.has(universe.league));

    const allCandidates = universes.flatMap((universe) => (
      universe.candidates.map((candidate) => ({ universe, candidate }))
    ));
    const selected = targets.includes("all")
      ? allCandidates
      : allCandidates.filter(({ candidate }) => (
        targets.includes(candidate.id) || targets.includes(candidate.name)
      ));

    expect(selected.length, `No Who Am I subjects matched: ${targets.join(", ")}`).toBeGreaterThan(0);

    const cfbRevealFailures: string[] = [];

    for (const { universe, candidate } of selected) {
      const semanticCapacity = whoAmISemanticIndependentCapacity(candidate.clues, 13);
      const sequences = Array.from({ length: 8 }, (_value, index) => (
        whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1))
      ));
      const replayTargets = whoAmIQualityCompatibleReplayTargets(candidate.clues, sequences);

      if (universe.league === "CFB") {
        for (const clue of candidate.clues) {
          const profile = whoAmIRevealProfile(clue);
          if (clue.band === "broad") {
            expect(
              profile.earliestClue,
              `${candidate.id} broad clue cannot reach its reveal window: ${clue.text}`,
            ).toBeLessThanOrEqual(2);
          }
          if (clue.band === "helpful") {
            expect(
              profile.earliestClue,
              `${candidate.id} helpful clue must be rebanded later: ${clue.text}`,
            ).toBeLessThanOrEqual(4);
            if (profile.category === "school") {
              expect(
                profile.identifyingPower,
                `${candidate.id} signature school belongs after the foundation clues: ${clue.text}`,
              ).not.toBe("signature");
            }
          }
          if (clue.band === "strong") {
            expect(
              profile.earliestClue,
              `${candidate.id} strong clue belongs in the final giveaway band: ${clue.text}`,
            ).toBeLessThanOrEqual(8);
          }
        }
      }

      for (const [sequenceIndex, sequence] of sequences.entries()) {
        expect(sequence, `${candidate.id} must still produce a complete board`).toHaveLength(WHO_AM_I_CLUE_LIMIT);

        for (const clue of sequence) {
          expect(
            whoAmIClueEditorialIssues(clue, universe.league),
            `${candidate.id} selected invalid clue: ${clue.text}`,
          ).toEqual([]);
        }

        if (semanticCapacity >= WHO_AM_I_CLUE_LIMIT) {
          for (let left = 0; left < sequence.length; left += 1) {
            for (let right = left + 1; right < sequence.length; right += 1) {
              expect(
                whoAmICluesShareInformation(sequence[left]!, sequence[right]!),
                `${candidate.id} repeats information despite having enough independent clue lanes: "${sequence[left]!.text}" / "${sequence[right]!.text}"`,
              ).toBe(false);
            }
          }
        }

        expect(
          sequence.slice(-4).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length,
          `${candidate.id} needs a strong finish`,
        ).toBeGreaterThanOrEqual(3);

        if (universe.league === "CFB") {
          if (!whoAmIRevealArchitectureSatisfied(sequence)) {
            const board = sequence.map((clue, index) => {
              const profile = whoAmIRevealProfile(clue);
              return `${index + 1}[${clue.id}]:${clue.band}/${profile.category}/${profile.identifyingPower}/>=${profile.earliestClue} ${clue.text}`;
            }).join(" || ");
            cfbRevealFailures.push(`${candidate.id} seed=${sequenceIndex + 1} :: ${board}`);
          }
        } else if (whoAmIRevealArchitectureCanOrder(sequence)) {
          expect(
            whoAmIRevealArchitectureSatisfied(sequence),
            `${candidate.id} must use the standardized reveal order when its selected board supports it`,
          ).toBe(true);
        }
      }

      if (replayTargets.boards > 1) {
        expect(
          new Set(sequences.map(whoAmISemanticSetKey)).size,
          `${candidate.id} replay must rotate actual information, not alternate wording or order`,
        ).toBeGreaterThan(1);
      }
    }

    expect(
      cfbRevealFailures,
      `CFB PR3 reveal failures:\n${cfbRevealFailures.join("\n")}`,
    ).toEqual([]);
  }, 150_000);
});
