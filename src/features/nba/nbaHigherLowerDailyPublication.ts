import { createNbaHigherLowerBoard, nbaHigherLowerMatchupKey, NBA_HIGHER_LOWER_QUESTION_COUNT, type NbaHigherLowerQuestion } from "./nbaHigherLowerModel";
import type { OfficialDailySetupPublication } from "../play/todaysChallengeRuntime";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "../play/officialScoreContract";
import { buildTwoGameDailyPublication } from "../play/dailyTwoGameRuntime";

export const NBA_HIGHER_LOWER_SERVER_VERSION = "nba-higher-lower-official-v1";
export function nbaHigherLowerPublicQuestion(question:NbaHigherLowerQuestion){
  const {answer: _answer,hidden,...safe} = question;
  const {value:_value,formattedValue:_formatted,...publicHidden}=hidden;
  return {...safe,hidden:publicHidden};
}
export function buildNbaHigherLowerDailyPublication(day:string,scheduleVersion:string,ordinal:number,gameIndex=0,excluded:ReadonlySet<string>=new Set()):OfficialDailySetupPublication{
  const seed=gameIndex===0 && excluded.size===0
    ? `${NBA_HIGHER_LOWER_SERVER_VERSION}|${scheduleVersion}|${day}|${ordinal}`
    : `${NBA_HIGHER_LOWER_SERVER_VERSION}|${scheduleVersion}|${day}|${ordinal}|game-${gameIndex+1}`;
  const board=createNbaHigherLowerBoard(seed,excluded);
  if(board.questions.length!==NBA_HIGHER_LOWER_QUESTION_COUNT)throw new Error("NBA Higher or Lower Daily needs 10 questions.");
  return{
    setupKey:`${NBA_HIGHER_LOWER_SERVER_VERSION}:${scheduleVersion}:${day}:${ordinal}:game-${gameIndex+1}`,
    contentVersion:NBA_HIGHER_LOWER_SERVER_VERSION,scoringVersion:OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup:{
      runtime_version:NBA_HIGHER_LOWER_SERVER_VERSION,league:"NBA",
      question_count:NBA_HIGHER_LOWER_QUESTION_COUNT,
      initial_state:{complete:false,index:0,correct_count:0,answers:[],current_question:nbaHigherLowerPublicQuestion(board.questions[0]!),last_result:null},
    },
    revealSetup:{questions:board.questions.map(q=>({id:q.id,answer:q.answer,known:q.known,hidden:q.hidden}))},
    privateSetupEvidence:{board},
    privateGradingEvidence:{question_ids:board.questions.map(q=>q.id),correct_choices:board.questions.map(q=>q.answer)},
  };
}
