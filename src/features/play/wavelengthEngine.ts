import {
  WAVELENGTH_CALIBRATION_VERSION,
  WAVELENGTH_CATALOG_VERSION,
  WAVELENGTH_GENERATOR_VERSION,
  WAVELENGTH_REVEAL_CONTRACT_VERSION,
  approvedWavelengthCatalog,
  type WavelengthCategory,
} from "./wavelengthCatalog";

export const WAVELENGTH_CONTRACT_VERSIONS = {
  catalog: WAVELENGTH_CATALOG_VERSION,
  calibration: WAVELENGTH_CALIBRATION_VERSION,
  generator: WAVELENGTH_GENERATOR_VERSION,
  reveal: WAVELENGTH_REVEAL_CONTRACT_VERSION,
} as const;

export interface WavelengthClue {
  id: string;
  category: WavelengthCategory;
  text: string;
  rating: number;
}

export interface WavelengthRound {
  target: number;
  clues: WavelengthClue[];
  versions?: typeof WAVELENGTH_CONTRACT_VERSIONS;
}

export interface WavelengthRecentHistory {
  clueIds?: readonly string[];
  categories?: readonly WavelengthCategory[];
  targets?: readonly number[];
  clueSequenceKeys?: readonly string[];
}

export const wavelengthTargets = [18, 27, 31, 35, 43, 47, 50, 56, 60, 62, 65, 67, 70, 72, 75, 77, 79, 82, 84, 85, 88, 91] as const;

export const wavelengthClues: readonly WavelengthClue[] = approvedWavelengthCatalog.map(({ id, category, text, rating }) => ({
  id,
  category,
  text,
  rating,
}));

export function clampWavelength(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

export function wavelengthScore(guess: number, target: number) {
  return Math.max(0, 100 - Math.abs(guess - target));
}

export function wavelengthDistanceCopy(distance: number) {
  if (distance === 0) return "NAILED IT";
  if (distance === 1) return "ONE POINT OFF";
  if (distance <= 3) return `${distance} POINTS OFF · ELITE READ`;
  if (distance <= 7) return `${distance} POINTS OFF · CLOSE`;
  return `${distance} POINTS OFF`;
}

export function desiredWavelengthCorrection(target: number, guess: number, nextClueIndex: number, random = Math.random) {
  const error = target - guess;
  if (Math.abs(error) <= 2) return clampWavelength(target + (random() > 0.5 ? 2 : -2));
  const factors = [0, 0.36, 0.5, 0.62];
  const factor = factors[nextClueIndex] ?? 0.5;
  const push = Math.max(4, Math.min(22, Math.round(Math.abs(error) * factor)));
  return clampWavelength(target + (Math.sign(error) * push));
}

function relax<T>(preferred: readonly T[], relaxed: readonly T[]) {
  return preferred.length ? preferred : relaxed;
}

export function chooseWavelengthClue(
  desiredRating: number,
  options: {
    target: number;
    direction?: number;
    usedIds?: readonly string[];
    usedCategories?: readonly WavelengthCategory[];
    recent?: WavelengthRecentHistory;
    random?: () => number;
  },
) {
  const random = options.random ?? Math.random;
  const usedIds = new Set(options.usedIds ?? []);
  const recentIds = new Set(options.recent?.clueIds ?? []);
  const usedCategories = new Set(options.usedCategories ?? []);
  const recentCategories = new Set(options.recent?.categories ?? []);
  let candidates: readonly WavelengthClue[] = wavelengthClues.filter((clue) => !usedIds.has(clue.id));
  candidates = relax(candidates.filter((clue) => !recentIds.has(clue.id)), candidates);
  if ((options.direction ?? 0) > 0) {
    candidates = relax(candidates.filter((clue) => clue.rating > options.target), candidates);
  } else if ((options.direction ?? 0) < 0) {
    candidates = relax(candidates.filter((clue) => clue.rating < options.target), candidates);
  }
  return [...candidates]
    .map((clue) => ({
      clue,
      score: Math.abs(clue.rating - desiredRating)
        + (usedCategories.has(clue.category) ? 18 : 0)
        + (recentCategories.has(clue.category) ? 6 : 0)
        + random() * 2.5,
    }))
    .sort((left, right) => left.score - right.score)[0]?.clue ?? wavelengthClues[0];
}

export function wavelengthSequenceKey(round: WavelengthRound) {
  return [round.target, ...round.clues.map((clue) => clue.id)].join("|");
}

export function createWavelengthRound(options: number | {
  previousTarget?: number;
  recent?: WavelengthRecentHistory;
  random?: () => number;
} = 0, randomArg = Math.random): WavelengthRound {
  const previousTarget = typeof options === "number" ? options : options.previousTarget ?? 0;
  const random = typeof options === "number" ? randomArg : options.random ?? Math.random;
  const recent = typeof options === "number" ? undefined : options.recent;
  const recentTargets = new Set([previousTarget, ...(recent?.targets ?? [])]);
  let targets: readonly number[] = wavelengthTargets.filter((target) => !recentTargets.has(target));
  targets = relax(targets, wavelengthTargets.filter((target) => target !== previousTarget));
  const target = targets[Math.floor(random() * targets.length)] ?? 65;
  const firstClue = chooseWavelengthClue(clampWavelength(target + (random() > 0.5 ? 3 : -3)), {
    target,
    recent,
    random,
  });
  return { target, clues: [firstClue], versions: WAVELENGTH_CONTRACT_VERSIONS };
}

export function nextWavelengthClue(
  round: WavelengthRound,
  lastGuess: number,
  nextClueIndex: number,
  random = Math.random,
  recent?: WavelengthRecentHistory,
) {
  const direction = Math.sign(round.target - lastGuess);
  const desired = desiredWavelengthCorrection(round.target, lastGuess, nextClueIndex, random);
  return chooseWavelengthClue(desired, {
    target: round.target,
    direction,
    usedIds: round.clues.map((clue) => clue.id),
    usedCategories: round.clues.map((clue) => clue.category),
    recent,
    random,
  });
}
