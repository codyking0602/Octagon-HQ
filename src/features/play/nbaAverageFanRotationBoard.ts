import { AVERAGE_FAN_CONTENT_BANKS } from "../games/averageFanContentBanks";
import { averageFanQuestionEligibleForBoard, averageFanQuestionEligibleForFinal } from "../games/averageFanEngine";
import { nbaAverageFanRotationRounds } from "./nbaAverageFanRotationPools";
import { nbaAverageFanRotationFinals } from "./nbaAverageFanRotationFinals";
export function buildNbaAverageFanRotationBoard(seed:string,cursor:number,now:Date|string=new Date()) {
  if(!Number.isSafeInteger(cursor)||cursor<0)throw Error("Invalid NBA rotation cursor");
  const bank=AVERAGE_FAN_CONTENT_BANKS.nba.filter(q=>q.protectedFinal?
    averageFanQuestionEligibleForFinal(q,now):averageFanQuestionEligibleForBoard(q,now));
  const cycle=seed+"|"+Math.floor(cursor/20);
  const boards=nbaAverageFanRotationRounds(bank,cycle);
  const finals=nbaAverageFanRotationFinals(boards,bank,cycle);
  const index=cursor%20;
  return {sport:"nba" as const,questions:boards[index]!,finalQuestion:finals[index]!};
}
