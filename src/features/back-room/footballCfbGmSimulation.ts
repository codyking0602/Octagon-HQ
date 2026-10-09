/**
 * Owner-preview CFB GM: reproducible 12-team postseason.
 * This models a fictional, mixed-school GM core competing against a calibrated
 * hypothetical 2026 field. It is NOT an actual 2026 ranking prediction.
 * The 2026 CFP has five league champion bids (four P4 + highest Group of Six),
 * seven at-large bids, four highest-ranked first-round byes, and no guaranteed
 * conference champion byes. A team appears only once in each bracket.
 */
export type CfbGmCollegeFinish =
  | "Missed CFP" | "Lost First Round" | "Lost Quarterfinal"
  | "Lost Semifinal" | "National Runner-up" | "National Champion";
export type CfbGmCollegeStage = "First Round" | "Quarterfinal" | "Semifinal" | "National Championship";
export type CfbGmCollegeGame = {
  round: CfbGmCollegeStage; teamA: string; teamB: string;
  winner: string; loser: string;
};
export type CfbGmCollegeSeason = {
  wins: number; losses: number; cfpSeed: number | null;
  finish: CfbGmCollegeFinish; champion: string;
  games: readonly CfbGmCollegeGame[]; winOdds: number;
};
type Team = {id:string;name:string;strength:number;wins:number;autoBid:boolean;groupOfSix?:boolean;isUser?:boolean};
const baseline: readonly Team[] = [
  {id:"sec",name:"SEC Champion",strength:94,wins:12,autoBid:true},
  {id:"big-ten",name:"Big Ten Champion",strength:94,wins:12,autoBid:true},
  {id:"big12",name:"Big 12 Champion",strength:90.5,wins:11,autoBid:true},
  {id:"acc",name:"ACC Champion",strength:90,wins:11,autoBid:true},
  {id:"g6",name:"Group of Six Champion",strength:85,wins:12,autoBid:true,groupOfSix:true},
  {id:"a1",name:"Top At-Large A",strength:94,wins:11,autoBid:false},
  {id:"a2",name:"Top At-Large B",strength:92.5,wins:11,autoBid:false},
  {id:"notre-dame",name:"Notre Dame",strength:92,wins:11,autoBid:false},
  {id:"a4",name:"Top At-Large D",strength:91,wins:10,autoBid:false},
  {id:"a5",name:"Top At-Large E",strength:89,wins:10,autoBid:false},
  {id:"a6",name:"Top At-Large F",strength:88,wins:10,autoBid:false},
  {id:"a7",name:"Top At-Large G",strength:86.5,wins:10,autoBid:false},
];
const hash = (value:string) => {
  let result=2166136261;
  for(let i=0;i<value.length;i++) { result^=value.charCodeAt(i);result=Math.imul(result,16777619); }
  return result>>>0;
};
const roll=(seed:string)=>hash(seed)/4294967296;
function probability(strengthA:number,strengthB:number,home=false) {
  const adjusted=strengthA-strengthB+(home?1.2:0);
  return Math.min(.94,Math.max(.06,1/(1+Math.exp(-adjusted/4.2))));
}
function resume(team:Team, seasonSeed:string) {
  // A stable program's schedule strength and committee evaluation vary by year.
  // Small seeded noise avoids a hard cliff where +1 talent point suddenly turns
  // a plausible 10-win team from 0% qualifying to near-certain qualification.
  const committeeVariation=(roll("cfp:committee:"+seasonSeed+":"+team.id)-.5)*6;
  return team.wins*7.2+(team.strength-85)*1.55+(team.groupOfSix?-19:0)+committeeVariation;
}
function field(user:Team,seasonSeed:string): Team[] {
  const ranked=(teams:Team[])=>teams.sort((a,b)=>
    resume(b,seasonSeed)-resume(a,seasonSeed)||a.id.localeCompare(b.id));
  const atLarge=ranked([...baseline.filter(x=>!x.autoBid)]);
  // The mixed-school GM program is modeled as a hypothetical at-large team,
  // never a sixth automatic qualifier. All five champion bids are preserved.
  const threshold=resume(atLarge[atLarge.length-1]!,seasonSeed);
  const eligible=user.wins>=9 && resume(user,seasonSeed)>=threshold;
  const selected=eligible
    ? [...baseline.filter(x=>x.autoBid), ...atLarge.slice(0,-1), user]
    : [...baseline];
  if(selected.length!==12||new Set(selected.map(x=>x.id)).size!==12)throw Error("Invalid CFP field");
  return ranked(selected);
}
function simulateBracket(teams:readonly Team[],seed:string) {
  if(teams.length!==12)throw Error("CFP bracket requires 12 entries");
  const games:CfbGmCollegeGame[]=[];
  const play=(a:Team,b:Team,stage:CfbGmCollegeStage,token:string,home=false): Team => {
    const winner=roll(seed+":"+token+":"+a.id+":"+b.id)<probability(a.strength,b.strength,home)?a:b;
    games.push({round:stage,teamA:a.id,teamB:b.id,winner:winner.id,loser:winner===a?b.id:a.id});
    return winner;
  };
  // 2026 bracket lanes: 1 vs 8/9, 4 vs 5/12, 2 vs 7/10, 3 vs 6/11.
  const r89=play(teams[7]!,teams[8]!,"First Round","8v9",true);
  const r512=play(teams[4]!,teams[11]!,"First Round","5v12",true);
  const r710=play(teams[6]!,teams[9]!,"First Round","7v10",true);
  const r611=play(teams[5]!,teams[10]!,"First Round","6v11",true);
  const q1=play(teams[0]!,r89,"Quarterfinal","q1");
  const q4=play(teams[3]!,r512,"Quarterfinal","q4");
  const q2=play(teams[1]!,r710,"Quarterfinal","q2");
  const q3=play(teams[2]!,r611,"Quarterfinal","q3");
  const s1=play(q1,q4,"Semifinal","s1");
  const s2=play(q2,q3,"Semifinal","s2");
  const champion=play(s1,s2,"National Championship","final");
  if(games.length!==11 || new Set([champion.id]).size!==1)throw Error("Invalid CFP path");
  return {games,champion};
}
function regularSeason(seed:string,year:1|2,grade:number) {
  let wins=0;
  // 12 opponents calibrated separately from NFL; varying home field/schedule.
  const schedule=[82,85,89,84,92,87,83,90,86,94,88,91];
  for(let week=0;week<12;week++) {
    // A mixed-school seven-player core has fewer complementary depth pieces
    // than an actual team. Calibrate the opponents to keep a Powerhouse CFP
    // push achievable without making Builder title runs routine.
    const opponent=schedule[week]!-1.5+(roll(seed+":"+year+":strength:"+week)-.5)*2.7;
    const home=[0,1,3,5,7,9].includes(week);
    if(roll(seed+":"+year+":game:"+week)<probability(grade,opponent,home))wins++;
  }
  return wins;
}
export function cfbGmSimulateCollegeSeason(seed:string,year:1|2,grade:number):CfbGmCollegeSeason {
  const wins=regularSeason(seed,year,grade);
  const user:Team={id:"user",name:"Your GM Program",strength:grade,wins,autoBid:false,isUser:true};
  const seeded=field(user,seed+":"+year);
  const index=seeded.findIndex(x=>x.id==="user");
  const bracket=simulateBracket(seeded,"cfb:"+seed+":"+year);
  const exit=bracket.games.find(g=>g.loser==="user");
  let finish:CfbGmCollegeFinish="Missed CFP";
  if(index>=0) {
    if(bracket.champion.id==="user")finish="National Champion";
    else if(exit?.round==="National Championship")finish="National Runner-up";
    else if(exit?.round==="Semifinal")finish="Lost Semifinal";
    else if(exit?.round==="Quarterfinal")finish="Lost Quarterfinal";
    else finish="Lost First Round";
  }
  let winOdds=0;
  if(index>=0) {
    let winsTitle=0;
    for(let sim=0;sim<128;sim++) if(simulateBracket(seeded,"cfb:odds:"+seed+":"+year+":"+sim).champion.id==="user") winsTitle++;
    winOdds=Math.round(winsTitle/128*1000)/10;
  }
  return {wins,losses:12-wins,cfpSeed:index<0?null:index+1,finish,
    champion:bracket.champion.name,games:bracket.games,winOdds};
}
