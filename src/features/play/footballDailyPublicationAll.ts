import type { OfficialDailyGameType } from "./todaysChallengeRuntime";
import { buildFootballDailyPersistenceSetup as buildWhoAmI } from "./footballDailyPublicationWhoAmI";
import { buildFootballDailyPersistenceSetup as buildWavelength } from "./footballDailyPublicationWavelength";
import { buildFootballDailyPersistenceSetup as buildFindLeader } from "./footballDailyPublicationFindLeader";
import { buildFootballDailyPersistenceSetup as buildBlindResume } from "./footballDailyPublicationBlindResume";
import { buildFootballDailyPersistenceSetup as buildHitNumber } from "./footballDailyPublicationHitNumber";
import { buildFootballDailyPersistenceSetup as buildMillionaire } from "./footballDailyPublicationMillionaire";
import { buildFootballDailyPersistenceSetup as buildSportsFeud } from "./footballDailyPublicationSportsFeud";
import { buildFootballDailyPersistenceSetup as buildBarTrivia } from "./footballDailyPublicationBarTrivia";
import { buildFootballDailyPersistenceSetup as buildAverageFan } from "./footballDailyPublicationAverageFan";
import { buildFootballDailyPersistenceSetup as buildComparison } from "./footballDailyPublicationComparison";

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
  publicationHistory?: unknown,
) {
  switch (gameType) {
    case "who_am_i":
      return buildWhoAmI(day, scheduleVersion, gameType, publicationHistory);
    case "wavelength":
      return buildWavelength(day, scheduleVersion, gameType);
    case "find_leader":
      return buildFindLeader(day, scheduleVersion, gameType);
    case "blind_resume":
      return buildBlindResume(day, scheduleVersion, gameType);
    case "hit_the_number":
      return buildHitNumber(day, scheduleVersion, gameType);
    case "millionaire":
      return buildMillionaire(day, scheduleVersion, gameType);
    case "sports_feud":
      return buildSportsFeud(day, scheduleVersion, gameType);
    case "bar_trivia":
      return buildBarTrivia(day, scheduleVersion, gameType);
    case "average_fan":
      return buildAverageFan(day, scheduleVersion, gameType, publicationHistory);
    case "blind_rank_5":
    case "keep_4_cut_4":
      return buildComparison(day, scheduleVersion, gameType);
    default:
      throw new Error(`Unsupported Football Daily publication game ${String(gameType)}.`);
  }
}
