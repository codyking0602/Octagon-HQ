import { describe, expect, it } from "vitest";

import { getFootballSubject } from "./footballSubjectRegistry";

const reviewedRepairs = [
  ["barry-sanders", "A", 1998],
  ["earl-campbell", "A", 1985],
  ["marcus-allen", "A", 1997],
  ["tony-dorsett", "A", 1988],
  ["cfb-danny-wuerffel", "B", 1996],
  ["cfb-doug-flutie", "A", 1984],
  ["cfb-gino-torretta", "B", 1992],
  ["cfb-jim-plunkett", "A", 1970],
  ["cfb-roger-staubach", "A", 1964],
  ["cfb-ty-detmer", "B", 1991],
  ["cfb-eddie-george", "B", 1995],
  ["cfb-ernie-davis", "A", 1961],
  ["cfb-o-j-simpson", "A", 1968],
  ["cfb-rashaan-salaam", "B", 1994],
  ["cfb-desmond-howard", "A", 1991],
] as const;

describe("Stage 13.5 newly dated historical recognition repair", () => {
  it("gives every newly exposed historical C subject an allowed reviewed tier and exact career end", () => {
    for (const [subjectId, expectedTier, expectedEndSeason] of reviewedRepairs) {
      const subject = getFootballSubject(subjectId);
      expect(subject, subjectId).toBeDefined();
      expect(subject!.recognizabilityTier, subjectId).toBe(expectedTier);
      expect(subject!.endSeason, subjectId).toBe(expectedEndSeason);
      expect(subject!.casualEligible, subjectId).toBe(true);
    }
  });

  it("keeps the oldest CFB repairs at the required A threshold", () => {
    for (const subjectId of ["cfb-jim-plunkett", "cfb-roger-staubach", "cfb-ernie-davis", "cfb-o-j-simpson"] as const) {
      const subject = getFootballSubject(subjectId)!;
      expect(subject.endSeason).toBeLessThan(1980);
      expect(subject.recognizabilityTier).toBe("A");
    }
  });

  it("keeps 1980-2004 CFB repairs at A/B and 1970-1999 NFL repairs at A/B", () => {
    for (const [subjectId] of reviewedRepairs) {
      const subject = getFootballSubject(subjectId)!;
      if (subject.league === "CFB" && subject.endSeason! >= 1980 && subject.endSeason! < 2005) {
        expect(["A", "B"]).toContain(subject.recognizabilityTier);
      }
      if (subject.league === "NFL" && subject.endSeason! >= 1970 && subject.endSeason! < 2000) {
        expect(["A", "B"]).toContain(subject.recognizabilityTier);
      }
    }
  });
});
