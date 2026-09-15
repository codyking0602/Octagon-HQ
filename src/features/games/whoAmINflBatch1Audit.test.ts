import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "./footballWhoAmIAuthority";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import { whoAmIProgressiveClues } from "./whoAmIEngine";

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

describe("NFL Who Am I batch 1 audit", () => {
  it("prints the first 50 launch subjects with their full clue pools and replay surface", () => {
    const pool = getFootballWhoAmILaunchPool("NFL");
    const universe = getFootballWhoAmIUniverse("NFL");
    const batchIds = pool.subjects.slice(0, 50).map((subject) => subject.id);
    const candidates = new Map(universe.candidates.map((candidate) => [candidate.id, candidate]));

    expect(batchIds).toHaveLength(50);

    const report = batchIds.map((id) => {
      const candidate = candidates.get(id)!;
      const sequences = Array.from({ length: 32 }, (_value, index) => (
        whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1))
      ));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map((clue) => clue.id)));
      const boards = new Set(sequences.map((sequence) => sequence.map((clue) => clue.id).join("|")));

      return {
        id: candidate.id,
        name: candidate.name,
        poolSize: candidate.clues.length,
        surfaced: surfaced.size,
        boards: boards.size,
        clues: candidate.clues.map((clue) => ({
          id: clue.id,
          band: clue.band,
          facet: whoAmIClueFacet(clue),
          selectionClass: whoAmIClueSelectionClass(clue),
          identityKnowledge: Boolean(clue.identityKnowledge),
          conceptId: clue.conceptId ?? null,
          text: clue.text,
        })),
      };
    });

    console.info("NFL WHO AM I BATCH 1 AUDIT", JSON.stringify(report));
  }, 120_000);
});
