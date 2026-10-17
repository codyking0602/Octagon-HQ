/** 2026–27 NBA Futures. Win totals are frozen BetMGM October 13, 2026 lines.
 * https://sports.betmgm.com/en/blog/nba/nba-odds-predictions-season-win-totals-bm23/
 * Never update these lines after entries open.
 */
export type Conference = "East" | "West";
export type WinPick = "over" | "under";
export type NbaTeam = { id: string; name: string; conference: Conference; line: number };
export const NBA_SEASON = 2026;
export const NBA_FUTURES_LOCK_AT = "2026-10-30T16:00:00Z";
export const NBA_FUTURES_LINE_SOURCE = "BetMGM · Oct 13, 2026";
export const NBA_TEAMS: readonly NbaTeam[] = [
  ["ATL","Atlanta Hawks","East",43.5],["BOS","Boston Celtics","East",51.5],
  ["BKN","Brooklyn Nets","East",24.5],["CHA","Charlotte Hornets","East",39.5],
  ["CHI","Chicago Bulls","East",29.5],["CLE","Cleveland Cavaliers","East",47.5],
  ["DAL","Dallas Mavericks","West",34.5],["DEN","Denver Nuggets","West",49.5],
  ["DET","Detroit Pistons","East",49.5],["GSW","Golden State Warriors","West",37.5],
  ["HOU","Houston Rockets","West",48.5],["IND","Indiana Pacers","East",43.5],
  ["LAC","Los Angeles Clippers","West",28.5],["LAL","Los Angeles Lakers","West",46.5],
  ["MEM","Memphis Grizzlies","West",29.5],["MIA","Miami Heat","East",46.5],
  ["MIL","Milwaukee Bucks","East",25.5],["MIN","Minnesota Timberwolves","West",48.5],
  ["NOP","New Orleans Pelicans","West",28.5],["NYK","New York Knicks","East",52.5],
  ["OKC","Oklahoma City Thunder","West",62.5],["ORL","Orlando Magic","East",43.5],
  ["PHI","Philadelphia 76ers","East",50.5],["PHX","Phoenix Suns","West",40.5],
  ["POR","Portland Trail Blazers","West",41.5],["SAC","Sacramento Kings","West",21.5],
  ["SAS","San Antonio Spurs","West",59.5],["TOR","Toronto Raptors","East",46.5],
  ["UTA","Utah Jazz","West",37.5],["WAS","Washington Wizards","East",34.5],
].map(([id,name,conference,line])=>({id:id as string,name:name as string,conference:conference as Conference,line:line as number}));
export const NBA_TEAM_BY_ID = new Map(NBA_TEAMS.map(team => [team.id, team]));
export const NBA_CHAMPIONSHIP_WEIGHTS = { futures: 15, cup: 10, playoffs: 55, games: 20 } as const;
export const NBA_FUTURES_POINTS = {
  winTotals: 30, playoffs: 16, conferenceFinalists: 8, finals: 10,
  champion: 10, oneSeeds: 4, mvp: 7, dpoy: 4, roy: 4, mip: 3, cup: 4,
} as const;
export const NBA_FUTURES_MAX = Object.values(NBA_FUTURES_POINTS).reduce((a,b)=>a+b,0);

export type NbaFuturesPicks = {
  winTotals: Record<string,WinPick>;
  playoffTeams: string[];
  conferenceFinalists: string[];
  finalsTeams: string[];
  champion: string;
  oneSeeds: string[];
  mvp: string; dpoy: string; roy: string; mip: string; cupChampion: string;
};
export function emptyNbaFutures(): NbaFuturesPicks {
  return {winTotals:{},playoffTeams:[],conferenceFinalists:[],finalsTeams:[],
    champion:"",oneSeeds:[],mvp:"",dpoy:"",roy:"",mip:"",cupChampion:""};
}
export function nbaFuturesProgress(p: NbaFuturesPicks) {
  return Object.keys(p.winTotals).length + p.playoffTeams.length + p.conferenceFinalists.length
    + p.finalsTeams.length + p.oneSeeds.length
    + [p.champion,p.mvp,p.dpoy,p.roy,p.mip,p.cupChampion].filter(value=>value.trim().length>0).length;
}
export const NBA_FUTURES_SELECTIONS = 30+16+4+2+2+6;
export function validateNbaFutures(p: NbaFuturesPicks): string[] {
  const errors:string[]=[];
  if(Object.entries(p.winTotals).some(([id,choice])=>!NBA_TEAM_BY_ID.has(id)||!["over","under"].includes(choice)))
    errors.push("Invalid team or win-total selection.");
  for(const [key,max,perConference] of [
    ["playoffTeams",16,8],["conferenceFinalists",4,2],["finalsTeams",2,1],["oneSeeds",2,1],
  ] as const){
    const values=p[key];
    if(values.length>max||new Set(values).size!==values.length||values.some(id=>!NBA_TEAM_BY_ID.has(id)))
      errors.push("Invalid "+key+" selections.");
    for(const conference of ["East","West"] as const) {
      if(values.filter(id=>NBA_TEAM_BY_ID.get(id)?.conference===conference).length>perConference)
        errors.push("Too many "+conference+" "+key+" selections.");
    }
  }
  const subset=(child:readonly string[],parents:readonly string[],key:string)=>{
    if(child.some(id=>!parents.includes(id))) errors.push(key+" must come from the preceding round.");
  };
  subset(p.conferenceFinalists,p.playoffTeams,"Conference finalists");
  subset(p.finalsTeams,p.conferenceFinalists,"Finals teams");
  subset(p.oneSeeds,p.playoffTeams,"No. 1 seeds");
  if(p.champion&&!p.finalsTeams.includes(p.champion)) errors.push("Champion must be a Finals pick.");
  if(p.cupChampion&&!NBA_TEAM_BY_ID.has(p.cupChampion)) errors.push("Invalid NBA Cup champion.");
  if(["mvp","dpoy","roy","mip"].some(k=>p[k as "mvp"].length>120)) errors.push("Award names must be under 120 characters.");
  return errors;
}
export function isNbaFuturesComplete(p:NbaFuturesPicks):boolean {
  return nbaFuturesProgress(p)===NBA_FUTURES_SELECTIONS &&
    p.playoffTeams.filter(id=>NBA_TEAM_BY_ID.get(id)?.conference==="East").length===8 &&
    p.playoffTeams.filter(id=>NBA_TEAM_BY_ID.get(id)?.conference==="West").length===8 &&
    p.conferenceFinalists.filter(id=>NBA_TEAM_BY_ID.get(id)?.conference==="East").length===2 &&
    p.conferenceFinalists.filter(id=>NBA_TEAM_BY_ID.get(id)?.conference==="West").length===2 &&
    p.finalsTeams.filter(id=>NBA_TEAM_BY_ID.get(id)?.conference==="East").length===1 &&
    p.finalsTeams.filter(id=>NBA_TEAM_BY_ID.get(id)?.conference==="West").length===1 &&
    p.oneSeeds.filter(id=>NBA_TEAM_BY_ID.get(id)?.conference==="East").length===1 &&
    p.oneSeeds.filter(id=>NBA_TEAM_BY_ID.get(id)?.conference==="West").length===1 &&
    validateNbaFutures(p).length===0;
}
export type NbaFuturesResults = {
  regularWins?: Record<string,number>; playoffTeams?:string[]; conferenceFinalists?:string[];
  finalsTeams?:string[]; champion?:string; oneSeeds?:string[];
  mvp?:string; dpoy?:string; roy?:string; mip?:string; cupChampion?:string;
};
/** Scores only known, official facts. Missing facts remain ungraded, never losses. */
export function scoreNbaFutures(p:NbaFuturesPicks,r:NbaFuturesResults) {
  const match=(a:string,b:string|undefined)=>Boolean(a&&b&&a.trim().toLocaleLowerCase()===b.trim().toLocaleLowerCase());
  const hits=(a:readonly string[],b:readonly string[]|undefined)=>b===undefined?null:a.filter(id=>b.includes(id)).length;
  const scores = {
    winTotals:r.regularWins?NBA_TEAMS.filter(t=>Number.isInteger(r.regularWins?.[t.id])&&
      (p.winTotals[t.id]==="over"?r.regularWins![t.id]>t.line:p.winTotals[t.id]==="under"&&r.regularWins![t.id]<t.line)).length:null,
    playoffs:hits(p.playoffTeams,r.playoffTeams),
    conferenceFinalists:r.conferenceFinalists?hits(p.conferenceFinalists,r.conferenceFinalists)!*2:null,
    finals:r.finalsTeams?hits(p.finalsTeams,r.finalsTeams)!*5:null,
    champion:r.champion===undefined?null:Number(match(p.champion,r.champion))*10,
    oneSeeds:r.oneSeeds?hits(p.oneSeeds,r.oneSeeds)!*2:null,
    mvp:r.mvp===undefined?null:Number(match(p.mvp,r.mvp))*7,
    dpoy:r.dpoy===undefined?null:Number(match(p.dpoy,r.dpoy))*4,
    roy:r.roy===undefined?null:Number(match(p.roy,r.roy))*4,
    mip:r.mip===undefined?null:Number(match(p.mip,r.mip))*3,
    cup:r.cupChampion===undefined?null:Number(match(p.cupChampion,r.cupChampion))*4,
  };
  return {scores,earned:Object.values(scores).reduce<number>((sum,n)=>sum+(n??0),0),
    settledMax:Object.entries(scores).reduce((sum,[k,v])=>sum+(v===null?0:k==="winTotals" ? Object.entries(r.regularWins??{}).filter(([id,wins])=>NBA_TEAM_BY_ID.has(id)&&Number.isInteger(wins)&&wins>=0&&wins<=82).length : NBA_FUTURES_POINTS[k as keyof typeof NBA_FUTURES_POINTS]),0)};
}
