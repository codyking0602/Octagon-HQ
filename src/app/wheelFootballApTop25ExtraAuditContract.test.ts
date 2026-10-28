import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  WHEEL_FOOTBALL_AP_TOP_25,
} from "../features/back-room/wheelFootballApTop25";
import {
  wheelFootballPoolTeams,
} from "../features/back-room/wheelFootballModel";
import {
  wheelFootballCfbPriorityForSchoolId,
} from "../features/back-room/wheelFootballCfbPriority";

type AuditGrade = {
  family: string;
  name: string;
  grade: number;
  eaRating: number | null;
};

type ExtraAudit = {
  version: string;
  status: string;
  schoolId: string;
  priority: Record<string, unknown> & {
    espnId: string;
    QB: string[];
    RB: string[];
    WR: string[];
    TE: string[];
    Flex: string[];
    "Front Seven": string[];
    Secondary: string[];
    "Head Coach": string[];
  };
  grades: AuditGrade[];
  eaDiscrepancyAudit: {
    result: string;
    mandatoryReviews: Array<{
      family: string;
      name: string;
      hq: number;
      ea: number;
      delta: number;
      majorRedFlag: boolean;
    }>;
  };
  coachExternalAudit: { result: string };
  auditResult: {
    priorityAndGradeStatus: string;
    result: string;
  };
};

const baseline = JSON.parse(
  readFileSync(
    "data/generated/football/cfb/wheel-football-current-priorities-2026.json",
    "utf8",
  ),
) as { teams: Record<string, { espnId: string }> };

const extraAuditFiles = readdirSync("data/curated/football/cfb")
  .filter((file) => /^wheel-football-.+-grading-audit-\d{4}-\d{2}-\d{2}\.json$/.test(file));

const extraAudits = new Map<string, { filename: string; audit: ExtraAudit }>();
for (const filename of extraAuditFiles) {
  const audit = JSON.parse(
    readFileSync(`data/curated/football/cfb/${filename}`, "utf8"),
  ) as ExtraAudit;
  if (audit.status === "audit-locked-runtime") {
    extraAudits.set(audit.schoolId, { filename, audit });
  }
}

function sqlEscaped(value: string) {
  return value.replaceAll("'", "''");
}

describe("CFB Wheel AP Top 25 extra-team audit contract", () => {
  const extras = WHEEL_FOOTBALL_AP_TOP_25
    .map((entry) => entry.schoolId)
    .filter((schoolId) => !baseline.teams[schoolId]);

  it("keeps every current Top 25 school outside the 68-school base behind a locked extra-team audit", () => {
    expect(extras).toContain("boise-state");
    expect(WHEEL_FOOTBALL_AP_TOP_25).toContainEqual({ rank: 3, schoolId: "notre-dame" });
    expect(baseline.teams["notre-dame"]).toMatchObject({ espnId: "87" });
    for (const schoolId of extras) {
      expect(
        extraAudits.has(schoolId),
        `${schoolId} entered the Top 25 without a locked extra-team grading audit`,
      ).toBe(true);
    }
  });

  it("requires every extra Top 25 team to pass the full Boise-style audit before runtime coverage", () => {
    const top25Teams = wheelFootballPoolTeams("AP_TOP_25");
    expect(top25Teams).toHaveLength(25);

    const worker = readFileSync("worker/index.ts", "utf8");
    const allowlistMatch = worker.match(
      /const CFB_ROSTER_ESPN_IDS = new Set\(\[([\s\S]*?)\]\);/,
    );
    expect(allowlistMatch, "CFB roster proxy allowlist must remain parseable").not.toBeNull();
    const rosterAllowlist = allowlistMatch?.[1] ?? "";

    const migrations = readdirSync("supabase/migrations")
      .filter((file) => file.endsWith(".sql"))
      .map((file) => readFileSync(`supabase/migrations/${file}`, "utf8"))
      .join("\n");

    for (const schoolId of extras) {
      const record = extraAudits.get(schoolId);
      expect(record, `${schoolId} missing audit-locked-runtime artifact`).toBeDefined();
      if (!record) continue;

      const { filename, audit } = record;
      expect(audit.auditResult).toMatchObject({
        priorityAndGradeStatus: "locked",
        result: "passed",
      });
      expect(audit.eaDiscrepancyAudit.result).toBe("passed");
      expect(audit.coachExternalAudit.result).toBe("passed");

      const runtimePriority = wheelFootballCfbPriorityForSchoolId(schoolId);
      expect(runtimePriority, `${schoolId} missing audited runtime priority`).not.toBeNull();
      expect(runtimePriority?.espnId).toBe(audit.priority.espnId);

      const runtimeTeam = top25Teams.find((team) => team.code === schoolId);
      expect(runtimeTeam, `${schoolId} missing AP Top 25 runtime team metadata`).toBeDefined();
      expect(runtimeTeam?.espnId).toBe(audit.priority.espnId);
      expect(rosterAllowlist).toContain(`"${audit.priority.espnId}"`);

      const grades = new Map(
        audit.grades.map((row) => [`${row.family}|${row.name}`, row]),
      );
      const families = [
        "QB",
        "RB",
        "WR",
        "TE",
        "Front Seven",
        "Secondary",
        "Head Coach",
      ] as const;

      for (const family of families) {
        for (const name of audit.priority[family]) {
          expect(
            grades.has(`${family}|${name}`),
            `${schoolId} missing ${family} grade for ${name}`,
          ).toBe(true);
        }
      }

      for (const name of audit.priority.Flex) {
        const inherited = ["RB", "WR", "TE"].filter((family) =>
          grades.has(`${family}|${name}`),
        );
        expect(inherited, `${schoolId} Flex identity ${name}`).toHaveLength(1);
      }

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
        expect(review, `${schoolId} missing EA discrepancy review for ${row.name}`).toBeDefined();
        expect(review?.delta).toBe(delta);
        if (Math.abs(delta) >= 10) {
          expect(
            review?.majorRedFlag,
            `${schoolId} missing major-red-flag review for ${row.name}`,
          ).toBe(true);
        }
      }

      expect(migrations).toContain(audit.version);
      expect(migrations).toContain(filename);
      for (const row of audit.grades) {
        expect(migrations).toContain(
          `private.wheel_football_grade_name_key('${sqlEscaped(row.name)}')`,
        );
      }
    }
  });
});
