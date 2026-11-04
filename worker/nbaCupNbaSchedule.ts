import {CUP_GAMES} from "../src/features/nba/nbaCupTracker";
import type {NbaCupScoreEvent} from "./nbaCupScoreboard";

/**
 * The NBA's current-season schedule CDN publishes official game status and score.
 * Match by EXACT 2026 Cup fixture identity, never merely by game date.
 */
const cupFixtures=new Set(CUP_GAMES.map(game=>game.id));
export const NBA_SCHEDULE_CDN=[
  "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json",
  "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json",
] as const;

type ScheduleGame={
  gameCode?:string;
  gameStatus?:number;
  gameStatusText?:string;
  awayTeam?:{teamTricode?:string;score?:number|string};
  homeTeam?:{teamTricode?:string;score?:number|string};
};
type SchedulePayload={
  leagueSchedule?:{
    seasonYear?:string|number;
    gameDates?:Array<{games?:ScheduleGame[]}>;
  };
};
function finalScore(raw:unknown):number|null{
  if(typeof raw!=="number"&&typeof raw!=="string")return null;
  const value=Number(raw);
  return Number.isInteger(value)&&value>=0&&value<400?value:null;
}
export function parseOfficialNbaCupSchedule(payload:unknown):NbaCupScoreEvent[]{
  const schedule=payload as SchedulePayload|null;
  const year=String(schedule?.leagueSchedule?.seasonYear??"");
  if(year!=="2026"&&year!=="2026-27"&&year!=="2026-2027"||!Array.isArray(schedule?.leagueSchedule?.gameDates)){
    throw new Error("NBA schedule does not represent the 2026 season.");
  }
  const matches:NbaCupScoreEvent[]=[];
  const seen=new Set<string>();
  for(const date of schedule.leagueSchedule.gameDates){
    for(const game of date.games??[]){
      const code=game.gameCode??"";
      const dateCode=code.match(/^(\d{4})(\d{2})(\d{2})\//);
      if(!dateCode)continue;
      const day=dateCode[1]+"-"+dateCode[2]+"-"+dateCode[3];
      const away=game.awayTeam?.teamTricode;
      const home=game.homeTeam?.teamTricode;
      if(!away||!home)continue;
      const id=day+"|"+away+"|"+home;
      if(!cupFixtures.has(id)||seen.has(id))continue;
      seen.add(id);
      const awayScore=finalScore(game.awayTeam?.score);
      const homeScore=finalScore(game.homeTeam?.score);
      const withScores=awayScore!==null&&homeScore!==null;
      const status=game.gameStatus===3&&withScores?"final"
        :game.gameStatus===2&&withScores?"live":"scheduled";
      matches.push({
        id,home,away,status,
        homeScore:status==="scheduled"?null:homeScore,
        awayScore:status==="scheduled"?null:awayScore,
        detail:typeof game.gameStatusText==="string"?game.gameStatusText.slice(0,60):"",
      });
    }
  }
  // Empty results usually indicate a stale CDN season or a malformed payload.
  if(matches.length<10)throw new Error("NBA schedule missing Cup fixtures.");
  return matches;
}

export async function fetchOfficialNbaCupScores():Promise<NbaCupScoreEvent[]>{
  for(const url of NBA_SCHEDULE_CDN){
    try{
      const response=await fetch(url,{headers:{Accept:"application/json","User-Agent":"OctagonHQ/1.0"},signal:AbortSignal.timeout(12000)});
      if(!response.ok)continue;
      const events=parseOfficialNbaCupSchedule(await response.json());
      return events;
    }catch{/* Try the alternate official CDN endpoint. */}
  }
  throw new Error("Official NBA schedule feed unavailable.");
}
