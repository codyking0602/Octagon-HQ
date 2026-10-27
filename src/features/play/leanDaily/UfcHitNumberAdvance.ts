import { advanceOfficialHitTheNumberDailyRuntime } from "../hitTheNumberDailyRuntime";
import { gradeHitTheNumberSelection, type HitTheNumberPublicSetup } from "../hitTheNumberEngine";
import { advanceTwoGameDailyRuntime, isTwoGameDailyContext } from "../dailyTwoGameRuntime";
import type { OfficialDailyRuntimeContext, OfficialDailyAdvanceResult } from "../todaysChallengeRuntime";
function record(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Official Hit the Number action is invalid.");
  return value as Record<string, unknown>;
}
export function advanceOfficialDailyGameRuntime(context: OfficialDailyRuntimeContext, action: unknown): OfficialDailyAdvanceResult {
  const advance = (child: OfficialDailyRuntimeContext, next: unknown) =>
    advanceOfficialHitTheNumberDailyRuntime(child, record(next));
  return isTwoGameDailyContext(context)
    ? advanceTwoGameDailyRuntime(context, action, advance, (child, result) => {
        const selected = record(result.finalSubmission).selected_ids;
        if (!Array.isArray(selected) || selected.some(value => typeof value !== "string")) throw new Error("Hit the Number selections are invalid.");
        return gradeHitTheNumberSelection(child.publicSetup as unknown as HitTheNumberPublicSetup, selected as string[]).score;
      })
    : advance(context, action);
}
