import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NBA_GM_ROSTER_SLOTS } from "./nbaGmFoundation";
import {
  NBA_GM_DEV_CAPS, nbaGmDevAssignRoster, nbaGmDevCanAdd, nbaGmDevFitSignals,
  nbaGmDevSpend, type NbaGmDevPlayer, type NbaGmDevRun,
} from "./nbaGmDevModel";
import { createNbaGmDevRepository } from "./nbaGmDevRepository";
import { NbaGmDevelopmentReport } from "./NbaGmDevelopmentReport";
import { NbaGmFinalExperience } from "./NbaGmFinalExperience";
import { nbaGmScoutOutlook } from "./nbaGmScouting";

const sql = readFileSync("supabase/migrations/202612310897_nba_gm_football_parity_private.sql", "utf8");
const original = readFileSync("supabase/migrations/202612310896_nba_gm_spin_first_private_franchise.sql", "utf8");
const page = readFileSync("src/features/nba/NbaGmDevPage.tsx", "utf8");
const css = readFileSync("src/styles/nba-gm-dev.css", "utf8");
const playerFixture: NbaGmDevPlayer = {
  id: "parity-test", name: "Private Test Player", teamCode: "SAS",
  positions: ["PG"], currentGrade: 83,
  skills: {scoring:85,shooting:84,playmaking:86,perimeterDefense:78,interiorDefense:43,rebounding:52},
  salaries: [8_000_000,9_000_000,10_000_000], gameContract:"1YR",
  pricingKind:"GAME_FIXTURE_NOT_REAL_CONTRACT",eligibilityKind:"PROVISIONAL_EDITORIAL",
  officialNbaPlayerId:null,officialRosterPosition:"G",positionReview:"unverified",
  reviewFlags:["test fixture"],
};
const players = NBA_GM_ROSTER_SLOTS.map((slot,index):NbaGmDevPlayer=>({
  ...playerFixture,
  id:"nba-parity-"+slot,name:"Test "+slot,teamCode: "SAS",
  positions: [slot === "GUARD" ? "SG" : slot === "BIG" ? "C" : slot],
  currentGrade:83-index,
  salaries: [8_000_000,9_000_000,10_000_000],
}));
const picks = NBA_GM_ROSTER_SLOTS.map((slot,index)=>({slot,playerId:players[index]!.id}));
const results = [1,2,3].map(season=>({
  season,wins:45+season*2,losses:82-(45+season*2),offense:79+season,
  defense:78+season,positionalFit:27,finish:"Conference Semifinals",
}));
const development = Object.fromEntries(players.map((player,index)=>[player.id,{
  startingGrade:player.currentGrade,year2Grade:player.currentGrade+(index%2?-.9:3.2),
  year3Grade:player.currentGrade+(index%2?-1.4:3.2),
  year2Salary:player.salaries[1],year3Salary:player.salaries[2],
}]));
const run:NbaGmDevRun = {
  version:"nba-gm-dev-v2",economyVersion:3,seed:"nba-gm-parity-test",phase:"final",
  picks,yearOnePicks:picks,pendingTeam:null,pendingSlot:null,spinIndex:7,
  caps:NBA_GM_DEV_CAPS,results,shopPlayerId:null,tradeTeam:null,tradeAttempts:0,
  tradesUsed:0,freeAgencyTeam:null,freeAgencyVisits:0,releasedIds:[],
  development,scoreBreakdown:{score:84.1,roster:84,regularSeason:83,playoffs:88,
    weights:[.9,.03,.07]},
};

describe("NBA GM private Football parity boundary",()=>{
  it("preserves earlier V2 saved agreements and snapshots alongside new economies",()=>{
    expect(original).toContain("right(md5(p_id),1)");
    expect(sql).not.toContain("create or replace function private.nba_gm_v2_contract(");
    expect(sql).toContain("create or replace function private.nba_gm_v3_contract_for_state");
    expect(sql).toContain("p_state->>'economyVersion'='3'");
    expect(sql).toContain("private.nba_gm_v2_salary(p_id,p_year)");
    expect(sql).toContain("'economyVersion',3");
    expect(sql).toContain("'version','nba-gm-dev-v2'");
    expect(sql).toContain("private.football_gm_runs");
    expect(sql).toContain("private.football_gm_run_snapshots");
    expect(sql).toContain("private.nba_gm_dev_owner()");
    expect(sql).toContain("revoke all on function public.nba_gm_dev_action");
    expect(sql).not.toContain("as $\ndeclare");
  });
  it("uses 301 uniquely matched birthdates, with 29 explicitly unknown athletes",()=>{
    const ages=[...sql.matchAll(/\('nba-gm-draft-[^']+',date '\d{4}-\d{2}-\d{2}'\)/g)];
    expect(ages).toHaveLength(301);
    expect(new Set(ages.map(row=>row[0].split("'")[1])).size).toBe(301);
    expect(sql).toContain("verified_birth_date date");
    expect(sql).toContain("v_age:=case when v_player.verified_birth_date is not null");
    expect(sql).toContain("v_ceiling:=least(99,v_player.overall");
    expect(sql).toContain("when v_age>=35 then .23");
    expect(nbaGmScoutOutlook({...playerFixture,ageAtStart:21,currentGrade:83})).toBe("HIGH UPSIDE");
    expect(nbaGmScoutOutlook({...playerFixture,ageAtStart:25,currentGrade:83})).toBe("RISING");
    expect(nbaGmScoutOutlook({...playerFixture,ageAtStart:36,currentGrade:83})).toBe("DECLINE RISK");
    expect(nbaGmScoutOutlook({...playerFixture,ageAtStart:null})).toBe("STEADY");
  });
  it("keeps grades server-seeded and repricing authoritative, without unlocking 3YR deals",()=>{
    expect(sql).toContain("create or replace function private.nba_gm_v3_grade");
    expect(sql).toContain("v_step in 2..least(3,p_year)");
    expect(sql).toContain("v_prior:=v_grade-v_player.overall");
    expect(sql).toContain("v_grade:=round(greatest(58,least(99,v_grade+v_delta)),2)");
    expect(sql).toContain("create or replace function private.nba_gm_v3_salary");
    expect(sql).toContain("if p_year<=1 or private.nba_gm_v3_contract(p_id)='3YR'");
    expect(sql).toContain("v_delta:=private.nba_gm_v3_grade");
    expect(sql).toContain("private.nba_gm_v3_grade(p_state,p.id,p_year)");
    expect(sql).toContain("private.nba_gm_v3_development_report");
    expect(sql).toContain("private.nba_gm_v3_final_score");
    expect(sql).toContain("v_roster*.90+v_record*.03+v_playoff*.07");
    expect(sql).toContain("82-v_wins");
  });
  it("rejects a superstar overload but keeps seven legal NBA positions fillable",()=>{
    expect(NBA_GM_DEV_CAPS).toEqual([155_000_000,155_000_000,155_000_000]);
    expect(nbaGmDevAssignRoster(picks.map(p=>p.playerId),players)).toHaveLength(7);
    expect(nbaGmDevSpend(picks,players)).toEqual([56e6,63e6,70e6]);
    const expensive={...playerFixture,id:"star",salaries:[156e6,156e6,156e6] as const};
    expect(nbaGmDevCanAdd([],expensive,[...players,expensive],NBA_GM_DEV_CAPS)).toBe(false);
    expect(nbaGmDevCanAdd([],players[0]!,players,NBA_GM_DEV_CAPS)).toBe(true);
  });
  it("starts the wheel before awaiting the server but lands only on the chosen team",()=>{
    const start=page.indexOf('async function spin(action:');
    const end=page.indexOf('const byId=',start);
    const implementation=page.slice(start,end);
    expect(implementation.indexOf("setWheelSpinning(true)")).toBeLessThan(
      implementation.indexOf("await repo.action(action)"));
    expect(implementation.indexOf("setWheelRotation(prev=>prev+1440)")).toBeLessThan(
      implementation.indexOf("await repo.action(action)"));
    expect(implementation).toContain("const i=wheelTeams.findIndex(team=>team.code===teamCode)");
    expect(implementation).toContain("wheelRequestRef.current=true");
    expect(implementation).toContain("setInterval");
    expect(implementation).toContain("setRun(state);setWheelSpinning(false)");
  });
  it("shows all partner targets, two-chip proposals and capped FA recovery",()=>{
    expect(page).toContain("const eligibleTrade=run?.shopPlayerId?catalog.filter");
    expect(page).not.toContain("nbaGmDevCanAdd(run.picks.filter(pick=>pick.playerId!==run.shopPlayerId)");
    expect(page).toContain('void act("trade",player.id,tradeChip??undefined)');
    expect(page).toContain('void act("emergency-sign",player.id)');
    expect(page).toContain('run.freeAgencyVisits<3');
    expect(page).toContain("capCrisis");
    expect(sql).toContain("Optional second outgoing asset");
    expect(sql).toContain("v_chip_id:=nullif(p_slot,'')");
    expect(sql).toContain("(v_state->>'freeAgencyVisits')::integer>=3");
    expect(sql).toContain("elsif p_action='emergency-sign'");
    expect(sql).toContain("Trade target needs different outgoing assets or more cap room");
  });
  it("preserves post-Season-1-only fit and uses real server development in report",()=>{
    expect(nbaGmDevFitSignals(picks.slice(0,6),players)).toEqual([]);
    expect(page).toContain('run.phase==="year1"||run.phase==="offseason"');
    expect(page).not.toContain('run.phase==="year1"||run.phase==="offseason"||run.phase==="final"');
    expect(page).toContain('run.phase!=="final"&&<>');
    const markup=renderToStaticMarkup(<NbaGmDevelopmentReport run={{...run,phase:"offseason"}} catalog={players}/>);
    expect(markup).toContain("OFFSEASON DEVELOPMENT");
    expect(markup).toContain("1YR REPRICE");
    expect(markup).toContain("BREAKOUT");
    expect(markup).toContain("REGRESSED");
  });
  it("uses Football final classes and 90/3/7 scores with 82-game records",()=>{
    const markup=renderToStaticMarkup(<NbaGmFinalExperience run={run} catalog={players}/>);
    expect(markup).toContain("football-gm-final gm-final");
    expect(markup).toContain("84.1");
    expect(markup).toContain("Roster (90%)");
    expect(markup).toContain("Season record (3%)");
    expect(markup).toContain("Playoffs (7%)");
    expect(markup).toContain("THREE-YEAR RESULTS");
    expect(markup).toContain("49–33");
    expect(markup).toContain("FINANCIALS · YEAR 3");
    expect(css).toContain("nba-gm-final__team-logo");
    expect(css).toContain("@media(max-width:700px)");
  });
  it("only sends selected outgoing assets and target IDs to server",async()=>{
    const calls:unknown[][]=[];
    const backend={rpc:async(name:string,args?:Record<string,unknown>)=>{
      calls.push([name,args]);return {data:run,error:null};
    }};
    const repo=createNbaGmDevRepository(backend)!;
    await repo.action("trade","trade-target","outgoing-chip");
    expect(calls).toEqual([["nba_gm_dev_action",{
      p_action:"trade",p_slot:"outgoing-chip",p_player_id:"trade-target",
    }]]);
  });
});
