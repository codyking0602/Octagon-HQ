import { AVERAGE_FAN_CONTENT_BANKS } from "../games/averageFanContentBanks";
import { averageFanQuestionEligibleForBoard, averageFanQuestionEligibleForFinal } from "../games/averageFanEngine";
import { nbaAverageFanRotationRounds } from "./nbaAverageFanRotationPools";
import { nbaAverageFanRotationFinals } from "./nbaAverageFanRotationFinals";
export function buildNbaAverageFanRotationBoard(seed:string,cursor:number,now:Date|string=new Date()) {
  if(!Number.isSafeInteger(cursor)||cursor<0)throw Error("Invalid NBA rotation cursor");
