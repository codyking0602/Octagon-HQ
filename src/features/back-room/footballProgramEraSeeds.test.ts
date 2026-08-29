import { describe, expect, it } from "vitest";

import { getFootballFactualRecord } from "./footballFactualStatsCore";
import { footballProgramEraSeeds } from "./footballProgramEraSeeds";
import { footballHistoricalTierIssue } from "./footballRecognitionHistoricalPolicy";
import { getFootballSubject, queryFootballSubjects } from "./footballSubjectRegistry";

const approvedSameCoachSplits = new Set([
  "Oklahoma|Bob Stoops",
  "Texas|Mack Brown",
]);

const approvedLegacyProgramEraTitleEvidence = new Map([
  ["usc-2002-2008", "cfr-program-records"],
]);

describe("Stage 13.5 CFB Program Era recognition", () => {
  it("keeps Program Eras substantial, coach-defined, unique and historically valid", () => {
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

    expect(byId.get("oregon-2009-2012")?.eraCoach).toBe("Chip Kelly");
    expect(byId.get("oregon-2013-2016")?.eraCoach).toBe("Mark Helfrich");
    expect(byId.get("ohio-state-2012-2018")?.eraCoach).toBe("Urban Meyer");
    expect(byId.get("ohio-state-2019-2025")?.eraCoach).toBe("Ryan Day");
    expect(byId.get("texas-2014-2016")?.tier).toBe("C");
    expect(byId.get("nebraska-2018-2022")?.tier).toBe("C");

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

  it("registers exactly the reviewed Program Era owner at its reviewed recognition tier", () => {
    const canonicalEras = queryFootballSubjects({ kind: "program-era", league: "CFB" });
    expect(canonicalEras.map((subject) => subject.id).sort())
      .toEqual(footballProgramEraSeeds.map((seed) => seed.id).sort());

    for (const seed of footballProgramEraSeeds) {
      const subject = getFootballSubject(seed.id);
      expect(subject, seed.id).not.toBeNull();
      expect(subject?.kind, seed.id).toBe("program-era");
      expect(subject?.league, seed.id).toBe("CFB");
      expect(subject?.school, seed.id).toBe(seed.school);
      expect(subject?.startSeason, seed.id).toBe(seed.startSeason);
      expect(subject?.endSeason, seed.id).toBe(seed.endSeason);
      expect(subject?.recognizabilityTier, seed.id).toBe(seed.tier);
      expect(subject?.casualEligible, seed.id).toBe(true);

      const sourceKeys = subject?.sourceIdentityKeys.map((key) => `${key.provider}:${key.id}`) ?? [];
      expect(new Set(sourceKeys).size, seed.id).toBe(sourceKeys.length);
    }
  });

  it("hydrates every Program Era with reviewed national-title facts", () => {
    for (const seed of footballProgramEraSeeds) {
      const factual = getFootballFactualRecord(seed.id);
      expect(factual, seed.id).not.toBeNull();
      const titleFact = factual?.facts.find((fact) => fact.metricId === "cfb-era-national-titles");
      expect(titleFact?.value, seed.id).toBe(seed.titleSelectionSeasons.length);

      const approvedLegacySource = approvedLegacyProgramEraTitleEvidence.get(seed.id);
      if (approvedLegacySource) {
        expect(titleFact?.evidence.sourceIds, seed.id).toContain(approvedLegacySource);
      } else {
        expect(titleFact?.evidence.sourceIds, seed.id).toContain("ncaa-fbs-championship-history");
      }
    }
  });
});
