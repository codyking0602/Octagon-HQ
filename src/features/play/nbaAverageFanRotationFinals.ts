import type { AverageFanQuestion } from "../games/averageFanEngine";
import { averageFanQuestionBoardTopics } from "../games/averageFanContentBanks";
import { stableLineupHash } from "./lineupModel";
export function nbaAverageFanRotationFinals(
  boards: readonly (readonly AverageFanQuestion[])[],
  bank: readonly AverageFanQuestion[], seed: string,
) {
  const finals = bank.filter(q=>q.protectedFinal).sort((a,b)=>
    stableLineupHash(seed+a.id)-stableLineupHash(seed+b.id));
  if (finals.length < 20) throw Error("Need 20 NBA Finals.");
  const owners = finals.map(()=>-1);
