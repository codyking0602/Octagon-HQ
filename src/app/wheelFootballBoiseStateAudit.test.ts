import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { wheelFootballCfbPriorityForSchoolId } from "../features/back-room/wheelFootballCfbPriority";

type BoiseAudit = {
  version: string;
  status: string;
  evidenceCutoff: string;
  priority: {
    QB: string[];
    RB: string[];
    WR: string[];
    TE: string[];
    Flex: string[];
    "Front Seven": string[];
    Secondary: string[];
    "Head Coach": string[];
  };
  grades: Array<{
    family: string;
    name: string;
    grade: number;
    eaRating: number | null;
  }>;
  eaDiscrepancyAudit: {
    mandatoryReviews: Array<{
      family: string;
      name: string;
      hq: number;
      ea: number;
      delta: number;
      majorRedFlag: boolean;
    }>;
    result: string;
  };
  coachExternalAudit: {
    result: string;
  };
  auditResult: {
    currentCandidateCount: number;
    priorityAndGradeStatus: string;
    result: string;
  };
};

const audit = JSON.parse(
  readFileSync(
    "data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json",
    "utf8",
  ),
) as BoiseAudit;

describe("Boise State CFB Wheel grading audit", () => {
  it("locks the corrected current Boise State shortlist from the reviewed audit", () => {
    expect(audit.version).toBe("cfb-wheel-boise-state-grades-2026-10-03-v2");
    expect(audit.status).toBe("audit-locked-runtime");
    expect(audit.evidenceCutoff).toBe("2026-09-26");
    expect(audit.auditResult).toMatchObject({
      currentCandidateCount: 19,
      priorityAndGradeStatus: "locked",
      result: "passed",
    });

    const priority = wheelFootballCfbPriorityForSchoolId("boise-state");
    expect(priority).not.toBeNull();
    expect(priority?.QB).toEqual(["Maddux Madsen"]);
    expect(priority?.RB).toEqual(["Dylan Riley", "Sire Gaines"]);
    expect(priority?.WR).toEqual(["Rasean Jones", "Akeem Wright", "Ben Ford", "Cam Bates"]);
    expect(priority?.TE).toEqual(["Matt Wagner"]);
    expect(priority?.Flex).toEqual(["Dylan Riley", "Rasean Jones", "Akeem Wright", "Matt Wagner"]);
    expect(priority?.["Front Seven"]).toEqual([
      "Jayden Virgin-Morgan",
      "Boen Phelps",
      "Max Stege",
      "Mikaio Edward",
      "Logan Brantley",
    ]);
    expect(priority?.Secondary).toEqual([
      "Jaden Mickey",
      "Travis Anderson",
      "JeRico Washington Jr.",
      "Roman Tillmon",
      "Sherrod Smith",
    ]);
    expect(priority?.["Head Coach"]).toEqual(["Spencer Danielson"]);

    expect(priority?.TE).not.toContain("Kaden Anderson");
    expect(priority?.["Front Seven"]).not.toContain("Jake Ripp");
    expect(priority?.["Front Seven"]).not.toContain("Sterling Lane II");
    expect(priority?.Secondary).not.toContain("Demetrius Freeney Jr.");
    expect(priority?.Secondary).not.toContain("Derek Ganter Jr.");
  });

  it("locks all 19 current Boise grades against the shared CFB scale", () => {
    const grades = new Map(audit.grades.map((row) => [`${row.family}|${row.name}`, row.grade]));

    expect(grades.size).toBe(19);
    expect(Object.fromEntries(grades)).toEqual({
      "QB|Maddux Madsen": 88,
      "RB|Dylan Riley": 95,
      "RB|Sire Gaines": 88,
      "WR|Rasean Jones": 87,
      "WR|Akeem Wright": 84,
      "WR|Ben Ford": 83,
      "WR|Cam Bates": 82,
      "TE|Matt Wagner": 84,
      "Front Seven|Jayden Virgin-Morgan": 93,
      "Front Seven|Boen Phelps": 88,
      "Front Seven|Max Stege": 85,
      "Front Seven|Mikaio Edward": 83,
      "Front Seven|Logan Brantley": 80,
      "Secondary|Jaden Mickey": 88,
      "Secondary|Travis Anderson": 86,
      "Secondary|JeRico Washington Jr.": 86,
      "Secondary|Roman Tillmon": 84,
      "Secondary|Sherrod Smith": 84,
      "Head Coach|Spencer Danielson": 86,
    });

    for (const family of ["QB", "RB", "WR", "TE", "Front Seven", "Secondary", "Head Coach"] as const) {
      for (const name of audit.priority[family]) {
        expect(grades.has(`${family}|${name}`), `${family} ${name}`).toBe(true);
      }
    }

    for (const name of audit.priority.Flex) {
      const matchingFamilies = ["RB", "WR", "TE"].filter((family) =>
        grades.has(`${family}|${name}`),
      );
      expect(matchingFamilies, `Flex ${name}`).toHaveLength(1);
    }
  });

  it("requires a written review for every 7+ EA gap and a major-red-flag review for every 10+ gap", () => {
    const reviews = new Map(
      audit.eaDiscrepancyAudit.mandatoryReviews.map((review) => [
        `${review.family}|${review.name}`,
        review,
      ]),
    );

    for (const row of audit.grades) {
      if (row.eaRating == null) continue;
      const delta = row.grade - row.eaRating;
      if (Math.abs(delta) < 7) continue;

      const review = reviews.get(`${row.family}|${row.name}`);
      expect(review, `missing discrepancy review for ${row.name}`).toBeDefined();
      expect(review?.hq).toBe(row.grade);
      expect(review?.ea).toBe(row.eaRating);
      expect(review?.delta).toBe(delta);
      if (Math.abs(delta) >= 10) {
        expect(review?.majorRedFlag, `missing major-red-flag review for ${row.name}`).toBe(true);
      }
    }

    expect(audit.eaDiscrepancyAudit.result).toBe("passed");
    expect(audit.coachExternalAudit.result).toBe("passed");
  });

  it("wires the audited grades into the server-owned grade authority", () => {
    const migration = readFileSync(
      "supabase/migrations/202612310252_wheel_football_boise_state_grading_audit.sql",
      "utf8",
    );

    expect(migration).toContain("cfb-wheel-boise-state-grades-2026-10-03-v2");
    expect(migration).toContain("wheel-football-boise-state-grading-audit-2026-10-03.json");
    for (const row of audit.grades) {
      expect(migration).toContain(`private.wheel_football_grade_name_key('${row.name.replaceAll("'", "''")}')`);
      expect(migration).toContain(`, ${row.grade.toFixed(1)}, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2'`);
    }
  });
});
