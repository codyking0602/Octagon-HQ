import { nbaLeanDailyPublication } from "../nbaDailyPublicationIdentity";
import { buildNbaOfficialMillionaireRun } from "../nbaMillionaireDailyRotation";
import { buildNbaMillionaireShowcaseRun } from "../nbaMillionaireBank";
import { buildNbaMillionaireDailySetup } from "../../play/millionaireDailyRuntime";

export function buildNbaMillionaireLeanPublication(day: string, scheduleVersion: string, gameType: string, history?: unknown) {
  return nbaLeanDailyPublication(day, scheduleVersion, gameType, "millionaire",
    (ordinal) => scheduleVersion === "nba-daily-oct29-millionaire-showcase-v1" && day === "2026-10-29"
      ? buildNbaMillionaireDailySetup(day, scheduleVersion, 2, buildNbaMillionaireShowcaseRun())
      : buildNbaMillionaireDailySetup(day, scheduleVersion, ordinal, buildNbaOfficialMillionaireRun(ordinal)));
}
export { buildNbaMillionaireLeanPublication as buildNbaServerDailyPublication };
