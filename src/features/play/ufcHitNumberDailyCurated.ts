/**
 * UFC Official Daily-only curated candidate foundation. Staged and unhooked:
 * the existing Casual generator, published Daily versions and progression
 * continue to use their previous versions until coordinated activation.
 *
 * Uses the canonical UFC-only fighter stat ledger and existing four gameplay
 * formats. Rejects 7-pick plans and expands Random Pool to 12/14/16 choices
 * while preserving a source-backed exact solution and meaningful alternatives.
 */
import {
  HIT_THE_NUMBER_STATS,
  hitTheNumberEligibleFighters,
  hitTheNumberStatRows,
  type HitTheNumberStatId,
} from "./hitTheNumberEngine";
import {
  createHitTheNumberFormatPlan,
  hitTheNumberSlotAcceptsFighter,
  type HitTheNumberFormatPlan,
} from "./hitTheNumberFormats";
import {
  hitTheNumberRandomPoolQuality,
  type HitTheNumberPoolQualityResult,
} from "./hitTheNumberPoolQuality";
import { seededLineupRandom, shuffleLineup } from "./lineupModel";

export const UFC_CURATED_DAILY_HIT_NUMBER_VERSION = "ufc-hit-number-curated-daily-v1";
export const UFC_CURATED_DAILY_MAX_TRIES = 128;
export const UFC_CURATED_DAILY_PICKS = [4, 5, 6] as const;
export const UFC_CURATED_DAILY_CHOICES = { 4: 12, 5: 14, 6: 16 } as const;

export type UfcCuratedDailyHitNumberPlan = HitTheNumberFormatPlan & {
  quality: HitTheNumberPoolQualityResult;
  curatedVersion: typeof UFC_CURATED_DAILY_HIT_NUMBER_VERSION;
};

export function ufcCuratedHitNumberFingerprint(plan: Pick<HitTheNumberFormatPlan, "statId" | "fighterIds">) {
  return [plan.statId, [...plan.fighterIds].sort().join("|")].join(":");
}

function validPoolSubject(
  plan: HitTheNumberFormatPlan,
  fighterId: string,
) {
  if (plan.format.formatId === "classic") return true;
  if (plan.format.formatId === "themed-lineup") {
    return hitTheNumberSlotAcceptsFighter({
      id: "daily-theme", label: "Daily theme", rules: plan.format.rules,
    }, fighterId);
  }
  return plan.format.slots.some((slot) => hitTheNumberSlotAcceptsFighter(slot, fighterId));
}

function extendCuratedRandomPool(
  plan: HitTheNumberFormatPlan,
  seed: string,
): HitTheNumberFormatPlan | null {
  if (plan.boardType !== "random-pool" ||
      !UFC_CURATED_DAILY_PICKS.includes(plan.pickCount as 4 | 5 | 6)) return null;
  const count = UFC_CURATED_DAILY_CHOICES[plan.pickCount as 4 | 5 | 6];
  const values = new Map(hitTheNumberStatRows.map((row) => [row.fighterId, row.values]));
  const original = [...plan.fighterIds];
  const existing = new Set(original);
  const eligible = hitTheNumberEligibleFighters(plan.statId as HitTheNumberStatId)
    .map((fighter) => fighter.id)
    .filter((id) => !existing.has(id)
      && Number(values.get(id)?.[plan.statId]) > 0
      && validPoolSubject(plan, id));
  if (original.length > count || original.length + eligible.length < count) return null;

  const shuffled = shuffleLineup(
    eligible,
    seededLineupRandom(UFC_CURATED_DAILY_HIT_NUMBER_VERSION, seed, "extra-fighters"),
  );
  const selected = [...original, ...shuffled.slice(0, count - original.length)];
  if (new Set(selected).size !== count) return null;
  return {
    ...plan,
    fighterIds: shuffleLineup(
      selected,
      seededLineupRandom(UFC_CURATED_DAILY_HIT_NUMBER_VERSION, seed, "shuffled-board"),
    ),
  };
}

/**
 * History is a caller-supplied exact FULL-BOARD fingerprint set. This prevents
 * exact repeats across sequential rehearsal boards, but does not replace a
 * backend history RPC in the final production cutover.
 */
export function createUfcCuratedDailyHitNumberPlan(
  seed: string,
  historicalBoardKeys: ReadonlySet<string> = new Set<string>(),
): UfcCuratedDailyHitNumberPlan {
  if (!seed.trim()) throw new Error("UFC curated Daily seed is required.");
  for (let attempt = 0; attempt < UFC_CURATED_DAILY_MAX_TRIES; attempt++) {
    const attemptSeed = [
      UFC_CURATED_DAILY_HIT_NUMBER_VERSION, seed, attempt,
    ].join("|");
    let proposed: HitTheNumberFormatPlan;
    try {
      proposed = createHitTheNumberFormatPlan({
        seed: attemptSeed, boardType: "random-pool",
      });
    } catch {
      continue; // a rare shallow theme/stat combination; retry deterministically
    }
    const expanded = extendCuratedRandomPool(proposed, attemptSeed);
    if (!expanded || historicalBoardKeys.has(ufcCuratedHitNumberFingerprint(expanded))) continue;

    const quality = hitTheNumberRandomPoolQuality(expanded);
    if (!quality.passes) continue;

    const byId = new Map(hitTheNumberStatRows.map((row) => [row.fighterId, row.values]));
    const total = expanded.solutionFighterIds.reduce(
      (sum, id) => sum + Number(byId.get(id)?.[expanded.statId] ?? NaN), 0,
    );
    if (total !== expanded.target ||
        expanded.solutionFighterIds.length !== expanded.pickCount ||
        !expanded.solutionFighterIds.every((id) => expanded.fighterIds.includes(id))) continue;

    return {
      ...expanded, quality,
      curatedVersion: UFC_CURATED_DAILY_HIT_NUMBER_VERSION,
    };
  }
  throw new Error("UFC curated Daily Hit the Number exhausted its safe 128-plan search.");
}

export const UFC_CURATED_DAILY_SUPPORTED_METRICS: readonly HitTheNumberStatId[] =
  HIT_THE_NUMBER_STATS.map(({ id }) => id);
