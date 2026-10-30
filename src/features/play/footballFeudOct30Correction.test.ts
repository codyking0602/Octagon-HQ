import { describe, expect, it } from "vitest";
import { assertFamilyFeudPack, matchFamilyFeudAnswer, type FamilyFeudPack } from "../games/familyFeudEngine";
import { buildFootballFeudRebuildPack } from "./sportsFeudDailyBanks";
import {
  applyOct30FootballFeudCorrection,
  OCT30_CFB_FEUD_CORRECTION,
  OCT30_CFB_FEUD_STATE_KEY,
} from "../../../supabase/functions/daily-challenge-runtime/footballFeudOct30Correction";

const league = "football-daily-v22-higher-lower-oct27";
const big12 = "cfb-feud-r2-fast-big-twelve-2025-schools";
const oldBoard = "cfb-feud-r2-main-four-team-cfp-schools";
const newBoard = "cfb-feud-r2-main-named-college-rivalries";

function fixture() {
 const entities: Array<{id:string;displayName:string;kind:"school"|"other";aliases:string[]}> = [];
 function question(id:string, names:string[], extras:string[]=[], main=false, kind:"school"|"other"="other") {
   const ids:string[]=[];
   for(const [i,name] of [...names,...extras].entries()) {
     const entityId=`${id}:${i<names.length?"a"+(i+1):"v"+(i-names.length+1)}`;
     entities.push({id:entityId,displayName:name,kind,aliases:[]});ids.push(entityId);
   }
   return {id,prompt:"Test "+id,candidateIds:ids,
     answers:names.map((_n,i)=>({entityId:ids[i]!,points:(main?[10,8,7,5,5,4,4,3]:[8,7,6,5,4,3,2,1])[i]!})),
     alsoAcceptedEntityIds:ids.slice(names.length)};
 }
 const first=question("cfb-feud-r2-main-programs-heisman-win",
  ["USC","Oklahoma","Alabama","LSU","Florida","Baylor","Texas A&M","Auburn"],[],true,"school");
 const second=question(oldBoard,["Alabama","Clemson","Ohio State","Georgia","Oklahoma","LSU","Notre Dame","Michigan"],[],true,"school");
 const fast1=question(big12,["Texas Tech","Baylor","TCU","Colorado","Oklahoma State","Arizona State","Utah","Kansas State"],["BYU"],false,"school");
 const fast2=question("cfb-fast3-01-1",["Nick Saban","Kirby Smart","Urban Meyer","Dabo Swinney","Pete Carroll","Jim Harbaugh","Mack Brown","Bob Stoops"]);
 const alumni=question("cfb-feud-r2-fast-alumni-on-saturdays",
  ["Wear school colors","Watch game","Attend tailgate","Travel to campus","Donate to athletics","Meet old classmates","Attend alumni watch party","Cheer fight song"],["Buy tickets"]);
 const polls=question("cfb-feud-r2-fast-college-football-polls",
  ["Top 25","Strength of schedule","Quality wins","Upset loss","Conference record","Playoff position","Ranked win","Ranking drop"],["AP poll","CFP rankings","Coaches poll","Poll voters","Ranking debate"]);
 const students=question("cfb-feud-r2-fast-student-section-actions",
  ["Chant","Cheer","Wave signs","Jump in unison","Paint faces","Sing fight song","Stand the whole game","Boo a call"],["Clap","Start a wave"]);
 const pack:FamilyFeudPack={id:"sports-feud-bank-r2-cfb-2026-10-30-legacy",sport:"football",
  entities,mainBoards:[first,second],fastMoney:[fast1,fast2,alumni,polls,students]};
 const boards=[first,second].map(q=>({id:q.id,prompt:q.prompt,slots:[],strikes:0}));
 return {
  gameType:"sports_feud",central_day:"2026-10-30",schedule_version:league,
  setupKey:"family-feud-daily-v2:"+league+":2026-10-30:football:sports-feud-bank-r2-cfb-2026-10-30-legacy",
  progress_revision:0,official_attempt:null,
  submissionState:{},privateSetupEvidence:{pack,proof:"historical-proof"},
  privateGradingEvidence:{proof:"historical-proof"},
  publicSetup:{main_boards:[first,second].map(q=>({id:q.id,prompt:q.prompt})),initial_state:{main_boards:boards}},
  publicState:{main_boards:boards},revealSetup:{main_boards:[],fast_money:[]},
 };
}

describe("October 30 CFB Feud live correction",()=>{
 it("changes both authoritative answers and public prompts while preserving historical proof",()=>{
  const corrected=applyOct30FootballFeudCorrection(fixture());
  const p=(corrected.privateSetupEvidence as {pack:FamilyFeudPack}).pack;
  expect(()=>assertFamilyFeudPack(p)).not.toThrow();
  expect(p.mainBoards[1]?.id).toBe(newBoard);
  expect((corrected.publicSetup.main_boards as Array<{id:string}>)[1]?.id).toBe(newBoard);
  expect((corrected.publicState.main_boards as Array<{id:string}>)[1]?.id).toBe(newBoard);
  expect((corrected.privateSetupEvidence as {proof:string}).proof).toBe("historical-proof");
  const fast=p.fastMoney[0]!;
  expect(p.entities.find(e=>e.id===fast.answers[1]?.entityId)?.displayName).toBe("BYU");
  expect(fast.answers[1]?.points).toBe(7);
  expect(fast.alsoAcceptedEntityIds?.includes(big12+":a8")).toBe(true);
  expect(matchFamilyFeudAnswer(p,p.mainBoards[1]!,"Red River Shootout")).toMatchObject({status:"matched"});
  for(const [index,input] of [[2,"tailgating"],[2,"wear a jersey"],[3,"poll bias"],[4,"yelling"]] as const){
    expect(matchFamilyFeudAnswer(p,p.fastMoney[index]!,input).status,input).toBe("matched");
  }
 });
 it("does not rewrite previously completed or started original runs",()=>{
  const initial=fixture();
  expect(applyOct30FootballFeudCorrection({...initial,progress_revision:13,official_attempt:{native_score:82}})).toEqual({...initial,progress_revision:13,official_attempt:{native_score:82}});
  expect(applyOct30FootballFeudCorrection({...initial,progress_revision:2})).toEqual({...initial,progress_revision:2});
  const continued=applyOct30FootballFeudCorrection({...initial,progress_revision:2,submissionState:{[OCT30_CFB_FEUD_STATE_KEY]:OCT30_CFB_FEUD_CORRECTION}});
  expect((continued.privateSetupEvidence as {pack:FamilyFeudPack}).pack.mainBoards[1]?.id).toBe(newBoard);
 });
 it("keeps future canonical selection fresh and does not duplicate today's rivalry topic",()=>{
   const day=buildFootballFeudRebuildPack("cfb","2026-10-30");
   expect(day.mainBoards[1]?.id).toBe(newBoard);
   expect(()=>assertFamilyFeudPack(day)).not.toThrow();
 });
});
