import {CUP_GAMES} from "../src/features/nba/nbaCupTracker";
import {fetchOfficialNbaCupScores} from "./nbaCupNbaSchedule";
/**
 * Read-only ESPN NBA scoreboard adapter for the seven *official* 2026 Cup nights.
 * Fixture eligibility is validated separately against the NBA-authored 60-game
 * Cup schedule in the client, never inferred merely from the calendar date.
 */
export const NBA_CUP_2026_DATES = new Set([
  "2026-10-30","2026-11-06","2026-11-13","2026-11-20",
  "2026-11-24","2026-11-25","2026-11-27",
]);

const ESPN_TO_NBA:Record<string,string>={
  GS:"GSW",NY:"NYK",SA:"SAS",NO:"NOP",WSH:"WAS",
  PHO:"PHX",UTAH:"UTA",UTAHJAZZ:"UTA",BKN:"BKN",
};

function nbaAbbreviation(raw:unknown){
  if(typeof raw!=="string")return null;
  const code=raw.trim().toUpperCase();
  const mapped=ESPN_TO_NBA[code]??code;
  return /^[A-Z]{2,3}$/.test(mapped)?mapped:null;
}
function scoreValue(raw:unknown):number|null{
  if(typeof raw!=="string"&&typeof raw!=="number")return null;
  const value=Number(raw);
  return Number.isInteger(value)&&value>=0&&value<400?value:null;
}
export type NbaCupScoreEvent={
  id:string;
  away:string;
  home:string;
  status:"scheduled"|"live"|"final";
  awayScore:number|null;
  homeScore:number|null;
  detail:string;
};
type EspnScoreboard={
  events?:Array<{
    date?:string;
    status?:{type?:{completed?:boolean;state?:string;shortDetail?:string}};
    competitions?:Array<{competitors?:Array<{
      homeAway?:string;
      score?:string|number;
      team?:{abbreviation?:string};
    }> }>;
  }>;
};
export function parseEspnNbaCupScoreboard(day:string,payload:unknown):NbaCupScoreEvent[]{
  if(!NBA_CUP_2026_DATES.has(day))return [];
  const data=payload as EspnScoreboard|null;
  if(!data||!Array.isArray(data.events))throw new Error("Invalid NBA scoreboard response");
  const events:NbaCupScoreEvent[]=[];
  for(const event of data.events){
    const competition=event.competitions?.[0];
    const homeTeam=competition?.competitors?.find(t=>t.homeAway==="home");
    const awayTeam=competition?.competitors?.find(t=>t.homeAway==="away");
    const home=nbaAbbreviation(homeTeam?.team?.abbreviation);
    const away=nbaAbbreviation(awayTeam?.team?.abbreviation);
    if(!home||!away||home===away)continue;
    const actualParts=event.date?new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(event.date)).reduce((parts,item)=>item.type==="year"||item.type==="month"||item.type==="day"?{...parts,[item.type]:item.value}:parts,{} as Record<string,string>):null;
    const actualDay=actualParts?actualParts.year+"-"+actualParts.month+"-"+actualParts.day:null;
    // ESPN's date parameter is not proof that a rescheduled game belongs to
    // the requested date. Exclude any event whose actual tipoff day differs.
    if(actualDay!==day)continue;
    const completed=event.status?.type?.completed===true;
    const live=!completed&&event.status?.type?.state==="in";
    const homeScore=scoreValue(homeTeam?.score);
    const awayScore=scoreValue(awayTeam?.score);
    const hasScore=homeScore!==null&&awayScore!==null;
    const status=completed&&hasScore?"final":live&&hasScore?"live":"scheduled";
    events.push({
      id:day+"|"+away+"|"+home,
      away,home,status,
      awayScore:status==="scheduled"?null:awayScore,
      homeScore:status==="scheduled"?null:homeScore,
      detail:typeof event.status?.type?.shortDetail==="string"
        ?event.status.type.shortDetail.slice(0,60):"",
    });
  }
  return events;
}

/** Final October 30 game results cross-checked against NBA's public box scores.
 * These verified results are a fallback, not a source for later Cup nights.
 * https://www.nba.com/game/DET-vs-BKN-0022600017
 */
export const VERIFIED_CUP_OPENING_NIGHT:NbaCupScoreEvent[]=[
  ["CHA","WAS",79,95],["CHI","BOS",111,125],
  ["DET","BKN",110,94],["NYK","PHI",93,98],
  ["ORL","TOR",121,114],["IND","MIA",125,145],
  ["HOU","DAL",111,116],["LAC","MIN",101,127],
  ["LAL","GSW",95,112],["DEN","PHX",127,120],
].map(([away,home,awayScore,homeScore])=>({
  id:"2026-10-30|"+away+"|"+home,
  away:String(away),home:String(home),awayScore:Number(awayScore),homeScore:Number(homeScore),
  status:"final" as const,detail:"Final",
}));

const CUP_FIXTURES=new Set(CUP_GAMES.map(game=>game.id));
function confirmedFixture(event:NbaCupScoreEvent){
  return CUP_FIXTURES.has(event.id)
    && event.id.split("|")[1]===event.away
    && event.id.split("|")[2]===event.home;
}
function progress(status:NbaCupScoreEvent["status"]){
  return status==="final"?2:status==="live"?1:0;
}
export function mergeCupGameScores(...lists:readonly NbaCupScoreEvent[][]):NbaCupScoreEvent[]{
  const result=new Map<string,NbaCupScoreEvent>();
  for(const list of lists)for(const event of list){
    if(!confirmedFixture(event))continue;
    const prior=result.get(event.id);
    if(!prior||progress(event.status)>=progress(prior.status)){
      result.set(event.id,event);
    }
  }
  return [...result.values()];
}
async function fetchEspnNight(day:string):Promise<NbaCupScoreEvent[]>{
  try{
    const response=await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates="+day.replaceAll("-","")+"&limit=100",{
      headers:{Accept:"application/json","User-Agent":"OctagonHQ/1.0"},
      signal:AbortSignal.timeout(9000),
    });
    if(!response.ok)return [];
    return parseEspnNbaCupScoreboard(day,await response.json()).filter(confirmedFixture);
  }catch{return [];}
}
export async function serveNbaCupScoreboard(requestUrl:URL):Promise<Response>{
  const day=requestUrl.searchParams.get("date")??"";
  const jsonHeaders={"Content-Type":"application/json; charset=utf-8"};
  if(day&&!NBA_CUP_2026_DATES.has(day))return new Response(JSON.stringify({error:"Invalid 2026 NBA Cup date."}),{
    status:400,headers:{...jsonHeaders,"Cache-Control":"no-store"},
  });

  let official:NbaCupScoreEvent[]=[];
  try{official=await fetchOfficialNbaCupScores();}catch{/* ESPN and verified result fallback. */}
  const now=Date.now();
  // ESPN complements the NBA CDN only if official past results are missing or
  // a Cup night is currently active. Do not fetch seven future nights repeatedly.
  const needed=[...NBA_CUP_2026_DATES].filter(date=>{
    const games=CUP_GAMES.filter(game=>game.date===date);
    if(!games.length)return false;
    if(games.some(game=>Date.parse(game.startAt)<now
      && Date.parse(game.startAt)+4*60*60*1000>now))return true;
    return games.some(game=>Date.parse(game.startAt)+5*60*60*1000<now
      && official.find(event=>event.id===game.id)?.status!=="final");
  });
  const supplementary=await Promise.all(needed.map(fetchEspnNight));
  const events=mergeCupGameScores(
    VERIFIED_CUP_OPENING_NIGHT,
    ...supplementary,
    official,
  ).filter(event=>!day||event.id.startsWith(day+"|"));
  if(!events.length&&needed.length&&official.length===0)
    return new Response(JSON.stringify({error:"NBA Cup scores temporarily unavailable."}),{
      status:502,headers:{...jsonHeaders,"Cache-Control":"no-store"},
    });
  return new Response(JSON.stringify({
    date:day||null,source:"NBA+ESPN",events,refreshedAt:new Date().toISOString(),
  }),{
    status:200,headers:{...jsonHeaders,"Cache-Control":"public, max-age=75, stale-while-revalidate=180"},
  });
}
