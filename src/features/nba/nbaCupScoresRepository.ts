import {CUP_GAMES,type CupScoreFeed,type CupScore} from "./nbaCupTracker";

/**
 * One read-only first-party feed, using official NBA schedule first and ESPN
 * as a supplement. Only the exact 60 official group fixtures can enter results.
 */
const CANONICAL=new Set(CUP_GAMES.map(game=>game.id));
type ScoreboardPayload={source?:string;events?:unknown[];refreshedAt?:string};

export function normalizeCupScoreFeed(payload:unknown,nowMs=Date.now()):CupScoreFeed{
  const data=payload as ScoreboardPayload|null;
  if(!data||data.source!=="NBA+ESPN"||!Array.isArray(data.events))
    throw new Error("NBA Cup result source could not be verified.");
  const byGame:Record<string,CupScore>={};
  for(const item of data.events){
    if(!item||typeof item!=="object")continue;
    const value=item as Record<string,unknown>;
    const id=value.id,away=value.away,home=value.home,status=value.status;
    if(typeof id!=="string"||!CANONICAL.has(id)||typeof away!=="string"||typeof home!=="string")continue;
    const expected=CUP_GAMES.find(game=>game.id===id);
    if(expected?.away!==away||expected.home!==home)continue;
    if(status!=="scheduled"&&status!=="live"&&status!=="final")continue;
    const validScore=(n:unknown):n is number=>typeof n==="number"&&Number.isInteger(n)&&n>=0&&n<400;
    const awayScore=value.awayScore,homeScore=value.homeScore;
    if(status!=="scheduled"&&(!validScore(awayScore)||!validScore(homeScore)))continue;
    byGame[id]={
      away,home,status,
      awayScore:validScore(awayScore)?awayScore:null,
      homeScore:validScore(homeScore)?homeScore:null,
      detail:typeof value.detail==="string"?value.detail.slice(0,60):"",
    };
  }
  // A missing *completed* fixture is an actual score gap. Future games are
  // scheduled and should not cause distracting failure banners.
  const failedDates=[...new Set(CUP_GAMES.filter(game=>
    Date.parse(game.startAt)+5*60*60*1000<nowMs &&
    byGame[game.id]?.status!=="final"
  ).map(game=>game.date))];
  return {byGame,failedDates,refreshedAt:data.refreshedAt??new Date().toISOString()};
}
export async function loadCupScoreFeed():Promise<CupScoreFeed>{
  const response=await fetch("/api/nba/cup-2026-scoreboard",{
    headers:{Accept:"application/json"},
  });
  if(!response.ok)throw new Error("NBA Cup scores temporarily unavailable.");
  return normalizeCupScoreFeed(await response.json());
}
