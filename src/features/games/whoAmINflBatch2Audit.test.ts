import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "./footballWhoAmIAuthority";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";

describe("NFL Who Am I batch 2 audit preflight", () => {
  it("prints launch-order subjects 51-100 and their full assembled clue pools", () => {
    const subjectIds = getFootballWhoAmILaunchPool("NFL").subjects.slice(50, 100).map((subject) => subject.id);
    expect(subjectIds).toHaveLength(50);

    const candidates = new Map(getFootballWhoAmIUniverse("NFL").candidates.map((candidate) => [candidate.id, candidate]));
    const report = subjectIds.map((subjectId, index) => {
      const candidate = candidates.get(subjectId);
      expect(candidate, subjectId).toBeDefined();
      return {
        order: index + 51,
        id: subjectId,
        name: candidate!.name,
        pool: candidate!.clues.length,
        clues: candidate!.clues.map((clue) => ({
          id: clue.id,
          conceptId: clue.conceptId,
          text: clue.text,
          band: clue.band,
          facet: whoAmIClueFacet(clue),
          selectionClass: whoAmIClueSelectionClass(clue),
          identityKnowledge: Boolean(clue.identityKnowledge),
          knowledgeSubjectId: clue.knowledgeSubjectId,
          sourceFactId: clue.sourceFactId,
        })),
      };
    });

    console.info("NFL WHO AM I BATCH 2 RAW AUDIT", JSON.stringify(report));
  });
});
