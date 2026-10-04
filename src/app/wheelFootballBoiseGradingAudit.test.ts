import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { wheelFootballCfbPriorityForSchoolId } from "../features/back-room/wheelFootballCfbPriority";

type BoiseAuditRow = {
  family: "QB" | "RB" | "WR" | "TE" | "Front Seven" | "Secondary" | "Head Coach";
  player?: string;
  coach?: string;
  priorGrade: number | null;
  grade: number;
  ea: number | null;
  review: string;
  majorRedFlag: boolean;
};

describe("Boise State CFB Wheel grading audit", () => {
  const audit = JSON.parse(
    readFileSync(
      "data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json",
      "utf8",
    ),
  ) as {
    version: string;
    status: string;
    replacedIdentity: { player: string; replacement: string };
    grades: BoiseAuditRow[];
    auditResult: {
      population: string;
      pairwiseNeighbors: string;
      eaDiscrepancies: string;
      rangeSeparation: string;
      contradictionsRemaining: boolean;
      locked: boolean;
    };
  };
  const migration = readFileSync(
    "supabase/migrations/202612310252_wheel_football_boise_grading_audit.sql",
    "utf8",
  );
  const boise = wheelFootballCfbPriorityForSchoolId("boise-state");

  const byIdentity = new Map(
    audit.grades.map((row) => [
      `${row.family}|${row.player ?? row.coach}`,
      row,
    ]),
  );

  it("uses the audited current Boise population with Matt Wagner at TE", () => {
    expect(boise).not.toBeNull();
    expect(boise?.TE).toEqual(["Matt Wagner"]);
    expect(boise?.Flex).toEqual([
      "Dylan Riley",
      "Rasean Jones",
      "Cam Bates",
      "Matt Wagner",
    ]);
    expect([
      ...boise!.QB,
      ...boise!.RB,
      ...boise!.WR,
      ...boise!.TE,
      ...boise!["Front Seven"],
      ...boise!.Secondary,
      ...boise!["Head Coach"],
      ...boise!.Flex,
    ]).not.toContain("Kaden Anderson");
    expect(audit.replacedIdentity).toMatchObject({
      player: "Kaden Anderson",
      replacement: "Matt Wagner",
    });
  });

  it("covers every current non-Flex Boise option exactly once", () => {
    const families = [
      "QB",
      "RB",
      "WR",
      "TE",
      "Front Seven",
      "Secondary",
      "Head Coach",
    ] as const;
    const expected = families.flatMap((family) =>
      boise![family].map((name) => `${family}|${name}`),
    );

    expect(audit.grades).toHaveLength(18);
    expect(new Set(expected).size).toBe(18);
    expect(new Set(byIdentity.keys())).toEqual(new Set(expected));

    for (const flexName of boise!.Flex) {
      const matches = (["RB", "WR", "TE"] as const).filter((family) =>
        byIdentity.has(`${family}|${flexName}`),
      );
      expect(matches, flexName).toHaveLength(1);
    }
  });

  it("locks the neighbor-calibrated Boise grades and all discrepancy reviews", () => {
    expect(audit.version).toBe("cfb-wheel-ap25-boise-2026-10-03-v2");
    expect(audit.status).toBe("audit-locked-runtime");
    expect(audit.auditResult).toEqual({
      population: "passed",
      pairwiseNeighbors: "passed",
      eaDiscrepancies: "passed",
      rangeSeparation: "passed",
      contradictionsRemaining: false,
      locked: true,
    });

    expect(byIdentity.get("RB|Dylan Riley")?.grade).toBe(94);
    expect(byIdentity.get("TE|Matt Wagner")?.grade).toBe(84);
    expect(byIdentity.get("Front Seven|Jayden Virgin-Morgan")?.grade).toBe(91);
    expect(byIdentity.get("Front Seven|Jake Ripp")?.grade).toBe(80);
    expect(byIdentity.get("Secondary|Demetrius Freeney Jr.")?.grade).toBe(75);
    expect(byIdentity.get("Head Coach|Spencer Danielson")?.grade).toBe(88);

    for (const row of audit.grades) {
      if (row.ea == null) continue;
      const delta = Math.abs(row.grade - row.ea);
      if (delta >= 7) {
        expect(row.review.trim().length, row.player ?? row.coach).toBeGreaterThan(20);
      }
      if (delta >= 10) {
        expect(row.majorRedFlag, row.player ?? row.coach).toBe(true);
      }
    }
  });

  it("wires every audited Boise identity into the private v2 grade authority", () => {
    expect(migration).toContain("cfb-wheel-ap25-boise-2026-10-03-v2");
    expect(migration).toContain(
      "data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json",
    );
    for (const row of audit.grades) {
      const name = (row.player ?? row.coach)!;
      expect(migration, name).toContain(
        `private.wheel_football_grade_name_key('${name.replaceAll("'", "''")}')`,
      );
    }
  });
});
