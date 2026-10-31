import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { footballGmOutlookFromOdds } from "../back-room/footballGmScouting";
import { nbaGmScoutOutlook } from "./nbaGmScouting";
const data=JSON.parse(readFileSync("data/curated/nba/gm-nba-development-profiles-2026-10-30.json","utf8")) as {
  profileCount:number;
  profiles:Array<{id:string;name:string;gradeAtCalibration:number;ageAtCalibration:number|null;
    breakoutPct:number;improvePct:number;declinePct:number;steadyPct:number;
    maxAnnualGain:number;maxAnnualLoss:number;careerHeadroom:number;marketVariancePct:number;
    rationale:string;evidenceSummary:string;calibration:string;sourceKind:string}>;
};
const sql=readFileSync("supabase/migrations/202612310898_nba_gm_dev_profiles_setup.sql","utf8");
const board=JSON.parse(readFileSync("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json","utf8")) as {
  players:Array<{editorialId:string;overall:number;name:string}>;
};
describe("NBA GM player-specific seeded development authority",()=>{
  it("covers all 330 exact player identities with independently inspectable evidence context",()=>{
    expect(data.profileCount).toBe(330);
    expect(data.profiles).toHaveLength(330);
    expect(new Set(data.profiles.map(p=>p.id)).size).toBe(330);
    const byId=new Map(data.profiles.map(p=>[p.id,p]));
    for(const player of board.players){
      const p=byId.get(player.editorialId);
      expect(p?.name).toBe(player.name);
      expect(p?.gradeAtCalibration).toBe(player.overall);
      expect(p?.rationale.length).toBeGreaterThan(12);
      expect(p?.evidenceSummary.length).toBeGreaterThan(12);
    }
    const embedded=JSON.parse(sql.match(/\$profiles\$(.*?)\$profiles\$/s)?.[1]||"null") as typeof data.profiles;
    expect(embedded).toEqual(data.profiles);
  });
  it("retains 301 known ages, 29 age gaps, and all four grounded evidence classes",()=>{
    expect(data.profiles.filter(p=>p.ageAtCalibration!==null)).toHaveLength(301);
    expect(data.profiles.filter(p=>p.ageAtCalibration===null)).toHaveLength(29);
    expect(data.profiles.filter(p=>p.sourceKind==="pinned-2025-26-nba-api")).toHaveLength(301);
    expect(data.profiles.filter(p=>p.sourceKind==="verified-prior-nba-season")).toHaveLength(4);
    expect(data.profiles.filter(p=>p.sourceKind==="overseas-2025-26")).toHaveLength(2);
    expect(data.profiles.filter(p=>p.sourceKind==="no-2025-26-nba-sample")).toHaveLength(23);
  });
  it("preserves probability simplex, bounded annual deltas, and plausible elite headroom",()=>{
    for(const p of data.profiles){
      expect(p.breakoutPct+p.improvePct+p.steadyPct+p.declinePct).toBe(100);
      expect(Math.min(p.breakoutPct,p.improvePct,p.steadyPct,p.declinePct)).toBeGreaterThanOrEqual(0);
      expect(p.careerHeadroom).toBeLessThanOrEqual(99-p.gradeAtCalibration);
      expect(p.maxAnnualGain).toBeLessThanOrEqual(99-p.gradeAtCalibration);
      expect(p.maxAnnualLoss).toBeGreaterThan(0);
      expect(p.marketVariancePct).toBeLessThanOrEqual(10);
    }
    for(const elite of data.profiles.filter(p=>p.gradeAtCalibration>=96)){
      expect(elite.careerHeadroom).toBeLessThanOrEqual(3);
      expect(elite.breakoutPct).toBeLessThanOrEqual(4);
    }
    const wemby=data.profiles.find(p=>p.name==="Victor Wembanyama")!;
    expect([wemby.breakoutPct,wemby.improvePct,wemby.careerHeadroom]).toEqual([0,0,0]);
  });
  it("reuses exact SQL odds for the NBA scout label, not an age-only frontend substitute",()=>{
    expect(sql).toContain("private.nba_gm_v4_odds(v_state,p.id");
    expect(sql).toContain("o:=private.nba_gm_v4_odds(p_state,p_id,v_step-1,g)");
    expect(sql).toContain("'developmentModelVersion',2");
    expect(sql).toContain("p_state->>'developmentModelVersion'='2'");
    expect(sql).toContain("if p_year<=1 or private.nba_gm_v3_contract(p_id)='3YR'");
    const fixture={currentGrade:83,ageAtStart:22,reviewFlags:[],developmentOdds:{
      breakoutPct:3,improvePct:12,steadyPct:25,declinePct:60}};
    expect(nbaGmScoutOutlook(fixture)).toBe(footballGmOutlookFromOdds(fixture.developmentOdds));
    expect(nbaGmScoutOutlook(fixture)).toBe("DECLINE RISK");
  });
});
