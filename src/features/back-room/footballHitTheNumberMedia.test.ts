import { describe, expect, it } from "vitest";
import { footballHitTheNumberSubjects } from "./footballHitTheNumberModel";
import { footballSubjectAsset } from "./footballSubjectAssets";

describe("Football Hit the Number canonical media coverage", () => {
  it("resolves every eligible HTN subject through the shared Football media owner", () => {
    const missingSubjects = footballHitTheNumberSubjects
      .filter((subject) => footballSubjectAsset(subject.id) == null);
    const missing = missingSubjects.map((subject) => `${subject.id} (${subject.kind}/${subject.league})`);
    const samples = [
      ...missingSubjects.filter((subject) => subject.league === "NFL").slice(0, 8),
      ...missingSubjects.filter((subject) => subject.league === "CFB").slice(0, 8),
    ];

    if (missing.length) {
      console.log("HTN media missing subject samples", JSON.stringify(samples, null, 2));
    }

    expect(footballHitTheNumberSubjects.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});
