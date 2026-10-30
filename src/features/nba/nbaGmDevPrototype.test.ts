import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";
import { NBA_GM_ROSTER_SLOTS,NBA_GM_SKILL_KEYS } from "./nbaGmFoundation";
import {
 NBA_GM_DEV_CAPS,nbaGmDevCanAdd,nbaGmDevAssignRoster,nbaGmDevCandidates,
 nbaGmDevCatalogErrors,nbaGmDevSpend,type NbaGmDevPlayer,type NbaGmDevRun,
} from "./nbaGmDevModel";
import { nbaGmScoutLetter,nbaGmScoutTier } from "./nbaGmScouting";
import { createNbaGmDevRepository } from "./nbaGmDevRepository";
const board=JSON.parse(readFileSync("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json","utf8")) as {
 players:Array<{editorialId:string;name:string;teamCode:string;candidatePositions:string[];overall:number;skills:NbaGmDevPlayer["skills"]}>;
};
const sql=readFileSync("supabase/migrations/202612310896_nba_gm_spin_first_private_franchise.sql","utf8");
const runtime=readFileSync("supabase/migrations/202612310893_nba_gm_private_playtest_runtime.sql","utf8");
const router=readFileSync("src/app/router.tsx","utf8");
const hub=readFileSync("src/features/nba/NbaPlayPage.tsx","utf8");
const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const css=readFileSync("src/styles/nba-gm-dev.css","utf8");
const catalog:NbaGmDevPlayer[]=board.players.map(p=>{
 const price=Math.round((2500000+58000000*Math.pow(Math.max(0,p.overall-73)/26,1.8))/100000)*100000;
 return {
  id:p.editorialId,name:p.name,teamCode:p.teamCode as NbaGmDevPlayer["teamCode"],
  positions:p.candidatePositions as unknown as NbaGmDevPlayer["positions"],
  currentGrade:p.overall,skills:p.skills,gameContract:"3YR",
  salaries:[price,Math.round(price*1.05/100000)*100000,Math.round(price*1.10/100000)*100000],
  pricingKind:"GAME_FIXTURE_NOT_REAL_CONTRACT",eligibilityKind:"PROVISIONAL_EDITORIAL",
  officialNbaPlayerId:null,officialRosterPosition:"F",positionReview:"unverified",reviewFlags:["test-provisional"],
 };
});
const wemby=catalog.find(p=>p.name==="Victor Wembanyama")!;
const kennard=catalog.find(p=>p.name==="Luke Kennard")!;
const run:NbaGmDevRun={
 version:"nba-gm-dev-v2",seed:"nba-gm-test",phase:"draft",picks:[],yearOnePicks:[],
 pendingTeam:"SAS",pendingSlot:null,spinIndex:1,caps:NBA_GM_DEV_CAPS,results:[],
 shopPlayerId:null,tradeTeam:null,tradeAttempts:0,tradesUsed:0,freeAgencyTeam:null,
 freeAgencyVisits:0,releasedIds:[],
};
describe("NBA GM private NFL-parity prototype",()=>{
 it("preserves 330 researched candidates, six skills and owner-only access",()=>{
  expect(nbaGmDevCatalogErrors(catalog)).toEqual([]);
  expect(new Set(catalog.map(p=>p.teamCode)).size).toBe(30);
  expect(NBA_GM_SKILL_KEYS).toHaveLength(6);
  expect(wemby.currentGrade).toBe(99);
  expect(wemby.skills.interiorDefense).toBe(99);
  expect(kennard.currentGrade).toBe(78);
  expect(kennard.skills.shooting).toBe(95);
  expect(router).toContain('path: "nba/gm-dev", element: <NbaWhoAmIOwnerGate>');
  expect(hub).toContain('navigate("/nba/gm-dev")');
  expect(runtime).toContain("private.football_gm_runs");
  expect(sql).toContain("private.football_gm_run_snapshots");
  expect(sql).toContain("private.nba_gm_dev_owner()");
  expect(sql).toContain("revoke all on function public.nba_gm_dev_action");
 });
 it("allows a spin FIRST, any eligible player, and automatic seven-slot NBA lineup",()=>{
  expect(NBA_GM_ROSTER_SLOTS).toEqual(["PG","SG","SF","PF","C","GUARD","BIG"]);
  expect(nbaGmDevCanAdd([],wemby,catalog)).toBe(true);
  const after=nbaGmDevAssignRoster([wemby.id,kennard.id],catalog)!;
  expect(after).toHaveLength(2);
  expect(after.some(p=>p.slot==="C"&&p.playerId===wemby.id)).toBe(true);
  expect(nbaGmDevAssignRoster([wemby.id,wemby.id],catalog)).toBeNull();
  expect(nbaGmDevCandidates(run,catalog).every(p=>p.teamCode==="SAS")).toBe(true);
  expect(nbaGmDevCandidates({...run,pendingTeam:null},catalog)).toEqual([]);
  expect(nbaGmDevCanAdd([{slot:"C",playerId:wemby.id}],wemby,catalog)).toBe(false);
 });
 it("keeps a true guard and a true big, with secondary-position SF versatility",()=>{
  const sample=[
   {...wemby,id:"pg",positions:["PG"] as const},
   {...wemby,id:"sg",positions:["SG"] as const},
   {...wemby,id:"sf",positions:["SF"] as const},
   {...wemby,id:"pf",positions:["PF"] as const},
   {...wemby,id:"c",positions:["C"] as const},
   {...wemby,id:"sfg",positions:["SG","SF"] as const},
   {...wemby,id:"sfb",positions:["SF","PF"] as const},
  ];
  const arranged=nbaGmDevAssignRoster(sample.map(p=>p.id),sample);
  expect(arranged?.map(p=>p.slot).sort()).toEqual([...NBA_GM_ROSTER_SLOTS].sort());
  expect(arranged?.find(p=>p.playerId==="sfg")?.slot).toBe("GUARD");
  expect(arranged?.find(p=>p.playerId==="sfb")?.slot).toBe("BIG");
  expect(nbaGmDevAssignRoster(["sf","sf","sf"],sample)).toBeNull();
 });
 it("preserves hidden exact numbers and NFL tiers with letter-grade skill scouting",()=>{
  expect(nbaGmScoutLetter(99)).toBe("A+");
  expect(nbaGmScoutLetter(87)).toBe("A-");
  expect(nbaGmScoutLetter(76)).toBe("B");
  expect(nbaGmScoutLetter(42)).toBe("D-");
  expect(nbaGmScoutTier(wemby)).toBe("ELITE");
  expect(nbaGmScoutTier(kennard)).toBe("DEPTH");
  expect(page).not.toContain("OVR");
  expect(page).not.toContain("player.currentGrade");
  expect(page).toContain("nbaGmScoutLetter");
  expect(page).toContain("GmFootballWheel");
  expect(page).toContain("run.phase===\"year1\"");
  expect(page).toContain('act("offseason")');
  expect(css).toContain("@media(max-width:700px)");
  expect(css).toContain("overflow-wrap:anywhere");
 });
 it("protects 1YR reprice vs 3YR locked game salaries and future cap",()=>{
  const athlete={...wemby,gameContract:"1YR" as const};
  expect(nbaGmDevSpend([{slot:"C",playerId:athlete.id}],[athlete])).toEqual(athlete.salaries);
  expect(nbaGmDevSpend([{slot:"C",playerId:wemby.id}],[wemby])).toEqual([wemby.salaries[0],wemby.salaries[0],wemby.salaries[0]]);
  const expensive={...athlete,id:"expensive",salaries:[193000000,193000000,193000000] as const};
  expect(nbaGmDevCanAdd([],expensive,[...catalog,expensive])).toBe(false);
  expect(sql).toContain("private.nba_gm_v2_contract");
  expect(sql).toContain("private.nba_gm_v2_salary");
  expect(sql).toContain("elsif p_action='release'");
  expect(sql).toContain("elsif p_action='trade-spin'");
  expect(sql).toContain("elsif p_action='fa-spin'");
  expect(sql).toContain("elsif p_action='advance'");
 });
 it("server owns team wheel, selections, offseason and season simulation",async()=>{
  const calls:Array<{name:string;args:Record<string,unknown>|undefined}>=[];
  const client={rpc:async(name:string,args?:Record<string,unknown>)=>{
   calls.push({name,args});
   if(name==="nba_gm_dev_catalog")return {data:catalog,error:null};
   return {data:run,error:null};
  }};
  const repo=createNbaGmDevRepository(client)!;
  expect((await repo.catalog()).length).toBe(330);
  expect((await repo.action("spin"))?.pendingTeam).toBe("SAS");
  expect((await repo.action("pick",wemby.id))?.picks).toEqual([]);
  expect((await repo.action("offseason"))?.phase).toBe("draft");
  expect(calls[1]?.args).toEqual({p_action:"spin",p_slot:null,p_player_id:null});
  expect(calls[2]?.args).toEqual({p_action:"pick",p_slot:null,p_player_id:wemby.id});
  expect(Object.keys(calls[2]!.args!)).not.toContain("team");
  expect(Object.keys(calls[2]!.args!)).not.toContain("results");
  expect(sql).toContain("private.nba_gm_v2_season");
  expect(sql).toContain("82-v_wins");
 });
});
