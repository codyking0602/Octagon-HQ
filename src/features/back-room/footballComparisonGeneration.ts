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
  minHigh?: number;
  maxHigh?: number;
  minMiddle?: number;
  maxMiddle?: number;
  minLow?: number;
  maxLow?: number;
}

export interface FootballBlindRankBoard {
  items: FootballRankFiveItem[];
  requestedArchetype: FootballBlindRankArchetypeId;
  archetype: FootballBlindRankArchetypeId;
  badItems: number;
  attemptsUsed: number;
  fallbackUsed: boolean;
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
  fallbackUsed: boolean;
}

const TIER_ORDER: readonly FootballComparisonTierId[] = [
  "elite",
  "great",
  "good",
  "average",
  "below-average",
  "bad",
];
const HIGH_TIERS = new Set<FootballComparisonTierId>(["elite", "great"]);
const MIDDLE_TIERS = new Set<FootballComparisonTierId>(["good", "average"]);
const LOW_TIERS = new Set<FootballComparisonTierId>(["below-average", "bad"]);
const BLIND_RANK_BOARD_SIZE = 5;
const KEEP_CUT_BOARD_SIZE = 8;
const KEEP_COUNT = 4;
const MAX_BLIND_RANK_BAD = 1;
const MAX_KEEP_CUT_BAD = 2;
const MAX_KEEP_CUT_ELITE = 2;
const MAX_KEEP_CUT_CUTOFF_GAP = 8;
const BLIND_RANK_ATTEMPTS = 100;
const KEEP_CUT_ATTEMPTS = 180;

export const FOOTBALL_BLIND_RANK_ARCHETYPES: readonly FootballBlindRankArchetype[] = [
  {
    id: "balanced",
    name: "Balanced",
    weight: 0.1,
    targets: ["elite", "great", "good", "average", "below-average"],
    minRange: 32,
    minHigh: 1,
    maxHigh: 2,
    minMiddle: 2,
    minLow: 1,
    maxLow: 2,
  },
  {
    id: "top-heavy",
    name: "Top-heavy",
    weight: 0.1,
    targets: ["elite", "elite", "great", "good", "average"],
    minRange: 18,
    minHigh: 3,
    maxHigh: 4,
    minMiddle: 1,
    minLow: 0,
    maxLow: 0,
  },
  {
    id: "bottom-heavy",
    name: "Bottom-heavy",
    weight: 0.12,
    targets: ["great", "average", "below-average", "below-average", "bad"],
    minRange: 24,
    minHigh: 1,
    maxHigh: 2,
    minMiddle: 1,
    minLow: 3,
    maxLow: 4,
  },
  {
    id: "middle-cluster",
    name: "Middle cluster",
    weight: 0.18,
    targets: ["great", "good", "good", "average", "average"],
    minRange: 8,
    minHigh: 0,
    maxHigh: 1,
    minMiddle: 4,
    maxMiddle: 5,
    minLow: 0,
    maxLow: 0,
  },
  {
    id: "chaos",
    name: "Chaos",
    weight: 0.5,
    targets: ["elite", "good", "average", "below-average", "bad"],
    minRange: 45,
    minHigh: 1,
    maxHigh: 2,
    minMiddle: 2,
    minLow: 2,
    maxLow: 2,
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

const BLIND_RANK_ARCHETYPE_FALLBACKS: Record<FootballBlindRankArchetypeId, readonly FootballBlindRankArchetypeId[]> = {
  balanced: ["chaos", "bottom-heavy"],
  "top-heavy": ["middle-cluster"],
  "bottom-heavy": ["chaos", "balanced"],
  "middle-cluster": ["top-heavy"],
  chaos: ["bottom-heavy", "balanced"],
};

export function footballComparisonTier(itemOrRating: FootballRankFiveItem | number): FootballComparisonTierId {
  return getFootballRatingBand(typeof itemOrRating === "number" ? itemOrRating : itemOrRating.rating);
}

function bandCounts(items: readonly FootballRankFiveItem[]) {
  return items.reduce((counts, item) => {
    const tier = footballComparisonTier(item);
    if (HIGH_TIERS.has(tier)) counts.high += 1;
    if (MIDDLE_TIERS.has(tier)) counts.middle += 1;
    if (LOW_TIERS.has(tier)) counts.low += 1;
    if (tier === "bad") counts.bad += 1;
    if (tier === "elite") counts.elite += 1;
    return counts;
  }, { high: 0, middle: 0, low: 0, bad: 0, elite: 0 });
}

function tierDistance(left: FootballComparisonTierId, right: FootballComparisonTierId) {
  return Math.abs(TIER_ORDER.indexOf(left) - TIER_ORDER.indexOf(right));
}

function chooseTierItem(
  items: readonly FootballRankFiveItem[],
  targetTier: FootballComparisonTierId,
  used: ReadonlySet<string>,
  badCount: number,
  maxBad: number,
  random: () => number,
) {
  const eligible = items.filter((item) => (
    !used.has(item.id)
    && !(footballComparisonTier(item) === "bad" && badCount >= maxBad)
  ));
  const exact = shuffleLineup(
    eligible.filter((item) => footballComparisonTier(item) === targetTier),
    random,
  )[0];
  if (exact) return { item: exact, exact: true };

  const adjacent = shuffleLineup(eligible, random)
    .filter((item) => targetTier === "bad" || footballComparisonTier(item) !== "bad")
    .sort((left, right) => (
      tierDistance(footballComparisonTier(left), targetTier)
      - tierDistance(footballComparisonTier(right), targetTier)
    ))[0];
  return adjacent ? { item: adjacent, exact: false } : null;
}

function validateBlindRankBoard(
  archetype: FootballBlindRankArchetype,
  items: readonly FootballRankFiveItem[],
) {
  if (items.length !== BLIND_RANK_BOARD_SIZE) return false;
  if (new Set(items.map((item) => item.id)).size !== BLIND_RANK_BOARD_SIZE) return false;
  const ratings = items.map((item) => item.rating);
  const range = Math.max(...ratings) - Math.min(...ratings);
  if (range < archetype.minRange) return false;
  const counts = bandCounts(items);
  if (counts.bad > MAX_BLIND_RANK_BAD) return false;
  if (archetype.minHigh !== undefined && counts.high < archetype.minHigh) return false;
  if (archetype.maxHigh !== undefined && counts.high > archetype.maxHigh) return false;
  if (archetype.minMiddle !== undefined && counts.middle < archetype.minMiddle) return false;
  if (archetype.maxMiddle !== undefined && counts.middle > archetype.maxMiddle) return false;
  if (archetype.minLow !== undefined && counts.low < archetype.minLow) return false;
  if (archetype.maxLow !== undefined && counts.low > archetype.maxLow) return false;
  return true;
}

function blindRankArchetypeById(id: FootballBlindRankArchetypeId) {
  return FOOTBALL_BLIND_RANK_ARCHETYPES.find((archetype) => archetype.id === id)!;
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
  let fallbackUsed = false;

  for (const targetTier of archetype.targets) {
    const picked = chooseTierItem(items, targetTier, used, badCount, MAX_BLIND_RANK_BAD, random);
    if (!picked) return null;
    selected.push(picked.item);
    used.add(picked.item.id);
    badCount += footballComparisonTier(picked.item) === "bad" ? 1 : 0;
    fallbackUsed ||= !picked.exact;
  }

  if (!validateBlindRankBoard(archetype, selected)) return null;
  return {
    items: shuffleLineup(selected, random),
    badItems: badCount,
    fallbackUsed,
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
  const requestedArchetype = requestedArchetypeId
    ? blindRankArchetypeById(requestedArchetypeId)
    : footballBlindRankArchetypeForSeed(scopeId, seed);
  const candidates = [
    requestedArchetype,
    ...BLIND_RANK_ARCHETYPE_FALLBACKS[requestedArchetype.id].map(blindRankArchetypeById),
  ];

  for (const archetype of candidates) {
    for (let attempt = 0; attempt < BLIND_RANK_ATTEMPTS; attempt += 1) {
      const board = attemptBlindRankBoard(items, scopeId, seed, archetype, attempt);
      if (!board) continue;
      return {
        ...board,
        requestedArchetype: requestedArchetype.id,
        archetype: archetype.id,
        attemptsUsed: attempt + 1,
        fallbackUsed: board.fallbackUsed || archetype.id !== requestedArchetype.id,
      };
    }
  }

  throw new Error(`Football Blind Rank could not build a mature five-subject board for ${scopeId}.`);
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

function availableTierCount(items: readonly FootballRankFiveItem[], tier: FootballComparisonTierId) {
  return items.filter((item) => footballComparisonTier(item) === tier).length;
}

function desiredEliteCount(styleId: FootballKeepCutBoardStyleId, random: () => number) {
  const roll = random();
  switch (styleId) {
    case "knife-edge":
      if (roll < 0.125) return 2;
      if (roll < 0.375) return 1;
      return 0;
    case "messy-middle":
      return roll < (1 / 6) ? 1 : 0;
    case "one-superstar":
    case "classic-spread":
      return 1;
    case "bottom-grind":
      return 0;
  }
}

function desiredBadCount(
  styleId: FootballKeepCutBoardStyleId,
  availableBad: number,
  random: () => number,
) {
  if (availableBad <= 0) return 0;
  const roll = random();
  switch (styleId) {
    case "knife-edge":
      return roll < 0.15 ? 1 : 0;
    case "messy-middle":
      return roll < 0.45 ? 1 : 0;
    case "one-superstar":
      return roll < 0.35 ? 1 : 0;
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

function keepCutTargetsForSeed(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
  style: FootballKeepCutBoardStyle,
) {
  const random = seededLineupRandom("football-keep-cut", "board-profile", scopeId, seed, style.id);
  const requestedElite = desiredEliteCount(style.id, random);
  const availableBad = availableTierCount(items, "bad");
  const requestedBad = desiredBadCount(style.id, availableBad, random);
  const eliteCount = Math.min(requestedElite, availableTierCount(items, "elite"), MAX_KEEP_CUT_ELITE);
  const badCount = Math.min(requestedBad, availableBad, MAX_KEEP_CUT_BAD);
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

  return {
    targets,
    eliteCount,
    badCount,
    degradedForPoolDepth: eliteCount !== requestedElite || badCount !== requestedBad,
  };
}

export function footballKeepCutBoardIsCompetitive(items: readonly FootballRankFiveItem[]) {
  if (items.length !== KEEP_CUT_BOARD_SIZE) return false;
  if (new Set(items.map((item) => item.id)).size !== KEEP_CUT_BOARD_SIZE) return false;
  const ordered = [...items].sort((left, right) => right.rating - left.rating || left.id.localeCompare(right.id));
  const counts = bandCounts(items);
  const coreChoices = items.filter((item) => {
    const tier = footballComparisonTier(item);
    return tier === "good" || tier === "average" || tier === "below-average";
  }).length;
  const distinctTiers = new Set(items.map(footballComparisonTier)).size;
  const cutoffGap = Math.abs(ordered[KEEP_COUNT - 1]!.rating - ordered[KEEP_COUNT]!.rating);

  return (
    coreChoices >= 4
    && counts.elite <= MAX_KEEP_CUT_ELITE
    && counts.bad <= MAX_KEEP_CUT_BAD
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
  let fallbackUsed = false;

  for (const targetTier of targets) {
    const picked = chooseTierItem(items, targetTier, used, selectedBad, MAX_KEEP_CUT_BAD, random);
    if (!picked) return null;
    selected.push(picked.item);
    used.add(picked.item.id);
    selectedBad += footballComparisonTier(picked.item) === "bad" ? 1 : 0;
    fallbackUsed ||= !picked.exact;
  }

  const counts = bandCounts(selected);
  if (counts.elite !== eliteCount || counts.bad !== badCount) return null;
  if (!footballKeepCutBoardIsCompetitive(selected)) return null;
  const ordered = [...selected].sort((left, right) => right.rating - left.rating || left.id.localeCompare(right.id));
  return {
    items: shuffleLineup(selected, random),
    badItems: counts.bad,
    eliteItems: counts.elite,
    cutoffGap: Math.abs(ordered[KEEP_COUNT - 1]!.rating - ordered[KEEP_COUNT]!.rating),
    distinctTiers: new Set(selected.map(footballComparisonTier)).size,
    fallbackUsed,
  };
}

function competitiveWindowFallback(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
  style: FootballKeepCutBoardStyle,
) {
  const ordered = [...items].sort((left, right) => right.rating - left.rating || left.id.localeCompare(right.id));
  const windows: FootballRankFiveItem[][] = [];
  for (let start = 0; start <= ordered.length - KEEP_CUT_BOARD_SIZE; start += 1) {
    const window = ordered.slice(start, start + KEEP_CUT_BOARD_SIZE);
    if (footballKeepCutBoardIsCompetitive(window)) windows.push(window);
  }
  if (!windows.length) return null;
  const random = seededLineupRandom("football-keep-cut", "competitive-fallback", scopeId, seed, style.id);
  const selected = windows[Math.floor(random() * windows.length)]!;
  const counts = bandCounts(selected);
  const sorted = [...selected].sort((left, right) => right.rating - left.rating || left.id.localeCompare(right.id));
  return {
    items: shuffleLineup(selected, random),
    style: style.id,
    badItems: counts.bad,
    eliteItems: counts.elite,
    cutoffGap: Math.abs(sorted[KEEP_COUNT - 1]!.rating - sorted[KEEP_COUNT]!.rating),
    distinctTiers: new Set(selected.map(footballComparisonTier)).size,
    attemptsUsed: KEEP_CUT_ATTEMPTS,
    fallbackUsed: true,
  } satisfies FootballKeepCutBoard;
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
  const profile = keepCutTargetsForSeed(items, scopeId, seed, style);

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
    return {
      ...board,
      style: style.id,
      attemptsUsed: attempt + 1,
      fallbackUsed: board.fallbackUsed || profile.degradedForPoolDepth,
    };
  }

  const fallback = competitiveWindowFallback(items, scopeId, seed, style);
  if (fallback) return fallback;
  throw new Error(`Football Keep/Cut could not build a competitive eight-subject board for ${scopeId}.`);
}
