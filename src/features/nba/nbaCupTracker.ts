import {CUP_GROUPS,type CupGroupId} from "./nbaCup2026";

/**
 * Official 2026 Emirates NBA Cup Group Play fixtures (NBA.com, November 2, 2026):
 * https://www.nba.com/news/emirates-nba-cup-key-dates-schedule
 * Sixty games, four per team, ten per five-team group.
 * Each row is away, home, tipoff in Eastern Time. Explicit game identity
 * keeps non-Cup regular-season games out of the Cup-only standings.
 */
const GROUP_PLAY_NIGHTS = [
  ["2026-10-30", "CHA WAS 19:00; CHI BOS 19:30; DET BKN 19:30; NYK PHI 19:30; ORL TOR 19:30; IND MIA 20:00; HOU DAL 20:00; LAC MIN 20:00; LAL GSW 22:00; DEN PHX 22:00"],
  ["2026-11-06", "WAS ATL 19:00; BOS CHA 19:00; PHI CLE 19:30; UTA DAL 20:00; OKC MEM 20:00; TOR MIL 20:00; MIN NOP 20:00; POR LAL 22:00; SAS SAC 22:00"],
  ["2026-11-13", "NYK IND 19:00; MIL ORL 19:00; CLE MIA 20:00; ATL CHI 20:00; MEM NOP 20:00; UTA HOU 20:30; GSW SAS 21:30; POR SAC 22:00; OKC LAC 22:30"],
  ["2026-11-20", "CHA ATL 19:00; ORL BKN 19:30; IND CLE 19:30; TOR DET 19:30; WAS CHI 20:00; NOP OKC 20:00; PHX UTA 21:30; HOU DEN 22:00; SAC LAL 22:00"],
  ["2026-11-24", "DET ORL 19:00; BOS WAS 20:00; DAL DEN 22:00"],
  ["2026-11-25", "MIA PHI 17:00; CHI CHA 19:00; CLE NYK 19:30; MIN OKC 19:30; LAC MEM 20:00; BKN MIL 20:00; PHX HOU 20:30; SAC GSW 22:00; SAS POR 22:00"],
  ["2026-11-27", "MIA NYK 19:00; MIL DET 19:30; PHI IND 19:30; BKN TOR 19:30; ATL BOS 20:00; MEM MIN 20:30; DAL PHX 21:00; LAL SAS 21:30; DEN UTA 21:30; NOP LAC 21:30; GSW POR 21:30"],
] as const;

export const CUP_NIGHTS = GROUP_PLAY_NIGHTS.map(([date])=>date);
export type CupScoreStatus="scheduled"|"live"|"final";
export type CupScore={
  away:string;
  home:string;
  status:CupScoreStatus;
  awayScore:number|null;
  homeScore:number|null;
  detail:string;
};
export type CupGame={
  id:string;
  date:string;
  startAt:string;
  away:string;
  home:string;
  groupId:CupGroupId;
};
export type CupScoreFeed={
  byGame:Record<string,CupScore>;
  failedDates:string[];
  refreshedAt:string;
};
export const CUP_GAMES:readonly CupGame[]=GROUP_PLAY_NIGHTS.flatMap(([date,lines])=>
  lines.split(";").map(row=>{
    const [away,home,time]=row.trim().split(/\s+/);
    const group=CUP_GROUPS.find(group=>group.teams.some(t=>t===away)&&group.teams.some(t=>t===home));
    if(!away||!home||!time||!group)throw new Error("Invalid NBA Cup fixture: "+date+" "+row);
    const offset=date==="2026-10-30"?"-04:00":"-05:00";
    return {id:cupFixtureId(date,away,home),date,startAt:new Date(date+"T"+time+":00"+offset).toISOString(),away,home,groupId:group.id};
  })
).sort((a,b)=>a.startAt.localeCompare(b.startAt));

export function cupFixtureId(date:string,away:string,home:string){
  return date+"|"+away+"|"+home;
}
export function cupGameStatus(game:CupGame,feed:CupScoreFeed|null){
  return feed?.byGame[game.id]?.status??"scheduled";
}
export function cupGameScore(game:CupGame,feed:CupScoreFeed|null){
  const score=feed?.byGame[game.id];
  return score&&(score.status==="final"||score.status==="live")?score:null;
}
export function cupGamesForTeam(teamId:string){
  return CUP_GAMES.filter(game=>game.home===teamId||game.away===teamId);
}
export function nextCupGame(teamId:string,feed:CupScoreFeed|null,nowMs=Date.now()){
  return cupGamesForTeam(teamId).find(game=>
    cupGameStatus(game,feed)==="live" ||
    (cupGameStatus(game,feed)!=="final" && Date.parse(game.startAt)+4*60*60*1000>nowMs)
  )??null;
}
export function nextCupNight(feed:CupScoreFeed|null,nowMs=Date.now()){
  return CUP_GAMES.find(game=>
    cupGameStatus(game,feed)==="live" ||
    (cupGameStatus(game,feed)!=="final" && Date.parse(game.startAt)+4*60*60*1000>nowMs)
  )?.date??null;
}
export type CupGroupRecord={teamId:string;wins:number;losses:number;differential:number;played:number};
export function cupGroupRecords(groupId:CupGroupId,feed:CupScoreFeed|null):CupGroupRecord[]{
  const group=CUP_GROUPS.find(group=>group.id===groupId);
  if(!group)return [];
  const result=group.teams.map(teamId=>({teamId,wins:0,losses:0,differential:0,played:0}));
  for(const game of CUP_GAMES.filter(game=>game.groupId===groupId)){
    const score=cupGameScore(game,feed);
    if(!score||score.status!=="final"||score.homeScore===null||score.awayScore===null)continue;
    const home=result.find(row=>row.teamId===game.home);
    const away=result.find(row=>row.teamId===game.away);
    if(!home||!away||score.homeScore===score.awayScore)continue;
    home.played++;away.played++;
    home.differential+=score.homeScore-score.awayScore;
    away.differential+=score.awayScore-score.homeScore;
    (score.homeScore>score.awayScore?home:away).wins++;
    (score.homeScore>score.awayScore?away:home).losses++;
  }
  // Unofficial standings only: NBA head-to-head / multi-team tie-breakers
  // decide official group rankings; never grade a pick from this ordering.
  return result.sort((a,b)=>b.wins-a.wins||a.losses-b.losses||b.differential-a.differential||a.teamId.localeCompare(b.teamId));
}
export function cupGameDateLabel(game:CupGame,options?:Intl.DateTimeFormatOptions){
  return new Intl.DateTimeFormat("en-US",{timeZone:"America/Chicago",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",...options}).format(new Date(game.startAt));
}
