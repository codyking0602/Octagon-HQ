import {
  seededLineupRandom,
  shuffleLineup,
} from "../play/lineupModel";
import {
  getFootballRatingBand,
  type FootballRatingBand,
} from "./footballContentContract";
import type { FootballRankFiveItem } from "./footballRankFiveModel";

export type FootballComparisonTierId = FootballRatingBand;
export type FootballBlindRankArchetypeId =
  | "balanced"
  | "top-heavy"
  | "bottom-heavy"
  | "middle-cluster"
  | "chaos";
export type FootballKeepCutBoardStyleId =
  | "knife-edge"
  | "messy-middle"
  | "one-superstar"
  | "bottom-grind"
  | "classic-spread";

export interface FootballBlindRankArchetype {
  id: FootballBlindRankArchetypeId;
  name: string;
  weight: number;
  targets: readonly FootballComparisonTierId[];
  minRange: number;
}

export interface FootballBlindRankBoard {
  items: FootballRankFiveItem[];
  archetype: FootballBlindRankArchetypeId;
  badItems: number;
  attemptsUsed: number;
}

export interface FootballKeepCutBoardStyle {
  id: FootballKeepCutBoardStyleId;
  name: string;
  weight: number;
  targets: readonly FootballComparisonTierId[];
}

export interface FootballKeepCutBoard {
  items: FootballRankFiveItem[];
  style: FootballKeepCutBoardStyleId;
  badItems: number;
  eliteItems: number;
  cutoffGap: number;
  distinctTiers: number;
  attemptsUsed: number;
}

interface RatingWindow {
  minPercentile: number;
  maxPercentile: number;
}

const TIER_ORDER: readonly FootballComparisonTierId[] = [
  "elite",
  "great",
  "good",
  "average",
  "below-average",
  "bad",
];
const BLIND_RANK_BOARD_SIZE = 5;
const KEEP_CUT_BOARD_SIZE = 8;
const KEEP_COUNT = 4;
const MAX_BLIND_RANK_BAD = 1;
const MAX_KEEP_CUT_BAD = 2;
const MAX_KEEP_CUT_ELITE = 2;
const MAX_KEEP_CUT_CUTOFF_GAP = 8;
const TIGHT_KEEP_CUT_CUTOFF_GAP = 4;
const BLIND_RANK_ATTEMPTS = 120;
const KEEP_CUT_ATTEMPTS = 180;

const TARGET_WINDOWS: Record<FootballComparisonTierId, RatingWindow> = {
  elite: { minPercentile: 0, maxPercentile: 0.22 },
  great: { minPercentile: 0.08, maxPercentile: 0.4 },
  good: { minPercentile: 0.2, maxPercentile: 0.6 },
  average: { minPercentile: 0.4, maxPercentile: 0.8 },
  "below-average": { minPercentile: 0.6, maxPercentile: 0.94 },
  bad: { minPercentile: 0.76, maxPercentile: 1 },
};

export const FOOTBALL_BLIND_RANK_ARCHETYPES: readonly FootballBlindRankArchetype[] = [
  {
    id: "balanced",
    name: "Balanced",
    weight: 0.1,
    targets: ["elite", "great", "good", "average", "below-average"],
    minRange: 32,
  },
  {
    id: "top-heavy",
    name: "Top-heavy",
    weight: 0.1,
    targets: ["elite", "elite", "great", "good", "average"],
    minRange: 18,
  },
  {
    id: "bottom-heavy",
    name: "Bottom-heavy",
    weight: 0.12,
    targets: ["great", "average", "below-average", "below-average", "bad"],
    minRange: 24,
  },
  {
    id: "middle-cluster",
    name: "Middle cluster",
    weight: 0.18,
    targets: ["great", "good", "good", "average", "average"],
    minRange: 8,
  },
  {
    id: "chaos",
    name: "Chaos",
    weight: 0.5,
    targets: ["elite", "good", "average", "below-average", "bad"],
    minRange: 45,
  },
] as const;

export const FOOTBALL_KEEP_CUT_BOARD_STYLES: readonly FootballKeepCutBoardStyle[] = [
  {
    id: "knife-edge",
    name: "Knife Edge",
    weight: 0.4,
    targets: ["great", "good", "good", "good", "average", "average", "average", "below-average"],
  },
  {
    id: "messy-middle",
    name: "Messy Middle",
    weight: 0.3,
    targets: ["great", "good", "good", "average", "average", "average", "below-average", "below-average"],
  },
  {
    id: "one-superstar",
    name: "One Superstar",
    weight: 0.15,
    targets: ["elite", "good", "good", "average", "average", "average", "below-average", "below-average"],
  },
  {
    id: "bottom-grind",
    name: "Bottom Grind",
    weight: 0.1,
    targets: ["good", "average", "average", "average", "below-average", "below-average", "below-average", "bad"],
  },
  {
    id: "classic-spread",
    name: "Classic Spread",
    weight: 0.05,
    targets: ["elite", "great", "good", "average", "average", "below-average", "below-average", "bad"],
  },
] as const;

export function footballComparisonTier(itemOrRating: FootballRankFiveItem | number): FootballComparisonTierId {
  return getFootballRatingBand(typeof itemOrRating === "number" ? itemOrRating : itemOrRating.rating);
}

function sortedPool(items: readonly FootballRankFiveItem[]) {
  return [...items].sort((left, right) => right.rating - left.rating || left.id.localeCompare(right.id));
}

function percentileById(items: readonly FootballRankFiveItem[]) {
  const ordered = sortedPool(items);
  const denominator = Math.max(1, ordered.length - 1);
  return new Map(ordered.map((item, index) => [item.id, index / denominator]));
}

function tierDistance(left: FootballComparisonTierId, right: FootballComparisonTierId) {
  return Math.abs(TIER_ORDER.indexOf(left) - TIER_ORDER.indexOf(right));
}

function availableTierCount(items: readonly FootballRankFiveItem[], tier: FootballComparisonTierId) {
  return items.filter((item) => footballComparisonTier(item) === tier).length;
}

function selectionCandidates(
  pool: readonly FootballRankFiveItem[],
  targetTier: FootballComparisonTierId,
  used: ReadonlySet<string>,
  badCount: number,
  maxBad: number,
  forceAbsoluteTier: boolean,
) {
  const eligible = pool.filter((item) => (
    !used.has(item.id)
    && !(footballComparisonTier(item) === "bad" && badCount >= maxBad)
  ));
  const exact = eligible.filter((item) => footballComparisonTier(item) === targetTier);
  if (forceAbsoluteTier) return exact;

  const percentiles = percentileById(pool);
  const window = TARGET_WINDOWS[targetTier];
  const inWindow = eligible.filter((item) => {
    const percentile = percentiles.get(item.id) ?? 0.5;
    return percentile >= window.minPercentile && percentile <= window.maxPercentile;
  });
  const combined = [...exact, ...inWindow]
    .filter((item, index, rows) => rows.findIndex((candidate) => candidate.id === item.id) === index);
  if (combined.length) return combined;

  const minimumDistance = Math.min(...eligible.map((item) => (
    tierDistance(footballComparisonTier(item), targetTier)
  )));
  return eligible.filter((item) => tierDistance(footballComparisonTier(item), targetTier) === minimumDistance);
}

function chooseItem(
  pool: readonly FootballRankFiveItem[],
  targetTier: FootballComparisonTierId,
  used: ReadonlySet<string>,
  badCount: number,
  maxBad: number,
  random: () => number,
  forceAbsoluteTier = false,
) {
  return shuffleLineup(
    selectionCandidates(pool, targetTier, used, badCount, maxBad, forceAbsoluteTier),
    random,
  )[0] ?? null;
}

function requiredBlindRankRange(
  items: readonly FootballRankFiveItem[],
  archetype: FootballBlindRankArchetype,
) {
  const ratings = items.map((item) => item.rating);
  const poolRange = Math.max(...ratings) - Math.min(...ratings);
  return Math.min(archetype.minRange, Math.max(8, Math.floor(poolRange * 0.75)));
}

export function footballBlindRankArchetypeForSeed(scopeId: string, seed: string) {
  const random = seededLineupRandom("football-rank-five", "archetype", scopeId, seed);
  let cursor = random();
  for (const archetype of FOOTBALL_BLIND_RANK_ARCHETYPES) {
    cursor -= archetype.weight;
    if (cursor <= 0) return archetype;
  }
  return FOOTBALL_BLIND_RANK_ARCHETYPES.at(-1)!;
}

function attemptBlindRankBoard(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
  archetype: FootballBlindRankArchetype,
  attempt: number,
) {
  const random = seededLineupRandom("football-rank-five", scopeId, seed, archetype.id, attempt);
  const used = new Set<string>();
  const selected: FootballRankFiveItem[] = [];
  let badCount = 0;

  for (const targetTier of archetype.targets) {
    const picked = chooseItem(items, targetTier, used, badCount, MAX_BLIND_RANK_BAD, random);
    if (!picked) return null;
    selected.push(picked);
    used.add(picked.id);
    badCount += footballComparisonTier(picked) === "bad" ? 1 : 0;
  }

  const ratings = selected.map((item) => item.rating);
  if (Math.max(...ratings) - Math.min(...ratings) < requiredBlindRankRange(items, archetype)) return null;
  return {
    items: shuffleLineup(selected, random),
    badItems: badCount,
  };
}

export function buildFootballBlindRankBoard(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
  requestedArchetypeId?: FootballBlindRankArchetypeId,
): FootballBlindRankBoard {
  if (items.length < BLIND_RANK_BOARD_SIZE) {
    throw new Error(`Football Blind Rank needs at least ${BLIND_RANK_BOARD_SIZE} comparison subjects.`);
  }
  const archetype = requestedArchetypeId
    ? FOOTBALL_BLIND_RANK_ARCHETYPES.find((row) => row.id === requestedArchetypeId)
    : footballBlindRankArchetypeForSeed(scopeId, seed);
  if (!archetype) throw new Error(`Unsupported Football Blind Rank archetype: ${String(requestedArchetypeId)}`);

  for (let attempt = 0; attempt < BLIND_RANK_ATTEMPTS; attempt += 1) {
    const board = attemptBlindRankBoard(items, scopeId, seed, archetype, attempt);
    if (!board) continue;
    return {
      ...board,
      archetype: archetype.id,
      attemptsUsed: attempt + 1,
    };
  }

  throw new Error(`Football Blind Rank could not build a ${archetype.name} five-subject board for ${scopeId}.`);
}

export function footballKeepCutBoardStyleForSeed(scopeId: string, seed: string) {
  const random = seededLineupRandom("football-keep-cut", "board-style", scopeId, seed);
  let cursor = random();
  for (const style of FOOTBALL_KEEP_CUT_BOARD_STYLES) {
    cursor -= style.weight;
    if (cursor <= 0) return style;
  }
  return FOOTBALL_KEEP_CUT_BOARD_STYLES.at(-1)!;
}

function desiredEliteCount(
  styleId: FootballKeepCutBoardStyleId,
  availableElite: number,
  random: () => number,
) {
  if (availableElite <= 0) return 0;
  const roll = random();
  let requested = 0;
  switch (styleId) {
    case "knife-edge":
      requested = roll < 0.125 ? 2 : roll < 0.375 ? 1 : 0;
      break;
    case "messy-middle":
      requested = roll < (1 / 6) ? 1 : 0;
      break;
    case "one-superstar":
    case "classic-spread":
      requested = 1;
      break;
    case "bottom-grind":
      requested = 0;
      break;
  }
  if (requested === 0) return 0;
  if (availableElite === 1 && random() >= 0.55) return 0;
  return Math.min(requested, availableElite, MAX_KEEP_CUT_ELITE);
}

function desiredBadCount(
  styleId: FootballKeepCutBoardStyleId,
  availableBad: number,
  random: () => number,
) {
  if (availableBad <= 0) return 0;
  const depthScale = Math.min(1, availableBad / 2);
  const roll = random();
  switch (styleId) {
    case "knife-edge":
      return roll < 0.15 * depthScale ? 1 : 0;
    case "messy-middle":
      return roll < 0.45 * depthScale ? 1 : 0;
    case "one-superstar":
      return roll < 0.35 * depthScale ? 1 : 0;
    case "bottom-grind":
      return availableBad >= 2 && roll < 0.5 ? 2 : 1;
    case "classic-spread":
      return 1;
  }
}

function replaceHighestTargets(
  targets: FootballComparisonTierId[],
  tier: FootballComparisonTierId,
  count: number,
) {
  const already = targets.filter((target) => target === tier).length;
  for (let index = 0; index < count - already; index += 1) {
    const replaceAt = targets.findIndex((target) => target !== tier && target !== "bad");
    if (replaceAt >= 0) targets[replaceAt] = tier;
  }
}

function replaceLowestTargets(
  targets: FootballComparisonTierId[],
  tier: FootballComparisonTierId,
  count: number,
) {
  const already = targets.filter((target) => target === tier).length;
  for (let index = 0; index < count - already; index += 1) {
    let replaceAt = -1;
    for (let targetIndex = targets.length - 1; targetIndex >= 0; targetIndex -= 1) {
      if (targets[targetIndex] !== tier && targets[targetIndex] !== "elite") {
        replaceAt = targetIndex;
        break;
      }
    }
    if (replaceAt >= 0) targets[replaceAt] = tier;
  }
}

function keepCutProfileForSeed(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
  style: FootballKeepCutBoardStyle,
) {
  const random = seededLineupRandom("football-keep-cut", "board-profile", scopeId, seed, style.id);
  const eliteCount = desiredEliteCount(style.id, availableTierCount(items, "elite"), random);
  const badCount = desiredBadCount(style.id, availableTierCount(items, "bad"), random);
  const targets = [...style.targets];

  replaceHighestTargets(targets, "elite", eliteCount);
  while (targets.filter((target) => target === "elite").length > eliteCount) {
    const index = targets.lastIndexOf("elite");
    targets[index] = style.id === "classic-spread" ? "great" : "good";
  }

  replaceLowestTargets(targets, "bad", badCount);
  while (targets.filter((target) => target === "bad").length > badCount) {
    const index = targets.indexOf("bad");
    targets[index] = "below-average";
  }

  return { targets, eliteCount, badCount };
}

function countTier(items: readonly FootballRankFiveItem[], tier: FootballComparisonTierId) {
  return items.filter((item) => footballComparisonTier(item) === tier).length;
}

export function footballKeepCutBoardIsCompetitive(items: readonly FootballRankFiveItem[]) {
  if (items.length !== KEEP_CUT_BOARD_SIZE) return false;
  if (new Set(items.map((item) => item.id)).size !== KEEP_CUT_BOARD_SIZE) return false;
  const ordered = sortedPool(items);
  const coreChoices = items.filter((item) => {
    const tier = footballComparisonTier(item);
    return tier === "good" || tier === "average" || tier === "below-average";
  }).length;
  const elite = countTier(items, "elite");
  const bad = countTier(items, "bad");
  const distinctTiers = new Set(items.map(footballComparisonTier)).size;
  const cutoffGap = Math.abs(ordered[KEEP_COUNT - 1]!.rating - ordered[KEEP_COUNT]!.rating);

  return (
    coreChoices >= 4
    && elite <= MAX_KEEP_CUT_ELITE
    && bad <= MAX_KEEP_CUT_BAD
    && distinctTiers >= 3
    && cutoffGap <= MAX_KEEP_CUT_CUTOFF_GAP
  );
}

function attemptKeepCutBoard(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
  style: FootballKeepCutBoardStyle,
  targets: readonly FootballComparisonTierId[],
  eliteCount: number,
  badCount: number,
  attempt: number,
) {
  const random = seededLineupRandom("football-keep-cut", scopeId, seed, style.id, attempt);
  const used = new Set<string>();
  const selected: FootballRankFiveItem[] = [];
  let selectedBad = 0;

  for (const targetTier of targets) {
    const forceAbsoluteTier = targetTier === "elite" || targetTier === "bad";
    const picked = chooseItem(
      items,
      targetTier,
      used,
      selectedBad,
      MAX_KEEP_CUT_BAD,
      random,
      forceAbsoluteTier,
    );
    if (!picked) return null;
    selected.push(picked);
    used.add(picked.id);
    selectedBad += footballComparisonTier(picked) === "bad" ? 1 : 0;
  }

  if (countTier(selected, "elite") !== eliteCount || countTier(selected, "bad") !== badCount) return null;
  if (!footballKeepCutBoardIsCompetitive(selected)) return null;
  const ordered = sortedPool(selected);
  return {
    items: shuffleLineup(selected, random),
    badItems: badCount,
    eliteItems: eliteCount,
    cutoffGap: Math.abs(ordered[KEEP_COUNT - 1]!.rating - ordered[KEEP_COUNT]!.rating),
    distinctTiers: new Set(selected.map(footballComparisonTier)).size,
  };
}

export function buildFootballKeepCutBoard(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
): FootballKeepCutBoard {
  if (items.length < KEEP_CUT_BOARD_SIZE) {
    throw new Error(`Football Keep/Cut needs at least ${KEEP_CUT_BOARD_SIZE} comparison subjects.`);
  }
  const style = footballKeepCutBoardStyleForSeed(scopeId, seed);
  const profile = keepCutProfileForSeed(items, scopeId, seed, style);
  let best: (Omit<FootballKeepCutBoard, "style" | "attemptsUsed"> & { attempt: number }) | null = null;

  for (let attempt = 0; attempt < KEEP_CUT_ATTEMPTS; attempt += 1) {
    const board = attemptKeepCutBoard(
      items,
      scopeId,
      seed,
      style,
      profile.targets,
      profile.eliteCount,
      profile.badCount,
      attempt,
    );
    if (!board) continue;
    if (!best || board.cutoffGap < best.cutoffGap) best = { ...board, attempt };
    if (board.cutoffGap <= TIGHT_KEEP_CUT_CUTOFF_GAP) {
      return { ...board, style: style.id, attemptsUsed: attempt + 1 };
    }
  }

  if (best) {
    const { attempt, ...board } = best;
    return { ...board, style: style.id, attemptsUsed: attempt + 1 };
  }
  throw new Error(`Football Keep/Cut could not build a ${style.name} eight-subject board for ${scopeId}.`);
}
