import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import revisions from "../../../data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json";
import qbBaseline from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import rbBaseline from "../../../data/generated/football/wheel-nfl-rb-grades-2026-10-03.json";
import wrBaseline from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-03.json";
import { FOOTBALL_GM_PLAYER_POOL, FOOTBALL_GM_CURRENT_PLAYER_POOL } from "./footballGmEngine";

const migration = readFileSync("supabase/migrations/202612310604_nfl_eight_current_ability_grade_batch.sql", "utf8");
const grades: Record<string, Array<{ team: string; player: string; grade: number }>> = { QB: qbBaseline.grades, RB: rbBaseline.grades, WR: wrBaseline.grades };

describe("NFL October 27 independently sourced eight-player ability batch", () => {
  it("contains eight evidence-backed meaningful updates within existing NFL identity/position authorities", () => {
    expect(revisions.sport).toBe("NFL");
    expect(revisions.changes).toHaveLength(8);
    expect(new Set(revisions.changes.map(c => [c.team,c.family,c.player].join("|"))).size).toBe(8);
    expect(new Set(revisions.changes.map(c=>c.team)).size).toBeGreaterThanOrEqual(6);
    for (const c of revisions.changes) {
      const source = grades[c.family]?.find(p => p.team===c.team && p.player===c.player);
      expect(source?.grade, c.player).toBe(c.oldGrade);
      expect(Math.abs(c.newGrade-c.oldGrade),c.player).toBeGreaterThanOrEqual(3);
      expect(c.newGrade,c.player).toBeGreaterThanOrEqual(70);
      expect(c.newGrade,c.player).toBeLessThanOrEqual(99);
      expect(c.reason.length,c.player).toBeGreaterThan(140);
      expect(c.sourceUrls.length,c.player).toBeGreaterThanOrEqual(2);
      expect(c.sourceUrls.every(url=>url.startsWith("https://")),c.player).toBe(true);
      expect(migration,c.player).toContain("'" + c.player + "'," + c.newGrade + ",date '2026-10-27'");
    }
  });

  it("appends current Wheel versions without changing old GM contracts, IDs, profiles or completed picks", () => {
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
    expect(FOOTBALL_GM_CURRENT_PLAYER_POOL).toHaveLength(591);
    for (const c of revisions.changes) {
      const saved = FOOTBALL_GM_PLAYER_POOL.find(p=>p.team===c.team && p.family===c.family && p.name===c.player);
      expect(saved,c.player).toBeDefined();
      expect(saved!.currentGrade,c.player).toBe(c.oldGrade);
    }
    // Database name_key retains the Jr. suffix (unlike historical GM player IDs).
    expect(migration).toContain("('ATL','QB','michaelpenixjr','Michael Penix Jr.',84,date '2026-10-27'");
    expect(migration).toContain("order by a.effective_date desc limit 1");
    expect(migration).toContain("NFL October 27 current-grade source baseline changed");
    expect(migration).toContain("newer authority supersedes it");
    expect(migration).not.toMatch(/\b(?:update|delete\s+from)\s+private\.wheel_football_(?:picks|grade_authority)\b/i);
    expect(migration).not.toMatch(/\b(?:update|delete\s+from)\s+(?:public|private)\.football_gm_/i);
  });
});
