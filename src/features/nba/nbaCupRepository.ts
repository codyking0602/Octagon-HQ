import {getSupabaseClient} from "../../lib/supabase";
import {validCupPicks,type CupGroupPicks} from "./nbaCup2026";
export type CupPreview={season:number;locked:boolean;picks:CupGroupPicks;updated_at:string|null};
export async function loadCupPreview():Promise<CupPreview>{
  const client=getSupabaseClient();
  if(!client)throw new Error("NBA Cup is not connected.");
  const {data,error}=await client.rpc("get_nba_cup_group_preview");
  if(error)throw new Error(error.message);
  if(!data||!validCupPicks(data.picks))throw new Error("NBA Cup picks could not be verified.");
  return data as CupPreview;
}
export async function saveCupPreview(picks:CupGroupPicks):Promise<CupPreview>{
  if(!validCupPicks(picks))throw new Error("Invalid group picks.");
  const client=getSupabaseClient();
  if(!client)throw new Error("NBA Cup is not connected.");
  const {data,error}=await client.rpc("save_nba_cup_group_preview",{p_picks:picks});
  if(error)throw new Error(error.message);
  if(!data||!validCupPicks(data.picks))throw new Error("NBA Cup save could not be verified.");
  return data as CupPreview;
}