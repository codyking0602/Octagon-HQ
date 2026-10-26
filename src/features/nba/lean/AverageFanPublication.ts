import { nbaLeanDailyPublication } from "../nbaDailyPublicationIdentity";
import { buildAverageFanDailySetup } from "../../play/averageFanDailyRuntime";

export function buildNbaAverageFanLeanPublication(day: string, scheduleVersion: string, gameType: string, history?: unknown) {
  return nbaLeanDailyPublication(day, scheduleVersion, gameType, "average_fan",
    (ordinal) => buildAverageFanDailySetup("nba", day, scheduleVersion, history));
}
export { buildNbaAverageFanLeanPublication as buildNbaServerDailyPublication };
