import { nbaLeanDailyPublication } from "../nbaDailyPublicationIdentity";
import { buildNbaWavelengthDailyPublication } from "../nbaWavelengthDailyPublication";

export function buildNbaWavelengthLeanPublication(day: string, scheduleVersion: string, gameType: string, history?: unknown) {
  return nbaLeanDailyPublication(day, scheduleVersion, gameType, "wavelength",
    (ordinal) => buildNbaWavelengthDailyPublication(day, scheduleVersion, ordinal));
}
export { buildNbaWavelengthLeanPublication as buildNbaServerDailyPublication };
