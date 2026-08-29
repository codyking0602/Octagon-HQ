import { describe, expect, it } from "vitest";

import { getFootballFactualRecord } from "./footballFactualStatsCore";
import { footballProgramEraSeeds } from "./footballProgramEraSeeds";
import { footballHistoricalTierIssue } from "./footballRecognitionHistoricalPolicy";
import { getFootballSubject } from "./footballSubjectRegistry";

const approvedSameCoachSplits = new Set([
  "Oklahoma|Bob Stoops",
  "Texas|Mack Brown",
]);

const tierRank = { D: 0, C: 1, B: 2, A: 3 } as const;

describe("Stage 13.5 CFB Program Era recognition", () => {
  it("keeps Program Eras substantial, coach-defined, unique and historically valid", () => {
    expect(footballProgramEraSeeds.length).toBeGreaterThanOrEqual(40);
    expect(new Set(footballProgramEraSeeds.map((seed) => seed.id)).size).toBe(footballProgramEraSeeds.length);

    const bySchoolCoach = new Map<string, string[]>();
    for (const seed of footballProgramEraSeeds) {
      expect(seed.endSeason - seed.startSeason + 1, seed.id).toBeGreaterThanOrEqual(3);
      expect(seed.eraCoach.trim().length, seed.id).toBeGreaterThan(0);
      expect(footballHistoricalTierIssue("CFB", seed.endSeason, seed.tier), seed.id).toBeNull();
      for (const titleSeason of seed.titleSelectionSeasons) {
        expect(titleSeason, seed.id).toBeGreaterThanOrEqual(seed.startSeason);
        expect(titleSeason, seed.id).toBeLessThanOrEqual(seed.endSeason);
      }

      const key = `${seed.school}|${seed.eraCoach}`;
      bySchoolCoach.set(key, [...(bySchoolCoach.get(key) ?? []), seed.id]);
    }

    const repeatedSchoolCoaches = [...bySchoolCoach.entries()]
      .filter(([, ids]) => ids.length > 1)
      .map(([key]) => key)
      .sort();
    expect(repeatedSchoolCoaches).toEqual([...approvedSameCoachSplits].sort());
  });

  it("preserves the approved coaching-era boundaries instead of slicing recent peaks into duplicate eras", () => {
    const byId = new Map(footballProgramEraSeeds.map((seed) => [seed.id, seed]));

    expect(byId.get("texas-1957-1976")?.eraCoach).toBe("Darrell K Royal");
    expect(byId.get("texas-2004-2009")?.eraCoach).toBe("Mack Brown");
    expect(byId.get("texas-2010-2013")?.eraCoach).toBe("Mack Brown");
    expect(byId.get("oklahoma-2000-2008")?.eraCoach).toBe("Bob Stoops");
    expect(byId.get("oklahoma-2009-2016")?.eraCoach).toBe("Bob Stoops");

    expect(byId.get("alabama-2008-2023")?.eraCoach).toBe("Nick Saban");
    expect(byId.get("clemson-2011-2025")?.eraCoach).toBe("Dabo Swinney");
    expect(byId.get("georgia-2017-2025")?.eraCoach).toBe("Kirby Smart");
    expect(byId.get("michigan-2015-2023")?.eraCoach).toBe("Jim Harbaugh");

    for (const rejectedSplitId of [
      "alabama-2009-2020",
      "alabama-2021-2023",
      "clemson-2011-2014",
      "clemson-2015-2020",
      "georgia-2016-2020",
      "georgia-2021-2024",
      "michigan-2015-2020",
      "michigan-2021-2023",
    ]) {
      expect(byId.has(rejectedSplitId), rejectedSplitId).toBe(false);
    }
  });

  it("registers every Program Era at its reviewed recognition tier with NCAA-backed title-count facts", () => {
    for (const seed of footballProgramEraSeeds) {
      const subject = getFootballSubject(seed.id);
      expect(subject, seed.id).not.toBeNull();
      expect(subject?.kind, seed.id).toBe("program-era");
      expect(subject?.league, seed.id).toBe("CFB");
      expect(subject?.school, seed.id).toBe(seed.school);
      expect(subject?.startSeason, seed.id).toBe(seed.startSeason);
      expect(subject?.endSeason, seed.id).toBe(seed.endSeason);
      expect(tierRank[subject!.recognizabilityTier], seed.id).toBeGreaterThanOrEqual(tierRank[seed.tier]);

      const factual = getFootballFactualRecord(seed.id);
      expect(factual, seed.id).not.toBeNull();
      const titleFact = factual?.facts.find((fact) => fact.metricId === "cfb-era-national-titles");
      expect(titleFact?.value, seed.id).toBe(seed.titleSelectionSeasons.length);
      expect(titleFact?.evidence.sourceIds, seed.id).toContain("ncaa-fbs-championship-history");
    }
  });
});
