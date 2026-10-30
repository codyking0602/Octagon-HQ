import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  NBA_GM_DEV_CAPS, nbaGmDevCanPick, nbaGmDevCandidates,
  nbaGmDevCatalogErrors, nbaGmDevSpend, type NbaGmDevPlayer,
  type NbaGmDevRun,
} from "./nbaGmDevModel";
import { NBA_GM_ROSTER_SLOTS, NBA_GM_SKILL_KEYS } from "./nbaGmFoundation";
import { createNbaGmDevRepository } from "./nbaGmDevRepository";

const board = JSON.parse(readFileSync("docs/nba-gm-330-six-skills-PROVISIONAL-2026-10-29.json","utf8")) as {
  players: Array<{editorialId:string;name:string;teamCode:string;candidatePositions:string[];overall:number;skills:NbaGmDevPlayer["skills"]}>;
};
const sql = readFileSync("supabase/migrations/202612310894_nba_gm_private_330_development_fixtures.sql","utf8");
const runtime = readFileSync("supabase/migrations/202612310893_nba_gm_private_playtest_runtime.sql","utf8");
const router = readFileSync("src/app/router.tsx","utf8");
const page = readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const css = readFileSync("src/styles/nba-gm-dev.css","utf8");

const catalog: NbaGmDevPlayer[] = board.players.map(p => {
  const price = Math.round((2_500_000 + 58_000_000 * Math.pow(Math.max(0,p.overall-73)/26,1.8))/100_000)*100_000;
  return {
    id:p.editorialId,name:p.name,teamCode:p.teamCode as NbaGmDevPlayer["teamCode"],
    positions:p.candidatePositions as unknown as NbaGmDevPlayer["positions"],
    currentGrade:p.overall,skills:p.skills,
    salaries:[price,Math.round(price*1.05/100_000)*100_000,Math.round(price*1.10/100_000)*100_000],
    pricingKind:"GAME_FIXTURE_NOT_REAL_CONTRACT",eligibilityKind:"PROVISIONAL_EDITORIAL",
  };
});
const wemby = catalog.find(p => p.name==="Victor Wembanyama")!;
const kennard = catalog.find(p => p.name==="Luke Kennard")!;
const run: NbaGmDevRun = {
  version:"nba-gm-dev-v1",seed:"nba-gm-test",phase:"draft",
  picks:[],pendingTeam:"SAS",pendingSlot:"C",spinIndex:1,
  caps:NBA_GM_DEV_CAPS,results:[],
};

describe("NBA GM Phase 2 private playable draft",()=>{
  it("preserves the exact 330-player, six-skill baseline with zero published real salaries",()=>{
    expect(nbaGmDevCatalogErrors(catalog)).toEqual([]);
    expect(new Set(catalog.map(p => p.teamCode)).size).toBe(30);
    expect(NBA_GM_SKILL_KEYS).toHaveLength(6);
    expect(wemby.currentGrade).toBe(99);
    expect(wemby.skills.interiorDefense).toBe(99);
    expect(kennard.skills.shooting).toBe(95);
    expect(kennard.currentGrade).toBe(78);
    expect(sql.match(/\('nba-gm-draft-[^']+'/g)).toHaveLength(330);
    expect(sql).toContain("GAME fixture");
    expect(runtime).toContain("private.nba_gm_dev_players");
    expect(runtime).toContain("private.football_gm_runs");
    expect(runtime).toContain("private.football_gm_run_snapshots");
  });
  it("enforces duplicates, positions, slots, cap windows and affordability reserves",()=>{
    expect(NBA_GM_ROSTER_SLOTS).toEqual(["PG","SG","SF","PF","C","SIXTH","FLEX"]);
    expect(nbaGmDevCanPick([], "C",wemby,catalog)).toBe(true);
    expect(nbaGmDevCanPick([], "PG",wemby,catalog)).toBe(false);
    expect(nbaGmDevCanPick([{slot:"C",playerId:wemby.id}],"FLEX",wemby,catalog)).toBe(false);
    expect(nbaGmDevCanPick([{slot:"C",playerId:wemby.id}],"C",kennard,catalog)).toBe(false);
    const expensive = {...wemby,salaries:[193_000_000,193_000_000,193_000_000] as const};
    expect(nbaGmDevCanPick([],"C",expensive,[...catalog,expensive])).toBe(false);
    expect(nbaGmDevSpend([{slot:"C",playerId:wemby.id}],catalog)).toEqual(wemby.salaries);
  });
  it("drawn team only exposes legal, affordable selections, not any famous player",()=>{
    const candidates=nbaGmDevCandidates(run,catalog);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every(p=>p.teamCode==="SAS"&&p.positions.includes("C"))).toBe(true);
    expect(candidates.some(p=>p.id===wemby.id)).toBe(true);
    expect(nbaGmDevCandidates({...run,pendingTeam:null},catalog)).toEqual([]);
    expect(nbaGmDevCandidates({...run,picks:[{slot:"C",playerId:wemby.id}]},catalog)).toEqual([]);
  });
  it("keeps NBA simulator server-owned and basketball-specific, separate from Football GM",()=>{
    expect(runtime).toContain("private.nba_gm_dev_simulate");
    expect(runtime).toContain("82-v_wins");
    expect(runtime).toContain("md5(p_state->>'seed'");
    for(const key of NBA_GM_SKILL_KEYS)expect(runtime).toContain("skills->>'"+key+"'");
    expect(runtime).toContain("private.nba_gm_dev_can_pick");
    expect(runtime).toContain("not private.nba_gm_dev_can_pick");
    expect(runtime).toContain("current_setting('octagon.nba_gm_dev_authorized_write'");
    expect(runtime).toContain("private.nba_gm_dev_owner()");
    expect(runtime).toContain("revoke all on function public.nba_gm_dev_catalog()");
    expect(runtime).toContain("revoke all on function public.nba_gm_dev_action(");
    expect(runtime).not.toContain("footballGmSeasonResult");
  });
  it("is owner-gated and mobile-safe with no public NBA hub entry or provisional JSON bundle",()=>{
    expect(router).toContain('path: "nba/gm-dev", element: <NbaWhoAmIOwnerGate>');
    expect(page).toContain("OWNER PLAYTEST · NOT PUBLIC");
    expect(page).toContain("fictional game-price fixture");
    expect(page).not.toContain("nba-gm-330-six-skills-PROVISIONAL");
    expect(css).toContain("@media(max-width:700px)");
    expect(css).toContain("overflow-wrap:anywhere");
    expect(page).toContain('aria-pressed={activeSlot === slot}');
    expect(page).toContain("nbaGmDevCandidates");
    expect(page).toContain('act("confirm")');
  });
  it("uses authenticated Supabase actions instead of a client-generated team wheel or result",async()=>{
    const calls:Array<{name:string;args:Record<string,unknown>|undefined}>=[];
    const client={rpc:async(name:string,args?:Record<string,unknown>)=>{
      calls.push({name,args});
      if(name==="nba_gm_dev_catalog")return {data:catalog,error:null};
      return {data:run,error:null};
    }};
    const repo=createNbaGmDevRepository(client)!;
    expect((await repo.catalog()).length).toBe(330);
    expect((await repo.action("spin","C"))?.pendingTeam).toBe("SAS");
    expect((await repo.action("pick","C",wemby.id))?.picks).toEqual([]);
    expect(calls.map(c=>c.name)).toEqual(["nba_gm_dev_catalog","nba_gm_dev_action","nba_gm_dev_action"]);
    expect(calls[1]?.args).toEqual({p_action:"spin",p_slot:"C",p_player_id:null});
    expect(calls[2]?.args).toEqual({p_action:"pick",p_slot:"C",p_player_id:wemby.id});
    expect(Object.keys(calls[2]!.args!)).not.toContain("team");
    expect(Object.keys(calls[2]!.args!)).not.toContain("result");
  });
});
