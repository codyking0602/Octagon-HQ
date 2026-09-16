import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool } from "./footballWhoAmIAuthority";

describe("CFB Who Am I batch 1 discovery", () => {
  it("prints launch-order subjects 1-50 for curation", () => {
    const subjects = getFootballWhoAmILaunchPool("CFB").subjects.slice(0, 50);
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
    }))));
    expect(subjects).toHaveLength(50);
  });
});
