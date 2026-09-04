import {
  hitTheNumberScore,
  hitTheNumberStatRows,
  type HitTheNumberResultStatus,
  type HitTheNumberStatRow,
} from "./hitTheNumberEngine";
import {
  createHitTheNumberFormatPlan,
  hitTheNumberFormatSelectionSatisfies,
  hitTheNumberSlotAcceptsFighter,
  type CreateHitTheNumberFormatPlanOptions,
  type HitTheNumberFormatPlan,
} from "./hitTheNumberFormats";

export const HIT_THE_NUMBER_RANDOM_POOL_QUALITY = {
  candidateAttempts: 64,
  minimumLegalSelections: 6,
  goodUnderMinScore: 90,
  badUnderMaxScore: 75,
  meaningfulBustMaxScore: 65,
  midScoreMin: 50,
  midScoreMax: 85,
} as const;

export interface HitTheNumberPoolQualityResult {
  passes: boolean;
  legalSelectionCount: number;
  highestUnderScore: number | null;
  lowestUnderScore: number | null;
  lowestBustScore: number | null;
  hasMidScore: boolean;
}

function valuesByFighter(statRows: readonly HitTheNumberStatRow[]) {
  return new Map(statRows.map((row) => [row.fighterId, row.values]));
}

function combinations<T>(items: readonly T[], count: number, visit: (selection: readonly T[]) => void) {
  const selected: T[] = [];

  function walk(start: number) {
    if (selected.length === count) {
      visit(selected);
      return;
    }
    const remaining = count - selected.length;
    for (let index = start; index <= items.length - remaining; index += 1) {
      selected.push(items[index]!);
      walk(index + 1);
      selected.pop();
    }
  }

  walk(0);
}

function selectionCanSatisfyPlan(
  plan: HitTheNumberFormatPlan,
  fighterIds: readonly string[],
  statRows: readonly HitTheNumberStatRow[],
) {
  if (plan.format.slots.length === 0) {
    return hitTheNumberFormatSelectionSatisfies(plan.format, fighterIds, statRows);
  }
  if (fighterIds.length !== plan.format.slots.length) return false;

  const used = new Set<string>();
  function assignSlot(slotIndex: number): boolean {
    const slot = plan.format.slots[slotIndex];
    if (!slot) return true;
    for (const fighterId of fighterIds) {
      if (used.has(fighterId) || !hitTheNumberSlotAcceptsFighter(slot, fighterId, statRows)) continue;
      used.add(fighterId);
      if (assignSlot(slotIndex + 1)) return true;
      used.delete(fighterId);
    }
    return false;
  }

  return assignSlot(0);
}

export function hitTheNumberRandomPoolQuality(
  plan: HitTheNumberFormatPlan,
  statRows: readonly HitTheNumberStatRow[] = hitTheNumberStatRows,
): HitTheNumberPoolQualityResult {
  if (plan.boardType !== "random-pool") {
    return {
      passes: true,
      legalSelectionCount: 0,
      highestUnderScore: null,
      lowestUnderScore: null,
      lowestBustScore: null,
      hasMidScore: false,
    };
  }

  const rows = valuesByFighter(statRows);
  let legalSelectionCount = 0;
  let highestUnderScore: number | null = null;
  let lowestUnderScore: number | null = null;
  let lowestBustScore: number | null = null;
  let hasMidScore = false;

  combinations(plan.fighterIds, plan.pickCount, (fighterIds) => {
    if (!selectionCanSatisfyPlan(plan, fighterIds, statRows)) return;

    const total = fighterIds.reduce((sum, fighterId) => {
      const value = rows.get(fighterId)?.[plan.statId];
      if (!Number.isInteger(value) || value == null || value < 0) {
        throw new Error(`Missing valid ${plan.statId} value for ${fighterId}.`);
      }
      return sum + value;
    }, 0);
    const status: HitTheNumberResultStatus = total === plan.target
      ? "perfect"
      : total > plan.target
        ? "bust"
        : "under";
    if (status === "perfect") return;

    legalSelectionCount += 1;
    const score = hitTheNumberScore({
      status,
      target: plan.target,
      distance: Math.abs(plan.target - total),
      pickCount: plan.pickCount,
    });
    if (status === "under") {
      highestUnderScore = highestUnderScore == null ? score : Math.max(highestUnderScore, score);
      lowestUnderScore = lowestUnderScore == null ? score : Math.min(lowestUnderScore, score);
    } else {
      lowestBustScore = lowestBustScore == null ? score : Math.min(lowestBustScore, score);
    }
    if (
      score >= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.midScoreMin
      && score <= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.midScoreMax
    ) {
      hasMidScore = true;
    }
  });

  return {
    passes: (
      legalSelectionCount >= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.minimumLegalSelections
      && highestUnderScore != null
      && highestUnderScore >= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.goodUnderMinScore
      && lowestUnderScore != null
      && lowestUnderScore <= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.badUnderMaxScore
      && lowestBustScore != null
      && lowestBustScore <= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.meaningfulBustMaxScore
      && hasMidScore
    ),
    legalSelectionCount,
    highestUnderScore,
    lowestUnderScore,
    lowestBustScore,
    hasMidScore,
  };
}

function hitTheNumberDailyPlanPassesQuality(
  plan: HitTheNumberFormatPlan,
  statRows?: readonly HitTheNumberStatRow[],
) {
  if (plan.fighterIds.length <= plan.pickCount) return false;
  if (plan.boardType !== "random-pool") return true;
  return hitTheNumberRandomPoolQuality(plan, statRows).passes;
}

/**
 * The format planner remains the sole board generator. This gate rejects any
 * official candidate that would force the player to pick the entire eligible
 * board. Every Random Pool must also contain enough legal choices to produce
 * near-target, middling, clearly bad, and meaningful bust outcomes.
 */
export function createQualityGatedHitTheNumberFormatPlan(
  options: CreateHitTheNumberFormatPlanOptions,
): HitTheNumberFormatPlan {
  const first = createHitTheNumberFormatPlan(options);
  if (hitTheNumberDailyPlanPassesQuality(first, options.statRows)) return first;

  for (let attempt = 1; attempt <= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.candidateAttempts; attempt += 1) {
    const candidate = createHitTheNumberFormatPlan({
      ...options,
      seed: `${options.seed}|pool-quality|${attempt}`,
    });
    if (candidate.format.formatId !== first.format.formatId) continue;
    if (hitTheNumberDailyPlanPassesQuality(candidate, options.statRows)) return candidate;
  }

  throw new Error("Hit the Number could not produce a board with real player choice and required pool quality.");
}
