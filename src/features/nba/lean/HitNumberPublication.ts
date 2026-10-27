import { nbaLeanDailyPublication } from "../nbaDailyPublicationIdentity";
import { buildNbaHitNumberDailyPublication } from "../nbaHitNumberDailyPublication";

export function buildNbaHitNumberLeanPublication(day: string, scheduleVersion: string, gameType: string, history?: unknown) {
  return nbaLeanDailyPublication(day, scheduleVersion, gameType, "hit_the_number",
    (ordinal) => buildNbaHitNumberDailyPublication(day, scheduleVersion, ordinal));
}
export { buildNbaHitNumberLeanPublication as buildNbaServerDailyPublication };
