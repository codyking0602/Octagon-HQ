import {
  hitTheNumberBoardQualityScore,
  HIT_THE_NUMBER_GENERATION_PROFILE,
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
import { seededLineupRandom } from "./lineupModel";

export const HIT_THE_NUMBER_RANDOM_POOL_QUALITY = {
  candidateAttempts: 64,
  minimumLegalSelections: 6,
  goodUnderMinScore: 90,
  badUnderMaxScore: 75,
  meaningfulBustMaxScore: 40,
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

/** Precompute costly eligibility checks once per board, not per legal combination. */
function boardEligibility(plan: HitTheNumberFormatPlan, statRows: readonly HitTheNumberStatRow[]) {
  if (plan.format.formatId === "themed-lineup") return {
    themed: new Set(plan.fighterIds.filter(id => hitTheNumberFormatSelectionSatisfies(plan.format, [id], statRows))),
    slots: [] as Set<string>[],
  };
  return {
    themed: null as Set<string> | null,
    slots: plan.format.slots.map(slot => new Set(
      plan.fighterIds.filter(id => hitTheNumberSlotAcceptsFighter(slot, id, statRows)),
    )),
  };
}

type BoardEligibility = ReturnType<typeof boardEligibility>;

function orderedLegalSelection(
  plan: HitTheNumberFormatPlan,
  ids: readonly string[],
  eligible: BoardEligibility,
): string[] | null {
  if (eligible.themed && ids.some(id => !eligible.themed!.has(id))) return null;
  if (!eligible.slots.length) return [...ids];
  if (ids.length !== eligible.slots.length) return null;
  const used = new Set<string>();
  const assigned: string[] = [];
  function fill(index: number): boolean {
    if (index === eligible.slots.length) return true;
    for (const id of ids) {
      if (used.has(id) || !eligible.slots[index]!.has(id)) continue;
      used.add(id);
      assigned[index] = id;
      if (fill(index + 1)) return true;
      used.delete(id);
    }
    return false;
  }
  return fill(0) ? assigned : null;
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
  const eligibility = boardEligibility(plan, statRows);
  let legalSelectionCount = 0;
  let highestUnderScore: number | null = null;
  let lowestUnderScore: number | null = null;
  let lowestBustScore: number | null = null;
  let hasMidScore = false;

  combinations(plan.fighterIds, plan.pickCount, (fighterIds) => {
    if (!orderedLegalSelection(plan, fighterIds, eligibility)) return;

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
    const score = hitTheNumberBoardQualityScore({
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

/** Select a reachable target from the middle of the legal lineup distribution.
 * Both the displayed target and hidden exact solution come from the same legal lineup. */
function balancedTargetPlan(
  plan: HitTheNumberFormatPlan,
  seed: string,
  statRows: readonly HitTheNumberStatRow[],
): HitTheNumberFormatPlan {
  if (plan.boardType !== "random-pool") return plan;
  const rows = valuesByFighter(statRows);
  const eligibility = boardEligibility(plan, statRows);
  const outcomes: Array<{ total: number; ids: string[] }> = [];
  combinations(plan.fighterIds, plan.pickCount, fighterIds => {
    const ordered = orderedLegalSelection(plan, fighterIds, eligibility);
    if (!ordered) return;
    const total = ordered.reduce((sum, id) => sum + Number(rows.get(id)?.[plan.statId] ?? 0), 0);
    if (total > 0) outcomes.push({ total, ids: ordered });
  });
  if (outcomes.length < 10) return plan;
  outcomes.sort((a, b) => a.total - b.total);
  const random = seededLineupRandom("ufc-hit-number-balanced-target", seed, plan.statId);
  const percentile = .44 + random() * .12;
  const selected = outcomes[Math.floor(outcomes.length * percentile)]!;
  return { ...plan, target: selected.total, solutionFighterIds: selected.ids };
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
  // Lock the pick count once. Failed quality retries must not skew the 85/15 mix.
  const pick = options.pickCount ?? (() => {
    const random = seededLineupRandom("ufc-hit-number-fixed-pick-count", options.seed, options.boardType);
    return (random() < HIT_THE_NUMBER_GENERATION_PROFILE.picks[0]!.weight / 100 ? 4 : 5) as 4 | 5;
  })();
  const fixedOptions = { ...options, pickCount: pick };
  const rows = options.statRows ?? hitTheNumberStatRows;
  const first = createHitTheNumberFormatPlan(fixedOptions);
  const balancedFirst = balancedTargetPlan(first, options.seed, rows);
  if (hitTheNumberDailyPlanPassesQuality(balancedFirst, options.statRows)) return balancedFirst;

  for (let attempt = 1; attempt <= HIT_THE_NUMBER_RANDOM_POOL_QUALITY.candidateAttempts; attempt += 1) {
    const candidateSeed = `${options.seed}|pool-quality|${attempt}`;
    let candidate: HitTheNumberFormatPlan;
    try {
      candidate = createHitTheNumberFormatPlan({ ...fixedOptions, seed: candidateSeed });
    } catch {
      continue;
    }
    if (candidate.format.formatId !== first.format.formatId) continue;
    const balanced = balancedTargetPlan(candidate, candidateSeed, rows);
    if (hitTheNumberDailyPlanPassesQuality(balanced, options.statRows)) return balanced;
  }

  throw new Error("Hit the Number could not produce a board with real player choice and required pool quality.");
}
