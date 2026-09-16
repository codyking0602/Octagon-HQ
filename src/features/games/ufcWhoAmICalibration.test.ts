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

  it("treats catchweight bouts as catchweights, not separate UFC divisions", () => {
    const candidate = getUfcWhoAmIUniverse().candidates.find(
      (entry) => entry.id === "ufc:charles-oliveira",
    );
    expect(candidate).toBeDefined();

    const divisionCount = candidate!.clues.find((clue) => clue.id === "division-count");
    expect(divisionCount?.text).toBe("I competed in 2 UFC divisions.");
    expect(candidate!.clues.some((clue) => /9 UFC divisions/i.test(clue.text))).toBe(false);
    expect(candidate!.clues.some((clue) => clue.id === "ufc-submission-record")).toBe(true);
    expect(candidate!.clues.some((clue) => clue.id === "title-wins")).toBe(false);
  });

  it("keeps the playable pool sports-first while preserving real replay depth", () => {
    const universe = getUfcWhoAmIUniverse();
    const candidateById = new Map(universe.candidates.map((candidate) => [candidate.id, candidate]));
    const report: Array<Record<string, unknown>> = [];

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

      expect(
        surfaced.size,
        `${subjectId} should surface at least 11 playable clues across replay seeds`,
      ).toBeGreaterThanOrEqual(11);
      expect(
        sequenceKeys.size,
        `${subjectId} should have multiple legitimate replay boards`,
      ).toBeGreaterThanOrEqual(2);

      report.push({
        id: subjectId,
        candidatePool: candidate!.clues.length,
        surfacedAcross64: surfaced.size,
        distinctBoards: sequenceKeys.size,
        maxRotatedFromFirst,
      });
    }

    console.info("UFC Who Am I full-100 calibration", JSON.stringify(report));
  }, 150_000);

  it("does not count catchweight bouts as UFC divisions for Charles Oliveira", () => {
    const candidate = getUfcWhoAmIUniverse().candidates.find(
      (entry) => entry.id === "ufc:charles-oliveira",
    );
    expect(candidate).toBeDefined();
    expect(candidate!.clues.find((entry) => entry.id === "division-count")?.text).toBe(
      "I competed in 2 UFC divisions.",
    );
    expect(candidate!.clues.some((entry) => entry.id === "title-wins")).toBe(false);
    expect(candidate!.clues.find((entry) => entry.id === "ufc-submission-record")?.text).toBe(
      "I hold the UFC record for submission wins.",
    );
  });

});
