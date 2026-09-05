import { describe, expect, it } from "vitest";
import { footballHitTheNumberSubjects } from "./footballHitTheNumberModel";
import { footballCfbTeamMediaId } from "./footballMediaIdentity";
import { footballSubjectAsset, footballTeamAssets } from "./footballSubjectAssets";

describe("Football Hit the Number canonical media coverage", () => {
  it("resolves every playable HTN subject through the shared Football media owner", () => {
    const missing = footballHitTheNumberSubjects
      .filter((subject) => footballSubjectAsset(subject.id) == null)
      .map((subject) => JSON.stringify({
        id: subject.id,
        name: subject.name,
        kind: subject.kind,
        league: subject.league,
        school: subject.school ?? null,
        franchises: subject.franchises ?? [],
      }));

    expect(footballHitTheNumberSubjects.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });

  it("marks Ohio State program media for a light backplate on dark surfaces", () => {
    expect(footballTeamAssets[footballCfbTeamMediaId("Ohio State")]).toMatchObject({
      label: "Ohio State",
      darkSurfaceTreatment: "light-backplate",
    });
  });
});
