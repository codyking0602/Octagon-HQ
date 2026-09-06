import {
  seededLineupRandom,
  shuffleLineup,
} from "../play/lineupModel";
import { getFootballRatingBand } from "./footballContentContract";
import {
  footballGreatnessTierForItem,
  footballGreatnessTiersForCategory,
  type FootballGreatnessTier,
} from "./footballGreatnessTier";
import { footballComparisonItemsConflict } from "./footballProgramEraComparisonReadiness";
import type { FootballRankFiveItem } from "./footballRankFiveModel";

export type FootballComparisonTierId = FootballGreatnessTier;
export type FootballBlindRankArchetypeId =
  | "wild-card"
  | "loaded"
  | "middle-maze"
  | "top-bottom"
  | "knife-edge"
  | "ladder";
export type FootballKeepCutBoardStyleId = FootballBlindRankArchetypeId;

export interface FootballBlindRankArchetype {
  id: FootballBlindRankArchetypeId;
  name: string;
  weight: number;
  /** Compatibility only. Board targets are derived from the category's canonical tier ladder. */
  targets: readonly FootballComparisonTierId[];
  /** Compatibility only. Football board shape is tier-based, never rating-range based. */
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
  /** Compatibility only. Board targets are derived from the category's canonical tier ladder. */
  targets: readonly FootballComparisonTierId[];
}

export interface FootballKeepCutBoard {
  items: FootballRankFiveItem[];
  style: FootballKeepCutBoardStyleId;
  badItems: number;
  eliteItems: number;
  /** Canonical tier distance between fourth and fifth place; zero means a tied cutoff tier. */
  cutoffGap: number;
  distinctTiers: number;
  attemptsUsed: number;
}

type RecognizabilityTier = "A" | "B" | "C" | "D";
type BoardKind = "blind-rank" | "keep-cut";

const BLIND_RANK_BOARD_SIZE = 5;
const KEEP_CUT_BOARD_SIZE = 8;
const KEEP_COUNT = 4;
const MAX_ATTEMPTS = 160;
const RELAX_AFTER_ATTEMPT = 112;

const EMPTY_TARGETS: readonly FootballComparisonTierId[] = [];

export const FOOTBALL_BLIND_RANK_ARCHETYPES: readonly FootballBlindRankArchetype[] = [
  { id: "wild-card", name: "Wild Card", weight: 0.35, targets: EMPTY_TARGETS, minRange: 0 },
  { id: "loaded", name: "Loaded", weight: 0.15, targets: EMPTY_TARGETS, minRange: 0 },
  { id: "middle-maze", name: "Middle Maze", weight: 0.15, targets: EMPTY_TARGETS, minRange: 0 },
  { id: "top-bottom", name: "Top + Bottom", weight: 0.10, targets: EMPTY_TARGETS, minRange: 0 },
  { id: "knife-edge", name: "Knife Edge", weight: 0.15, targets: EMPTY_TARGETS, minRange: 0 },
  { id: "ladder", name: "Ladder", weight: 0.10, targets: EMPTY_TARGETS, minRange: 0 },
] as const;

export const FOOTBALL_KEEP_CUT_BOARD_STYLES: readonly FootballKeepCutBoardStyle[] = [
  { id: "wild-card", name: "Wild Card", weight: 0.30, targets: EMPTY_TARGETS },
  { id: "loaded", name: "Loaded", weight: 0.15, targets: EMPTY_TARGETS },
  { id: "middle-maze", name: "Middle Maze", weight: 0.15, targets: EMPTY_TARGETS },
  { id: "top-bottom", name: "Top + Bottom", weight: 0.15, targets: EMPTY_TARGETS },
  { id: "knife-edge", name: "Knife Edge", weight: 0.20, targets: EMPTY_TARGETS },
  { id: "ladder", name: "Ladder", weight: 0.05, targets: EMPTY_TARGETS },
] as const;

export function footballComparisonTier(itemOrRating: FootballRankFiveItem | number): FootballComparisonTierId {
  return typeof itemOrRating === "number"
    ? getFootballRatingBand(itemOrRating)
    : footballGreatnessTierForItem(itemOrRating);
}

function availableTiers(items: readonly FootballRankFiveItem[]) {
  return footballGreatnessTiersForCategory(items);
}

function tierIndexForItem(item: FootballRankFiveItem, tiers: readonly FootballGreatnessTier[]) {
  return tiers.indexOf(footballGreatnessTierForItem(item));
}

function tierCounts(items: readonly FootballRankFiveItem[]) {
  const counts = new Map<FootballGreatnessTier, number>();
  for (const item of items) {
    const tier = footballGreatnessTierForItem(item);
    counts.set(tier, (counts.get(tier) ?? 0) + 1);
  }
  return counts;
}

function recognizabilityTier(item: FootballRankFiveItem): RecognizabilityTier | null {
  const value = (item as FootballRankFiveItem & { recognizabilityTier?: unknown }).recognizabilityTier;
  return value === "A" || value === "B" || value === "C" || value === "D" ? value : null;
}

function highlyRecognizable(item: FootballRankFiveItem) {
  const tier = recognizabilityTier(item);
  return tier === "A" || tier === "B";
}

function boardRecognizabilityIsHealthy(
  board: readonly FootballRankFiveItem[],
  pool: readonly FootballRankFiveItem[],
  boardKind: BoardKind,
) {
  const requestedMinimum = boardKind === "blind-rank" ? 2 : 3;
  const healthyPool = pool.length >= board.length * 2;
  const recognizablePool = pool.filter(highlyRecognizable).length;
  if (!healthyPool || recognizablePool < requestedMinimum) return true;
  return board.filter(highlyRecognizable).length >= requestedMinimum;
}

function markComparisonItemUsed(
  used: Set<string>,
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  picked: FootballRankFiveItem,
) {
  used.add(picked.id);
  for (const candidate of items) {
    if (footballComparisonItemsConflict(scopeId, picked, candidate)) used.add(candidate.id);
  }
}

function randomIndex(random: () => number, length: number) {
  return Math.min(length - 1, Math.floor(random() * length));
}

function clampTierIndex(index: number, tierCount: number) {
  return Math.max(0, Math.min(tierCount - 1, index));
}

function bandIndices(tierCount: number) {
  const topEnd = Math.max(0, Math.ceil(tierCount / 3) - 1);
  const bottomStart = Math.min(tierCount - 1, Math.floor((tierCount * 2) / 3));
  const middleStart = Math.min(tierCount - 1, Math.floor(tierCount * 0.25));
  const middleEnd = Math.max(middleStart, Math.ceil(tierCount * 0.75) - 1);
  return { topEnd, bottomStart, middleStart, middleEnd };
}

function randomInRange(random: () => number, min: number, max: number) {
  if (max <= min) return min;
  return min + randomIndex(random, max - min + 1);
}

function ladderTargets(size: number, tierCount: number) {
  if (size <= 1 || tierCount <= 1) return Array.from({ length: size }, () => 0);
  return Array.from({ length: size }, (_, index) => (
    Math.round((index * (tierCount - 1)) / (size - 1))
  ));
}

function blindRankTargets(
  style: FootballBlindRankArchetypeId,
  tierCount: number,
  random: () => number,
) {
  const { topEnd, bottomStart, middleStart, middleEnd } = bandIndices(tierCount);
  switch (style) {
    case "wild-card":
      return Array.from({ length: BLIND_RANK_BOARD_SIZE }, () => randomIndex(random, tierCount));
    case "loaded":
      return [
        randomInRange(random, 0, topEnd),
        randomInRange(random, 0, topEnd),
        randomInRange(random, 0, topEnd),
        randomInRange(random, 0, Math.max(topEnd, middleEnd)),
        randomIndex(random, tierCount),
      ];
    case "middle-maze":
      return [
        randomInRange(random, middleStart, middleEnd),
        randomInRange(random, middleStart, middleEnd),
        randomInRange(random, middleStart, middleEnd),
        randomInRange(random, middleStart, middleEnd),
        randomInRange(random, Math.max(0, middleStart - 1), Math.min(tierCount - 1, middleEnd + 1)),
      ];
    case "top-bottom":
      return [
        randomInRange(random, 0, topEnd),
        randomInRange(random, 0, topEnd),
        randomIndex(random, tierCount),
        randomInRange(random, bottomStart, tierCount - 1),
        randomInRange(random, bottomStart, tierCount - 1),
      ];
    case "knife-edge": {
      if (tierCount <= 1) return [0, 0, 0, 0, 0];
      const anchor = randomInRange(random, 0, tierCount - 2);
      const outside = anchor + 2 < tierCount ? anchor + 2 : Math.max(0, anchor - 1);
      return [anchor, anchor, anchor + 1, anchor + 1, outside];
    }
    case "ladder":
      return ladderTargets(BLIND_RANK_BOARD_SIZE, tierCount);
  }
}

function keepCutTargets(
  style: FootballKeepCutBoardStyleId,
  tierCount: number,
  random: () => number,
) {
  const { topEnd, bottomStart, middleStart, middleEnd } = bandIndices(tierCount);
  switch (style) {
    case "wild-card":
      return Array.from({ length: KEEP_CUT_BOARD_SIZE }, () => randomIndex(random, tierCount));
    case "loaded":
      return Array.from({ length: KEEP_CUT_BOARD_SIZE }, (_, index) => (
        index < 6
          ? randomInRange(random, 0, Math.max(topEnd, Math.min(middleStart, tierCount - 1)))
          : randomIndex(random, tierCount)
      ));
    case "middle-maze":
      return Array.from({ length: KEEP_CUT_BOARD_SIZE }, (_, index) => (
        index < 6
          ? randomInRange(random, middleStart, middleEnd)
          : randomInRange(random, Math.max(0, middleStart - 1), Math.min(tierCount - 1, middleEnd + 1))
      ));
    case "top-bottom":
      return [
        randomInRange(random, 0, topEnd),
        randomInRange(random, 0, topEnd),
        randomInRange(random, 0, topEnd),
        randomInRange(random, 0, topEnd),
        randomInRange(random, bottomStart, tierCount - 1),
        randomInRange(random, bottomStart, tierCount - 1),
        randomInRange(random, bottomStart, tierCount - 1),
        randomInRange(random, bottomStart, tierCount - 1),
      ];
    case "knife-edge": {
      if (tierCount <= 1) return Array.from({ length: KEEP_CUT_BOARD_SIZE }, () => 0);
      const anchor = tierCount === 2 ? 1 : randomInRange(random, 1, tierCount - 2);
      const above = Math.max(0, anchor - 1);
      const below = Math.min(tierCount - 1, anchor + 1);
      // Two above + four tied at the boundary + two below puts fourth/fifth inside the same canonical tier.
      return [above, above, anchor, anchor, anchor, anchor, below, below];
    }
    case "ladder":
      return ladderTargets(KEEP_CUT_BOARD_SIZE, tierCount);
  }
}

function chooseNearestCandidate(
  pool: readonly FootballRankFiveItem[],
  tiers: readonly FootballGreatnessTier[],
  targetTierIndex: number,
  used: ReadonlySet<string>,
  selectedTierCounts: ReadonlyMap<FootballGreatnessTier, number>,
  maxPerTier: number,
  random: () => number,
) {
  const eligible = pool.filter((item) => {
    if (used.has(item.id)) return false;
    const tier = footballGreatnessTierForItem(item);
    return (selectedTierCounts.get(tier) ?? 0) < maxPerTier;
  });
  if (!eligible.length) return null;

  const target = clampTierIndex(targetTierIndex, tiers.length);
  const minimumDistance = Math.min(...eligible.map((item) => (
    Math.abs(tierIndexForItem(item, tiers) - target)
  )));
  const nearest = eligible.filter((item) => (
    Math.abs(tierIndexForItem(item, tiers) - target) === minimumDistance
  ));
  return shuffleLineup(nearest, random)[0] ?? null;
}

function attemptBoard(
  items: readonly FootballRankFiveItem[],
  tiers: readonly FootballGreatnessTier[],
  scopeId: string,
  seed: string,
  style: FootballBlindRankArchetypeId,
  boardKind: BoardKind,
  attempt: number,
) {
  const boardSize = boardKind === "blind-rank" ? BLIND_RANK_BOARD_SIZE : KEEP_CUT_BOARD_SIZE;
  const compositionRandom = seededLineupRandom(
    boardKind === "blind-rank" ? "football-rank-five" : "football-keep-cut",
    "composition",
    scopeId,
    seed,
    style,
    attempt,
  );
  const requestedTargets = boardKind === "blind-rank"
    ? blindRankTargets(style, tiers.length, compositionRandom)
    : keepCutTargets(style, tiers.length, compositionRandom);
  const targets = shuffleLineup(requestedTargets, compositionRandom);
  const healthyTierDepth = tiers.length >= 3 && items.length >= boardSize * 2;
  const relaxed = attempt >= RELAX_AFTER_ATTEMPT;
  const maxPerTier = boardKind === "blind-rank"
    ? healthyTierDepth && !relaxed ? 2 : boardSize - 1
    : style === "knife-edge" ? 4 : healthyTierDepth && !relaxed ? 4 : boardSize - 1;
  const used = new Set<string>();
  const selected: FootballRankFiveItem[] = [];
  const selectedTierCounts = new Map<FootballGreatnessTier, number>();

  for (const target of targets) {
    const picked = chooseNearestCandidate(
      items,
      tiers,
      target,
      used,
      selectedTierCounts,
      maxPerTier,
      compositionRandom,
    );
    if (!picked) return null;
    selected.push(picked);
    const tier = footballGreatnessTierForItem(picked);
    selectedTierCounts.set(tier, (selectedTierCounts.get(tier) ?? 0) + 1);
    markComparisonItemUsed(used, items, scopeId, picked);
  }

  if (selected.length !== boardSize || new Set(selected.map((item) => item.id)).size !== boardSize) return null;
  const distinctTiers = selectedTierCounts.size;
  if (boardKind === "blind-rank" && tiers.length > 1 && distinctTiers < 2) return null;
  if (boardKind === "keep-cut" && tiers.length >= 3 && style !== "knife-edge" && distinctTiers < 2) return null;
  if (!boardRecognizabilityIsHealthy(selected, items, boardKind) && !relaxed) return null;

  const revealRandom = seededLineupRandom(
    boardKind === "blind-rank" ? "football-rank-five" : "football-keep-cut",
    "reveal-order",
    scopeId,
    seed,
    style,
    attempt,
  );
  return shuffleLineup(selected, revealRandom);
}

function weightedStyleForSeed<T extends { weight: number }>(
  rows: readonly T[],
  random: () => number,
) {
  let cursor = random();
  for (const row of rows) {
    cursor -= row.weight;
    if (cursor <= 0) return row;
  }
  return rows.at(-1)!;
}

export function footballBlindRankArchetypeForSeed(scopeId: string, seed: string) {
  return weightedStyleForSeed(
    FOOTBALL_BLIND_RANK_ARCHETYPES,
    seededLineupRandom("football-rank-five", "archetype", scopeId, seed),
  );
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
  const tiers = availableTiers(items);
  if (!tiers.length) throw new Error(`Football Blind Rank has no canonical greatness tiers for ${scopeId}.`);
  const archetype = requestedArchetypeId
    ? FOOTBALL_BLIND_RANK_ARCHETYPES.find((row) => row.id === requestedArchetypeId)
    : footballBlindRankArchetypeForSeed(scopeId, seed);
  if (!archetype) throw new Error(`Unsupported Football Blind Rank archetype: ${String(requestedArchetypeId)}`);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const board = attemptBoard(items, tiers, scopeId, seed, archetype.id, "blind-rank", attempt);
    if (!board) continue;
    return {
      items: board,
      archetype: archetype.id,
      badItems: board.filter((item) => footballGreatnessTierForItem(item) === "bad").length,
      attemptsUsed: attempt + 1,
    };
  }
  throw new Error(`Football Blind Rank could not build a ${archetype.name} five-subject board for ${scopeId}.`);
}

export function footballKeepCutBoardStyleForSeed(scopeId: string, seed: string) {
  return weightedStyleForSeed(
    FOOTBALL_KEEP_CUT_BOARD_STYLES,
    seededLineupRandom("football-keep-cut", "board-style", scopeId, seed),
  );
}

export function footballKeepCutRequiredDistinctTiers(items: readonly FootballRankFiveItem[]) {
  const count = availableTiers(items).length;
  if (count <= 1) return count;
  return Math.min(3, count);
}

/** Compatibility export now expressed only in canonical-tier terms. */
export function footballKeepCutEliteCap(items: readonly FootballRankFiveItem[]) {
  const tiers = availableTiers(items);
  if (!tiers.length) return 0;
  const topTier = tiers[0]!;
  const availableTopTier = items.filter((item) => footballGreatnessTierForItem(item) === topTier).length;
  return Math.min(4, availableTopTier);
}

function canonicalCutoffGap(items: readonly FootballRankFiveItem[], tiers: readonly FootballGreatnessTier[]) {
  const orderedTierIndexes = items
    .map((item) => tierIndexForItem(item, tiers))
    .sort((left, right) => left - right);
  return Math.abs(orderedTierIndexes[KEEP_COUNT - 1]! - orderedTierIndexes[KEEP_COUNT]!);
}

export function footballKeepCutBoardIsCompetitive(
  items: readonly FootballRankFiveItem[],
  pool: readonly FootballRankFiveItem[] = items,
) {
  if (items.length !== KEEP_CUT_BOARD_SIZE) return false;
  if (new Set(items.map((item) => item.id)).size !== KEEP_CUT_BOARD_SIZE) return false;
  const tiers = availableTiers(pool);
  if (!tiers.length) return false;
  const counts = tierCounts(items);
  const distinctTiers = counts.size;
  if (tiers.length >= 3 && distinctTiers < 2) return false;
  const largestTier = Math.max(...counts.values());
  if (tiers.length >= 3 && pool.length >= KEEP_CUT_BOARD_SIZE * 2 && largestTier > 6) return false;
  return true;
}

export function buildFootballKeepCutBoard(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
): FootballKeepCutBoard {
  if (items.length < KEEP_CUT_BOARD_SIZE) {
    throw new Error(`Football Keep/Cut needs at least ${KEEP_CUT_BOARD_SIZE} comparison subjects.`);
  }
  const tiers = availableTiers(items);
  if (!tiers.length) throw new Error(`Football Keep/Cut has no canonical greatness tiers for ${scopeId}.`);
  const style = footballKeepCutBoardStyleForSeed(scopeId, seed);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const board = attemptBoard(items, tiers, scopeId, seed, style.id, "keep-cut", attempt);
    if (!board || !footballKeepCutBoardIsCompetitive(board, items)) continue;
    const counts = tierCounts(board);
    const topTier = tiers[0]!;
    return {
      items: board,
      style: style.id,
      badItems: counts.get("bad") ?? 0,
      eliteItems: counts.get(topTier) ?? 0,
      cutoffGap: canonicalCutoffGap(board, tiers),
      distinctTiers: counts.size,
      attemptsUsed: attempt + 1,
    };
  }
  throw new Error(`Football Keep/Cut could not build a ${style.name} eight-subject board for ${scopeId}.`);
}
