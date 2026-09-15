import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "./footballWhoAmIAuthority";
import { NFL_WHO_AM_I_BATCH_1_SUBJECT_IDS } from "./footballWhoAmICuration";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import { WHO_AM_I_CLUE_LIMIT, whoAmIProgressiveClues } from "./whoAmIEngine";

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

describe("NFL Who Am I batch 1 calibration", () => {
  it("locks the audited launch-order batch to the curated 50 subjects", () => {
    const ids = getFootballWhoAmILaunchPool("NFL").subjects.slice(0, 50).map((subject) => subject.id);
    expect(ids).toEqual(NFL_WHO_AM_I_BATCH_1_SUBJECT_IDS);
  });

  it("keeps every batch-one pool sports-first, replayable, and free of biography filler", () => {
    const universe = getFootballWhoAmIUniverse("NFL");
    const candidates = new Map(universe.candidates.map((candidate) => [candidate.id, candidate]));
    const report: Array<Record<string, unknown>> = [];

    for (const subjectId of NFL_WHO_AM_I_BATCH_1_SUBJECT_IDS) {
      const candidate = candidates.get(subjectId);
      expect(candidate, subjectId).toBeDefined();
      expect(candidate!.clues.length, `${subjectId} playable pool`).toBeGreaterThanOrEqual(12);
      expect(candidate!.clues.length, `${subjectId} playable pool`).toBeLessThanOrEqual(16);
      expect(
        candidate!.clues.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography"),
        `${subjectId} deep biography`,
      ).toHaveLength(0);
      expect(
        candidate!.clues.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length,
        `${subjectId} color clues`,
      ).toBeLessThanOrEqual(1);

      const sequences = Array.from({ length: 64 }, (_value, index) => (
        whoAmIProgressiveClues(candidate!.clues, seededRandom(index + 1))
      ));
      const first = new Set(sequences[0]!.map((clue) => clue.id));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map((clue) => clue.id)));
      const boards = new Set(sequences.map((sequence) => sequence.map((clue) => clue.id).join("|")));
      const maxRotated = Math.max(...sequences.map((sequence) => (
        sequence.filter((clue) => !first.has(clue.id)).length
      )));

      for (const sequence of sequences) {
        expect(sequence, `${subjectId} clue count`).toHaveLength(WHO_AM_I_CLUE_LIMIT);
        expect(
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length,
          `${subjectId} sports identity`,
        ).toBeGreaterThanOrEqual(9);
        expect(
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography"),
          `${subjectId} deep biography in run`,
        ).toHaveLength(0);
        expect(
          sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length,
          `${subjectId} color in run`,
        ).toBeLessThanOrEqual(1);
        expect(
          sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships").length,
          `${subjectId} relationship slots`,
        ).toBeLessThanOrEqual(1);
        expect(
          sequence.slice(-2).every((clue) => clue.band === "strong" || clue.band === "giveaway"),
          `${subjectId} strongest finish`,
        ).toBe(true);
        if (candidate!.clues.length > 12) {
          expect(
            sequence.some((clue) => /fact:nfl-career-games$/.test(clue.id)),
            `${subjectId} generic career games`,
          ).toBe(false);
        }
      }

      expect(surfaced.size, `${subjectId} surfaced replay depth`).toBeGreaterThanOrEqual(12);
      expect(maxRotated, `${subjectId} rotating slots`).toBeGreaterThanOrEqual(2);
      expect(boards.size, `${subjectId} distinct boards`).toBeGreaterThanOrEqual(2);

      report.push({
        id: subjectId,
        pool: candidate!.clues.length,
        surfaced: surfaced.size,
        boards: boards.size,
        rotated: maxRotated,
      });
    }

    console.info("NFL WHO AM I BATCH 1 CALIBRATION", JSON.stringify(report));
  }, 150_000);
});
