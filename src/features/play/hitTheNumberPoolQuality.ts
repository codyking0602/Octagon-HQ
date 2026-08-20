import {
  hitTheNumberScore,
  hitTheNumberStatRows,
  type HitTheNumberResultStatus,
  type HitTheNumberStatRow,
} from "./hitTheNumberEngine";
import {
  createHitTheNumberFormatPlan,
  type CreateHitTheNumberFormatPlanOptions,
  type HitTheNumberFormatPlan,
} from "./hitTheNumberFormats";

export const HIT_THE_NUMBER_RANDOM_POOL_QUALITY = {
  candidateAttempts: 64,
  badUnderMaxScore: 75,
  meaningfulBustMaxScore: 65,
  midScoreMin: 50,
  midScoreMax: 85,
} as const;

export interface HitTheNumberPoolQualityResult {
  passes: boolean;
  legalSelectionCount: number;
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

export function hitTheNumberRandomPoolQuality(
  plan: HitTheNumberFormatPlan,
  statRows: readonly HitTheNumberStatRow[] = hitTheNumberStatRows,
): HitTheNumberPoolQualityResult {
  if (plan.boardType !== "random-pool") {
    return {
      passes: true,
      legalSelectionCount: 0,
      lowestUnderScore: null,
      lowestBustScore: null,
      hasMidScore: false,
    };
  }

  const rows = valuesByFighter(statRows);
  let legalSelectionCount = 0;
  let lowestUnderScore: number | null = null;
  let lowestBustScore: number | null = null;
  let hasMidScore = false;

  combinations(plan.fighterIds, plan.pickCount, (fighterIds) => {
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
      lowestUnderScore != null
      && lowestUnderScore <= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.badUnderMaxScore
      && lowestBustScore != null
      && lowestBustScore <= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.meaningfulBustMaxScore
      && hasMidScore
    ),
    legalSelectionCount,
    lowestUnderScore,
    lowestBustScore,
    hasMidScore,
  };
}

/**
 * The format planner remains the sole board generator. This only rejects weak
 * themed Random Pool candidates until that same canonical planner produces a
 * board with real low, middle, and bust outcomes. Classic and slot-driven
 * formats keep their existing generation path.
 */
export function createQualityGatedHitTheNumberFormatPlan(
  options: CreateHitTheNumberFormatPlanOptions,
): HitTheNumberFormatPlan {
  const first = createHitTheNumberFormatPlan(options);
  if (options.boardType !== "random-pool" || first.format.formatId !== "themed-lineup") {
    return first;
  }
  if (hitTheNumberRandomPoolQuality(first, options.statRows).passes) return first;

  for (let attempt = 1; attempt <= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.candidateAttempts; attempt += 1) {
    const candidate = createHitTheNumberFormatPlan({
      ...options,
      seed: `${options.seed}|pool-quality|${attempt}`,
    });
    if (candidate.format.formatId !== first.format.formatId) continue;
    if (hitTheNumberRandomPoolQuality(candidate, options.statRows).passes) return candidate;
  }

  throw new Error("Hit the Number themed Random Pool could not produce a balanced score spread.");
}
