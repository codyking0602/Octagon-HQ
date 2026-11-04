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

export async function serveNbaCupScoreboard(requestUrl:URL):Promise<Response>{
  const day=requestUrl.searchParams.get("date")??"";
  const jsonHeaders={"Content-Type":"application/json; charset=utf-8"};
  if(!NBA_CUP_2026_DATES.has(day))return new Response(JSON.stringify({error:"Invalid 2026 NBA Cup date."}),{
    status:400,headers:{...jsonHeaders,"Cache-Control":"no-store"},
  });
  try{
    const upstream=await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates="+day.replaceAll("-","")+"&limit=100",{
      headers:{Accept:"application/json","User-Agent":"OctagonHQ/1.0"},
    });
    if(!upstream.ok)throw new Error("NBA score provider unavailable");
    const events=parseEspnNbaCupScoreboard(day,await upstream.json());
    return new Response(JSON.stringify({date:day,source:"ESPN",events}),{
      status:200,headers:{...jsonHeaders,"Cache-Control":"public, max-age=75, stale-while-revalidate=180"},
    });
  }catch{
    return new Response(JSON.stringify({error:"NBA Cup scores temporarily unavailable."}),{
      status:502,headers:{...jsonHeaders,"Cache-Control":"no-store"},
    });
  }
}
