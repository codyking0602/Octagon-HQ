import { advanceHitTheNumber, scoreFootballHitNumberTwoGameChild } from "./footballHitNumberAdvanceCore";
import { advanceFindLeader, scoreFindLeader } from "./findLeaderDailyAdvanceCore";
import { advanceBlindResume, advanceBlindRank, advanceKeepCut } from "./footballComparisonActionCore";
export { advanceFindLeaderOnlyDailyRuntime } from "./findLeaderDailyAdvanceCore";
import {
  advanceFootballWavelengthRound,
  scoreFootballWavelengthTwoGameChild,
} from "./footballWavelengthDailyAdvance";
import {
  advanceTwoGameDailyRuntime,
  isTwoGameDailyContext,
} from "./dailyTwoGameRuntime";
import { advanceCanonicalWhoAmIDailyRuntime } from "./whoAmITwoRoundDailyRuntime";
import { advanceMillionaireDailyRuntime } from "./millionaireDailyRuntime";
import { advanceFamilyFeudDailyRuntime } from "./familyFeudDailyRuntime";
import { advanceBarTriviaDailyRuntime } from "./barTriviaDailyRuntime";
import { advanceAverageFanDailyRuntime } from "./averageFanDailyRuntime";
import { advanceFootballHigherLowerDailyRuntime } from "./footballHigherLowerDailyRuntime";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Football daily evidence must be an object.");
  return value as JsonRecord;
}

function advanceSingleFootballOfficialDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  const parsed = asRecord(action);
  switch (context.gameType) {
    case "find_leader": return advanceFindLeader(context, parsed);
    case "wavelength": return advanceFootballWavelengthRound(context, parsed);
    case "blind_resume": return advanceBlindResume(context, parsed);
    case "blind_rank_5": return advanceBlindRank(context, parsed);
    case "keep_4_cut_4": return advanceKeepCut(context, parsed);
    case "hit_the_number": return advanceHitTheNumber(context, parsed);
    case "who_am_i": return advanceCanonicalWhoAmIDailyRuntime(context, parsed);
    case "millionaire": return advanceMillionaireDailyRuntime(context, parsed);
    case "sports_feud": return advanceFamilyFeudDailyRuntime(context, parsed);
    case "bar_trivia": return advanceBarTriviaDailyRuntime(context, parsed);
    case "average_fan": return advanceAverageFanDailyRuntime(context, parsed);
    case "higher_lower": return advanceFootballHigherLowerDailyRuntime(context, parsed);
    default: throw new Error(`Unsupported Football official daily game ${String(context.gameType)}.`);
  }
}

function scoreTwoGameFootballChild(
  context: OfficialDailyRuntimeContext,
  advanced: OfficialDailyAdvanceResult,
) {
  if (context.gameType === "find_leader") {
    return scoreFindLeader(context, advanced);
  }
  if (context.gameType === "wavelength") return scoreFootballWavelengthTwoGameChild(context, advanced);
  if (context.gameType === "hit_the_number") {
    return scoreFootballHitNumberTwoGameChild(context, advanced);
  }
  if (context.gameType === "higher_lower") return Number(advanced.publicState.correct_count) * 10;
  throw new Error(`Unsupported Football two-game Daily score for ${String(context.gameType)}.`);
}

export function advanceFootballOfficialDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  return isTwoGameDailyContext(context)
    ? advanceTwoGameDailyRuntime(
        context,
        action,
        advanceSingleFootballOfficialDailyRuntime,
        scoreTwoGameFootballChild,
      )
    : advanceSingleFootballOfficialDailyRuntime(context, action);
}
