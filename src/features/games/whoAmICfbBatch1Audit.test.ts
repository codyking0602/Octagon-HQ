import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "./footballWhoAmIAuthority";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";

describe("CFB Who Am I batch 1 discovery", () => {
  it("prints launch-order subjects 1-50 and current clue pools for curation", () => {
    const subjects = getFootballWhoAmILaunchPool("CFB").subjects.slice(0, 50);
    const candidates = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    console.info("CFB WHO AM I BATCH 1 SUBJECTS", JSON.stringify(subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      kind: subject.kind,
      position: subject.position,
      school: subject.school,
      startSeason: subject.startSeason,
      endSeason: subject.endSeason,
      tier: subject.recognizabilityTier,
      heismanWinner: subject.heismanWinner,
      nationalChampion: subject.nationalChampion,
      draftYear: subject.draftYear,
      draftRound: subject.draftRound,
      draftPick: subject.draftPick,
      sourceIdentityKeys: subject.sourceIdentityKeys,
    }))));
    for (const subject of subjects) {
      const candidate = candidates.get(subject.id)!;
      console.info("CFB B1 POOL", JSON.stringify({
        id: subject.id,
        name: subject.name,
        clues: candidate.clues.map((clue) => ({
          id: clue.id,
          conceptId: clue.conceptId,
          text: clue.text,
          band: clue.band,
          facet: whoAmIClueFacet(clue),
          selectionClass: whoAmIClueSelectionClass(clue),
          identityKnowledge: Boolean(clue.identityKnowledge),
          sourceFactId: clue.sourceFactId,
        })),
      }));
    }
    expect(subjects).toHaveLength(50);
  });
});
