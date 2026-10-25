import { advanceAverageFanDailyRuntime } from "../play/averageFanDailyRuntime";
import { advanceBarTriviaDailyRuntime } from "../play/barTriviaDailyRuntime";
import { advanceFamilyFeudDailyRuntime } from "../play/familyFeudDailyRuntime";
import { advanceMillionaireDailyRuntime } from "../play/millionaireDailyRuntime";
import { advanceCanonicalWhoAmIDailyRuntime } from "../play/whoAmITwoRoundDailyRuntime";
import { advanceFootballOfficialDailyRuntime } from "../play/footballTodayChallengeAdvanceRuntime";
import { advanceTwoGameDailyRuntime, isTwoGameDailyContext } from "../play/dailyTwoGameRuntime";
import { wavelengthScore } from "../play/wavelengthEngine";
import { hitTheNumberScore } from "../play/hitTheNumberEngine";
import { nextNbaWavelengthClue } from "./nbaWavelengthModel";
import { nbaWavelengthClues } from "./nbaWavelengthCatalog";
import { nbaHitAvailableSubjectIds, nbaHitSelectionSatisfies, type NbaHitPlan } from "./nbaHitTheNumberModel";
import type { NbaHigherLowerBoard, NbaHigherLowerChoice } from "./nbaHigherLowerModel";
import { nbaHigherLowerPublicQuestion } from "./nbaHigherLowerDailyPublication";
import type { OfficialDailyAdvanceResult, OfficialDailyRuntimeContext, OfficialDailyGameType } from "../play/todaysChallengeRuntime";
export type NbaOfficialDailyRuntimeContext = Omit<OfficialDailyRuntimeContext, "gameType"> & { gameType: OfficialDailyGameType | "higher_lower" };

type R=Record<string,unknown>;
function record(value:unknown,label:string):R{
  if(!value||typeof value!=="object"||Array.isArray(value))throw new Error(label+" must be an object.");
  return value as R;
}
function strings(value:unknown):string[]{
  if(!Array.isArray(value)||value.some(x=>typeof x!=="string"))throw new Error("NBA Daily array is invalid.");
  return value;
}
function num(value:unknown,min:number,max:number,label:string):number{
  if(!Number.isInteger(value)||Number(value)<min||Number(value)>max)throw new Error("NBA Daily "+label+" is invalid.");
  return Number(value);
}
function clue(id:string){
  const value=nbaWavelengthClues.find(x=>x.id===id);
  if(!value)throw new Error("NBA Wavelength clue is not in the authored catalog.");
  return value;
}
function publicClue(id:string){
  const item=clue(id);return{id:item.id,category:item.category,text:item.text};
}
function wavelength(context:NbaOfficialDailyRuntimeContext,action:R):OfficialDailyAdvanceResult{
  const target=num(context.privateSetupEvidence.target,1,100,"target");
  const seed=String(context.privateSetupEvidence.seed??"");
  if(!seed)throw new Error("Missing NBA Wavelength seed.");
  const guesses=(context.submissionState.guesses??[]) as unknown[];
  if(!Array.isArray(guesses)||guesses.length>=4)throw new Error("NBA Wavelength round is finished.");
  const prior=guesses.map(x=>num(x,1,100,"prior guess"));
  const guess=num(action.guess,1,100,"guess");
  const newGuesses=[...prior,guess];
  const ids=strings(context.submissionState.clue_ids??[String(context.privateSetupEvidence.opening_clue_id??"")]);
  if(ids.length!==prior.length+1||!ids[0])throw new Error("NBA Wavelength clue sequence invalid.");
  const nextIds=[...ids];
  if(newGuesses.length<4){
    const next=nextNbaWavelengthClue({target,clues:ids.map(clue)},guess,newGuesses.length,seed,prior);
    nextIds.push(next.id);
  }
  const complete=newGuesses.length===4;
  return{
    submissionState:{guesses:newGuesses,clue_ids:nextIds,final_submission:complete?{guesses:newGuesses}:null},
    publicState:{
      complete,guesses:newGuesses,clues:nextIds.map(publicClue),
      next_guess_number:complete?null:newGuesses.length+1,
      reveal:complete?{target,clues:nextIds.map(id=>({...publicClue(id),rating:clue(id).rating}))}:null,
    },
    complete,finalSubmission:complete?{guesses:newGuesses}:null,
  };
}
function hit(context:NbaOfficialDailyRuntimeContext,action:R):OfficialDailyAdvanceResult{
  const plan=record(context.privateSetupEvidence.plan,"Hit Number plan") as unknown as NbaHitPlan;
  const allowed=new Set(strings(context.privateSetupEvidence.fighter_ids));
  if(plan.subjectIds.length!==allowed.size)throw new Error("Hit Number plan mismatch.");
  const selected=strings(context.submissionState.selected_ids??[]);
  const progressive=plan.slots.length>0;
  let next=[...selected];
  let complete=false;
  if(action.lock===true){
    if(!nbaHitSelectionSatisfies(plan,next))throw new Error("Hit Number selections are not legal.");
    complete=true;
  }else if(Number.isInteger(action.rewind_to)){
    if(!progressive)throw new Error("Hit Number rewind requires progression.");
    next=next.slice(0,num(action.rewind_to,0,Math.max(0,next.length-1),"rewind index"));
  }else{
    const id=String(action.fighter_id??"");
    if(!allowed.has(id))throw new Error("NBA Hit Number player not on board.");
    if(next.includes(id)){
      if(progressive&&next.at(-1)!==id)throw new Error("Only final progression selection can be undone.");
      next=progressive?next.slice(0,-1):next.filter(x=>x!==id);
    }else{
      if(next.length>=plan.pickCount||!nbaHitAvailableSubjectIds(plan,next).includes(id))throw new Error("NBA Hit Number selection not eligible.");
      next.push(id);
    }
  }
  const active=complete?null:plan.slots[next.length]?{...plan.slots[next.length]!,index:next.length}:null;
  const state={complete,selected_ids:next,available_subject_ids:complete?[...plan.subjectIds]:nbaHitAvailableSubjectIds(plan,next),active_slot:active};
  return{submissionState:{selected_ids:next,final_submission:complete?{selected_ids:next}:null},
    publicState:state,complete,finalSubmission:complete?{selected_ids:next}:null};
}
function higher(context:NbaOfficialDailyRuntimeContext,action:R):OfficialDailyAdvanceResult{
  const evidence=record(context.privateSetupEvidence.board,"Higher or Lower board") as unknown as NbaHigherLowerBoard;
  const state=context.publicState;
  const index=num(state.index,0,9,"Higher Lower index");
  const rows=Array.isArray(state.answers)?state.answers as R[]:[];
  if(state.complete===true||rows.length!==index||evidence.questions.length!==10)throw new Error("NBA Higher Lower state invalid or finished.");
  const current=evidence.questions[index]!;
  const answer=String(action.choice??"");
  if(answer!=="higher"&&answer!=="lower")throw new Error("NBA Higher Lower choice invalid.");
  const correct=current.answer===answer;
  const completed=[...rows,{question_id:current.id,choice:answer,correct}];
  const total=completed.filter(row=>row.correct===true).length;
  const complete=index===9;
  const final=complete?{native_score:total,normalized_score:total*10,correct_count:total,answers:completed}:null;
  return{
    submissionState:{answers:completed,final_submission:final},
    publicState:{complete,index:complete?10:index+1,correct_count:total,answers:completed,
      current_question:complete?null:nbaHigherLowerPublicQuestion(evidence.questions[index+1]!),
      last_result:{question_id:current.id,choice:answer,correct,known:current.known,hidden:current.hidden},
      score:complete?total*10:null},
    complete,finalSubmission:final,
  };
}
function single(context:NbaOfficialDailyRuntimeContext,action:unknown):OfficialDailyAdvanceResult{
  const a=record(action,"NBA Daily action");
  switch(context.gameType){
    case "average_fan":return advanceAverageFanDailyRuntime(context as OfficialDailyRuntimeContext,a);
    case "sports_feud":return advanceFamilyFeudDailyRuntime(context as OfficialDailyRuntimeContext,a);
    case "millionaire":return advanceMillionaireDailyRuntime(context as OfficialDailyRuntimeContext,a);
    case "who_am_i":return advanceCanonicalWhoAmIDailyRuntime(context as OfficialDailyRuntimeContext,a);
    case "bar_trivia":return advanceBarTriviaDailyRuntime(context as OfficialDailyRuntimeContext,a);
    case "find_leader":return advanceFootballOfficialDailyRuntime(context as OfficialDailyRuntimeContext,a);
    case "wavelength":return wavelength(context,a);
    case "hit_the_number":return hit(context,a);
    case "higher_lower":return higher(context,a);
    default:throw new Error("Unsupported NBA official Daily game: "+context.gameType);
  }
}
function childScore(context:OfficialDailyRuntimeContext,result:OfficialDailyAdvanceResult){
  if(context.gameType==="wavelength"){
    const guesses=Array.isArray(result.submissionState.guesses) ? result.submissionState.guesses.map(Number) : [];
    const guess=guesses.at(-1);
    const target=Number(context.privateGradingEvidence.target);
    if(!Number.isFinite(guess)||!Number.isFinite(target))throw new Error("Invalid Wavelength score evidence.");
    return wavelengthScore(guess!,target);
  }
  if(context.gameType==="hit_the_number"){
    const ids=strings(record(result.finalSubmission,"Hit Number final").selected_ids);
    const values=record(context.privateGradingEvidence.values,"Hit Number values");
    const target=Number(context.privateGradingEvidence.target);
    const pickCount=Number(context.privateGradingEvidence.pick_count);
    if(![4,5].includes(pickCount)||ids.length!==pickCount||!Number.isFinite(target)||target<=0)throw new Error("Invalid Hit Number grading setup.");
    const total=Math.round(ids.reduce((sum,id)=>{
      const value=Number(values[id]);if(!Number.isFinite(value))throw new Error("Invalid Hit Number selected value.");
      return sum+value*10;
    },0))/10;
    const distance=Math.round(Math.abs(total-target)*10)/10;
    const status=total===target?"perfect":total>target?"bust":"under";
    return hitTheNumberScore({status,target,distance,pickCount});
  }
  if(context.gameType==="higher_lower")return Number(result.publicState.correct_count)*10;
  throw new Error("Unsupported NBA two-game scorer.");
}
export function advanceNbaOfficialDailyRuntime(context:NbaOfficialDailyRuntimeContext,action:unknown):OfficialDailyAdvanceResult{
  if(isTwoGameDailyContext(context)&&context.gameType!=="find_leader"){
    return advanceTwoGameDailyRuntime(context as OfficialDailyRuntimeContext,action,single,childScore);
  }
  return single(context,action);
}
