import { describe, expect, it } from "vitest";
import { queryFootballSubjects } from "./footballSubjectRegistry";

describe("Football QB identity diagnostic", () => {
  it("prints the exact current canonical QB comparison universe", () => {
    const subjects = queryFootballSubjects({
      kind: "player-career",
      league: "NFL",
      position: "QB",
      recognizabilityTiers: ["A", "B", "C"],
      casualEligible: true,
      includeProjectedSourceSubjects: true,
      includeProjectedCanonicalRecognition: true,
    });
    console.log("QB_CANONICAL_IDENTITIES", JSON.stringify(subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      aliases: subject.aliases ?? [],
    }))));
    expect(subjects).toHaveLength(122);
  });
});
