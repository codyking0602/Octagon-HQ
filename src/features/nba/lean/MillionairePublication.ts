import { nbaLeanDailyPublication } from "../nbaDailyPublicationIdentity";
import { buildNbaOfficialMillionaireRun } from "../nbaMillionaireDailyRotation";
import { buildNbaMillionaireDailySetup } from "../../play/millionaireDailyRuntime";

export function buildNbaMillionaireLeanPublication(day: string, scheduleVersion: string, gameType: string, history?: unknown) {
  return nbaLeanDailyPublication(day, scheduleVersion, gameType, "millionaire",
    (ordinal) => buildNbaMillionaireDailySetup(day, scheduleVersion, ordinal, buildNbaOfficialMillionaireRun(ordinal)));
}
export { buildNbaMillionaireLeanPublication as buildNbaServerDailyPublication };
