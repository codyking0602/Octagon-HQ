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

export type HitTheNumberResultStatus = "perfect" | "under" | "bust";

export interface HitTheNumberResult {
  status: HitTheNumberResultStatus;
  target: number;
  total: number;
  distance: number;
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
 * Play-only fighters do not have complete canonical fight ledgers yet. Their
 * verified factual rows can extend this same owner before the game is surfaced;
 * missing rows are excluded rather than guessed or silently defaulted.
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
    pickCount = validatePickCount(
      options.pickCount
        ?? HIT_THE_NUMBER_MIN_PICKS
          + Math.floor(random() * (HIT_THE_NUMBER_MAX_PICKS - HIT_THE_NUMBER_MIN_PICKS + 1)),
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
    const requestedPoolSize = options.randomPoolSize ?? HIT_THE_NUMBER_DEFAULT_RANDOM_POOL_SIZE;
    if (!Number.isInteger(requestedPoolSize) || requestedPoolSize < pickCount) {
      throw new Error("Random Hit the Number pool must be at least as large as the pick count.");
    }
    const poolSize = Math.min(requestedPoolSize, eligible.length);
    const solutionSet = new Set(solutionFighterIds);
    const extras = shuffleLineup(
      eligible.filter((fighter) => !solutionSet.has(fighter.id)),
      random,
    ).slice(0, poolSize - solutionFighterIds.length);
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

  return {
    status,
    target: setup.target,
    total,
    distance: Math.abs(setup.target - total),
    selections,
  };
}
