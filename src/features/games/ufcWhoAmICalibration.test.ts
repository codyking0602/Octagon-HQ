import { describe, expect, it } from "vitest";
import { getUfcWhoAmIUniverse } from "./whoAmIAuthority";
import { whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import { UFC_WHO_AM_I_CALIBRATION_SUBJECT_IDS } from "./ufcWhoAmICuration";
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

function sequenceKey(ids: readonly string[]) {
  return [...ids].sort().join("|");
}

describe("UFC Who Am I calibration full 100-fighter population", () => {
  it("keeps the playable pool sports-first while preserving real replay depth", () => {
    const universe = getUfcWhoAmIUniverse();
    const candidateById = new Map(universe.candidates.map((candidate) => [candidate.id, candidate]));
    const report: Array<Record<string, unknown>> = [];
    const replayGaps: Array<Record<string, unknown>> = [];
    let nonForcedGiveawayBoards = 0;
    let totalBoards = 0;

    for (const subjectId of UFC_WHO_AM_I_CALIBRATION_SUBJECT_IDS) {
      const candidate = candidateById.get(subjectId);
      expect(candidate, `${subjectId} must remain in the UFC Who Am I universe`).toBeDefined();

      const sequences = Array.from({ length: 64 }, (_value, index) => (
        whoAmIProgressiveClues(candidate!.clues, seededRandom(index + 1))
      ));

      const surfaced = new Set<string>();
      const sequenceKeys = new Set<string>();
      let maxRotatedFromFirst = 0;

      const firstIds = new Set(sequences[0]!.map((clue) => clue.id));

      for (const sequence of sequences) {
        expect(sequence).toHaveLength(WHO_AM_I_CLUE_LIMIT);
        expect(sequence.slice(0, 2).every((clue) => clue.band === "broad")).toBe(true);
        expect(sequence.slice(2, 4).every((clue) => clue.band === "helpful")).toBe(true);
        expect(
          sequence.slice(4).every((clue) => clue.band === "strong" || clue.band === "giveaway"),
          `${subjectId} should use six strong-or-later clues after the opening two rounds`,
        ).toBe(true);

        totalBoards += 1;
        if (sequence.filter((clue) => clue.band === "giveaway").length < 2) {
          nonForcedGiveawayBoards += 1;
        }

        const classes = sequence.map(whoAmIClueSelectionClass);
        expect(
          classes.filter((selectionClass) => selectionClass === "deep-biography").length,
          `${subjectId} should not surface deep-biography clues after curation`,
        ).toBe(0);
        expect(
          classes.filter((selectionClass) => selectionClass === "identity-color").length,
          `${subjectId} should use at most one true color clue in a run`,
        ).toBeLessThanOrEqual(1);

        const ids = sequence.map((clue) => clue.id);
        ids.forEach((id) => surfaced.add(id));
        sequenceKeys.add(sequenceKey(ids));

        const sharedWithFirst = ids.filter((id) => firstIds.has(id)).length;
        maxRotatedFromFirst = Math.max(maxRotatedFromFirst, WHO_AM_I_CLUE_LIMIT - sharedWithFirst);
      }

      if (surfaced.size < 12 || maxRotatedFromFirst < 2 || sequenceKeys.size < 4) {
        replayGaps.push({
          id: subjectId,
          candidatePool: candidate!.clues.length,
          surfacedAcross64: surfaced.size,
          distinctBoards: sequenceKeys.size,
          maxRotatedFromFirst,
        });
      }

      report.push({
        id: subjectId,
        candidatePool: candidate!.clues.length,
        surfacedAcross64: surfaced.size,
        distinctBoards: sequenceKeys.size,
        maxRotatedFromFirst,
      });
    }

    expect(nonForcedGiveawayBoards).toBeGreaterThan(0);
    console.info("UFC_WHO_AM_I_REPLAY_GAPS", JSON.stringify(replayGaps));
    expect(replayGaps).toEqual([]);
    console.info(
      "UFC Who Am I full-100 calibration",
      JSON.stringify({ report, nonForcedGiveawayBoards, totalBoards }),
    );
  }, 90_000);
});
