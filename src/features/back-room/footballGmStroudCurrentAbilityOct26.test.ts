import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import revisions from "../../../data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-26.json";
import oldQb from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import { FOOTBALL_GM_PLAYER_POOL, footballGmPlayerById } from "./footballGmEngine";
import profiles from "../../../data/curated/football/gm-nfl-development-profiles-2026-10-07.json";
const sql=readFileSync("supabase/migrations/202612310492_nfl_cj_stroud_current_ability_grade.sql","utf8");

describe("Stroud Oct 26 current NFL grade and historical GM development continuity",()=>{
  it("regrades only one researched active Texans QB, with 594 GM identities preserved",()=>{
    expect(revisions.changes).toHaveLength(1);
    const revision=revisions.changes[0]!;
    expect(revision).toEqual(expect.objectContaining({team:"HOU",family:"QB",player:"C.J. Stroud",oldGrade:82,newGrade:88}));
    expect(revision.sourceUrls.length).toBeGreaterThanOrEqual(2);
    expect(oldQb.grades.find(x=>x.player==="C.J. Stroud")?.grade).toBe(82);
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
    expect(footballGmPlayerById("HOU|QB|cjstroud")).toEqual(
      expect.objectContaining({team:"HOU",currentGrade:88,position:"QB"}));
  });
  it("preserves original development odds and Oct 7 profile while updating future base grade",()=>{
    const profile=profiles.profiles.find(p=>p.id==="HOU|QB|cjstroud");
    expect(profile).toEqual(expect.objectContaining({gradeAtCalibration:82,breakoutPct:18,improvePct:35,declinePct:18}));
    expect(sql).toContain("nfl-wheel-stroud-current-ability-2026-10-26-v1");
    expect(sql).toContain("hidden_grade=82");
    expect(sql).toContain("'C.J. Stroud',88,date '2026-10-26'");
    expect(sql).not.toMatch(/\bupdate\s+private\.wheel_football_grade_authority\b/i);
    expect(sql).not.toMatch(/\b(?:update|delete\s+from)\s+private\.wheel_football_picks\b/i);
  });
});