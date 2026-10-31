import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { NbaGmDevPlayer, NbaGmDevRun } from "./nbaGmDevModel";
import { NBA_GM_ROSTER_SLOTS } from "./nbaGmFoundation";
const slot=z.enum(NBA_GM_ROSTER_SLOTS);
const run=z.object({
  version:z.literal("nba-gm-dev-v2"),economyVersion:z.literal(3).optional(),developmentModelVersion:z.literal(2).optional(),seed:z.string().startsWith("nba-gm-"),
  phase:z.enum(["draft","year1","offseason","final"]),
  picks:z.array(z.object({slot,playerId:z.string().min(1)})).max(7),
  yearOnePicks:z.array(z.object({slot,playerId:z.string().min(1)})).max(7),
  pendingTeam:z.string().nullable(),pendingSlot:z.null(),spinIndex:z.number().int().nonnegative(),
  caps:z.tuple([z.number().int(),z.number().int(),z.number().int()]),
  results:z.array(z.object({season:z.number().int(),wins:z.number().int(),losses:z.number().int(),
    offense:z.number(),defense:z.number(),positionalFit:z.number(),finish:z.string()})),
  shopPlayerId:z.string().nullable(),tradeTeam:z.string().nullable(),
  tradeAttempts:z.number().int().nonnegative(),tradesUsed:z.number().int().nonnegative(),
  freeAgencyTeam:z.string().nullable(),freeAgencyVisits:z.number().int().nonnegative(),
  releasedIds:z.array(z.string()),
  development:z.record(z.string(),z.object({year2Grade:z.number(),year3Grade:z.number(),
    year2Salary:z.number(),year3Salary:z.number(),startingGrade:z.number()})).optional(),
  scoreBreakdown:z.object({score:z.number(),roster:z.number(),regularSeason:z.number(),
    playoffs:z.number(),weights:z.tuple([z.number(),z.number(),z.number()])}).optional(),
});
const player=z.object({
  id:z.string().min(1),name:z.string().min(1),teamCode:z.string(),
  positions:z.array(z.enum(["PG","SG","SF","PF","C"])).min(1),
  currentGrade:z.number().int(),salaries:z.tuple([z.number().int(),z.number().int(),z.number().int()]),
  skills:z.object({scoring:z.number().int(),shooting:z.number().int(),playmaking:z.number().int(),
    perimeterDefense:z.number().int(),interiorDefense:z.number().int(),rebounding:z.number().int()}),
  gameContract:z.enum(["1YR","3YR"]),
  pricingKind:z.literal("GAME_FIXTURE_NOT_REAL_CONTRACT"),eligibilityKind:z.literal("PROVISIONAL_EDITORIAL"),
  officialNbaPlayerId:z.string().nullable(),ageAtStart:z.number().int().min(18).max(50).nullable().optional(),
  developmentOdds:z.object({breakoutPct:z.number().min(0).max(100),improvePct:z.number().min(0).max(100),declinePct:z.number().min(0).max(100),steadyPct:z.number().min(0).max(100)}).nullable().optional(),
  // Keep the owner-gated backend forecast; Zod strips unrecognized keys.
  repriceRisk:z.enum(["LOW","MEDIUM","HIGH","LOCKED"]).nullable().optional(),
  officialRosterPosition:z.string().min(1),
  positionReview:z.literal("unverified"),reviewFlags:z.array(z.string()).min(1),
});
type RpcClient={rpc:(name:string,args?:Record<string,unknown>)=>
  PromiseLike<{data:unknown,error:{message?:string}|null}>};
export type NbaGmDevOperation="load"|"start"|"spin"|"pick"|"offseason"|
 "shop"|"trade-spin"|"trade"|"cancel-trade"|"release"|"fa-spin"|"sign"|"pass-fa"|"emergency-sign"|"advance";
export function createNbaGmDevRepository(supplied?:RpcClient|null){
  const client=supplied===undefined?getSupabaseClient() as unknown as RpcClient|null:supplied;
  if(!client)return null;
  return {
    async catalog():Promise<NbaGmDevPlayer[]>{
      const {data,error}=await client.rpc("nba_gm_dev_catalog");
      if(error)throw Error(error.message||"NBA GM private catalog unavailable.");
      return z.array(player).length(330).parse(data) as NbaGmDevPlayer[];
    },
    async action(operation:NbaGmDevOperation,playerId?:string,tradeChipId?:string):Promise<NbaGmDevRun|null>{
      const {data,error}=await client.rpc("nba_gm_dev_action",{
        p_action:operation,p_slot:tradeChipId??null,p_player_id:playerId??null,
      });
      if(error)throw Error(error.message||"NBA GM action failed.");
      return data==null?null:run.parse(data) as NbaGmDevRun;
    },
  };
}
