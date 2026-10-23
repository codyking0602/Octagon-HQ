import { AVERAGE_FAN_PLAYABLE_GRADES, type AverageFanQuestion } from "../games/averageFanEngine";
import { stableLineupHash } from "./lineupModel";
export const NBA_AVERAGE_FAN_ROTATION_SIZE = 20;
/** Each grade contributes 40 distinct questions across 20 games. */
export function nbaAverageFanRotationRounds(bank: readonly AverageFanQuestion[], seed: string) {
  const rounds: AverageFanQuestion[][] = Array.from({ length: 20 }, () => []);
  for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
    const pool = bank.filter(q => q.grade === grade && !q.protectedFinal);
    if (pool.length < 40) throw new Error("NBA Average Fan needs 40 questions per grade.");
    pool.sort((a,b) => stableLineupHash(seed+"|"+grade+"|"+a.id) -
      stableLineupHash(seed+"|"+grade+"|"+b.id) || a.id.localeCompare(b.id));
    for (let r=0;r<20;r++) rounds[r]!.push(...pool.slice(r*2,r*2+2));
  }
  return rounds;
}
