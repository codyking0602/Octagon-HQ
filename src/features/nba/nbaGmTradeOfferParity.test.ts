import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createNbaGmDevRepository } from "./nbaGmDevRepository";

const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const css=readFileSync("src/styles/nba-gm-dev.css","utf8");
const migration=readFileSync("supabase/migrations/202612310916_nba_gm_nfl_trade_offers_parity.sql","utf8");

describe("NBA GM NFL-style trade and free-agent parity",()=>{
  it("fetches at most five server-generated offers with NO client-supplied chip",async()=>{
    const calls:unknown[][]=[];
    const repo=createNbaGmDevRepository({rpc:async(name,args)=>{
      calls.push([name,args]);
      return {data:[{
        outgoingPlayerIds:["anchor"],incomingPlayerIds:["target"],shape:"1-FOR-1",
        requiresFreeAgency:false,requiresRosterMove:false,
      }],error:null};
    }});
    expect(repo).not.toBeNull();
    const offers=await repo!.tradeOffers("target");
    expect(offers).toHaveLength(1);
    expect(calls).toEqual([["nba_gm_dev_trade_offers",{p_target_id:"target"}]]);
    expect(page).toContain('act("trade",tradeTarget,"offer:"+(index+1))');
    expect(page).not.toContain("OPTIONAL SECOND TRADE CHIP");
    expect(page).not.toContain("setTradeChip");
  });
  it("keeps the wheel for spinning, then shows NBA team-branded target choices",()=>{
    expect(page).toContain('!run.tradeTeam||wheelSpinning?');
    expect(page).toContain("nba-gm-dev__trade-team");
    expect(page).toContain("nba-gm-dev__trade-candidate");
    expect(page).toContain("PlayerPortrait player={player}");
    expect(page).toContain("NO LEGAL DEAL AVAILABLE");
    expect(css).toContain(".nba-gm-dev .nba-gm-dev__trade-candidate");
    expect(css).toContain("var(--nba-gm-accent)");
  });
  it("has server-selected optional 1/2-for-1/2 packages within counterparty 0-5% value range",()=>{
    expect(migration).toContain("private.nba_gm_v8_trade_offers");
    expect(migration).toContain("v_ratio>1.05");
    expect(migration).toContain("jsonb_array_length(v_offers)>=5");
    expect(migration).toContain("'activePicks',v_active");
    expect(migration).toContain("'displacedAssets',v_pool");
    expect(migration).toContain("raise exception 'Asking price is no longer available'");
    expect(migration).toContain("jsonb_array_length(coalesce(p_state->'displacedAssets'");
    expect(migration).toContain("jsonb_array_length(coalesce(v_state->''displacedAssets''");
    expect(page).toContain("PUT IN LINEUP");
    expect(page).toContain('act("release-displaced",id)');
  });
  it("preserves NBA's capped FA and emergency completion instead of making a second market",()=>{
    expect(page).toContain('run.freeAgencyVisits<3');
    expect(page).toContain('run.freeAgencyVisits>=3');
    expect(page).toContain('void act("emergency-sign",player.id)');
    expect(migration).toContain("private.nba_gm_v2_can_add");
    expect(migration).toContain("private.nba_gm_v3_salary");
    expect(migration).toContain("private.nba_gm_v3_contract_for_state");
    expect(page).not.toContain("OWNER ONLY · NOT PUBLIC");
  });
});
