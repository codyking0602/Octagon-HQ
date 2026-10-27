import priorities from "../../../data/generated/football/cfb/wheel-football-current-priorities-2026.json";
import evidence from "../../../data/curated/football/cfb/wheel-cfb-three-verified-role-grades-2026-10-26.json";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("2026 CFB three verified role/grade authorities", () => {
 const sql=readFileSync("supabase/migrations/202612310417_cfb_verified_role_family_grades.sql","utf8");
 it("corrects only verified Duke and Pitt linebackers; keeps STAR Texas Tech in Secondary",()=>{
   expect(priorities.teams.duke["Front Seven"]).toContain("Luke Mergott");
   expect(priorities.teams.pittsburgh["Front Seven"]).toContain("Braylan Lovelace");
   expect(priorities.teams.duke.Secondary).not.toContain("Luke Mergott");
   expect(priorities.teams.pittsburgh.Secondary).not.toContain("Braylan Lovelace");
   expect(priorities.teams["texas-tech"].Secondary).toContain("John Curry");
   expect(priorities.teams.lsu.Secondary).toContain("CJ Jimcoily");
   expect(evidence.changes).toHaveLength(3);
   expect(evidence.held).toEqual([expect.objectContaining({name:"CJ Jimcoily"})]);
   const slots=["QB","RB","WR","TE","Front Seven","Secondary","Head Coach"] as const;
   const n=Object.values(priorities.teams).reduce((sum,team)=>sum+slots.reduce((total,slot)=>total+team[slot].length,0),0);
   expect(n).toBe(1258);
   for(const t of Object.values(priorities.teams)){
     expect(t["Front Seven"].length).toBeLessThanOrEqual(6);
     expect(t.Secondary.length).toBeLessThanOrEqual(6);
   }
 });
 it("adds only three versioned grades to current authority; fails closed on past grades",()=>{
   expect(sql).toContain("('duke','Front Seven','Luke Mergott',86)");
   expect(sql).toContain("('pittsburgh','Front Seven','Braylan Lovelace',90)");
   expect(sql).toContain("('texas-tech','Secondary','John Curry',88)");
   expect(sql).toContain("grade_version='cfb-wheel-verified-three-roles-2026-10-26-v1'");
   expect(sql).toContain("date '2026-10-26'");
   expect(sql).toContain("Previously graded CFB role identity");
   expect(sql).not.toMatch(/update\s+private\.wheel_football_grade_authority/i);
   expect(sql).not.toMatch(/delete\s+from\s+private\.wheel_football_grade_authority/i);
   for(const row of evidence.changes) expect(row.sources.length).toBeGreaterThan(0);
 });
});
