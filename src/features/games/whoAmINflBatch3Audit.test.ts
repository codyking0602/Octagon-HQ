import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "./footballWhoAmIAuthority";

describe("NFL Who Am I batch 3 audit", () => {
  it("prints the launch-order subjects and current raw playable clues for 101-150", () => {
    const subjects = getFootballWhoAmILaunchPool("NFL").subjects.slice(100, 150);
    const candidates = new Map(getFootballWhoAmIUniverse("NFL").candidates.map((candidate) => [candidate.id, candidate]));
    const report = subjects.map((subject, index) => ({
      launch: index + 101,
      id: subject.id,
      name: subject.name,
      position: subject.position,
      tier: subject.recognizabilityTier,
      clues: candidates.get(subject.id)?.clues.map((clue) => ({
        id: clue.id,
        conceptId: clue.conceptId,
        text: clue.text,
        band: clue.band,
        facet: clue.facet,
        identityKnowledge: clue.identityKnowledge,
        sourceFactId: clue.sourceFactId,
      })) ?? [],
    }));
    console.info("NFL WHO AM I BATCH 3 RAW AUDIT", JSON.stringify(report));
    expect(subjects).toHaveLength(50);
  });
});
