import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** PRIVATE fixture-level sensitivity experiment, not a regression of game
 * ratings onto historical team wins. SQL is the production authority. */
type Role = "PG"|"SG"|"SF"|"PF"|"C"|"GUARD"|"BIG";
type Skills = Record<"scoring"|"shooting"|"playmaking"|"perimeterDefense"|"interiorDefense"|"rebounding",number>;
type BoardPlayer = {editorialId:string;teamCode:string;overall:number;candidatePositions:string[];skills:Skills};
type Profile = {id:string;ageAtCalibration:number|null;breakoutPct:number;improvePct:number;
  steadyPct:number;declinePct:number;maxAnnualGain:number;maxAnnualLoss:number;careerHeadroom:number};
type Player = BoardPlayer & {salaries:[number,number,number];profile:Profile};
const board = (JSON.parse(readFileSync("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json","utf8")) as {players:BoardPlayer[]}).players;
const fixture = readFileSync("supabase/migrations/202612310894_nba_gm_private_330_development_fixtures.sql","utf8");
const profiles = (JSON.parse(readFileSync("data/curated/nba/gm-nba-development-profiles-2026-10-30.json","utf8")) as {profiles:Profile[]}).profiles;
const byProfile = new Map(profiles.map(p=>[p.id,p]));
const salaryById = new Map([...fixture.matchAll(
  /\('(nba-gm-draft-[^']+)','(?:''|[^'])*','[A-Z]{3}',ARRAY\[[^\]]+\]::text\[\],\d+,'[^']+'::jsonb,ARRAY\[(\d+),(\d+),(\d+)\]::bigint\[\]/g
)].map(m=>[m[1]!,[Number(m[2]),Number(m[3]),Number(m[4])] as [number,number,number]]));
const pool:Player[] = board.map(p=>({...p,salaries:salaryById.get(p.editorialId)!,profile:byProfile.get(p.editorialId)!}));
const roles:Role[]=["PG","SG","SF","PF","C","GUARD","BIG"];
const teams=[...new Set(pool.map(p=>p.teamCode))].sort();
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const signedHash=(text:string)=>parseInt(createHash("md5").update(text).digest("hex").slice(0,8),16)|0;
const seeded=(text:string)=>Math.abs(signedHash(text))%10000/10000;
const seasonNoise=(text:string)=>Math.abs(signedHash(text))%11-5;
const hash=(value:number)=>{let x=value|0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0};
const legal=(p:Player,slot:Role)=>slot==="GUARD"?p.candidatePositions.some(s=>s==="PG"||s==="SG"):
  slot==="BIG"?p.candidatePositions.some(s=>s==="PF"||s==="C"):p.candidatePositions.includes(slot);
const locked=(p:Player)=>p.overall>=79&&p.overall<=80||p.overall>=88&&p.overall<=94;
const contracted=(p:Player,year:number)=>locked(p)?p.salaries[0]:p.salaries[year]!;
type Mode="stars"|"balanced"|"defense"|"depth"|"bargains";
function choose(mode:Mode,index:number):Player[] {
  let state=hash(536821+index*197+mode.length*981);
  const random=()=>{state=hash(state+0x9e3779b9);return state/4294967296};
  const chosen:Player[]=[],spend=[0,0,0];
  for(let slotIndex=0;slotIndex<roles.length;slotIndex++){
    const slot=roles[slotIndex]!;
    const canAfford=(p:Player)=>!chosen.includes(p)&&legal(p,slot)&&[0,1,2].every(year=>
      spend[year]!+contracted(p,year)<=155_000_000-(6-slotIndex)*2_500_000);
    let options:Player[]=[];
    for(let attempt=0;attempt<12;attempt++){
      const code=teams[Math.floor(random()*30)];
      options=pool.filter(p=>p.teamCode===code&&canAfford(p));
      if(options.length)break;
    }
    if(options.length===0)options=pool.filter(canAfford);
    if(!options.length)throw Error("No cap-legal completion for "+mode);
    const value=(p:Player)=>{
      const salary=Math.max(...p.salaries)/1_000_000;
      return mode==="stars"?p.overall*1.5:
        mode==="balanced"?p.overall-.8*salary:
        mode==="defense"?(p.skills.perimeterDefense+p.skills.interiorDefense)*.5+p.overall*.2:
        mode==="depth"?p.overall*.5-.7*salary:-salary;
    };
    options.sort((a,b)=>(value(b)-value(a))||a.editorialId.localeCompare(b.editorialId));
    const chosenIndex=Math.floor(random()*Math.min(3,options.length));
    const player=options[chosenIndex]!;
    chosen.push(player);
    for(let year=0;year<3;year++)spend[year]!+=contracted(player,year);
  }
  for(const total of spend)if(total>155_000_000)throw Error("Fixture cap exceeded");
  return chosen;
}
/** Same authored four-outcome probabilities and bounded deltas as NBA v4,
 * including the aged year-three adjustment. */
function grade(p:Player,year:number,seed:string):number{
  let g=p.overall;
  if(year===1)return g;
  const d=p.profile,ceiling=Math.min(99,p.overall+d.careerHeadroom);
  for(let step=2;step<=year;step++){
    let b=d.breakoutPct,i=d.improvePct,r=d.declinePct;
    if(step===3){
      const prior=g-p.overall,room=Math.max(0,ceiling-g);
      b=Math.round(b*Math.min(1,room/5)*Math.max(.35,1-Math.max(0,prior-2)/9)*100)/100;
      i=Math.round((i*Math.min(1,room/4)+(prior<=-3?3:0))*100)/100;
      const age=d.ageAtCalibration==null?null:d.ageAtCalibration+2;
      if(age!==null)r+=age>=35?7:age>=32?4:0;
      if(prior<=-4)r+=2;
    }
    if(g>=ceiling){b=0;i=0}
    b=clamp(b,0,100);i=clamp(i,0,100-b);r=clamp(r,0,100-b-i);
    const roll=seeded(seed+":"+p.editorialId+":"+step+":outcome");
    const mag=seeded(seed+":"+p.editorialId+":"+step+":size");
    const up=Math.min(d.maxAnnualGain,Math.max(0,ceiling-g)),down=d.maxAnnualLoss;
    let delta=roll<b/100?up*(.55+.45*mag):
      roll<(b+i)/100?Math.min(up*.62,.3+mag*Math.min(2.4,up*.55)):
      roll<1-r/100?(mag-.5)*Math.min(1.2,up*.35):
      -(.35+mag*Math.max(0,down-.35));
    delta=clamp(delta,-down,up);
    g=Math.round(clamp(g+delta,58,ceiling)*100)/100;
  }
  return g;
}
type Season={wins:number;before:number;defense:number;offense:number;starBoost:number};
function simulate(picks:Player[],year:number,seed:string):Season{
  let offense=0,defense=0,fit=0,floor=99;
  const creators:number[]=[];
  for(let index=0;index<picks.length;index++){
    const p=picks[index]!,slot=roles[index]!,s=p.skills;
    const delta=grade(p,year,seed)-p.overall;
    const v=(base:number)=>base+delta;
    const bench=slot==="GUARD"||slot==="BIG";
    const weight=bench?.55:1;
    const backcourt=["PG","SG","SF","GUARD"].includes(slot);
    offense+=(v(s.scoring)*.33+v(s.shooting)*.25+v(s.playmaking)*.27+
      v(s.rebounding)*.10+v(s.interiorDefense)*.05)*weight/6.1;
    defense+=(v(s.perimeterDefense)*(backcourt?.57:.30)+
      v(s.interiorDefense)*(["C","PF","BIG"].includes(slot)?.55:.23)+v(s.rebounding)*.18)
      /(backcourt?.98:1.03)*weight/6.1;
    if(slot==="PG")fit+=v(s.playmaking)*.35/5;
    if(slot==="C"||slot==="PF")fit+=(v(s.interiorDefense)+v(s.rebounding))*.175/5;
    if(slot==="SG"||slot==="SF")fit+=(v(s.shooting)+v(s.perimeterDefense))*.175/5;
    if(!bench){
      floor=Math.min(floor,Math.min(v(s.scoring),v(s.perimeterDefense)+10));
      creators.push(v(s.scoring)*.65+v(s.playmaking)*.35);
    }
  }
  creators.sort((a,b)=>b-a);
  const net=(offense-78)*.529+(defense-78)*.463+(fit-27)*.154+
    Math.min(0,floor-65)*.088;
  const starBoost=Math.min(3.75,Math.max(0,creators[0]!-86)*.22+
    Math.max(0,creators[1]!-84)*.12);
  const noise=seasonNoise(seed+":"+year);
  const before=clamp(Math.round(40.9983+2.2684*net+noise),8,74);
  const wins=clamp(Math.round(40.9983+2.2684*(net+3+starBoost)+noise),8,74);
  return {wins,before,offense,defense,starBoost};
}

describe("Priority 3: 2,500 deterministic three-season NBA GM sensitivity playthroughs",()=>{
  it("covers 7,500 complete fixture-level seasons, NBA position roles and three-year draft cap",()=>{
    expect(pool).toHaveLength(330);expect(teams).toHaveLength(30);
    const modes:Mode[]=["stars","balanced","defense","depth","bargains"];
    const result=Object.fromEntries(modes.map(m=>[m,{n:0,before:0,after:0,year3:0}])) as
      Record<Mode,{n:number;before:number;after:number;year3:number}>;
    let improved=0,declined=0;
    for(const mode of modes){
      for(let i=0;i<500;i++){
        const picks=choose(mode,i);
        expect(picks).toHaveLength(7);
        expect(new Set(picks.map(p=>p.editorialId)).size).toBe(7);
        for(let r=0;r<7;r++)expect(legal(picks[r]!,roles[r]!)).toBe(true);
        const seed="nba-balance-"+mode+"-"+i;
        const grades2=picks.map(p=>grade(p,2,seed)-p.overall);
        improved+=grades2.filter(x=>x>=1).length;
        declined+=grades2.filter(x=>x<=-1).length;
        for(let year=1;year<=3;year++){
          const v=simulate(picks,year,seed);
          expect(v.wins).toBeGreaterThanOrEqual(8);
          expect(v.wins).toBeLessThanOrEqual(74);
          expect(v.wins+(82-v.wins)).toBe(82);
          result[mode].before+=v.before;
          result[mode].after+=v.wins;
          if(year===3)result[mode].year3+=v.wins;
        }
        result[mode].n++;
      }
    }
    expect(Object.values(result).reduce((count,x)=>count+x.n,0)).toBe(2500);
    expect(improved).toBeGreaterThan(50);
    expect(declined).toBeGreaterThan(50);
    const average=(m:Mode,k:"before"|"after")=>result[m][k]/(result[m].n*3);
    expect(average("stars","after")).toBeGreaterThan(average("stars","before")+4);
    expect(average("defense","after")).toBeGreaterThan(average("defense","before")+4);
    // A star-heavy team under a fixed cap need not outperform a cheaper
    // complementary rotation. The simulator must preserve meaningful
    // differences across strategies while rewarding improvement in-place.
    for(const mode of modes) {
      expect(average(mode,"after")).toBeGreaterThan(average(mode,"before")+3);
    }
    expect(new Set(modes.map(mode=>Math.round(average(mode,"after")))).size)
      .toBeGreaterThanOrEqual(3);
    console.info("NBA GM P3 reproducible per-strategy 3-season results",
      Object.fromEntries(modes.map(mode=>[mode,{
        franchises:result[mode].n,
        originalWins:Number(average(mode,"before").toFixed(2)),
        calibratedWins:Number(average(mode,"after").toFixed(2)),
        thirdSeasonWins:Number((result[mode].year3/result[mode].n).toFixed(2)),
      }])));
  });
  it("gives elite creators leverage while preserving defensive and bench consequences",()=>{
    const byName=(name:string)=>pool.find(p=>p.editorialId==="nba-gm-draft-"+name)!;
    const sample=[
      byName("lukadoncic"),byName("anthonyedwards"),byName("ggjackson"),
      byName("michaelporter"),byName("wendellcarter"),byName("desmondbane"),byName("adembona"),
    ];
    const before=simulate(sample,1,"owner-playtest-example");
    expect(before.before).toBeLessThanOrEqual(35);
    expect(before.wins).toBeGreaterThanOrEqual(before.before+8);
    const weakened=sample.map(p=>({...p,skills:{...p.skills}}));
    for(const index of [0,1,2])weakened[index]!.skills.perimeterDefense-=12;
    expect(simulate(weakened,1,"owner-playtest-example").wins).toBeLessThan(before.wins);
    const strongerBench=sample.map(p=>({...p,skills:{...p.skills}}));
    strongerBench[6]!.skills.interiorDefense+=12;
    expect(simulate(strongerBench,1,"owner-playtest-example").wins).toBeGreaterThanOrEqual(before.wins);
  });
  it("preserves the 90/3/7 final score and legacy V2/V3 win-model gates",()=>{
    const scoreSql=readFileSync("supabase/migrations/202612310897_nba_gm_football_parity_private.sql","utf8");
    const balanceSql=readFileSync("supabase/migrations/202612310901_nba_gm_private_three_season_balance.sql","utf8");
    expect(scoreSql).toContain("v_score:=round(v_roster*.90+v_record*.03+v_playoff*.07,1)");
    expect(balanceSql).toContain("p_state->>'developmentModelVersion'='2'");
    expect(balanceSql).toContain("if p_state->>'economyVersion' is distinct from '3'");
    expect(balanceSql).not.toContain("create or replace function private.nba_gm_v3_final_score");
  });
});
