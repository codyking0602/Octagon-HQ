import { describe, expect, it } from "vitest";
import { footballHitTheNumberSubjects } from "./footballHitTheNumberModel";
import { footballSubjectAsset } from "./footballSubjectAssets";

describe("Football Hit the Number canonical media coverage", () => {
  it("resolves every historical player and team season through the shared Football media owner", () => {
    const seasonSubjects = footballHitTheNumberSubjects.filter((subject) => (
      subject.kind === "player-season" || subject.kind === "team-season"
    ));
    const missing = seasonSubjects
      .filter((subject) => footballSubjectAsset(subject.id) == null)
      .map((subject) => subject.id);

    expect(seasonSubjects.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});
