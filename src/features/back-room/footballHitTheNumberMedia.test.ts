import { describe, expect, it } from "vitest";
import { footballHitTheNumberSubjects } from "./footballHitTheNumberModel";
import { footballCfbTeamMediaId } from "./footballMediaIdentity";
import {
  footballSubjectAsset,
  footballSubjectAssets,
  footballTeamAssets,
} from "./footballSubjectAssets";
import { getFootballSubject } from "./footballSubjectRegistry";

describe("Football Hit the Number canonical media coverage", () => {
  it("resolves every eligible HTN subject through the shared Football media owner", () => {
    const missingSubjects = footballHitTheNumberSubjects
      .filter((subject) => footballSubjectAsset(subject.id) == null);
    const remainingAfterCanonicalRelationship = missingSubjects.filter((subject) => {
      const canonicalSubject = getFootballSubject(subject.id);
      if (!canonicalSubject) return true;
      if (footballSubjectAssets[canonicalSubject.id]) return false;
      if (canonicalSubject.league === "CFB" && canonicalSubject.school) {
        return footballTeamAssets[footballCfbTeamMediaId(canonicalSubject.school)] == null;
      }
      return true;
    });

    if (missingSubjects.length) {
      console.log("HTN canonical media reconciliation", JSON.stringify({
        initialMissing: missingSubjects.length,
        reconciledByCanonicalIdentityOrSchool: missingSubjects.length - remainingAfterCanonicalRelationship.length,
        remaining: remainingAfterCanonicalRelationship.length,
        remainingSubjects: remainingAfterCanonicalRelationship.slice(0, 80).map((subject) => {
          const canonicalSubject = getFootballSubject(subject.id);
          return {
            id: subject.id,
            name: subject.name,
            league: subject.league,
            canonicalId: canonicalSubject?.id,
            school: canonicalSubject?.school,
            franchises: canonicalSubject?.franchises,
            sourceIdentityKeys: canonicalSubject?.sourceIdentityKeys,
          };
        }),
      }, null, 2));
    }

    expect(footballHitTheNumberSubjects.length).toBeGreaterThan(0);
    expect(remainingAfterCanonicalRelationship.map((subject) => subject.id)).toEqual([]);
  });
});
