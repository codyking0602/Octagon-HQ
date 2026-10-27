import { advanceAverageFanDailyRuntime } from "../play/averageFanDailyRuntime";
import { wavelength, hit, higher, childScore } from "./nbaDailyGameplayCore";
export { advanceNbaWavelengthLeanDailyRuntime, advanceNbaHitNumberLeanDailyRuntime, advanceNbaHigherLowerLeanDailyRuntime } from "./nbaDailyGameplayCore";
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
export function advanceNbaOfficialDailyRuntime(context:NbaOfficialDailyRuntimeContext,action:unknown):OfficialDailyAdvanceResult{
  if(isTwoGameDailyContext(context)&&context.gameType!=="find_leader"){
    return advanceTwoGameDailyRuntime(context as OfficialDailyRuntimeContext,action,single,childScore);
  }
  return single(context,action);
}
