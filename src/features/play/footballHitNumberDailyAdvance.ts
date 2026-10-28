// Answer-only Football Hit the Number entrypoint. This deliberately avoids
// importing Football's Who Am I, Wavelength, Feud, or publication catalogs.
import { advanceTwoGameDailyRuntime, isTwoGameDailyContext } from "./dailyTwoGameRuntime";
import { advanceHitTheNumber, scoreFootballHitNumberTwoGameChild } from "./footballHitNumberAdvanceCore";
import type { OfficialDailyAdvanceResult, OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

export function advanceFootballHitNumberDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  if (context.gameType !== "hit_the_number") {
    throw new Error("Football Hit the Number fast path requires an official Hit the Number board.");
  }
  const advance = (active: OfficialDailyRuntimeContext, nextAction: unknown) => {
    if (!nextAction || typeof nextAction !== "object" || Array.isArray(nextAction)) {
      throw new Error("Football Hit the Number action must be an object.");
    }
    return advanceHitTheNumber(active, nextAction as Record<string, unknown>);
  };
  return isTwoGameDailyContext(context)
    ? advanceTwoGameDailyRuntime(context, action, advance, scoreFootballHitNumberTwoGameChild)
    : advance(context, action);
}
