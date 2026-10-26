import { nbaLeanDailyPublication } from "../nbaDailyPublicationIdentity";
import { buildFamilyFeudDailySetup } from "../../play/familyFeudDailyRuntime";
import { buildNbaSportsFeudDailyPack } from "../nbaSportsFeudDailyRotation";

export function buildNbaSportsFeudLeanPublication(day: string, scheduleVersion: string, gameType: string, history?: unknown) {
  return nbaLeanDailyPublication(day, scheduleVersion, gameType, "sports_feud",
    (ordinal) => buildFamilyFeudDailySetup(buildNbaSportsFeudDailyPack(ordinal), day, scheduleVersion));
}
export { buildNbaSportsFeudLeanPublication as buildNbaServerDailyPublication };
