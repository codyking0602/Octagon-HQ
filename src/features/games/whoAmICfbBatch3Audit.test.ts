import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool, getFootballWhoAmIUniverse } from "./footballWhoAmIAuthority";

describe("CFB Who Am I batch 3 preflight", () => {
  it("prints launch-order 101-150 and current clue pools", () => {
    const subjects = getFootballWhoAmILaunchPool("CFB").subjects.slice(100, 150);
    const byId = new Map(getFootballWhoAmIUniverse("CFB").candidates.map((candidate) => [candidate.id, candidate]));
    const report = subjects.map((subject, index) => ({
      launch: index + 101,
      id: subject.id,
      name: subject.name,
      kind: subject.kind,
      position: subject.position,
      school: subject.school,
      clues: byId.get(subject.id)?.clues.map((clue) => ({
        id: clue.id,
        conceptId: clue.conceptId,
        text: clue.text,
        band: clue.band,
        facet: clue.facet,
        sourceFactId: clue.sourceFactId,
        identityKnowledge: clue.identityKnowledge ?? false,
      })) ?? [],
    }));
    console.info("CFB WHO AM I BATCH 3 RAW PREFLIGHT", JSON.stringify(report));
    expect(subjects).toHaveLength(50);
  });
});
