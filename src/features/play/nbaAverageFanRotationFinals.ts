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
  const allowed = boards.map(board => {
    const seen = new Set(board.flatMap(averageFanQuestionBoardTopics));
    return finals.map((q,i)=>({q,i})).filter(x =>
      averageFanQuestionBoardTopics(x.q).every(t=>!seen.has(t))).map(x=>x.i);
  });
  function assign(r:number, tried:Set<number>):boolean {
    for(const i of allowed[r]!) {
      if(tried.has(i))continue;
      tried.add(i);
      if(owners[i]===-1||assign(owners[i]!,tried)){owners[i]=r;return true;}
    }
    return false;
  }
