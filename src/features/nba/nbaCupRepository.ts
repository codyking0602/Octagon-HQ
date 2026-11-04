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

export type CupStandingMember={profile_id:string;display_name:string;picks:CupGroupPicks};
/** The server exposes member cards only after the manual group-picks lock. */
export async function loadCupStandings():Promise<CupStandingMember[]>{
  const client=getSupabaseClient();
  if(!client)throw new Error("NBA Cup standings are not connected.");
  const {data,error}=await client.rpc("get_nba_cup_group_standings_2026");
  if(error)throw new Error(error.message);
  if(!data||data.locked!==true||!Array.isArray(data.entries))
    throw new Error("NBA Cup standings are not yet available.");
  const entries=data.entries as unknown[];
  if(entries.some(entry=>{
    if(!entry||typeof entry!=="object")return true;
    const member=entry as Record<string,unknown>;
    return typeof member.profile_id!=="string"||typeof member.display_name!=="string"||!validCupPicks(member.picks);
  }))throw new Error("NBA Cup standings could not be verified.");
  return entries as CupStandingMember[];
}
