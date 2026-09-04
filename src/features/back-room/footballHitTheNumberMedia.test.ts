import { describe, expect, it } from "vitest";
import { footballHitTheNumberSubjects } from "./footballHitTheNumberModel";
import { footballSubjectAsset } from "./footballSubjectAssets";

describe("Football Hit the Number canonical media coverage", () => {
  it("resolves every eligible HTN subject through the shared Football media owner", () => {
    const missing = footballHitTheNumberSubjects
      .filter((subject) => footballSubjectAsset(subject.id) == null)
      .map((subject) => `${subject.id} (${subject.kind}/${subject.league})`);

    expect(footballHitTheNumberSubjects.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});
