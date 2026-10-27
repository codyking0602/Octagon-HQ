import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import revisions from "../../../data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json";
import qb from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import rb from "../../../data/generated/football/wheel-nfl-rb-grades-2026-10-03.json";
import wr from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-03.json";
import otherQbBatch from "../../../data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json";
import { FOOTBALL_GM_PLAYER_POOL,FOOTBALL_GM_CURRENT_PLAYER_POOL } from "./footballGmEngine";
const migration=readFileSync("supabase/migrations/202612310605_nfl_seven_additional_current_ability_grades.sql","utf8");
const baseline: Record<string,Array<{team:string;player:string;grade:number}>>={QB:qb.grades,RB:rb.grades,WR:wr.grades};
describe("seven additional NFL Week 7 ability revisions, separate from merged five QB updates",()=>{
  it("contains seven genuinely meaningful peer-calibrated changes with NFL sourced evidence",()=>{
    expect(revisions.sport).toBe("NFL");
    expect(revisions.changes).toHaveLength(7);
    expect(new Set(revisions.changes.map(x=>x.team+"|"+x.family+"|"+x.player)).size).toBe(7);
    expect(revisions.changes.filter(x=>x.family==="QB")).toHaveLength(3);
    expect(revisions.changes.filter(x=>x.family==="RB")).toHaveLength(2);
    expect(revisions.changes.filter(x=>x.family==="WR")).toHaveLength(2);
    for(const x of revisions.changes){
      expect(baseline[x.family]?.find(p=>p.team===x.team&&p.player===x.player)?.grade,x.player).toBe(x.oldGrade);
      expect(Math.abs(x.newGrade-x.oldGrade),x.player).toBeGreaterThanOrEqual(3);
      expect(x.reason.length,x.player).toBeGreaterThan(130);
      expect(x.sourceUrls.length,x.player).toBeGreaterThanOrEqual(2);
      expect(x.sourceUrls.every(url=>url.startsWith("https://")),x.player).toBe(true);
      expect(otherQbBatch.changes.find(c=>c.team===x.team&&c.player===x.player),x.player).toBeUndefined();
      expect(migration,x.player).toContain("'"+x.player+"',"+x.newGrade+",date '2026-10-27'");
    }
  });
  it("keeps 594 GM identities and development profiles while applying current grade changes",()=>{
    expect(otherQbBatch.changes).toHaveLength(5);
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
    expect(FOOTBALL_GM_CURRENT_PLAYER_POOL).toHaveLength(591);
    for(const x of revisions.changes){
      expect(FOOTBALL_GM_PLAYER_POOL.find(p=>p.team===x.team&&p.family===x.family&&p.name===x.player)?.currentGrade).toBe(x.newGrade);
    }
    expect(migration).toContain("order by a.effective_date desc limit 1");
    expect(migration).toContain("NFL seven-player ability preflight changed baseline");
    expect(migration).not.toMatch(/\b(?:update|delete\s+from|truncate)\s+private\.wheel_football_(?:grade_authority|picks)\b/i);
    expect(migration).not.toMatch(/\b(?:insert\s+into|update|delete\s+from)\s+(?:public|private)\.football_gm_/i);
  });
});
