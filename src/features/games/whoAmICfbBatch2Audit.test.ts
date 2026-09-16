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

describe("CFB Who Am I batch 2 preflight", () => {
  it("prints launch-order subjects 51-100 and compact replay diagnostics before curation", () => {
    const subjects = getFootballWhoAmILaunchPool("CFB").subjects.slice(50, 100);
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    expect(subjects).toHaveLength(50);

    const report = subjects.map((subject) => {
      const candidate = candidates.get(subject.id)!;
      const sequences = Array.from({ length: 64 }, (_value, index) => whoAmIProgressiveClues(candidate.clues, seededRandom(index + 1)));
      const first = new Set(sequences[0]!.map((clue) => clue.id));
      const surfaced = new Set(sequences.flatMap((sequence) => sequence.map((clue) => clue.id)));
      return {
        id: subject.id,
        name: subject.name,
        position: subject.position,
        school: subject.school,
        startSeason: subject.startSeason,
        endSeason: subject.endSeason,
        pool: candidate.clues.length,
        surfaced: surfaced.size,
        boards: new Set(sequences.map((sequence) => sequence.map((clue) => clue.id).join("|"))).size,
        rotated: Math.max(...sequences.map((sequence) => sequence.filter((clue) => !first.has(clue.id)).length)),
        minSports: Math.min(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "sports-identity").length)),
        maxDeep: Math.max(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "deep-biography").length)),
        maxColor: Math.max(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueSelectionClass(clue) === "identity-color").length)),
        maxRelationships: Math.max(...sequences.map((sequence) => sequence.filter((clue) => whoAmIClueFacet(clue) === "relationships").length)),
        minFinalStrong: Math.min(...sequences.map((sequence) => sequence.slice(-2).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length)),
        clues: candidate.clues.map((clue) => ({
          id: clue.id,
          conceptId: clue.conceptId,
          text: clue.text,
          band: clue.band,
          facet: whoAmIClueFacet(clue),
          selectionClass: whoAmIClueSelectionClass(clue),
          sourceFactId: clue.sourceFactId,
        })),
      };
    });

    console.info("CFB WHO AM I BATCH 2 PREFLIGHT", JSON.stringify(report));
  }, 150_000);
});
