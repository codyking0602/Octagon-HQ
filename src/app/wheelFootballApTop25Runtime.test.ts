import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  WHEEL_FOOTBALL_AP_TOP_25,
  WHEEL_FOOTBALL_AP_TOP_25_POLL_DATE,
  WHEEL_FOOTBALL_AP_TOP_25_SOURCE_URL,
} from "../features/back-room/wheelFootballApTop25";

describe("Wheel of Football AP Top 25 runtime", () => {
  const migration = readFileSync(
    "supabase/migrations/202612310251_wheel_football_ap_top25.sql",
    "utf8",
  );
  const boiseAuditMigration = readFileSync(
    "supabase/migrations/202612310252_wheel_football_boise_state_grading_audit.sql",
    "utf8",
  );
  const page = readFileSync("src/features/back-room/FootballWheelPage.tsx", "utf8");

  it("locks the latest AP poll snapshot to exactly 25 unique schools", () => {
    expect(WHEEL_FOOTBALL_AP_TOP_25_POLL_DATE).toBe("2026-09-27");
    expect(WHEEL_FOOTBALL_AP_TOP_25_SOURCE_URL).toContain("apnews.com/");
    expect(WHEEL_FOOTBALL_AP_TOP_25).toHaveLength(25);
    expect(WHEEL_FOOTBALL_AP_TOP_25.map((entry) => entry.rank)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1),
    );
    expect(new Set(WHEEL_FOOTBALL_AP_TOP_25.map((entry) => entry.schoolId)).size).toBe(25);
    expect(WHEEL_FOOTBALL_AP_TOP_25[0]).toEqual({ rank: 1, schoolId: "texas" });
    expect(WHEEL_FOOTBALL_AP_TOP_25[21]).toEqual({ rank: 22, schoolId: "boise-state" });
  });

  it("keeps the backend AP pool private and the Boise grading authority on the audited v2 snapshot", () => {
    expect(migration).toContain("private.wheel_football_ap_top_25");
    expect(migration).toContain("'AP_TOP_25'");
    expect(migration).toContain("'boise-state', 'Boise State', 'Pac-12'");
    expect(migration).toContain("revoke all on private.wheel_football_ap_top_25 from public, anon, authenticated");

    expect(boiseAuditMigration).toContain("cfb-wheel-boise-state-grades-2026-10-03-v2");
    expect(boiseAuditMigration).toContain("private.wheel_football_grade_name_key('Maddux Madsen')");
    expect(boiseAuditMigration).toContain("private.wheel_football_grade_name_key('Dylan Riley')");
    expect(boiseAuditMigration).toContain("private.wheel_football_grade_name_key('Matt Wagner')");
    expect(boiseAuditMigration).toContain("private.wheel_football_grade_name_key('Max Stege')");
    expect(boiseAuditMigration).toContain("private.wheel_football_grade_name_key('Roman Tillmon')");
    expect(boiseAuditMigration).toContain("private.wheel_football_grade_name_key('Spencer Danielson')");
  });

  it("exposes the Top 25 mode and opens 2026 reference pages without leaving Wheel", () => {
    expect(page).toContain('{ value: "AP_TOP_25", label: "AP TOP 25"');
    expect(page).toContain('href={team.sportsReferenceUrl}');
    expect(page).toContain('target="_blank"');
    expect(page).toContain('showRank={state.pool_scope === "AP_TOP_25"}');
  });
});
