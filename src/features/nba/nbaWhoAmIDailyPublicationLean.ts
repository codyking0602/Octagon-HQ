import type { OfficialDailySetupPublication } from "../play/todaysChallengeRuntime";
import {
  NBA_DAILY_WEIGHTED_CYCLE,
  NBA_OWNER_PREVIEW_ORDER,
  nbaOwnerPreviewDaily,
  nbaRegularSeasonDaily,
} from "./nbaDailySchedule";
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
    const slot = nbaRegularSeasonDaily(day);
    if (!slot || !slot.isPublicationDay || slot.gameType !== "who_am_i") {
      throw new Error("NBA Daily publication must match its scheduled Central day and game.");
    }
    ordinal = 0;
    for (let index = 0; index < slot.appearanceIndex; index += 1) {
      if (NBA_DAILY_WEIGHTED_CYCLE[index % NBA_DAILY_WEIGHTED_CYCLE.length] === "who_am_i") {
        ordinal += 1;
      }
    }
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
