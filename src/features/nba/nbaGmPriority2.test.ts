import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { footballGmOutlookFromOdds, footballGmTalentTier } from "../back-room/footballGmScouting";
import { NBA_GM_TEAM_CODES } from "./nbaGmFoundation";
import type { NbaGmDevPlayer } from "./nbaGmDevModel";
import {
  nbaGmScoutOutlook, nbaGmScoutRepriceLabel, nbaGmScoutRepriceProjection,
  nbaGmScoutTier,
} from "./nbaGmScouting";

type BoardPlayer={editorialId:string;name:string;teamCode:string;overall:number;
  candidatePositions:string[];skills:NbaGmDevPlayer["skills"]};
type Profile={id:string;name:string;gradeAtCalibration:number;careerHeadroom:number;
  maxAnnualGain:number;maxAnnualLoss:number;marketVariancePct:number;
  breakoutPct:number;improvePct:number;steadyPct:number;declinePct:number};
const board=(JSON.parse(readFileSync("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json","utf8")) as {
  players:BoardPlayer[];
}).players;
const profiles=(JSON.parse(readFileSync("data/curated/nba/gm-nba-development-profiles-2026-10-30.json","utf8")) as {
  profiles:Profile[];
}).profiles;
const byId=new Map(profiles.map(profile=>[profile.id,profile]));
const sql=readFileSync("supabase/migrations/202612310899_nba_gm_private_scout_forecast.sql","utf8");
const engine=readFileSync("supabase/migrations/202612310898_nba_gm_dev_profiles_setup.sql","utf8");

function fixture(p:BoardPlayer):NbaGmDevPlayer{
  const profile=byId.get(p.editorialId)!;
  const price=Math.round((2_500_000+58_000_000*Math.pow(Math.max(0,p.overall-73)/26,1.8))/100_000)*100_000;
  const gameContract=p.overall>=95||p.overall<=78||(p.overall>=81&&p.overall<=87)?"1YR":"3YR";
  return {id:p.editorialId,name:p.name,teamCode:p.teamCode as NbaGmDevPlayer["teamCode"],
    positions:p.candidatePositions as NbaGmDevPlayer["positions"],currentGrade:p.overall,
    skills:p.skills,gameContract,pricingKind:"GAME_FIXTURE_NOT_REAL_CONTRACT",
    eligibilityKind:"PROVISIONAL_EDITORIAL",positionReview:"unverified",
    officialNbaPlayerId:null,officialRosterPosition:"F",reviewFlags:["qa"],
    salaries:[price,Math.round(price*1.05/100_000)*100_000,Math.round(price*1.10/100_000)*100_000],
    developmentOdds:{breakoutPct:profile.breakoutPct,improvePct:profile.improvePct,
      steadyPct:profile.steadyPct,declinePct:profile.declinePct},
    developmentForecast:{gradeAtCalibration:profile.gradeAtCalibration,
      maxAnnualGain:profile.maxAnnualGain,maxAnnualLoss:profile.maxAnnualLoss,
      careerHeadroom:profile.careerHeadroom,marketVariancePct:profile.marketVariancePct},
  };
}
const players=board.map(fixture);
const bands=["ELITE","IMPACT","STARTER","DEPTH"] as const;
const risks=["HIGH","MED","LOW","LOCKED"] as const;
const count=(values:readonly string[])=>Object.fromEntries([...new Set(values)].map(x=>[
  x,values.filter(v=>v===x).length,
]));

describe("NBA GM Priority 2 sport-specific scouting calibration",()=>{
  it("classifies all 330 IDs, preserves 30 teams and all unmodified authoritative grades",()=>{
    expect(board).toHaveLength(330);
    expect(new Set(players.map(p=>p.id)).size).toBe(330);
    expect(new Set(players.map(p=>p.teamCode))).toEqual(new Set(NBA_GM_TEAM_CODES));
    expect(profiles).toHaveLength(330);
    expect(players.every(p=>p.currentGrade===byId.get(p.id)?.gradeAtCalibration)).toBe(true);
    const groups=count(players.map(nbaGmScoutTier));
    expect(groups).toEqual({ELITE:10,IMPACT:33,STARTER:125,DEPTH:162});
    expect(players.filter(p=>nbaGmScoutTier(p)!==footballGmTalentTier(p.currentGrade)).length)
      .toBeGreaterThan(75);
    for(const group of bands)expect(groups[group]).toBeGreaterThan(0);
    expect(nbaGmScoutTier({currentGrade:94})).toBe("ELITE");
    expect(nbaGmScoutTier({currentGrade:93})).toBe("IMPACT");
    expect(nbaGmScoutTier({currentGrade:86})).toBe("IMPACT");
    expect(nbaGmScoutTier({currentGrade:85})).toBe("STARTER");
    expect(nbaGmScoutTier({currentGrade:79})).toBe("STARTER");
    expect(nbaGmScoutTier({currentGrade:78})).toBe("DEPTH");
  });
  it("separates excellent NBA starters from reserves without making elite commonplace",()=>{
    const byName=(name:string)=>players.find(p=>p.name===name)!;
    for(const name of ["Victor Wembanyama","Jayson Tatum","Cade Cunningham"])
      expect(nbaGmScoutTier(byName(name))).toBe("ELITE");
    for(const name of ["Stephen Curry","Bam Adebayo","Chet Holmgren",
      "Franz Wagner","OG Anunoby","Cooper Flagg"])
      expect(nbaGmScoutTier(byName(name))).toBe("IMPACT");
    for(const name of ["Derrick White","Rudy Gobert","Trey Murphy III",
      "Matas Buzelis","P.J. Washington"])
      expect(nbaGmScoutTier(byName(name))).toBe("STARTER");
    for(const name of ["Luke Kennard","Sam Hauser"])
      expect(nbaGmScoutTier(byName(name))).toBe("DEPTH");
    const teams=NBA_GM_TEAM_CODES.map(team=>players.filter(p=>p.teamCode===team));
    expect(teams.every(team=>team.length>0)).toBe(true);
    expect(teams.reduce((sum,team)=>sum+team.filter(p=>nbaGmScoutTier(p)==="ELITE").length,0)).toBe(10);
    expect(teams.reduce((sum,team)=>sum+team.filter(p=>nbaGmScoutTier(p)==="IMPACT").length,0)).toBe(33);
  });
  it("provides player-specific reprice severity for every 1YR fixture",()=>{
    const stats=count(players.map(p=>nbaGmScoutRepriceProjection(p).risk));
    // Captures exact 330-profile market assumptions; changes require a new audit.
    expect(stats).toEqual({HIGH:90,MED:98,LOW:48,LOCKED:94});
    expect(players.filter(p=>p.gameContract==="1YR")).toHaveLength(236);
    expect(players.filter(p=>p.gameContract==="3YR")).toHaveLength(94);
    for(const p of players){
      const projection=nbaGmScoutRepriceProjection(p);
      expect(Number.isFinite(projection.expectedUpsideDollars)).toBe(true);
      expect(projection.expectedUpsideDollars).toBeGreaterThanOrEqual(0);
      expect(projection.largeJumpProbability).toBeGreaterThanOrEqual(0);
      expect(projection.largeJumpProbability).toBeLessThanOrEqual(1);
      expect(risks).toContain(projection.risk);
      expect(nbaGmScoutRepriceLabel(p)).toBe(
        p.gameContract==="3YR"?"SALARY LOCKED":projection.risk+" REPRICE");
    }
    const byName=(name:string)=>players.find(p=>p.name===name)!;
    expect(nbaGmScoutRepriceLabel(byName("Victor Wembanyama"))).toBe("HIGH REPRICE");
    expect(nbaGmScoutRepriceLabel(byName("Cooper Flagg"))).toBe("HIGH REPRICE");
    expect(nbaGmScoutRepriceLabel(byName("OG Anunoby"))).toBe("MED REPRICE");
    expect(nbaGmScoutRepriceLabel(byName("Paul George"))).toBe("LOW REPRICE");
    expect(nbaGmScoutRepriceLabel(byName("Kawhi Leonard"))).toBe("SALARY LOCKED");
  });
  it("never uses seeded future salary or development result when projecting",()=>{
    const p=players.find(p=>p.name==="Cooper Flagg")!;
    const original=nbaGmScoutRepriceProjection(p);
    const hiddenFuture={...p,salaries:[p.salaries[0],99_000_000,150_000_000] as const};
    expect(nbaGmScoutRepriceProjection(hiddenFuture)).toEqual(original);
    const year2={...p,currentGrade:p.currentGrade+1.5,
      salaries:[p.salaries[0],Math.round(p.salaries[0]*1.15/100_000)*100_000,150_000_000] as const};
    expect(nbaGmScoutRepriceProjection({...year2,salaries:[year2.salaries[0],
      year2.salaries[1],90_000_000]},2)).toEqual(nbaGmScoutRepriceProjection(year2,2));
    expect(nbaGmScoutRepriceProjection(year2,2)).toEqual(nbaGmScoutRepriceProjection(year2,2));
  });
  it("links fresh-run outlook labels to exactly the same server-owned odds",()=>{
    for(const p of players){
      expect(nbaGmScoutOutlook(p,1)).toBe(footballGmOutlookFromOdds(p.developmentOdds!));
      const sum=Object.values(p.developmentOdds!).reduce((s,n)=>s+n,0);
      expect(sum).toBe(100);
    }
    const old={...players[0]!,developmentOdds:null,developmentForecast:null};
    expect(nbaGmScoutOutlook(old,1)).toBeDefined();
    expect(nbaGmScoutRepriceLabel(old)).toMatch(/^(LOW|MED|HIGH) REPRICE$/);
    expect(nbaGmScoutRepriceProjection({...old,salaries:[
      old.salaries[0],old.salaries[1],150_000_000]},2).risk).toBe(
        nbaGmScoutRepriceProjection(old,2).risk);
  });
  it("uses additive server catalog fields, not a changed salary or saved-game model",()=>{
    for(const token of ["private.nba_gm_v4_odds","private.nba_gm_v4_grade",
      "marketVariancePct","careerHeadroom","maxAnnualGain","maxAnnualLoss"])
      expect(engine).toContain(token);
    expect(engine).toContain("p_state->>'developmentModelVersion'='2'");
    expect(engine).toContain("'developmentModelVersion',2");
    for(const key of ["developmentOdds","developmentForecast","gradeAtCalibration",
      "maxAnnualGain","maxAnnualLoss","careerHeadroom","marketVariancePct"])
      expect(sql).toContain("'"+key+"'");
    expect(sql).toContain("private.nba_gm_dev_owner()");
    expect(sql).not.toMatch(/insert into|update private\.football_gm_runs|alter table/i);
  });
  it("tests 4,000 deterministic seven-spin draft windows across all 30 team catalogs",()=>{
    let seed=0x31ac09;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
    const teams=new Map(NBA_GM_TEAM_CODES.map(team=>[team,players.filter(p=>p.teamCode===team)]));
    const exposures={elite:0,impact:0,starter:0,depth:0,expensive:0};
    for(let trial=0;trial<4000;trial++){
      const seen=new Set<string>();
      for(let spin=0;spin<7;spin++){
        const team=NBA_GM_TEAM_CODES[Math.floor(random()*30)]!;
        for(const p of teams.get(team)!){
          if(seen.has(p.id))continue;
          seen.add(p.id);
          const tier=nbaGmScoutTier(p).toLowerCase() as "elite"|"impact"|"starter"|"depth";
          exposures[tier]++;
          if(p.salaries[0]>=40_000_000)exposures.expensive++;
        }
      }
    }
    // Team-wheel opportunity exposure, NOT a claim that server cap filtering
    // makes every candidate selectable. Separate draft-completion suites check
    // legal cap-constrained choices under the 155M game cap.
    expect(exposures.elite).toBeGreaterThan(4000);
    expect(exposures.impact).toBeGreaterThan(14000);
    expect(exposures.starter).toBeGreaterThan(exposures.impact);
    expect(exposures.depth).toBeGreaterThan(exposures.starter);
    expect(exposures.expensive).toBeGreaterThan(0);
  });
});
