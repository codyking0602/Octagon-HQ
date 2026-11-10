import { useEffect, useState } from "react";
import type { NbaTeam } from "./nbaFutures";

// Official NBA team IDs power image assets; the team abbreviation is a built-in fallback.
const NBA_IDS: Record<string,string> = {
  ATL:"1610612737",BOS:"1610612738",BKN:"1610612751",CHA:"1610612766",
  CHI:"1610612741",CLE:"1610612739",DAL:"1610612742",DEN:"1610612743",
  DET:"1610612765",GSW:"1610612744",HOU:"1610612745",IND:"1610612754",
  LAC:"1610612746",LAL:"1610612747",MEM:"1610612763",MIA:"1610612748",
  MIL:"1610612749",MIN:"1610612750",NOP:"1610612740",NYK:"1610612752",
  OKC:"1610612760",ORL:"1610612753",PHI:"1610612755",PHX:"1610612756",
  POR:"1610612757",SAC:"1610612758",SAS:"1610612759",TOR:"1610612761",
  UTA:"1610612762",WAS:"1610612764"
};
const NBA_BRAND_COLORS: Record<string,string> = {
  ATL:"#E03A3E",BOS:"#007A33",BKN:"#c5c5c5",CHA:"#1D1160",
  CHI:"#CE1141",CLE:"#860038",DAL:"#00538C",DEN:"#FEC524",
  DET:"#C8102E",GSW:"#FFC72C",HOU:"#CE1141",IND:"#FDBB30",
  LAC:"#C8102E",LAL:"#FDB927",MEM:"#5D76A9",MIA:"#98002E",
  MIL:"#00471B",MIN:"#236192",NOP:"#85714D",NYK:"#F58426",
  OKC:"#007AC1",ORL:"#0077C0",PHI:"#006BB6",PHX:"#E56020",
  POR:"#E03A3E",SAC:"#5A2D81",SAS:"#C4CED4",TOR:"#CE1141",
  UTA:"#753BBD",WAS:"#E31837"
};
// Distinct secondary team hues are used by the shared Spotlight photo bar and fade.
// Neutral black/silver secondaries are intentional for one-color NBA wordmarks.
const NBA_SECONDARY_COLORS: Record<string,string> = {
  ATL:"#C1D32F",BOS:"#BA9653",BKN:"#000000",CHA:"#00788C",
  CHI:"#000000",CLE:"#FDBB30",DAL:"#B8C4CA",DEN:"#0E2240",
  DET:"#006BB6",GSW:"#1D428A",HOU:"#000000",IND:"#002D62",
  LAC:"#1D428A",LAL:"#552583",MEM:"#12173F",MIA:"#F9A01B",
  MIL:"#EEE1C6",MIN:"#0C2340",NOP:"#0C2340",NYK:"#006BB6",
  OKC:"#EF3B24",ORL:"#000000",PHI:"#ED174C",PHX:"#1D1160",
  POR:"#000000",SAC:"#63727A",SAS:"#000000",TOR:"#000000",
  UTA:"#0C2340",WAS:"#002B5C",
};
export const nbaTeamColor = (id:string) => NBA_BRAND_COLORS[id] ?? "#c48d4a";
export const nbaTeamSecondaryColor = (id:string) => NBA_SECONDARY_COLORS[id] ?? nbaTeamColor(id);
export const nbaTeamLogoSrc = (id:string) => NBA_IDS[id]
  ? `https://cdn.nba.com/logos/nba/${NBA_IDS[id]}/primary/L/logo.svg`
  : "";

export function NbaTeamMark({team}:{team:NbaTeam}) {
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[team.id]);
  const logo=nbaTeamLogoSrc(team.id);
  return <span className="nba-team-mark" aria-hidden="true">
    {logo&&!failed
      ?<img src={logo} alt="" loading="lazy" onError={()=>setFailed(true)}/>
      :<span className="nba-team-mark__fallback">{team.id}</span>}
  </span>;
}
