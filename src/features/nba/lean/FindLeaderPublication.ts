import { nbaLeanDailyPublication } from "../nbaDailyPublicationIdentity";
import { buildNbaFindLeaderDailyPublication } from "../nbaFindLeaderDailyPublication";

export function buildNbaFindLeaderLeanPublication(day: string, scheduleVersion: string, gameType: string, history?: unknown) {
  return nbaLeanDailyPublication(day, scheduleVersion, gameType, "find_leader",
    (ordinal) => buildNbaFindLeaderDailyPublication(day, scheduleVersion, ordinal));
}
export { buildNbaFindLeaderLeanPublication as buildNbaServerDailyPublication };
