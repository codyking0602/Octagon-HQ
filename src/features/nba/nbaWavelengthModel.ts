import {
  desiredWavelengthCorrection,
  wavelengthTargets,
  WAVELENGTH_TARGET_POLICY_VERSION,
} from "../play/wavelengthEngine";
import {
  dailyLineupIdentity,
  loadLineupHistory,
  seededLineupRandom,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import {
  NBA_WAVELENGTH_CALIBRATION_VERSION,
  NBA_WAVELENGTH_CATALOG_VERSION,
  nbaWavelengthClues,
  type NbaWavelengthCatalogClue,
  type NbaWavelengthCategory,
  type NbaWavelengthEra,
} from "./nbaWavelengthCatalog";

export const NBA_WAVELENGTH_GAME_ID = "nba-wavelength" as const;
export const NBA_WAVELENGTH_GAME_VERSION = "nba-wavelength-v1" as const;
export const NBA_WAVELENGTH_TARGET_POLICY_VERSION = WAVELENGTH_TARGET_POLICY_VERSION;
export const NBA_WAVELENGTH_VERSIONS = {
  game: NBA_WAVELENGTH_GAME_VERSION,
  catalog: NBA_WAVELENGTH_CATALOG_VERSION,
  calibration: NBA_WAVELENGTH_CALIBRATION_VERSION,
  targetPolicy: NBA_WAVELENGTH_TARGET_POLICY_VERSION,
} as const;

export type NbaWavelengthClue = NbaWavelengthCatalogClue;
export type NbaWavelengthRound = { target: number; clues: NbaWavelengthClue[] };
export type NbaWavelengthBoard = {
  seed: string;
  rounds: [NbaWavelengthRound, NbaWavelengthRound];
  identity: PlayLineupIdentity;
  versions: typeof NBA_WAVELENGTH_VERSIONS;
};
export type NbaWavelengthHistory = {
  clueIds?: readonly string[];
  subjects?: readonly string[];
  targets?: readonly number[];
};
export type NbaWavelengthCompletedRound = {
  score: number;
  target: number;
  finalGuess: number;
  guesses: number[];
  clues: NbaWavelengthClue[];
};

function selectClue(
  desired: number,
  target: number,
  random: () => number,
  options: {
    direction?: number;
    used?: readonly NbaWavelengthClue[];
    excluded?: NbaWavelengthHistory;
  } = {},
): NbaWavelengthClue {
  const used = options.used ?? [];
  const usedIds = new Set(used.map(row => row.id));
  const usedSubjects = new Set(used.map(row => row.subject));
  const usedCategories = new Set(used.map(row => row.category));
  const usedEras = new Set(used.map(row => row.era));
  const recentIds = new Set(options.excluded?.clueIds ?? []);
  const recentSubjects = new Set(options.excluded?.subjects ?? []);
  // Hard rule: distinct categories AND distinct canonical subjects within a
  // round. Relax recent history and direction, never this identity safety rule.
  let candidates = nbaWavelengthClues.filter(clue => (
    !usedIds.has(clue.id)
    && !usedSubjects.has(clue.subject)
    && !usedCategories.has(clue.category)
  ));
  if (!candidates.length) throw new Error("NBA Wavelength category/subject pool exhausted.");
  const nonRecent = candidates.filter(clue => !recentIds.has(clue.id) && !recentSubjects.has(clue.subject));
  if (nonRecent.length) candidates = nonRecent;
  if (options.direction && Math.abs(desired - target) > 0) {
    const directional = candidates.filter(clue => (
      options.direction! > 0 ? clue.rating > target : clue.rating < target
    ));
    if (directional.length) candidates = directional;
  }
  return [...candidates]
    .map(clue => ({
      clue,
      cost: Math.abs(clue.rating - desired) + (usedEras.has(clue.era) ? 2.5 : 0) + random() * 4,
    }))
    .sort((a, b) => a.cost - b.cost || a.clue.id.localeCompare(b.clue.id))[0]!.clue;
}

export function createNbaWavelengthRound(
  seed: string,
  excluded: NbaWavelengthHistory = {},
): NbaWavelengthRound {
  const random = seededLineupRandom(NBA_WAVELENGTH_GAME_ID, "round", NBA_WAVELENGTH_CATALOG_VERSION, seed);
  const targets = wavelengthTargets.filter(target => !(excluded.targets ?? []).includes(target));
  const possible = targets.length ? targets : wavelengthTargets;
  const target = possible[Math.floor(random() * possible.length)] ?? 50;
  const opening = selectClue(target + (random() >= 0.5 ? 3 : -3), target, random, { excluded });
  return { target, clues: [opening] };
}

/**
 * The same deterministic four-clue, last-guess adaptive contract as Football.
 * Every guess path uses its own seed; no guess affects the locked hidden target.
 */
export function nextNbaWavelengthClue(
  round: NbaWavelengthRound,
  lastGuess: number,
  nextClueIndex: number,
  seed: string,
  priorGuesses: readonly number[],
  excluded: NbaWavelengthHistory = {},
): NbaWavelengthClue {
  if (!Number.isInteger(nextClueIndex) || nextClueIndex < 1 || nextClueIndex > 3
    || round.clues.length !== nextClueIndex) {
    throw new Error("NBA Wavelength expects precisely four sequential clues.");
  }
  const random = seededLineupRandom(
    NBA_WAVELENGTH_GAME_ID, "adaptive", NBA_WAVELENGTH_CATALOG_VERSION,
    seed, nextClueIndex, ...priorGuesses, lastGuess,
  );
  const desired = desiredWavelengthCorrection(round.target, lastGuess, nextClueIndex);
  return selectClue(desired, round.target, random, {
    used: round.clues,
    direction: Math.sign(round.target - lastGuess),
    excluded,
  });
}

export function nbaWavelengthDay(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find(value => value.type === type)?.value ?? "";
  return part("year") + "-" + part("month") + "-" + part("day");
}

function makeRounds(seed: string, excluded: NbaWavelengthHistory): [NbaWavelengthRound, NbaWavelengthRound] {
  const first = createNbaWavelengthRound(seed + "|game-1", excluded);
  const excludedSecond: NbaWavelengthHistory = {
    clueIds: [...(excluded.clueIds ?? []), first.clues[0]!.id],
    subjects: [...(excluded.subjects ?? []), first.clues[0]!.subject],
    targets: [...(excluded.targets ?? []), first.target],
  };
  // Make the two games noticeably different even when a seed happens to favor
  // the same category. This is deterministic for a given Daily publication.
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const second = createNbaWavelengthRound(seed + "|game-2|" + attempt, excludedSecond);
    if (second.clues[0]?.category !== first.clues[0]?.category
      && second.clues[0]?.subject !== first.clues[0]?.subject
      && Math.abs(second.target - first.target) >= 12) {
      return [first, second];
    }
  }
  throw new Error("NBA Wavelength could not form two distinct games.");
}

function recentCompletionHistory(): NbaWavelengthHistory {
  const history = loadLineupHistory(NBA_WAVELENGTH_GAME_ID);
  const clues = history.entries.flatMap(entry => {
    const result = entry.result as { rounds?: NbaWavelengthCompletedRound[] } | undefined;
    return Array.isArray(result?.rounds) ? result.rounds.flatMap(round => round.clues ?? []) : [];
  });
  return {
    clueIds: [...history.recentItemIds.filter(id => id.startsWith("clue:")).map(id => id.slice(5)), ...clues.map(clue => clue.id)],
    subjects: clues.map(clue => clue.subject),
    targets: history.entries.flatMap(entry => {
      const result = entry.result as { rounds?: NbaWavelengthCompletedRound[] } | undefined;
      return Array.isArray(result?.rounds) ? result.rounds.map(round => round.target) : [];
    }),
  };
}

export function createNbaWavelengthCasualBoard(): NbaWavelengthBoard {
  const excluded = recentCompletionHistory();
  const selection = selectReplayLineup({
    gameId: NBA_WAVELENGTH_GAME_ID,
    lineupSize: 6,
    attempts: 18,
    build: seed => {
      const rounds = makeRounds(seed, excluded);
      const first = rounds[0], second = rounds[1];
      return {
        value: { seed, rounds },
        itemIds: [
          "target:" + first.target, "target:" + second.target,
          "clue:" + first.clues[0]!.id, "clue:" + second.clues[0]!.id,
          "subject:" + first.clues[0]!.subject, "subject:" + second.clues[0]!.subject,
        ],
      };
    },
  });
  return { ...selection.value, identity: selection.identity, versions: NBA_WAVELENGTH_VERSIONS };
}

/** Preview only. No official setup, attempt, streak or standings API calls. */
export function createNbaWavelengthDailyPreview(day: string): NbaWavelengthBoard {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Expected a Chicago YYYY-MM-DD day.");
  const seed = "nba-wavelength|daily|" + NBA_WAVELENGTH_CATALOG_VERSION + "|" + day;
  return {
    seed,
    rounds: makeRounds(seed, {}),
    identity: dailyLineupIdentity(NBA_WAVELENGTH_GAME_ID, day),
    versions: NBA_WAVELENGTH_VERSIONS,
  };
}

/** Editorial lint; no subjective rating is silently inferred from another trait. */
export function auditNbaWavelengthCatalog() {
  const categories = new Set<NbaWavelengthCategory>();
  const eras = new Set<NbaWavelengthEra>();
  const seen = new Set<string>();
  const failures: string[] = [];
  for (const clue of nbaWavelengthClues) {
    categories.add(clue.category);
    eras.add(clue.era);
    if (seen.has(clue.id)) failures.push("duplicate ID " + clue.id);
    if (!clue.text.includes(clue.subject)) {
      failures.push("subject missing from wording " + clue.id);
    }
    if (!Number.isInteger(clue.rating) || clue.rating < 1 || clue.rating > 100) {
      failures.push("out-of-range rating " + clue.id);
    }
    if (!clue.text.includes("—")) failures.push("missing context " + clue.id);
    seen.add(clue.id);
  }
  return {
    entries: nbaWavelengthClues.length,
    distinctSubjects: new Set(nbaWavelengthClues.map(clue => clue.subject)).size,
    categories: categories.size,
    eras: eras.size,
    failures,
  };
}
