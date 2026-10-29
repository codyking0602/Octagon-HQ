import type { OfficialDailySetupPublication } from "../play/todaysChallengeRuntime";
import {
  NBA_OWNER_PREVIEW_ORDER,
  nbaOwnerPreviewDaily,
} from "./nbaDailySchedule";
import { nbaDailyGameAppearance } from "./nbaDailyPublicationIdentity";
import { buildNbaWhoAmIOfficialRounds } from "./nbaWhoAmIDailyRotation";
import { buildTwoRoundWhoAmIDailyPublication } from "../play/whoAmITwoRoundDailyRuntime";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "../play/officialScoreContract";

/**
 * Publication-equivalent NBA Who Am I generator, intentionally isolated from
 * Millionaire, Feud, Trivia, and all other game banks for Edge CPU safety.
 */
export function buildNbaWhoAmIDailyLeanPublication(day: string, scheduleVersion: string, gameType: string) {
  if (gameType !== "who_am_i" || !scheduleVersion.trim()) {
    throw new Error("NBA Who Am I Daily identity is invalid.");
  }
  let ordinal: number;
  if (scheduleVersion === "nba-daily-owner-prelaunch-v1") {
    if (nbaOwnerPreviewDaily(day) !== "who_am_i") {
      throw new Error("NBA owner prelaunch game/day mismatch.");
    }
    ordinal = 20 + NBA_OWNER_PREVIEW_ORDER.indexOf("who_am_i");
  } else {
    // Reuse the single authoritative game-appearance calculator; the public
    // Oct 29 Bar Trivia opening is counted before the Nov 1 weighted cycle.
    ordinal = nbaDailyGameAppearance(day, "who_am_i");
  }
  const publication: OfficialDailySetupPublication = buildTwoRoundWhoAmIDailyPublication(
    buildNbaWhoAmIOfficialRounds(ordinal),
    day,
    scheduleVersion,
    "nba-official-daily-v1",
    OFFICIAL_SCORE_CONTRACT_VERSION,
  );
  return { ...publication, gameType: "who_am_i" as const, scheduleVersion };
}
