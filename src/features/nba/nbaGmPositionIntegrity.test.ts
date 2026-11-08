import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createNbaGmDevRepository } from "./nbaGmDevRepository";
import type { NbaGmDevRun } from "./nbaGmDevModel";

const sample:NbaGmDevRun={
  version:"nba-gm-dev-v2", economyVersion:4,simulationModelVersion:13,
  lineupModelVersion:2,rosterQualityVersion:1,developmentModelVersion:2,
  seed:"nba-gm-guard-test", phase:"offseason", picks:[],yearOnePicks:[],
  pendingTeam:null,pendingSlot:null,spinIndex:7,
  caps:[175000000,175000000,175000000],results:[],
  shopPlayerId:null,tradeTeam:null,tradeAttempts:0,tradesUsed:0,
  freeAgencyTeam:"HOU",freeAgencyVisits:1,releasedIds:[],
};
const expected=[{playerId:"nba-gm-draft-clintcapela",
  projectedPicks:[{slot:"BIG" as const,playerId:"nba-gm-draft-clintcapela"}]}];

describe("NBA GM positional-integrity release contract",()=>{
  it("reads backend-vetted candidate IDs and position previews, not client guesses",async()=>{
    const calls:string[]=[];
    const repo=createNbaGmDevRepository({rpc:async(name)=>{
      calls.push(name);
      return {data:name==="nba_gm_dev_legal_candidates"?expected:
        name==="nba_gm_dev_legal_trade_targets"?["nba-gm-draft-clintcapela"]:sample,
        error:null};
    }})!;
    expect(await repo.action("load")).toMatchObject({rosterQualityVersion:1,simulationModelVersion:13});
    expect(await repo.legalCandidates()).toEqual(expected);
    expect(await repo.legalTradeTargets()).toEqual(["nba-gm-draft-clintcapela"]);
    expect(calls).toEqual(["nba_gm_dev_action","nba_gm_dev_legal_candidates","nba_gm_dev_legal_trade_targets"]);
  });
  it("keeps saved V13 games without the opt-in loading normally",async()=>{
    const repo=createNbaGmDevRepository({rpc:async()=>({data:{...sample,rosterQualityVersion:undefined},error:null})})!;
    const old=await repo.action("load");
    expect(old?.rosterQualityVersion).toBeUndefined();
    expect(old?.simulationModelVersion).toBe(13);
  });
  it("does not show forbidden players, warning cards, or fictional slot-based transaction swaps",()=>{
    const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
    const final=readFileSync("src/features/nba/NbaGmFinalExperience.tsx","utf8");
    const sql=readFileSync("supabase/migrations/202612311503_nba_gm_offseason_position_integrity.sql","utf8");
    expect(page).toContain("serverPicker?.key===candidateKey");
    expect(page).toContain("projectedById.has(player.id)");
    expect(page).toContain("serverTradeTargets.ids.includes(p.id)");
    expect(page).toContain("AFTER SIGNING · PROJECTED YEAR 2");
    expect(page).toContain("AFTER TRADE · PROJECTED YEAR 2");
    expect(page).not.toContain("benchAlert");
    expect(final).toContain("finalIds.has(pick.playerId)");
    expect(final).toContain("originalSlotById");
    expect(final).not.toContain('row.starting?.name??"OPEN"');
    expect(sql).toContain("private.nba_gm_v14_roster_ok");
    expect(sql).toContain("private.nba_gm_v14_lineup_strength");
    expect(sql).toContain("private.nba_gm_v13_components");
    expect(sql).toContain("'rosterQualityVersion',1");
  });
});
