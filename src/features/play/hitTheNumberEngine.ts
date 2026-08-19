import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import { seededLineupRandom, shuffleLineup } from "./lineupModel";
import { playFighters, type PlayFighter, type PlayGender } from "./playFighterPool";

export const HIT_THE_NUMBER_VERSION = "hit-the-number-v1" as const;
export const HIT_THE_NUMBER_MIN_PICKS = 4;
export const HIT_THE_NUMBER_MAX_PICKS = 7;
export const HIT_THE_NUMBER_DEFAULT_RANDOM_POOL_SIZE = 12;

export const HIT_THE_NUMBER_STATS = [
  { id: "ufc-wins", label: "UFC Wins" },
  { id: "ufc-ko-tko-wins", label: "UFC KO/TKO Wins" },
  { id: "ufc-submission-wins", label: "UFC Submission Wins" },
  { id: "ufc-finishes", label: "UFC Finishes" },
] as const;

export type HitTheNumberStatId = typeof HIT_THE_NUMBER_STATS[number]["id"];
export type HitTheNumberBoardType = "open-roster" | "random-pool";

export const HIT_THE_NUMBER_GENERATION_PROFILE = {
  stats: [
    { value: "ufc-wins", weight: 35 },
    { value: "ufc-finishes", weight: 30 },
    { value: "ufc-ko-tko-wins", weight: 25 },
    { value: "ufc-submission-wins", weight: 10 },
  ],
  filters: [
    { value: "all", weight: 55 },
    { value: "division", weight: 45 },
  ],
  picks: [
    { value: 4, weight: 15 },
    { value: 5, weight: 35 },
    { value: 6, weight: 35 },
    { value: 7, weight: 15 },
  ],
} as const;

export interface HitTheNumberEligibilityFilter {
  gender?: PlayGender;
  division?: string;
}

export interface HitTheNumberStatRow {
  fighterId: string;
  values: Record<HitTheNumberStatId, number>;
}

export interface HitTheNumberPublicSetup {
  version: typeof HIT_THE_NUMBER_VERSION;
  statId: HitTheNumberStatId;
  boardType: HitTheNumberBoardType;
  target: number;
  pickCount: number;
  filter: HitTheNumberEligibilityFilter;
  fighterIds: string[];
}

export interface HitTheNumberPrivateSetup {
  solutionFighterIds: string[];
}

export interface HitTheNumberBoard {
  publicSetup: HitTheNumberPublicSetup;
  privateSetup: HitTheNumberPrivateSetup;
}

export interface CreateHitTheNumberBoardOptions {
  seed: string;
  statId: HitTheNumberStatId;
  boardType: HitTheNumberBoardType;
  filter?: HitTheNumberEligibilityFilter;
  pickCount?: number;
  target?: number;
  randomPoolSize?: number;
  statRows?: readonly HitTheNumberStatRow[];
}

export interface CreateGeneratedHitTheNumberBoardOptions {
  seed: string;
  boardType: HitTheNumberBoardType;
  statRows?: readonly HitTheNumberStatRow[];
}

export type HitTheNumberResultStatus = "perfect" | "under" | "bust";

export interface HitTheNumberResult {
  status: HitTheNumberResultStatus;
  target: number;
  total: number;
  distance: number;
  score: number;
  selections: Array<{ fighterId: string; value: number }>;
}

const KO_TKO_METHODS = new Set(["ko-tko", "doctor-stoppage"]);
const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);

function statValuesForFights(
  fights: (typeof canonicalRankingInputs.fighters)[number]["facts"]["fights"],
): HitTheNumberStatRow["values"] {
  const wins = fights.filter((fight) => fight.officialResult === "win");
  return {
    "ufc-wins": wins.length,
    "ufc-ko-tko-wins": wins.filter((fight) => KO_TKO_METHODS.has(fight.methodCategory)).length,
    "ufc-submission-wins": wins.filter((fight) => fight.methodCategory === "submission").length,
    "ufc-finishes": wins.filter((fight) => FINISH_METHODS.has(fight.methodCategory)).length,
  };
}

/**
 * Ranked Hit the Number facts are derived from the existing canonical UFC fight
 * ledgers instead of maintaining another ranked-fighter stat table.
 *
 * Play-only fighters without complete canonical fight ledgers stay out of
 * factual Hit the Number boards until verified rows are owned here. Missing
 * rows are excluded rather than guessed or silently defaulted.
 */
export const rankedHitTheNumberStatRows: readonly HitTheNumberStatRow[] =
  canonicalRankingInputs.fighters.map((fighter) => ({
    fighterId: fighter.presentation.slug,
    values: statValuesForFights(fighter.facts.fights),
  }));

export const hitTheNumberStatRows: readonly HitTheNumberStatRow[] = rankedHitTheNumberStatRows;

function normalizedDivision(value: string) {
  return value.trim().toLowerCase();
}

function rowMap(rows: readonly HitTheNumberStatRow[]) {
  return new Map(rows.map((row) => [row.fighterId, row]));
}

function valueFor(
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
  fighterId: string,
  statId: HitTheNumberStatId,
) {
  const value = rowsById.get(fighterId)?.values[statId];
  if (!Number.isInteger(value) || value == null || value < 0) {
    throw new Error(`Missing valid ${statId} value for ${fighterId}.`);
  }
  return value;
}

export function hitTheNumberEligibleFighters(
  statId: HitTheNumberStatId,
  filter: HitTheNumberEligibilityFilter = {},
  statRows: readonly HitTheNumberStatRow[] = hitTheNumberStatRows,
): PlayFighter[] {
  const rowsById = rowMap(statRows);
  const requiredDivision = filter.division ? normalizedDivision(filter.division) : null;

  return playFighters.filter((fighter) => {
    if (filter.gender && fighter.gender !== filter.gender) return false;
    if (
      requiredDivision
      && !fighter.divisions.some((division) => normalizedDivision(division) === requiredDivision)
    ) return false;

    const value = rowsById.get(fighter.id)?.values[statId];
    return Number.isInteger(value) && value != null && value >= 0;
  });
}

function validatePickCount(value: number) {
  if (!Number.isInteger(value) || value < HIT_THE_NUMBER_MIN_PICKS || value > HIT_THE_NUMBER_MAX_PICKS) {
    throw new Error(
      `Hit the Number pick count must be ${HIT_THE_NUMBER_MIN_PICKS}-${HIT_THE_NUMBER_MAX_PICKS}.`,
    );
  }
  return value;
}

export function hitTheNumberRandomPoolSize(pickCount: number) {
  validatePickCount(pickCount);
  return Math.min(HIT_THE_NUMBER_DEFAULT_RANDOM_POOL_SIZE, pickCount * 2);
}

function weightedValue<T>(
  rows: readonly { value: T; weight: number }[],
  random: () => number,
): T {
  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  if (!(totalWeight > 0)) throw new Error("Hit the Number generation weights are invalid.");
  let cursor = random() * totalWeight;
  for (const row of rows) {
    cursor -= row.weight;
    if (cursor < 0) return row.value;
  }
  return rows[rows.length - 1]!.value;
}

function positiveFighterCount(
  statId: HitTheNumberStatId,
  filter: HitTheNumberEligibilityFilter,
  statRows: readonly HitTheNumberStatRow[],
) {
  const rowsById = rowMap(statRows);
  return hitTheNumberEligibleFighters(statId, filter, statRows).filter(
    (fighter) => valueFor(rowsById, fighter.id, statId) > 0,
  ).length;
}

function availableDivisionFilters(
  statId: HitTheNumberStatId,
  statRows: readonly HitTheNumberStatRow[],
  boardType: HitTheNumberBoardType,
) {
  const divisions = new Set(playFighters.flatMap((fighter) => fighter.divisions));
  return [...divisions]
    .filter((division) => {
      const filter = { division };
      const eligible = hitTheNumberEligibleFighters(statId, filter, statRows);
      return positiveFighterCount(statId, filter, statRows) >= HIT_THE_NUMBER_MIN_PICKS
        && (boardType === "open-roster" || eligible.length >= hitTheNumberRandomPoolSize(HIT_THE_NUMBER_MIN_PICKS));
    })
    .sort((left, right) => left.localeCompare(right));
}

function findExactSolution(
  fighters: readonly PlayFighter[],
  statId: HitTheNumberStatId,
  target: number,
  pickCount: number,
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
  random: () => number,
) {
  const candidates = shuffleLineup(
    fighters.filter((fighter) => valueFor(rowsById, fighter.id, statId) > 0),
    random,
  );
  const sums = Array.from({ length: pickCount + 1 }, () => new Map<number, string[]>());
  sums[0]!.set(0, []);

  for (const fighter of candidates) {
    const value = valueFor(rowsById, fighter.id, statId);
    for (let count = pickCount - 1; count >= 0; count -= 1) {
      for (const [sum, fighterIds] of [...sums[count]!.entries()]) {
        const next = sum + value;
        if (next > target || sums[count + 1]!.has(next)) continue;
        sums[count + 1]!.set(next, [...fighterIds, fighter.id]);
      }
    }
  }

  return sums[pickCount]!.get(target) ?? null;
}

function generatedSolution(
  fighters: readonly PlayFighter[],
  statId: HitTheNumberStatId,
  pickCount: number,
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
  random: () => number,
) {
  const positive = fighters.filter((fighter) => valueFor(rowsById, fighter.id, statId) > 0);
  if (positive.length < pickCount) {
    throw new Error(`Not enough positive ${statId} fighters to build a ${pickCount}-pick board.`);
  }
  return shuffleLineup(positive, random).slice(0, pickCount).map((fighter) => fighter.id);
}

function solutionTotal(
  fighterIds: readonly string[],
  statId: HitTheNumberStatId,
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
) {
  return fighterIds.reduce((sum, fighterId) => sum + valueFor(rowsById, fighterId, statId), 0);
}

export function createHitTheNumberBoard(options: CreateHitTheNumberBoardOptions): HitTheNumberBoard {
  const filter = { ...options.filter };
  const filterSeed = `${filter.gender ?? "all"}|${filter.division ?? "all"}`;
  const random = seededLineupRandom(
    "hit-the-number",
    options.seed,
    options.statId,
    options.boardType,
    filterSeed,
  );
  const statRows = options.statRows ?? hitTheNumberStatRows;
  const rowsById = rowMap(statRows);
  const eligible = hitTheNumberEligibleFighters(options.statId, filter, statRows);

  if (eligible.length < HIT_THE_NUMBER_MIN_PICKS) {
    throw new Error(`Not enough eligible fighters for ${options.statId}.`);
  }

  if (options.target != null && (!Number.isInteger(options.target) || options.target <= 0)) {
    throw new Error("Hit the Number target must be a positive integer.");
  }

  let pickCount: number;
  let solutionFighterIds: string[] | null = null;

  if (options.target != null) {
    const candidatePickCounts = options.pickCount != null
      ? [validatePickCount(options.pickCount)]
      : shuffleLineup(
          Array.from(
            { length: HIT_THE_NUMBER_MAX_PICKS - HIT_THE_NUMBER_MIN_PICKS + 1 },
            (_, index) => HIT_THE_NUMBER_MIN_PICKS + index,
          ),
          random,
        );

    pickCount = candidatePickCounts[0]!;
    for (const candidatePickCount of candidatePickCounts) {
      if (eligible.length < candidatePickCount) continue;
      const solution = findExactSolution(
        eligible,
        options.statId,
        options.target,
        candidatePickCount,
        rowsById,
        random,
      );
      if (!solution) continue;
      pickCount = candidatePickCount;
      solutionFighterIds = solution;
      break;
    }

    if (!solutionFighterIds) {
      throw new Error(`No exact ${options.statId} solution exists for target ${options.target}.`);
    }
  } else {
    const positiveCount = eligible.filter(
      (fighter) => valueFor(rowsById, fighter.id, options.statId) > 0,
    ).length;
    const maximumGeneratedPicks = Math.min(HIT_THE_NUMBER_MAX_PICKS, positiveCount);
    if (maximumGeneratedPicks < HIT_THE_NUMBER_MIN_PICKS) {
      throw new Error(`Not enough positive ${options.statId} fighters to build a Hit the Number board.`);
    }
    pickCount = validatePickCount(
      options.pickCount
        ?? HIT_THE_NUMBER_MIN_PICKS
          + Math.floor(random() * (maximumGeneratedPicks - HIT_THE_NUMBER_MIN_PICKS + 1)),
    );
    solutionFighterIds = generatedSolution(
      eligible,
      options.statId,
      pickCount,
      rowsById,
      random,
    );
  }

  const target = options.target ?? solutionTotal(solutionFighterIds, options.statId, rowsById);
  let fighterIds: string[];

  if (options.boardType === "open-roster") {
    fighterIds = eligible.map((fighter) => fighter.id);
  } else {
    const requestedPoolSize = options.randomPoolSize ?? hitTheNumberRandomPoolSize(pickCount);
    if (!Number.isInteger(requestedPoolSize) || requestedPoolSize <= pickCount) {
      throw new Error("Random Hit the Number pool must include at least one decoy.");
    }
    if (requestedPoolSize > HIT_THE_NUMBER_DEFAULT_RANDOM_POOL_SIZE) {
      throw new Error(`Random Hit the Number pool cannot exceed ${HIT_THE_NUMBER_DEFAULT_RANDOM_POOL_SIZE} fighters.`);
    }
    if (eligible.length < requestedPoolSize) {
      throw new Error(`Random Hit the Number pool needs ${requestedPoolSize} eligible fighters to preserve decoys.`);
    }
    const solutionSet = new Set(solutionFighterIds);
    const extras = shuffleLineup(
      eligible.filter((fighter) => !solutionSet.has(fighter.id)),
      random,
    ).slice(0, requestedPoolSize - solutionFighterIds.length);
    fighterIds = shuffleLineup(
      [...solutionFighterIds, ...extras.map((fighter) => fighter.id)],
      random,
    );
  }

  return {
    publicSetup: {
      version: HIT_THE_NUMBER_VERSION,
      statId: options.statId,
      boardType: options.boardType,
      target,
      pickCount,
      filter,
      fighterIds,
    },
    privateSetup: {
      solutionFighterIds: [...solutionFighterIds],
    },
  };
}

export function createGeneratedHitTheNumberBoard(
  options: CreateGeneratedHitTheNumberBoardOptions,
): HitTheNumberBoard {
  const statRows = options.statRows ?? hitTheNumberStatRows;
  const random = seededLineupRandom(
    "hit-the-number-generated",
    options.seed,
    options.boardType,
  );
  const statId = weightedValue(HIT_THE_NUMBER_GENERATION_PROFILE.stats, random);
  const divisions = availableDivisionFilters(statId, statRows, options.boardType);
  const filterKind = weightedValue(
    divisions.length > 0
      ? HIT_THE_NUMBER_GENERATION_PROFILE.filters
      : [{ value: "all" as const, weight: 100 }],
    random,
  );
  const filter: HitTheNumberEligibilityFilter = filterKind === "division"
    ? { division: divisions[Math.floor(random() * divisions.length)]! }
    : {};
  const eligible = hitTheNumberEligibleFighters(statId, filter, statRows);
  const positiveCount = positiveFighterCount(statId, filter, statRows);
  const maximumPicks = Math.min(HIT_THE_NUMBER_MAX_PICKS, positiveCount);
  const pickOptions = HIT_THE_NUMBER_GENERATION_PROFILE.picks.filter(
    (row) => row.value <= maximumPicks
      && (
        options.boardType === "open-roster"
        || eligible.length >= hitTheNumberRandomPoolSize(row.value)
      ),
  );
  if (!pickOptions.length) {
    throw new Error("Hit the Number generated challenge does not have enough fighter depth.");
  }
  const pickCount = weightedValue(pickOptions, random);

  return createHitTheNumberBoard({
    seed: options.seed,
    statId,
    boardType: options.boardType,
    filter,
    pickCount,
    statRows,
  });
}

export function hitTheNumberScore({
  status,
  target,
  distance,
  pickCount,
}: {
  status: HitTheNumberResultStatus;
  target: number;
  distance: number;
  pickCount: number;
}) {
  if (!Number.isFinite(target) || target <= 0) throw new Error("Hit the Number score target must be positive.");
  validatePickCount(pickCount);
  if (!Number.isFinite(distance) || distance < 0) throw new Error("Hit the Number score distance cannot be negative.");
  if (status === "perfect") return 100;

  const averageContribution = target / pickCount;
  const rawScore = status === "bust"
    ? 75 - (50 * distance / averageContribution)
    : 100 - (50 * distance / averageContribution);
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

export function gradeHitTheNumberSelection(
  setup: HitTheNumberPublicSetup,
  selectedFighterIds: readonly string[],
  statRows: readonly HitTheNumberStatRow[] = hitTheNumberStatRows,
): HitTheNumberResult {
  if (selectedFighterIds.length !== setup.pickCount) {
    throw new Error(`Hit the Number requires exactly ${setup.pickCount} fighters.`);
  }
  if (new Set(selectedFighterIds).size !== selectedFighterIds.length) {
    throw new Error("Hit the Number selections must be unique.");
  }
  const eligible = new Set(setup.fighterIds);
  if (selectedFighterIds.some((fighterId) => !eligible.has(fighterId))) {
    throw new Error("Hit the Number selection contains an ineligible fighter.");
  }

  const rowsById = rowMap(statRows);
  const selections = selectedFighterIds.map((fighterId) => ({
    fighterId,
    value: valueFor(rowsById, fighterId, setup.statId),
  }));
  const total = selections.reduce((sum, selection) => sum + selection.value, 0);
  const status: HitTheNumberResultStatus = total === setup.target
    ? "perfect"
    : total > setup.target
      ? "bust"
      : "under";
  const distance = Math.abs(setup.target - total);

  return {
    status,
    target: setup.target,
    total,
    distance,
    score: hitTheNumberScore({
      status,
      target: setup.target,
      distance,
      pickCount: setup.pickCount,
    }),
    selections,
  };
}
