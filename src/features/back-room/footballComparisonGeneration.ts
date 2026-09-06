import {
  seededLineupRandom,
  shuffleLineup,
} from "../play/lineupModel";
import {
  getFootballRatingBand,
  type FootballRatingBand,
} from "./footballContentContract";
import {
  footballGreatnessTierForItem,
  footballGreatnessTiersForCategory,
  type FootballGreatnessTier,
} from "./footballGreatnessTier";
import { footballComparisonItemsConflict } from "./footballProgramEraComparisonReadiness";
import type { FootballRankFiveItem } from "./footballRankFiveModel";

export type FootballComparisonTierId = FootballRatingBand;
export type FootballBoardTypeId =
  | "wild-card"
  | "loaded"
  | "middle-maze"
  | "top-bottom"
  | "knife-edge"
  | "ladder";

/** Compatibility names retained so the shared generator remains the only board owner. */
export type FootballBlindRankArchetypeId = FootballBoardTypeId;
export type FootballKeepCutBoardStyleId = FootballBoardTypeId;

export interface FootballBlindRankArchetype {
  id: FootballBlindRankArchetypeId;
  name: string;
  weight: number;
  /** Legacy inspection fields. Board construction no longer consumes rating-band targets. */
  targets: readonly FootballComparisonTierId[];
  minRange: number;
}

export interface FootballBlindRankBoard {
  items: FootballRankFiveItem[];
  boardType: FootballBoardTypeId;
  archetype: FootballBlindRankArchetypeId;
  badItems: number;
  attemptsUsed: number;
}

export interface FootballKeepCutBoardStyle {
  id: FootballKeepCutBoardStyleId;
  name: string;
  weight: number;
  /** Legacy inspection field. Board construction no longer consumes rating-band targets. */
  targets: readonly FootballComparisonTierId[];
}

export interface FootballKeepCutBoard {
  items: FootballRankFiveItem[];
  boardType: FootballBoardTypeId;
  style: FootballKeepCutBoardStyleId;
  badItems: number;
  eliteItems: number;
  /** Canonical greatness-tier distance at the four/five boundary; zero means a cutoff tie. */
  cutoffGap: number;
  distinctTiers: number;
  attemptsUsed: number;
}

type FootballRecognizabilityTier = "A" | "B" | "C" | "D";
type RecognizableFootballItem = FootballRankFiveItem & { recognizabilityTier?: FootballRecognizabilityTier };

type GameKind = "blind-rank" | "keep-cut";

const BLIND_RANK_BOARD_SIZE = 5;
const KEEP_CUT_BOARD_SIZE = 8;
const KEEP_COUNT = 4;
const GENERATION_ATTEMPTS = 240;
const CASUAL_BOARD_TIERS = new Set<FootballRecognizabilityTier>(["A", "B"]);

const boardType = (
  id: FootballBoardTypeId,
  name: string,
  weight: number,
) => ({ id, name, weight, targets: [] as readonly FootballComparisonTierId[], minRange: 0 });

export const FOOTBALL_BLIND_RANK_ARCHETYPES: readonly FootballBlindRankArchetype[] = [
  boardType("wild-card", "Wild Card", 0.35),
  boardType("loaded", "Loaded", 0.15),
  boardType("middle-maze", "Middle Maze", 0.15),
  boardType("top-bottom", "Top + Bottom", 0.10),
  boardType("knife-edge", "Knife Edge", 0.15),
  boardType("ladder", "Ladder", 0.10),
] as const;

export const FOOTBALL_KEEP_CUT_BOARD_STYLES: readonly FootballKeepCutBoardStyle[] = [
  boardType("wild-card", "Wild Card", 0.30),
  boardType("loaded", "Loaded", 0.15),
  boardType("middle-maze", "Middle Maze", 0.15),
  boardType("top-bottom", "Top + Bottom", 0.15),
  boardType("knife-edge", "Knife Edge", 0.20),
  boardType("ladder", "Ladder", 0.05),
] as const;

export const FOOTBALL_BLIND_RANK_BOARD_TYPE_WEIGHTS = Object.freeze(
  Object.fromEntries(FOOTBALL_BLIND_RANK_ARCHETYPES.map((row) => [row.id, row.weight])),
) as Readonly<Record<FootballBoardTypeId, number>>;

export const FOOTBALL_KEEP_CUT_BOARD_TYPE_WEIGHTS = Object.freeze(
  Object.fromEntries(FOOTBALL_KEEP_CUT_BOARD_STYLES.map((row) => [row.id, row.weight])),
) as Readonly<Record<FootballBoardTypeId, number>>;

function comparisonTierForGreatness(tier: FootballGreatnessTier): FootballComparisonTierId {
  switch (tier) {
    case "goat":
    case "legendary":
    case "elite":
      return "elite";
    case "near-elite":
    case "great":
      return "great";
    case "good":
    case "average":
    case "below-average":
    case "bad":
      return tier;
  }
}

/**
 * Compatibility projection for diagnostics outside generation. Football board construction
 * never consumes this collapsed band and never consumes raw rating/OVR.
 */
export function footballComparisonTier(itemOrRating: FootballRankFiveItem | number): FootballComparisonTierId {
  return typeof itemOrRating === "number"
    ? getFootballRatingBand(itemOrRating)
    : comparisonTierForGreatness(footballGreatnessTierForItem(itemOrRating));
}

function weightedTypeForSeed<T extends { weight: number }>(
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
  return weightedTypeForSeed(
    FOOTBALL_BLIND_RANK_ARCHETYPES,
    seededLineupRandom("football-rank-five", "board-type", scopeId, seed),
  );
}

export const footballBlindRankBoardTypeForSeed = footballBlindRankArchetypeForSeed;

export function footballKeepCutBoardStyleForSeed(scopeId: string, seed: string) {
  return weightedTypeForSeed(
    FOOTBALL_KEEP_CUT_BOARD_STYLES,
    seededLineupRandom("football-keep-cut", "board-type", scopeId, seed),
  );
}

export const footballKeepCutBoardTypeForSeed = footballKeepCutBoardStyleForSeed;

function tierCounts(items: readonly FootballRankFiveItem[]) {
  const counts = new Map<FootballGreatnessTier, number>();
  for (const item of items) {
    const tier = footballGreatnessTierForItem(item);
    counts.set(tier, (counts.get(tier) ?? 0) + 1);
  }
  return counts;
}

function canFillWithTierCap(
  items: readonly FootballRankFiveItem[],
  boardSize: number,
  cap: number,
) {
  const counts = tierCounts(items);
  return [...counts.values()].reduce((sum, count) => sum + Math.min(cap, count), 0) >= boardSize;
}

function healthyTierCap(
  game: GameKind,
  boardTypeId: FootballBoardTypeId,
  items: readonly FootballRankFiveItem[],
) {
  if (game === "blind-rank") return canFillWithTierCap(items, BLIND_RANK_BOARD_SIZE, 2) ? 2 : BLIND_RANK_BOARD_SIZE;
  const preferred = boardTypeId === "knife-edge" ? 4 : 3;
  return canFillWithTierCap(items, KEEP_CUT_BOARD_SIZE, preferred) ? preferred : KEEP_CUT_BOARD_SIZE;
}

function casualBoardFloor(items: readonly FootballRankFiveItem[], boardSize: number) {
  const recognizable = items.filter((item) => {
    const tier = (item as RecognizableFootballItem).recognizabilityTier;
    return tier != null && CASUAL_BOARD_TIERS.has(tier);
  }).length;
  const desired = boardSize === BLIND_RANK_BOARD_SIZE ? 2 : 3;
  const healthyPool = items.length >= boardSize * 2 && recognizable >= desired * 2;
  if (healthyPool) return desired;
  if (recognizable >= desired) return Math.max(1, desired - 1);
  return 0;
}

function isCasualBoardItem(item: FootballRankFiveItem) {
  const tier = (item as RecognizableFootballItem).recognizabilityTier;
  return tier != null && CASUAL_BOARD_TIERS.has(tier);
}

function randomIndex(indices: readonly number[], random: () => number) {
  return indices[Math.floor(random() * indices.length)] ?? 0;
}

function uniqueIndices(length: number) {
  return Array.from({ length }, (_, index) => index);
}

function segmentIndices(length: number, startShare: number, endShare: number) {
  if (length <= 1) return [0];
  const start = Math.max(0, Math.min(length - 1, Math.floor((length - 1) * startShare)));
  const end = Math.max(start, Math.min(length - 1, Math.ceil((length - 1) * endShare)));
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
}

function spacedTierTargets(tierCount: number, boardSize: number) {
  if (tierCount <= 1) return Array.from({ length: boardSize }, () => 0);
  return Array.from(
    { length: boardSize },
    (_, index) => Math.round(index * (tierCount - 1) / Math.max(1, boardSize - 1)),
  );
}

function knifeEdgeTargets(tierCount: number, game: GameKind, random: () => number) {
  if (tierCount <= 1) return Array.from({ length: game === "blind-rank" ? 5 : 8 }, () => 0);
  const anchor = tierCount === 2
    ? Math.floor(random() * tierCount)
    : 1 + Math.floor(random() * (tierCount - 2));
  const upper = Math.max(0, anchor - 1);
  const lower = Math.min(tierCount - 1, anchor + 1);

  if (game === "keep-cut") {
    if (tierCount === 2) return [0, 0, 0, 0, 1, 1, 1, 1];
    // Two above + four tied + two below intentionally puts the 4/5 boundary inside the tied tier.
    return [upper, upper, anchor, anchor, anchor, anchor, lower, lower];
  }

  const distant = Math.abs(anchor - 0) >= Math.abs((tierCount - 1) - anchor) ? 0 : tierCount - 1;
  return [anchor, anchor, lower, lower, distant];
}

function boardTierTargets(
  boardTypeId: FootballBoardTypeId,
  tierCount: number,
  game: GameKind,
  random: () => number,
) {
  const boardSize = game === "blind-rank" ? BLIND_RANK_BOARD_SIZE : KEEP_CUT_BOARD_SIZE;
  const all = uniqueIndices(tierCount);
  const top = segmentIndices(tierCount, 0, 0.38);
  const middle = segmentIndices(tierCount, 0.28, 0.72);
  const bottom = segmentIndices(tierCount, 0.62, 1);

  switch (boardTypeId) {
    case "wild-card":
      return Array.from({ length: boardSize }, () => randomIndex(all, random));
    case "loaded": {
      const topSlots = Math.ceil(boardSize * 0.7);
      return [
        ...Array.from({ length: topSlots }, () => randomIndex(top, random)),
        ...Array.from({ length: boardSize - topSlots }, () => randomIndex(middle.length ? middle : all, random)),
      ];
    }
    case "middle-maze": {
      const middleSlots = Math.ceil(boardSize * 0.75);
      return [
        ...Array.from({ length: middleSlots }, () => randomIndex(middle, random)),
        ...Array.from({ length: boardSize - middleSlots }, () => randomIndex(all, random)),
      ];
    }
    case "top-bottom": {
      const topSlots = Math.ceil(boardSize / 2);
      return [
        ...Array.from({ length: topSlots }, () => randomIndex(top, random)),
        ...Array.from({ length: boardSize - topSlots }, () => randomIndex(bottom, random)),
      ];
    }
    case "knife-edge":
      return knifeEdgeTargets(tierCount, game, random);
    case "ladder":
      return spacedTierTargets(tierCount, boardSize);
  }
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

function tierPreference(targetIndex: number, tierCount: number) {
  return uniqueIndices(tierCount).sort((left, right) => (
    Math.abs(left - targetIndex) - Math.abs(right - targetIndex)
    || left - right
  ));
}

function pickForTarget(
  items: readonly FootballRankFiveItem[],
  categoryTiers: readonly FootballGreatnessTier[],
  targetIndex: number,
  used: ReadonlySet<string>,
  selectedTierCounts: ReadonlyMap<FootballGreatnessTier, number>,
  tierCap: number,
  requireCasual: boolean,
  random: () => number,
) {
  for (const tierIndex of tierPreference(targetIndex, categoryTiers.length)) {
    const tier = categoryTiers[tierIndex]!;
    if ((selectedTierCounts.get(tier) ?? 0) >= tierCap) continue;
    let eligible = items.filter((item) => !used.has(item.id) && footballGreatnessTierForItem(item) === tier);
    if (requireCasual) eligible = eligible.filter(isCasualBoardItem);
    if (!eligible.length) continue;
    return shuffleLineup(eligible, random)[0] ?? null;
  }
  return null;
}

function buildAttempt(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
  game: GameKind,
  boardTypeId: FootballBoardTypeId,
  attempt: number,
) {
  const boardSize = game === "blind-rank" ? BLIND_RANK_BOARD_SIZE : KEEP_CUT_BOARD_SIZE;
  const categoryTiers = footballGreatnessTiersForCategory(items);
  const random = seededLineupRandom(`football-${game}`, "composition", scopeId, seed, boardTypeId, attempt);
  const tierCap = healthyTierCap(game, boardTypeId, items);
  const recognitionFloor = casualBoardFloor(items, boardSize);
  const targets = shuffleLineup(boardTierTargets(boardTypeId, categoryTiers.length, game, random), random);
  const used = new Set<string>();
  const selected: FootballRankFiveItem[] = [];
  const selectedTierCounts = new Map<FootballGreatnessTier, number>();
  let casualSelected = 0;

  for (const targetIndex of targets) {
    const remainingSlots = boardSize - selected.length;
    const casualNeeded = Math.max(0, recognitionFloor - casualSelected);
    const requireCasual = casualNeeded >= remainingSlots;
    let picked = pickForTarget(
      items,
      categoryTiers,
      targetIndex,
      used,
      selectedTierCounts,
      tierCap,
      requireCasual,
      random,
    );
    if (!picked && !requireCasual) {
      picked = pickForTarget(
        items,
        categoryTiers,
        targetIndex,
        used,
        selectedTierCounts,
        tierCap,
        false,
        random,
      );
    }
    if (!picked) return null;
    selected.push(picked);
    markComparisonItemUsed(used, items, scopeId, picked);
    const tier = footballGreatnessTierForItem(picked);
    selectedTierCounts.set(tier, (selectedTierCounts.get(tier) ?? 0) + 1);
    if (isCasualBoardItem(picked)) casualSelected += 1;
  }

  if (casualSelected < recognitionFloor) return null;
  const distinctTiers = selectedTierCounts.size;
  if (game === "blind-rank" && categoryTiers.length > 1 && distinctTiers < 2) return null;
  if (game === "keep-cut") {
    const preferredDistinct = footballKeepCutRequiredDistinctTiers(items);
    if (distinctTiers < preferredDistinct) return null;
  }

  // Reveal order is a separate lottery from board-type and composition selection.
  const revealRandom = seededLineupRandom(`football-${game}`, "reveal-order", scopeId, seed);
  return shuffleLineup(selected, revealRandom);
}

function canonicalTierDistance(
  left: FootballRankFiveItem,
  right: FootballRankFiveItem,
  categoryItems: readonly FootballRankFiveItem[],
) {
  const tiers = footballGreatnessTiersForCategory(categoryItems);
  return Math.abs(
    tiers.indexOf(footballGreatnessTierForItem(left))
      - tiers.indexOf(footballGreatnessTierForItem(right)),
  );
}

function canonicalTierCounts(items: readonly FootballRankFiveItem[]) {
  return items.reduce((counts, item) => {
    const tier = footballGreatnessTierForItem(item);
    counts.set(tier, (counts.get(tier) ?? 0) + 1);
    return counts;
  }, new Map<FootballGreatnessTier, number>());
}

export function footballKeepCutRequiredDistinctTiers(items: readonly FootballRankFiveItem[]) {
  const availableTiers = footballGreatnessTiersForCategory(items).length;
  if (availableTiers <= 1) return 1;
  if (availableTiers === 2) return 2;
  return canFillWithTierCap(items, KEEP_CUT_BOARD_SIZE, 3) ? 3 : 2;
}

/** Legacy diagnostic helper; generation uses per-board canonical-tier caps instead. */
export function footballKeepCutEliteCap(items: readonly FootballRankFiveItem[]) {
  return canFillWithTierCap(items, KEEP_CUT_BOARD_SIZE, 4) ? 4 : KEEP_CUT_BOARD_SIZE;
}

export function footballKeepCutBoardIsCompetitive(
  items: readonly FootballRankFiveItem[],
  pool: readonly FootballRankFiveItem[] = items,
) {
  if (items.length !== KEEP_CUT_BOARD_SIZE) return false;
  if (new Set(items.map((item) => item.id)).size !== KEEP_CUT_BOARD_SIZE) return false;
  const distinctTiers = new Set(items.map(footballGreatnessTierForItem)).size;
  if (distinctTiers < footballKeepCutRequiredDistinctTiers(pool)) return false;
  const largestTier = Math.max(...canonicalTierCounts(items).values());
  return footballGreatnessTiersForCategory(pool).length <= 1 || largestTier <= 6;
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
  const selectedType = requestedArchetypeId
    ? FOOTBALL_BLIND_RANK_ARCHETYPES.find((row) => row.id === requestedArchetypeId)
    : footballBlindRankArchetypeForSeed(scopeId, seed);
  if (!selectedType) throw new Error(`Unsupported Football Blind Rank board type: ${String(requestedArchetypeId)}`);

  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt += 1) {
    const boardItems = buildAttempt(items, scopeId, seed, "blind-rank", selectedType.id, attempt);
    if (!boardItems) continue;
    return {
      items: boardItems,
      boardType: selectedType.id,
      archetype: selectedType.id,
      badItems: boardItems.filter((item) => footballGreatnessTierForItem(item) === "bad").length,
      attemptsUsed: attempt + 1,
    };
  }

  throw new Error(`Football Blind Rank could not build a ${selectedType.name} five-subject board for ${scopeId}.`);
}

export function buildFootballKeepCutBoard(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
): FootballKeepCutBoard {
  if (items.length < KEEP_CUT_BOARD_SIZE) {
    throw new Error(`Football Keep/Cut needs at least ${KEEP_CUT_BOARD_SIZE} comparison subjects.`);
  }
  const selectedType = footballKeepCutBoardStyleForSeed(scopeId, seed);

  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt += 1) {
    const boardItems = buildAttempt(items, scopeId, seed, "keep-cut", selectedType.id, attempt);
    if (!boardItems || !footballKeepCutBoardIsCompetitive(boardItems, items)) continue;
    const categoryTiers = footballGreatnessTiersForCategory(items);
    const ordered = [...boardItems].sort((left, right) => (
      categoryTiers.indexOf(footballGreatnessTierForItem(left))
        - categoryTiers.indexOf(footballGreatnessTierForItem(right))
    ));
    const topTier = categoryTiers[0];
    return {
      items: boardItems,
      boardType: selectedType.id,
      style: selectedType.id,
      badItems: boardItems.filter((item) => footballGreatnessTierForItem(item) === "bad").length,
      eliteItems: topTier == null ? 0 : boardItems.filter((item) => footballGreatnessTierForItem(item) === topTier).length,
      cutoffGap: canonicalTierDistance(ordered[KEEP_COUNT - 1]!, ordered[KEEP_COUNT]!, items),
      distinctTiers: new Set(boardItems.map(footballGreatnessTierForItem)).size,
      attemptsUsed: attempt + 1,
    };
  }

  throw new Error(`Football Keep/Cut could not build a ${selectedType.name} eight-subject board for ${scopeId}.`);
}
