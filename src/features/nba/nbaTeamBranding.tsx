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
export const nbaTeamColor = (id:string) => NBA_BRAND_COLORS[id] ?? "#c48d4a";
export const nbaTeamLogoSrc = (id:string) => NBA_IDS[id]
  ? `https://cdn.nba.com/logos/nba/${NBA_IDS[id]}/primary/L/logo.svg`
  : "";

export function NbaTeamMark({team}:{team:NbaTeam}) {
  return <span className="nba-team-mark" aria-hidden="true">
    <span className="nba-team-mark__fallback">{team.id}</span>
    <img src={nbaTeamLogoSrc(team.id)} alt="" loading="lazy"
      onError={event=>{ event.currentTarget.style.display="none"; }} />
  </span>;
}
