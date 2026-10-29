import { nbaDailyGameAppearance } from "./nbaDailyPublicationIdentity";
export { nbaDailyGameAppearance } from "./nbaDailyPublicationIdentity";
import { barTriviaPublication } from "./nbaBarTriviaDailyPublication";
import { buildAverageFanDailySetup } from "../play/averageFanDailyRuntime";
import { buildFamilyFeudDailySetup } from "../play/familyFeudDailyRuntime";
import { BAR_TRIVIA_MAX_SCORE, createBarTriviaState, type BarTriviaQuestion } from "../games/barTriviaEngine";
import { BAR_TRIVIA_DAILY_SCORING_VERSION } from "../play/barTriviaDailyRuntime";
import { stableLineupHash } from "../play/lineupModel";
import {
  NBA_DAILY_WEIGHTED_CYCLE, NBA_OWNER_PREVIEW_ORDER, nbaOwnerPreviewDaily, nbaRegularSeasonDaily, type NbaDailyGame,
} from "./nbaDailySchedule";
import { buildNbaSportsFeudDailyPack } from "./nbaSportsFeudDailyRotation";
import { buildNbaBarTriviaDailyBoard } from "./nbaBarTriviaDailyRotation";
import { buildNbaOfficialMillionaireRun } from "./nbaMillionaireDailyRotation";
import { buildNbaMillionaireDailySetup } from "../play/millionaireDailyRuntime";
import { buildNbaWhoAmIOfficialRounds } from "./nbaWhoAmIDailyRotation";
import { buildTwoRoundWhoAmIDailyPublication } from "../play/whoAmITwoRoundDailyRuntime";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "../play/officialScoreContract";
import { buildNbaFindLeaderDailyPublication } from "./nbaFindLeaderDailyPublication";
import { buildNbaWavelengthDailyPublication } from "./nbaWavelengthDailyPublication";
import { buildNbaHitNumberDailyPublication } from "./nbaHitNumberDailyPublication";
import { buildNbaHigherLowerTwoGameDailyPublication } from "./nbaHigherLowerDailyPublication";

/**
 * Publication-only foundation using the existing canonical server graders.
 * None of these publications is accessible to clients until the NBA
 * authenticated Daily runtime and the remaining six games are wired.
 */
export const NBA_SERVER_READY_GAME_TYPES = [
  "average_fan", "sports_feud", "bar_trivia", "millionaire", "who_am_i", "find_leader", "wavelength", "hit_the_number", "higher_lower",
] as const satisfies readonly NbaDailyGame[];

export { NBA_BAR_TRIVIA_DAILY_CONTENT_VERSION } from "./nbaBarTriviaDailyPublication";

export function buildNbaServerDailyPublication(
  day: string,
  scheduleVersion: string,
  gameType: (typeof NBA_SERVER_READY_GAME_TYPES)[number],
  publicationHistory?: unknown,
) {
  if (!scheduleVersion.trim()) throw new Error("NBA Daily schedule version is required.");
  if (scheduleVersion === "nba-daily-launch-oct29-bar-trivia-v1") {
    throw new Error("The October 29 public Bar Trivia must use its existing verified saved board, never regenerate it.");
  }
  // Rehearsal is drawn from a later pool band so the Nov 1 season's first
  // official appearances do not simply recycle questions the owner has seen.
  const ordinal = scheduleVersion === "nba-daily-owner-prelaunch-v1"
    ? (nbaOwnerPreviewDaily(day) === gameType
      ? 20 + NBA_OWNER_PREVIEW_ORDER.indexOf(gameType)
      : (() => { throw new Error("NBA owner prelaunch game/day mismatch."); })())
    : nbaDailyGameAppearance(day, gameType);
  const publication = gameType === "higher_lower"
    ? buildNbaHigherLowerTwoGameDailyPublication(day, scheduleVersion, ordinal)
    : gameType === "hit_the_number"
      ? buildNbaHitNumberDailyPublication(day, scheduleVersion, ordinal)
    : gameType === "wavelength"
      ? buildNbaWavelengthDailyPublication(day, scheduleVersion, ordinal)
    : gameType === "find_leader"
    ? buildNbaFindLeaderDailyPublication(day, scheduleVersion, ordinal)
    : gameType === "who_am_i"
    ? buildTwoRoundWhoAmIDailyPublication(
        buildNbaWhoAmIOfficialRounds(ordinal),
        day, scheduleVersion, "nba-official-daily-v1", OFFICIAL_SCORE_CONTRACT_VERSION,
      )
    : gameType === "millionaire"
    ? buildNbaMillionaireDailySetup(day, scheduleVersion, ordinal, buildNbaOfficialMillionaireRun(ordinal))
    : gameType === "average_fan"
    ? buildAverageFanDailySetup("nba", day, scheduleVersion, publicationHistory)
    : gameType === "sports_feud"
      ? buildFamilyFeudDailySetup(buildNbaSportsFeudDailyPack(ordinal), day, scheduleVersion)
      : barTriviaPublication(day, scheduleVersion, ordinal);
  return { ...publication, gameType, scheduleVersion };
}

// The standalone Edge entries below import only their specific canonical author.
export { buildNbaAverageFanLeanPublication } from "./lean/AverageFanPublication";
export { buildNbaSportsFeudLeanPublication } from "./lean/SportsFeudPublication";
export { buildNbaMillionaireLeanPublication } from "./lean/MillionairePublication";
export { buildNbaHitNumberLeanPublication } from "./lean/HitNumberPublication";
export { buildNbaFindLeaderLeanPublication } from "./lean/FindLeaderPublication";
export { buildNbaWavelengthLeanPublication } from "./lean/WavelengthPublication";
export { buildNbaHigherLowerLeanPublication } from "./lean/HigherLowerPublication";
export { buildNbaBarTriviaLeanPublication } from "./lean/BarTriviaPublication";
