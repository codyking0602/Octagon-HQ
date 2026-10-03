import { describe, expect, it } from "vitest";
import currentCfbPriorityJson from "../../../data/generated/football/cfb/wheel-football-current-priorities-2026.json";
import auditedCfbPriorityJson from "../../../data/curated/football/cfb/wheel-football-priority-audit-2026-10-03.json";
import {
  CFB_CURRENT_SCHOOLS_2026,
} from "./footballCfbCurrentSchoolScope";
import {
  WHEEL_FOOTBALL_CFB_BASELINE_LAUNCH_READY,
  WHEEL_FOOTBALL_CFB_GRADING_COMPLETE,
  WHEEL_FOOTBALL_CFB_PRIORITY_AUDIT_COMPLETE,
  wheelFootballCfbBaseline,
  wheelFootballCfbBaselineAudit,
  wheelFootballCfbPriority,
  wheelFootballCfbPriorityAudit,
  wheelFootballCfbPriorityForSchoolId,
} from "./wheelFootballCfbPriority";

function assertUnique(values: readonly string[], label: string) {
  expect(new Set(values).size, label).toBe(values.length);
}

function findForbiddenGradeKey(value: unknown, path = "root"): string | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findForbiddenGradeKey(value[index], `${path}[${index}]`);
      if (found) return found;
    }
    return null;
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (/grade|rating|score/i.test(key)) return `${path}.${key}`;
    const found = findForbiddenGradeKey(child, `${path}.${key}`);
    if (found) return found;
  }
  return null;
}

describe("2026 current CFB Wheel priority authority", () => {
  it("covers exactly the approved 68-school current universe after manual audit", () => {
    const expectedIds = CFB_CURRENT_SCHOOLS_2026.map((school) => school.id).sort();
    const actualIds = Object.keys(wheelFootballCfbPriority).sort();

    expect(actualIds).toEqual(expectedIds);
    expect(wheelFootballCfbPriorityAudit.teamCount).toBe(68);
    expect(wheelFootballCfbPriorityAudit.season).toBe(2026);
    expect(wheelFootballCfbPriorityAudit.teamsChanged).toBe(65);
    expect(wheelFootballCfbPriorityAudit.groupsChanged).toBe(180);

    const conferenceCounts = Object.values(wheelFootballCfbPriority).reduce<Record<string, number>>(
      (counts, team) => {
        counts[team.conference] = (counts[team.conference] ?? 0) + 1;
        return counts;
      },
      {},
    );

    expect(conferenceCounts).toEqual({
      SEC: 16,
      "Big Ten": 18,
      "Big 12": 16,
      ACC: 17,
      Independent: 1,
    });
  });

  it("keeps the source-derived Step 2 baseline separate from the Step 3 audited authority", () => {
    expect(wheelFootballCfbBaselineAudit.status).toBe(
      "generated-baseline-pending-manual-conference-audit",
    );
    expect(wheelFootballCfbPriorityAudit.status).toBe(
      "manually-audited-current-priorities",
    );
    expect(WHEEL_FOOTBALL_CFB_PRIORITY_AUDIT_COMPLETE).toBe(true);
    expect(WHEEL_FOOTBALL_CFB_GRADING_COMPLETE).toBe(false);
    expect(WHEEL_FOOTBALL_CFB_BASELINE_LAUNCH_READY).toBe(false);
    expect(wheelFootballCfbPriorityAudit.auditComplete).toBe(true);
    expect(wheelFootballCfbPriorityAudit.gradingComplete).toBe(false);
    expect(wheelFootballCfbPriorityAudit.launchReady).toBe(false);

    expect(wheelFootballCfbBaseline.alabama.RB).toEqual([
      "Daniel Hill",
      "Trae'shawn Brown",
    ]);
    expect(wheelFootballCfbPriority.alabama.RB).toEqual([
      "Daniel Hill",
      "Trae'shawn Brown",
      "EJ Crowell",
    ]);
  });

  it("locks compact football-sensible candidate ceilings without random padding", () => {
    for (const [schoolId, team] of Object.entries(wheelFootballCfbPriority)) {
      expect(team.QB.length, `${schoolId} QB`).toBe(1);
      expect(team.RB.length, `${schoolId} RB`).toBeGreaterThanOrEqual(2);
      expect(team.RB.length, `${schoolId} RB`).toBeLessThanOrEqual(3);
      expect(team.WR.length, `${schoolId} WR`).toBeGreaterThanOrEqual(3);
      expect(team.WR.length, `${schoolId} WR`).toBeLessThanOrEqual(4);
      expect(team.TE.length, `${schoolId} TE`).toBeGreaterThanOrEqual(1);
      expect(team.TE.length, `${schoolId} TE`).toBeLessThanOrEqual(2);
      expect(team.Flex.length, `${schoolId} Flex`).toBe(4);
      expect(team["Front Seven"].length, `${schoolId} front seven`).toBeGreaterThanOrEqual(5);
      expect(team["Front Seven"].length, `${schoolId} front seven`).toBeLessThanOrEqual(6);
      expect(team.Secondary.length, `${schoolId} secondary`).toBeGreaterThanOrEqual(5);
      expect(team.Secondary.length, `${schoolId} secondary`).toBeLessThanOrEqual(6);
      expect(team["Head Coach"].length, `${schoolId} head coach`).toBe(1);

      for (const slot of ["QB", "RB", "WR", "TE", "Flex", "Front Seven", "Secondary", "Head Coach"] as const) {
        assertUnique(team[slot], `${schoolId} ${slot}`);
        expect(team[slot].every((name) => name.trim().length > 0), `${schoolId} ${slot}`).toBe(true);
      }
    }
  });

  it("preserves high-confidence current anchors from every conference", () => {
    expect(wheelFootballCfbPriorityForSchoolId("alabama")?.["Front Seven"][0]).toBe("Yhonzae Pierre");
    expect(wheelFootballCfbPriorityForSchoolId("florida")?.WR).toEqual([
      "Vernell Brown III",
      "Dallas Wilson",
      "Eric Singleton Jr.",
    ]);
    expect(wheelFootballCfbPriorityForSchoolId("georgia")?.["Front Seven"]).toEqual([
      "Raylen Wilson",
      "Elijah Griffin",
      "Chris Cole",
      "Gabe Harris Jr.",
      "Jordan Hall",
      "Quintavius Johnson",
    ]);
    expect(wheelFootballCfbPriorityForSchoolId("missouri")?.RB[0]).toBe("Ahmad Hardy");
    expect(wheelFootballCfbPriorityForSchoolId("south-carolina")?.["Front Seven"][0]).toBe("Dylan Stewart");
    expect(wheelFootballCfbPriorityForSchoolId("texas")?.["Front Seven"].slice(0, 2)).toEqual([
      "Colin Simmons",
      "Rasheem Biles",
    ]);
    expect(wheelFootballCfbPriorityForSchoolId("texas-am")?.WR).toContain("Terry Bussey");

    expect(wheelFootballCfbPriorityForSchoolId("ohio-state")?.["Front Seven"][0]).toBe("Riley Pettijohn");
    expect(wheelFootballCfbPriorityForSchoolId("oregon")?.["Front Seven"].slice(0, 2)).toEqual([
      "Amauri Washington",
      "Matayo Uiagalelei",
    ]);
    expect(wheelFootballCfbPriorityForSchoolId("penn-state")?.TE[0]).toBe("Benjamin Brahmer");

    expect(wheelFootballCfbPriorityForSchoolId("byu")?.["Front Seven"].slice(0, 2)).toEqual([
      "Keanu Tanuvasa",
      "Cade Uluave",
    ]);
    expect(wheelFootballCfbPriorityForSchoolId("texas-tech")?.WR).toContain("Malcolm Simmons");
    expect(wheelFootballCfbPriorityForSchoolId("utah")?.["Front Seven"][0]).toBe("Trey Reynolds");

    expect(wheelFootballCfbPriorityForSchoolId("boston-college")?.["Front Seven"]).toContain("E'Lla Boykin");
    expect(wheelFootballCfbPriorityForSchoolId("miami")?.WR[0]).toBe("Malachi Toney");
    expect(wheelFootballCfbPriorityForSchoolId("virginia")?.RB).toContain("Xay Davis");

    expect(wheelFootballCfbPriorityForSchoolId("notre-dame")?.["Front Seven"][0]).toBe("Kyngstonn Viliamu-Asa");
    expect(wheelFootballCfbPriorityForSchoolId("notre-dame")?.Secondary[0]).toBe("Leonard Moore");
  });

  it("keeps corrected linebackers out of the secondary", () => {
    expect(wheelFootballCfbPriorityForSchoolId("pittsburgh")?.Secondary).not.toContain("Braylan Lovelace");
    expect(wheelFootballCfbPriorityForSchoolId("texas-tech")?.Secondary).not.toContain("John Curry");
    expect(wheelFootballCfbPriorityForSchoolId("duke")?.Secondary).not.toContain("Luke Mergott");
  });

  it("records only known school/group overrides and contains no grading", () => {
    const audit = auditedCfbPriorityJson as {
      overrides: Record<string, Record<string, unknown>>;
    };
    const validSchoolIds = new Set(CFB_CURRENT_SCHOOLS_2026.map((school) => school.id));
    const validGroups = new Set([
      "QB", "RB", "WR", "TE", "Flex", "Front Seven", "Secondary", "Head Coach",
    ]);

    expect(Object.keys(audit.overrides)).toHaveLength(65);
    for (const [schoolId, groups] of Object.entries(audit.overrides)) {
      expect(validSchoolIds.has(schoolId), schoolId).toBe(true);
      for (const group of Object.keys(groups)) {
        expect(validGroups.has(group), `${schoolId} ${group}`).toBe(true);
      }
    }

    expect(findForbiddenGradeKey(currentCfbPriorityJson)).toBeNull();
    expect(findForbiddenGradeKey(auditedCfbPriorityJson)).toBeNull();
  });
});
