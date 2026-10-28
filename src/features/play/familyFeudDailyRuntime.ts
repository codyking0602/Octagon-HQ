// Legacy UFC/Football consumers retain the full authored metadata hydration.
// NBA Daily uses the same canonical scoring core directly, without importing
// all UFC, NFL and CFB question catalogs into its per-answer Edge isolate.
import { sportsFeudCurrentEntityMetadata } from "./sportsFeudDailyBanks";
import {
  advanceFamilyFeudDailyCore,
  type FamilyFeudDailyRuntimeContext,
  type FamilyFeudDailyAdvanceResult,
} from "./familyFeudDailyCore";
export * from "./familyFeudDailyCore";

export function advanceFamilyFeudDailyRuntime(
  context: FamilyFeudDailyRuntimeContext,
  actionValue: unknown,
): FamilyFeudDailyAdvanceResult {
  return advanceFamilyFeudDailyCore(context, actionValue, sportsFeudCurrentEntityMetadata);
}
