import { describe, expect, it } from "vitest";
import { footballHitTheNumberSubjects } from "./footballHitTheNumberModel";
import { footballSubjectAsset } from "./footballSubjectAssets";

describe("Football Hit the Number canonical media coverage", () => {
  it("resolves every eligible HTN subject through the shared Football media owner", () => {
    const missingSubjects = footballHitTheNumberSubjects
      .filter((subject) => footballSubjectAsset(subject.id) == null);
    const missing = missingSubjects.map((subject) => `${subject.id} (${subject.kind}/${subject.league})`);

    if (missing.length) {
      const cfb = missingSubjects.filter((subject) => subject.league === "CFB");
      const nfl = missingSubjects.filter((subject) => subject.league === "NFL");
      console.log("HTN media relationship coverage", JSON.stringify({
        total: missing.length,
        cfb: {
          total: cfb.length,
          withSchool: cfb.filter((subject) => Boolean(subject.school)).length,
          withoutSchool: cfb.filter((subject) => !subject.school).slice(0, 12),
        },
        nfl: {
          total: nfl.length,
          withOneFranchise: nfl.filter((subject) => subject.franchises?.length === 1).length,
          withMultipleFranchises: nfl.filter((subject) => (subject.franchises?.length ?? 0) > 1).length,
          withoutFranchise: nfl.filter((subject) => !subject.franchises?.length).slice(0, 12),
        },
      }, null, 2));
    }

    expect(footballHitTheNumberSubjects.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });
});
