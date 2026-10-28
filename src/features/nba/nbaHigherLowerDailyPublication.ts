import { createNbaHigherLowerBoard, nbaHigherLowerSemanticPairKey, NBA_HIGHER_LOWER_QUESTION_COUNT, type NbaHigherLowerQuestion } from "./nbaHigherLowerModel";
import type { OfficialDailySetupPublication } from "../play/todaysChallengeRuntime";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "../play/officialScoreContract";
import { buildTwoGameDailyPublication } from "../play/dailyTwoGameRuntime";
import { dailyUsesTwoGameAverage } from "../play/dailyTwoGameContract";

export const NBA_HIGHER_LOWER_SERVER_VERSION = "nba-higher-lower-official-v1";
export function nbaHigherLowerPublicQuestion(question:NbaHigherLowerQuestion){
  const {answer: _answer,hidden,...safe} = question;
  const {value:_value,formattedValue:_formatted,...publicHidden}=hidden;
  return {...safe,hidden:publicHidden};
}
export function buildNbaHigherLowerDailyPublication(
  day:string,scheduleVersion:string,ordinal:number,gameIndex=0,excludedPairs?:ReadonlySet<string>,
):OfficialDailySetupPublication{
  const seed=excludedPairs
    ? `${NBA_HIGHER_LOWER_SERVER_VERSION}-two-game|${scheduleVersion}|${ordinal}|${gameIndex}`
    : `${NBA_HIGHER_LOWER_SERVER_VERSION}|${scheduleVersion}|${day}|${ordinal}`;
  const board=createNbaHigherLowerBoard(seed,excludedPairs);
  if(board.questions.length!==NBA_HIGHER_LOWER_QUESTION_COUNT)throw new Error("NBA Higher or Lower Daily needs 10 questions.");
  return{
    setupKey:`${NBA_HIGHER_LOWER_SERVER_VERSION}:${scheduleVersion}:${day}:${ordinal}:${gameIndex}`,
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

/**
 * Replay previously scheduled NBA Higher/Lower appearances in ordinal order.
 * No client-supplied exclusions or mutable calendar; owner previews are isolated.
 * The paired boards are frozen under the server's existing Daily persistence.
 */
export function buildNbaHigherLowerTwoGameDailyPublication(day:string,scheduleVersion:string,ordinal:number) {
  if (!dailyUsesTwoGameAverage("higher_lower",day)) {
    return buildNbaHigherLowerDailyPublication(day,scheduleVersion,ordinal);
  }
  const used=new Set<string>();
  let current: [OfficialDailySetupPublication,OfficialDailySetupPublication] | null=null;
  const start=ordinal>=20 ? ordinal : 0;
  for(let i=start;i<=ordinal;i++){
    const children: OfficialDailySetupPublication[]=[];
    for(let game=0;game<2;game++){
      const child=buildNbaHigherLowerDailyPublication(day,scheduleVersion,i,game,used);
      const board=(child.privateSetupEvidence as {board:{questions:NbaHigherLowerQuestion[]}}).board;
      for(const question of board.questions){
        const key=nbaHigherLowerSemanticPairKey(question.known.name,question.hidden.name);
        if(used.has(key))throw new Error("NBA Daily has a duplicate/reversed player matchup.");
        used.add(key);
      }
      children.push(child);
    }
    if(i===ordinal)current=children as [OfficialDailySetupPublication,OfficialDailySetupPublication];
  }
  if(!current)throw new Error("NBA Daily needs two unique Higher or Lower games.");
  return buildTwoGameDailyPublication({
    sport:"nba",gameType:"higher_lower",day,scheduleVersion,children:current,
  });
}
