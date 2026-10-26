import { nbaLeanDailyPublication } from "../nbaDailyPublicationIdentity";
import { buildNbaHigherLowerTwoGameDailyPublication } from "../nbaHigherLowerDailyPublication";

export function buildNbaHigherLowerLeanPublication(day: string, scheduleVersion: string, gameType: string, history?: unknown) {
  return nbaLeanDailyPublication(day, scheduleVersion, gameType, "higher_lower",
    (ordinal) => buildNbaHigherLowerTwoGameDailyPublication(day, scheduleVersion, ordinal));
}
export { buildNbaHigherLowerLeanPublication as buildNbaServerDailyPublication };
