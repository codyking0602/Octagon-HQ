import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import ledger from "../../../data/curated/football/nfl/wheel-nfl-madden-editorial-revisions-2026-10-28.json";
import te from "../../../data/generated/football/wheel-nfl-te-grades-2026-10-28.json";
import secondary from "../../../data/generated/football/wheel-nfl-secondary-grades-2026-10-28.json";
import coaches from "../../../data/generated/football/wheel-nfl-head-coach-grades-2026-10-28.json";
import historicalTe from "../../../data/generated/football/wheel-nfl-te-grades-2026-10-03.json";
import historicalSecondary from "../../../data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json";
import historicalCoaches from "../../../data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json";
import { WHEEL_NFL_GM_AUTHORITY } from "./wheelFootballNflCurrentAuthority";
import { FOOTBALL_GM_PLAYER_POOL } from "./footballGmEngine";

const sources: Record<string, { grades: readonly { team: string; player?: string; coach?: string; grade: number }[] }> = {
  TE: te, Secondary: secondary, "Head Coach": coaches,
};
const historical: typeof sources = {
  TE: historicalTe, Secondary: historicalSecondary, "Head Coach": historicalCoaches,
};
const sql = readFileSync("supabase/migrations/202612310885_nfl_madden_editorial_first_cycle.sql", "utf8");
const postRatingWorkflow = readFileSync(".github/workflows/wheel-nfl-development-post-ratings.yml", "utf8");
const postRatingScript = readFileSync("scripts/wheel-monitor/nfl-development-post-ratings.mjs", "utf8");
const coachWorkflow = readFileSync(".github/workflows/wheel-nfl-coach-current-review.yml", "utf8");

describe("NFL first Madden editorial ability cycle — append-only", () => {
  it("makes seven independently reasoned current-ability decisions with an unchanged historical seed", () => {
    expect(ledger.changes).toHaveLength(7);
    expect(ledger.changes.filter(x => x.family === "Head Coach")).toHaveLength(3);
    expect(ledger.changes.filter(x => x.family !== "Head Coach")).toHaveLength(4);
    expect(new Set(ledger.changes.map(x => [x.team,x.family,x.subject].join("|"))).size).toBe(7);
    for (const c of ledger.changes) {
      const current = sources[c.family]!.grades.find(x => x.team === c.team && (x.player ?? x.coach) === c.subject);
      const original = historical[c.family]!.grades.find(x => x.team === c.team && (x.player ?? x.coach) === c.subject);
      expect(current?.grade, c.subject).toBe(c.approvedGrade);
      expect(original?.grade, c.subject).toBe(c.previousGrade);
      expect(c.reason.length, c.subject).toBeGreaterThan(110);
      expect(c.sourceUrls.length, c.subject).toBeGreaterThan(0);
      expect(c.sourceUrls.every(url => url.startsWith("https://")), c.subject).toBe(true);
      expect(sql).toContain("'" + c.subject + "'," + c.approvedGrade + ",date '2026-10-28'");
    }
    expect(te.grades).toHaveLength(33);
    expect(secondary.grades).toHaveLength(168);
    expect(coaches.grades).toHaveLength(32);
  });
  it("updates current Wheel/GM bindings while retaining 594 stable GM player entries", () => {
    expect(WHEEL_NFL_GM_AUTHORITY.gradeFiles.TE).toBe("wheel-nfl-te-grades-2026-10-28.json");
    expect(WHEEL_NFL_GM_AUTHORITY.gradeFiles.Secondary).toBe("wheel-nfl-secondary-grades-2026-10-28.json");
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
    for (const c of ledger.changes.filter(x => x.family !== "Head Coach")) {
      const pool = FOOTBALL_GM_PLAYER_POOL.find(p=>p.team===c.team&&p.family===c.family&&p.name===c.subject);
      expect(pool?.currentGrade, c.subject).toBe(c.approvedGrade);
    }
  });
  it("guarantees backend grade append-only and stage-two automatic development reevaluation", () => {
    expect(sql).toContain("order by g.effective_date desc limit 1");
    expect(sql).toContain("preflight mismatch");
    expect(sql).toContain("postflight mismatch");
    expect(sql).not.toMatch(/\b(?:update|delete\s+from|truncate)\s+private\.wheel_football_(?:grade_authority|picks)\b/i);
    expect(postRatingWorkflow).toContain("wheel-nfl-*-grades-*.json");
    expect(postRatingWorkflow).toContain("push:");
    expect(postRatingScript).toContain("mandatoryDevelopmentReevaluations");
    expect(postRatingScript).toContain("gradeAtCalibration");
    expect(postRatingScript).toContain("developmentProbabilitiesChanged:0");
    expect(coachWorkflow).toContain("available.at(-1)");
    expect(coachWorkflow).toContain("reviewedThisCycle:false");
  });
});
