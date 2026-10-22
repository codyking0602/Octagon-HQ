import { getSupabaseClient } from "../../lib/supabase";
import { NBA_SEASON, type NbaFuturesPicks, type NbaTeam } from "./nbaFutures";

export type NbaFuturesSnapshot = {
  season:number; locked:boolean; lock_at:string; own:NbaFuturesPicks|null;
  participants:number; entries:{profile_id:string;display_name:string;complete:boolean;picks:NbaFuturesPicks}[];
  lines:NbaTeam[];
};
export async function loadNbaFutures():Promise<NbaFuturesSnapshot> {
  const client=getSupabaseClient();
  if(!client) throw new Error("Basketball Futures are not connected.");
  const {data,error}=await client.rpc("get_nba_futures",{p_season:NBA_SEASON});
  if(error) throw new Error(error.message||"Basketball Futures could not load.");
  return data as NbaFuturesSnapshot;
}
export async function saveNbaFutures(picks:NbaFuturesPicks):Promise<void> {
  const client=getSupabaseClient();
  if(!client) throw new Error("Basketball Futures are not connected.");
  const {error}=await client.rpc("save_nba_futures",{p_season:NBA_SEASON,p_picks:picks});
  if(error) throw new Error(error.message||"Basketball Futures could not save.");
}
