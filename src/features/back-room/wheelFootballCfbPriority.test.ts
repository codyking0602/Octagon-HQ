import { describe, expect, it } from "vitest";
import currentCfbPriorityJson from "../../../data/generated/football/cfb/wheel-football-current-priorities-2026.json";
import {
  CFB_CURRENT_SCHOOLS_2026,
} from "./footballCfbCurrentSchoolScope";
import {
  WHEEL_FOOTBALL_CFB_BASELINE_LAUNCH_READY,
  wheelFootballCfbBaseline,
  wheelFootballCfbBaselineAudit,
  wheelFootballCfbBaselineForSchoolId,
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

describe("2026 current CFB Wheel roster baseline", () => {
  it("covers exactly the approved 68-school current universe", () => {
    const expectedIds = CFB_CURRENT_SCHOOLS_2026.map((school) => school.id).sort();
    const actualIds = Object.keys(wheelFootballCfbBaseline).sort();

    expect(actualIds).toEqual(expectedIds);
    expect(wheelFootballCfbBaselineAudit.teamCount).toBe(68);
    expect(wheelFootballCfbBaselineAudit.season).toBe(2026);

    const conferenceCounts = Object.values(wheelFootballCfbBaseline).reduce<Record<string, number>>(
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

  it("locks compact current-player pools without padding from ESPN roster order", () => {
    for (const [schoolId, team] of Object.entries(wheelFootballCfbBaseline)) {
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

      expect(team.depthChartUrl).toMatch(/^https:\/\/secure\.ourlads\.com\/ncaa-football-depth-charts\/pfdepthchart\//);
      expect(team.rosterUrl).toBe(
        `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${team.espnId}/roster`,
      );
      expect(Array.isArray(team.reconciliationWarnings)).toBe(true);
    }
  });

  it("keeps Step 2 explicitly out of CFB Wheel runtime until the manual conference audits are complete", () => {
    expect(WHEEL_FOOTBALL_CFB_BASELINE_LAUNCH_READY).toBe(false);
    expect(wheelFootballCfbBaselineAudit.status).toBe(
      "generated-baseline-pending-manual-conference-audit",
    );
    expect(wheelFootballCfbBaselineAudit.notes).toContain(
      "Step 3 must manually audit football importance",
    );
  });

  it("contains no player grading or hidden scores", () => {
    expect(findForbiddenGradeKey(currentCfbPriorityJson)).toBeNull();
  });

  it("preserves recognizable current anchors while leaving ordering for Step 3 audit", () => {
    expect(wheelFootballCfbBaselineForSchoolId("texas")?.QB).toEqual(["Arch Manning"]);
    expect(wheelFootballCfbBaselineForSchoolId("texas")?.["Head Coach"]).toEqual(["Steve Sarkisian"]);
    expect(wheelFootballCfbBaselineForSchoolId("notre-dame")?.QB).toEqual(["CJ Carr"]);
    expect(wheelFootballCfbBaselineForSchoolId("notre-dame")?.Secondary).toContain("Leonard Moore");
    expect(wheelFootballCfbBaselineForSchoolId("vanderbilt")?.RB).toContain("Makhilyn Young");
  });
});
