import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { footballGmOutlookFromOdds } from "../back-room/footballGmScouting";
import { nbaGmRepriceLabel, nbaGmScoutOutlook, nbaGmScoutTier } from "./nbaGmScouting";

type Profile = {
  id: string; name: string; gradeAtCalibration: number;
  breakoutPct: number; improvePct: number; declinePct: number; steadyPct: number;
  maxAnnualGain: number; maxAnnualLoss: number; careerHeadroom: number; marketVariancePct: number;
};
type Athlete = {id:string;name:string;team:string;grade:number;salary:number;year2:number;year3:number};
const profiles = (JSON.parse(readFileSync(
  "data/curated/nba/gm-nba-development-profiles-2026-10-30.json","utf8")) as {profiles:Profile[]}).profiles;
const fixture = readFileSync("supabase/migrations/202612310894_nba_gm_private_330_development_fixtures.sql","utf8");
const migration = readFileSync("supabase/migrations/202612310899_nba_gm_scouting_reprice_signals.sql","utf8");
const board = (JSON.parse(readFileSync(
  "docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json","utf8")) as {
    players:Array<{editorialId:string;name:string;teamCode:string;overall:number;candidatePositions:string[]}>;
  }).players;
const fixtures:Athlete[] = [...fixture.matchAll(
  /\('(nba-gm-draft-[^']+)','((?:''|[^'])*)','([A-Z]{3})',ARRAY\[[^\]]+\]::text\[\],(\d+),'[^']+'::jsonb,ARRAY\[(\d+),(\d+),(\d+)\]::bigint\[\]/g,
)].map(m=>({id:m[1]!,name:m[2]!.replace(/''/g,"'"),team:m[3]!,grade:Number(m[4]),
  salary:Number(m[5]),year2:Number(m[6]),year3:Number(m[7])}));
const fixturesById = new Map(fixtures.map(p=>[p.id,p]));
const contract=(g:number):"1YR"|"3YR"=>
  g>=95||g>=81&&g<=87||g<=78 ? "1YR":"3YR";
function seeded(seed:string):number{
  const signed=parseInt(createHash("md5").update(seed).digest("hex").slice(0,8),16)|0;
  return Math.abs(signed)%10000/10000;
}
function modeledYear2(p:Profile,player:Athlete,seed:string){
  const up=Math.min(p.maxAnnualGain,Math.max(0,p.careerHeadroom));
  const roll=seeded(seed+":"+p.id+":2:outcome");
  const mag=seeded(seed+":"+p.id+":2:size");
  const b=p.breakoutPct/100, i=p.improvePct/100, r=p.declinePct/100;
  let delta=roll<b?up*(.55+.45*mag)
    :roll<b+i?Math.min(up*.62,.3+mag*Math.min(2.4,up*.55))
    :roll<1-r?(mag-.5)*Math.min(1.2,up*.35)
    :-(.35+mag*Math.max(0,p.maxAnnualLoss-.35));
  delta=Math.max(-p.maxAnnualLoss,Math.min(up,delta));
  const grade=Math.round(Math.max(58,Math.min(99,p.gradeAtCalibration+p.careerHeadroom,
    p.gradeAtCalibration+delta))*100)/100;
  const market=seeded(seed+":"+p.id+":2:market");
  let factor=Math.max(.66,Math.min(2,1.105**(grade-player.grade)*1.065));
  factor=Math.max(.62,Math.min(2,factor*(1+(market*2-1)*p.marketVariancePct/100)));
  return Math.max(2500000,Math.round(player.salary*factor/100000)*100000);
}
/** Independent fixture-level copy of the additive SQL's seed-free 36-scenario
 * forecast, not a second application authority. The backend returns labels. */
function forecast(p:Profile,player:Athlete){
  const odds=[p.breakoutPct,p.improvePct,p.steadyPct,p.declinePct];
  const up=Math.min(p.maxAnnualGain,Math.max(0,p.careerHeadroom));
  let expected=0,large=0,huge=0;
  for(let branch=0;branch<4;branch++)for(const mag of [.15,.5,.85])for(const market of [-.75,0,.75]){
    let delta=branch===0?up*(.55+.45*mag)
      :branch===1?Math.min(up*.62,.3+mag*Math.min(2.4,up*.55))
      :branch===2?(mag-.5)*Math.min(1.2,up*.35)
      :-(.35+mag*Math.max(0,p.maxAnnualLoss-.35));
    delta=Math.max(-p.maxAnnualLoss,Math.min(up,delta));
    const grade=Math.round(Math.max(58,Math.min(99,p.gradeAtCalibration+p.careerHeadroom,
      p.gradeAtCalibration+delta))*100)/100;
    let factor=Math.max(.66,Math.min(2,1.105**(grade-player.grade)*1.065));
    factor=Math.max(.62,Math.min(2,factor*(1+market*p.marketVariancePct/100)));
    const cost=Math.max(2500000,Math.round(player.salary*factor/100000)*100000);
    const over=Math.max(0,cost-player.year2),weight=odds[branch]!/900;
    expected+=over*weight;
    if(over>=Math.max(1000000,player.salary*.12))large+=weight;
    if(over>=Math.max(2400000,player.salary*.15))huge+=weight;
  }
  const share=100*expected/155000000;
  const risk=share>=.8||(share>=.3&&huge>=.17)?"HIGH":
    share>=.3||large>=.12?"MEDIUM":"LOW";
  return {expected,large,huge,risk};
}
const priced=profiles.map(p=>({profile:p,player:fixturesById.get(p.id)!,
  forecast:forecast(p,fixturesById.get(p.id)!)}));

describe("NBA GM Priority 2: 330-person tier and contract forecast calibration",()=>{
  it("uses genuine NBA-specific tier boundaries without changing player grades",()=>{
    expect(board).toHaveLength(330);expect(fixtures).toHaveLength(330);
    expect(profiles).toHaveLength(330);
    const counts=(boundaries:[number,number,number])=>board.reduce((acc,p)=>{
      const label=p.overall>=boundaries[0]?"ELITE":p.overall>=boundaries[1]?"IMPACT":
        p.overall>=boundaries[2]?"STARTER":"DEPTH";acc[label]=(acc[label]??0)+1;return acc;
    },{} as Record<string,number>);
    expect(counts([94,89,83])).toEqual({ELITE:10,IMPACT:17,STARTER:39,DEPTH:264});
    expect(counts([94,88,79])).toEqual({ELITE:10,IMPACT:23,STARTER:135,DEPTH:162});
    for(const p of board){
      expect(fixturesById.get(p.editorialId)?.grade).toBe(p.overall);
      const expected=p.overall>=94?"ELITE":p.overall>=88?"IMPACT":
        p.overall>=79?"STARTER":"DEPTH";
      expect(nbaGmScoutTier({currentGrade:p.overall})).toBe(expected);
    }
    for(const [id,tier] of [
      ["nba-gm-draft-victorwembanyama","ELITE"],
      ["nba-gm-draft-alperensengun","IMPACT"],
      ["nba-gm-draft-oganunoby","STARTER"],
      ["nba-gm-draft-pjwashington","STARTER"],
      ["nba-gm-draft-lukekennard","DEPTH"],
    ] as const){
      expect(nbaGmScoutTier({currentGrade:fixturesById.get(id)!.grade})).toBe(tier);
    }
  });
  it("covers each of 30 teams, each basketball position and every borderline player",()=>{
    expect(new Set(board.map(p=>p.teamCode)).size).toBe(30);
    for(const team of new Set(board.map(p=>p.teamCode))){
      expect(board.filter(p=>p.teamCode===team).length).toBeGreaterThanOrEqual(9);
      expect(board.filter(p=>p.teamCode===team).length).toBeLessThanOrEqual(13);
    }
    for(const position of ["PG","SG","SF","PF","C"]){
      expect(board.filter(p=>p.candidatePositions.includes(position)).length).toBeGreaterThan(15);
    }
    expect(board.filter(p=>p.overall>=78&&p.overall<=89)).toHaveLength(176);
  });
  it("calculates exactly one calibrated risk for all 236 1YR contracts; locks all 94 3YR contracts",()=>{
    expect(priced).toHaveLength(330);
    const risks={LOW:0,MEDIUM:0,HIGH:0,LOCKED:0};
    for(const {profile:p,player,forecast:projection} of priced){
      expect(player.id).toBe(p.id);
      if(contract(player.grade)==="3YR"){
        risks.LOCKED++;expect(nbaGmRepriceLabel("LOCKED","3YR").label).toBe("SALARY LOCKED");
        continue;
      }
      risks[projection.risk]++;
      expect(projection.expected).toBeGreaterThanOrEqual(0);
      expect(projection.large).toBeGreaterThanOrEqual(0);
      expect(projection.huge).toBeLessThanOrEqual(1);
      expect(nbaGmRepriceLabel(projection.risk,"1YR").label).toMatch(/REPRICE/);
    }
    expect(risks).toEqual({LOW:84,MEDIUM:121,HIGH:31,LOCKED:94});
    expect(nbaGmRepriceLabel(null,"1YR")).toEqual({label:"REPRICE RISK",tone:"unknown"});
    expect(nbaGmRepriceLabel(null,"3YR")).toEqual({label:"SALARY LOCKED",tone:"locked"});
  });
  it("tests deterministic actual reprice exposure without leaking a seeded result",()=>{
    const sampleSeeds=Array.from({length:64},(_,i)=>"calibration-"+i);
    const sum={LOW:{over:0,n:0,shock:0},MEDIUM:{over:0,n:0,shock:0},
      HIGH:{over:0,n:0,shock:0}};
    for(const {profile,player,forecast:projection} of priced){
      if(contract(player.grade)==="3YR")continue;
      for(const seed of sampleSeeds){
        const actual=modeledYear2(profile,player,seed);
        expect(actual).toBe(modeledYear2(profile,player,seed));
        const excess=Math.max(0,actual-player.year2);
        const item=sum[projection.risk];
        item.n++;item.over+=excess;
        if(excess>=Math.max(1000000,player.salary*.12))item.shock++;
      }
    }
    const avg=(key:"LOW"|"MEDIUM"|"HIGH")=>sum[key].over/sum[key].n;
    expect(avg("HIGH")).toBeGreaterThan(avg("MEDIUM"));
    expect(avg("MEDIUM")).toBeGreaterThan(avg("LOW"));
    expect(sum.HIGH.shock/sum.HIGH.n).toBeGreaterThan(sum.LOW.shock/sum.LOW.n);
    expect(migration).toContain("private.nba_gm_v4_odds(p_state,p_id,v_step,v_grade)");
    expect(migration).toContain("private.nba_gm_v4_grade(p_state,p_id,2)");
    expect(migration).not.toContain("p_state->>'seed'");
    expect(migration).not.toContain("update private.football_gm_runs");
  });
  it("shares authoritative scouting odds but preserves legacy and final neutral reads",()=>{
    for(const p of profiles){
      const odds={breakoutPct:p.breakoutPct,improvePct:p.improvePct,
        steadyPct:p.steadyPct,declinePct:p.declinePct};
      const input={currentGrade:p.gradeAtCalibration,ageAtStart:null,reviewFlags:[],developmentOdds:odds};
      expect(nbaGmScoutOutlook(input)).toBe(footballGmOutlookFromOdds(odds));
      expect(nbaGmScoutOutlook(input,3)).toBe("STEADY");
      expect(nbaGmScoutOutlook({...input,developmentOdds:null})).toBe("STEADY");
    }
    expect(migration).toContain("'developmentOdds',case when v_state->>'developmentModelVersion'='2'");
    expect(migration).toContain("'repriceRisk',private.nba_gm_v5_reprice_risk(v_state,p.id)");
    expect(migration).toContain("private.nba_gm_v3_contract_for_state(p_state,p_id)");
    expect(migration).toContain("or p_state->>'developmentModelVersion' is distinct from '2'");
    expect(migration).toContain("'ageAtStart'");
  });
});
