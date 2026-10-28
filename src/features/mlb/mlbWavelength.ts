import { desiredWavelengthCorrection } from "../play/wavelengthEngine";

export type MlbWavelengthCategory =
  | "STAR POWER"
  | "HOME RUN POWER"
  | "FRANCHISE TRADITION"
  | "BALLPARK ATMOSPHERE"
  | "BASERUNNING SPEED"
  | "UNIFORM QUALITY"
  | "VILLAIN ENERGY";

export type MlbWavelengthClue = {
  id: string;
  category: MlbWavelengthCategory;
  text: string;
  rating: number;
};

export type MlbWavelengthRound = {
  target: number;
  clues: MlbWavelengthClue[];
};

type MlbWavelengthStage = {
  category: MlbWavelengthCategory;
  clues: readonly MlbWavelengthClue[];
};

export type MlbWavelengthRoundDefinition = {
  id: string;
  target: number;
  stages: readonly [
    MlbWavelengthStage,
    MlbWavelengthStage,
    MlbWavelengthStage,
    MlbWavelengthStage,
  ];
};

function stage(
  category: MlbWavelengthCategory,
  rows: readonly [id: string, text: string, rating: number][],
): MlbWavelengthStage {
  return {
    category,
    clues: rows.map(([id, text, rating]) => ({
      id,
      category,
      text,
      rating,
    })),
  };
}

/**
 * Owner-only review content. Every subject, scale, target, and clue path in
 * these rounds is permanently excluded from the scheduled MLB challenges.
 */
export const MLB_WAVELENGTH_OWNER_ROUNDS: readonly MlbWavelengthRoundDefinition[] = [
  {
    id: "mlb-wavelength-owner-1",
    target: 72,
    stages: [
      stage("STAR POWER", [
        ["star-freeman", "Freddie Freeman", 66],
        ["star-betts", "Mookie Betts", 74],
        ["star-judge", "Aaron Judge", 98],
      ]),
      stage("HOME RUN POWER", [
        ["power-jeter", "Derek Jeter", 42],
        ["power-harper", "Bryce Harper", 84],
        ["power-ortiz", "David Ortiz", 91],
      ]),
      stage("FRANCHISE TRADITION", [
        ["tradition-rays", "Tampa Bay Rays", 24],
        ["tradition-astros", "Houston Astros", 66],
        ["tradition-yankees", "New York Yankees", 100],
      ]),
      stage("BALLPARK ATMOSPHERE", [
        ["park-angels", "Angel Stadium", 44],
        ["park-dodgers", "Dodger Stadium", 80],
        ["park-fenway", "Fenway Park", 100],
      ]),
    ],
  },
  {
    id: "mlb-wavelength-owner-2",
    target: 45,
    stages: [
      stage("FRANCHISE TRADITION", [
        ["tradition-rays-2", "Tampa Bay Rays", 24],
        ["tradition-mets", "New York Mets", 47],
        ["tradition-yankees-2", "New York Yankees", 100],
      ]),
      stage("BASERUNNING SPEED", [
        ["speed-pujols", "Albert Pujols", 8],
        ["speed-ohtani", "Shohei Ohtani", 82],
        ["speed-henderson", "Rickey Henderson", 100],
      ]),
      stage("UNIFORM QUALITY", [
        ["uniform-marlins", "Miami Marlins", 38],
        ["uniform-padres", "San Diego Padres", 72],
        ["uniform-yankees", "New York Yankees", 94],
      ]),
      stage("VILLAIN ENERGY", [
        ["villain-mariners", "Seattle Mariners", 16],
        ["villain-dodgers", "Los Angeles Dodgers", 68],
        ["villain-astros", "Houston Astros", 96],
      ]),
    ],
  },
] as const;

export const MLB_WAVELENGTH_OWNER_EXCLUSIONS = {
  roundIds: MLB_WAVELENGTH_OWNER_ROUNDS.map((round) => round.id),
  clueIds: MLB_WAVELENGTH_OWNER_ROUNDS.flatMap((round) => (
    round.stages.flatMap((roundStage) => roundStage.clues.map((clue) => clue.id))
  )),
  subjects: [...new Set(MLB_WAVELENGTH_OWNER_ROUNDS.flatMap((round) => (
    round.stages.flatMap((roundStage) => roundStage.clues.map((clue) => clue.text))
  )))],
  categories: [...new Set(MLB_WAVELENGTH_OWNER_ROUNDS.flatMap((round) => (
    round.stages.map((roundStage) => roundStage.category)
  )))],
} as const;

const MLB_WAVELENGTH_DESCRIPTORS: Record<MlbWavelengthCategory, string> = {
  "STAR POWER": "baseball star power",
  "HOME RUN POWER": "home-run power",
  "FRANCHISE TRADITION": "franchise tradition",
  "BALLPARK ATMOSPHERE": "ballpark atmosphere",
  "BASERUNNING SPEED": "baserunning speed",
  "UNIFORM QUALITY": "uniform quality",
  "VILLAIN ENERGY": "baseball villain energy",
};

export function mlbWavelengthCategoryLabel(category: string) {
  return category;
}

export function mlbWavelengthClueDescriptor(category: string) {
  return MLB_WAVELENGTH_DESCRIPTORS[category as MlbWavelengthCategory] ?? "MLB scale";
}

function nearest(clues: readonly MlbWavelengthClue[], desiredRating: number) {
  return [...clues].sort((left, right) => (
    Math.abs(left.rating - desiredRating) - Math.abs(right.rating - desiredRating)
    || left.id.localeCompare(right.id)
  ))[0]!;
}

export function createMlbWavelengthRound(definition: MlbWavelengthRoundDefinition): MlbWavelengthRound {
  return {
    target: definition.target,
    clues: [nearest(definition.stages[0].clues, definition.target)],
  };
}

export function nextMlbWavelengthClue(
  definition: MlbWavelengthRoundDefinition,
  lastGuess: number,
  nextClueIndex: number,
): MlbWavelengthClue {
  const roundStage = definition.stages[nextClueIndex];
  if (!roundStage) throw new Error("MLB Wavelength requested a clue outside the four-clue round.");

  const direction = Math.sign(definition.target - lastGuess);
  const desiredRating = desiredWavelengthCorrection(definition.target, lastGuess, nextClueIndex);
  const directional = direction > 0
    ? roundStage.clues.filter((clue) => clue.rating > definition.target)
    : direction < 0
      ? roundStage.clues.filter((clue) => clue.rating < definition.target)
      : roundStage.clues;

  return nearest(directional.length ? directional : roundStage.clues, desiredRating);
}
