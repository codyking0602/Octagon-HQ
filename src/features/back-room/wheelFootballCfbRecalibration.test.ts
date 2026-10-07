import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { WHEEL_FOOTBALL_AP_TOP_25, WHEEL_FOOTBALL_AP_TOP_25_POLL_DATE } from "./wheelFootballApTop25";
import { wheelFootballPoolTeams } from "./wheelFootballModel";
import { wheelFootballCfbPriorityForSchoolId } from "./wheelFootballCfbPriority";

const recalibration = JSON.parse(readFileSync("data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json","utf8")) as {
 changeLog: Array<{ schoolId:string; school:string; player:string; positionGroup:string; previousGrade:number|null; newGrade:number }>;
 apTop25: { schoolIds: string[]; pollDate:string };
};
const files:Record<string,string> = {
 QB:"data/generated/football/wheel-cfb-qb-grades-2026-10-03.json",
 RB:"data/generated/football/wheel-cfb-rb-grades-2026-10-03.json",
 "Front Seven":"data/generated/football/wheel-cfb-front-seven-grades-2026-10-03.json",
 Secondary:"data/generated/football/wheel-cfb-secondary-grades-2026-10-03.json"
};
const normalize=(v:string)=>v.normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");

describe("2026-10-07 CFB Wheel / GM recalibration",()=>{
 it("keeps previous/new grade audit entries for exactly 14 reprices plus 3 new current-role candidates",()=>{
   expect(recalibration.changeLog).toHaveLength(17);
   const keys=new Set<string>();
   for(const row of recalibration.changeLog){
     const key=`${row.schoolId}|${row.positionGroup}|${normalize(row.player)}`;
     expect(keys.has(key)).toBe(false);keys.add(key);
     const grades=(JSON.parse(readFileSync(files[row.positionGroup]!,"utf8")) as { grades: Array<{school:string;player:string;grade:number}> }).grades;
     const matched=grades.filter(x=>normalize(x.school)===normalize(row.school)&&normalize(x.player)===normalize(row.player));
     expect(matched,key).toHaveLength(1);expect(matched[0]!.grade,key).toBe(row.newGrade);
     if(row.previousGrade!==null)expect(row.previousGrade,key).not.toBe(row.newGrade);
   }
 });
 it("replaces only current role lists",()=>{
  expect(wheelFootballCfbPriorityForSchoolId("alabama")?.["Front Seven"]).toEqual(["Yhonzae Pierre","Luke Metz","Devan Thompkins","Terrance Green","London Simmons","Caleb Woodson"]);
  expect(wheelFootballCfbPriorityForSchoolId("pittsburgh")?.QB).toEqual(["Holden Geriner"]);
  expect(wheelFootballCfbPriorityForSchoolId("tennessee")?.QB).toEqual(["George MacIntyre"]);
 });
 it("matches the dated client Top 25 to the audit and school selector",()=>{
  expect(WHEEL_FOOTBALL_AP_TOP_25_POLL_DATE).toBe("2026-10-04");
  expect(recalibration.apTop25.schoolIds).toHaveLength(25);
  expect(WHEEL_FOOTBALL_AP_TOP_25.map(r=>r.schoolId)).toEqual(recalibration.apTop25.schoolIds);
  expect(wheelFootballPoolTeams("AP_TOP_25").map(t=>t.code)).toEqual(recalibration.apTop25.schoolIds);
  expect(recalibration.apTop25.schoolIds).not.toContain("kentucky");
 });
 it("leaves historic authority and poll rows in place",()=>{
  const sql=readFileSync("supabase/migrations/202612310261_wheel_football_cfb_gm_grade_recalibration.sql","utf8");
  expect(sql).toContain("'2026-10-07'");expect(sql).toContain("'2026-10-04'");
  expect(sql).toContain("on conflict (team_code, position_group, name_key, effective_date)");
  for(const c of recalibration.changeLog)expect(sql).toContain("grade_name_key('"+c.player.replace(/'/g,"''")+"')");
  expect(sql).not.toMatch(/delete\\s+from\\s+private\\.wheel_football_grade_authority/i);
 });
});
