import {CUP_GAMES,CUP_NIGHTS,cupFixtureId,type CupScoreFeed,type CupScore} from "./nbaCupTracker";

/**
 * Public, read-only, first-party Cup-night score feed.
 * Do not trust a provider's "NBA game on a Cup date" as Cup membership:
 * the match must be one of the sixty NBA-official group-play fixtures.
 */
const CANONICAL=new Set(CUP_GAMES.map(game=>game.id));
type ScoreboardPayload={date:string;source:string;events:unknown[]};
function validScore(item:unknown,date:string):[string,CupScore]|null{
  if(!item||typeof item!=="object")return null;
  const value=item as Record<string,unknown>;
  const away=value.away,home=value.home,status=value.status;
  if(typeof away!=="string"||typeof home!=="string"||
     (status!=="scheduled"&&status!=="live"&&status!=="final"))return null;
  const id=cupFixtureId(date,away,home);
  if(!CANONICAL.has(id))return null;
  const awayScore=value.awayScore,homeScore=value.homeScore;
  const scoreValid=(n:unknown)=>Number.isInteger(n)&&typeof n==="number"&&n>=0&&n<400;
  if(status!=="scheduled"&&(!scoreValid(awayScore)||!scoreValid(homeScore)))return null;
  return [id,{
    away,home,status,
    awayScore:scoreValid(awayScore)?awayScore as number:null,
    homeScore:scoreValid(homeScore)?homeScore as number:null,
    detail:typeof value.detail==="string"?value.detail.slice(0,60):"",
  }];
}
async function fetchNight(date:string):Promise<{date:string;scores:Record<string,CupScore>}>{
  const response=await fetch("/api/nba/cup-2026-scoreboard?date="+encodeURIComponent(date),{
    headers:{Accept:"application/json"},
  });
  if(!response.ok)throw new Error("NBA Cup scores temporarily unavailable.");
  const data=await response.json() as ScoreboardPayload;
  if(!data||data.date!==date||data.source!=="ESPN"||!Array.isArray(data.events))
    throw new Error("NBA Cup score source could not be verified.");
  const scores:Record<string,CupScore>={};
  for(const item of data.events){
    const valid=validScore(item,date);
    if(valid)scores[valid[0]]=valid[1];
  }
  return {date,scores};
}
export async function loadCupScoreFeed():Promise<CupScoreFeed>{
  const settled=await Promise.allSettled(CUP_NIGHTS.map(fetchNight));
  const byGame:Record<string,CupScore>={};
  const failedDates:string[]=[];
  settled.forEach((result,index)=>{
    if(result.status==="rejected"){failedDates.push(CUP_NIGHTS[index]);return;}
    Object.assign(byGame,result.value.scores);
    // Past Cup nights must have all officially scheduled results accounted for.
    // The future schedule remains available even if ESPN has not posted games yet.
    const date=CUP_NIGHTS[index];
    const night=CUP_GAMES.filter(game=>game.date===date);
    const hasPastTipoffs=night.some(game=>Date.parse(game.startAt)<Date.now()-5*60*60*1000);
    if(hasPastTipoffs&&night.some(game=>!byGame[game.id]))failedDates.push(date);
  });
  return {byGame,failedDates,refreshedAt:new Date().toISOString()};
}
