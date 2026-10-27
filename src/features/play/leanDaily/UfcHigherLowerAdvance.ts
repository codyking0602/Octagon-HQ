import { advanceUfcHigherLowerDailyRuntime } from "../ufcHigherLowerDailyRuntime";
import { advanceTwoGameDailyRuntime, isTwoGameDailyContext } from "../dailyTwoGameRuntime";
import type { OfficialDailyRuntimeContext, OfficialDailyAdvanceResult } from "../todaysChallengeRuntime";
function record(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("UFC Higher or Lower action must be an object.");
  return value as Record<string, unknown>;
}
export function advanceOfficialDailyGameRuntime(context: OfficialDailyRuntimeContext, action: unknown): OfficialDailyAdvanceResult {
  const advance = (child: OfficialDailyRuntimeContext, next: unknown) =>
    advanceUfcHigherLowerDailyRuntime(child, record(next));
  return isTwoGameDailyContext(context)
    ? advanceTwoGameDailyRuntime(context, action, advance, (_child, result) => Number(result.publicState.correct_count) * 10)
    : advance(context, action);
}
