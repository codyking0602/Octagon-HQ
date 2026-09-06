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
export type FootballBlindRankArchetypeId = FootballBoardTypeId;
export type FootballKeepCutBoardStyleId = FootballBoardTypeId;

export interface FootballBoardType {
  id: FootballBoardTypeId;
  name: string;
  weight: number;
}

export type FootballBlindRankArchetype = FootballBoardType;
export type FootballKeepCutBoardStyle = FootballBoardType;

export interface FootballBlindRankBoard {
  items: FootballRankFiveItem[];
  boardType: FootballBoardTypeId;
  /** Backward-compatible alias. Board type is intentionally not player-facing. */
  archetype: FootballBlindRankArchetypeId;
  badItems: number;
  attemptsUsed: number;
}

export interface FootballKeepCutBoard {
  items: FootballRankFiveItem[];
  boardType: FootballBoardTypeId;
  /** Backward-compatible alias. Board type is intentionally not player-facing. */
  style: FootballKeepCutBoardStyleId;
  badItems: number;
  eliteItems: number;
  /** Canonical tier distance across the 4/5 cutoff. Zero means the cutoff is tied. */
  cutoffGap: number;
  distinctTiers: number;
  attemptsUsed: number;
}

type RecognizableFootballItem = FootballRankFiveItem & {
  recognizabilityTier?: "A" | "B" | "C" | "D";
};

const BLIND_RANK_BOARD_SIZE = 5;
const KEEP_CUT_BOARD_SIZE = 8;
const KEEP_COUNT = 4;
const BOARD_ATTEMPTS = 180;
const STRICT_ATTEMPTS = 96;
const NEIGHBOR_RELAX_ATTEMPTS = 144;
const SPARSE_CONFLICT_RELAX_POOL_MAX = 15;

export const FOOTBALL_BLIND_RANK_ARCHETYPES: readonly FootballBlindRankArchetype[] = [
  { id: "wild-card", name: "Wild Card", weight: 0.35 },
  { id: "loaded", name: "Loaded", weight: 0.15 },
  { id: "middle-maze", name: "Middle Maze", weight: 0.15 },
  { id: "top-bottom", name: "Top + Bottom", weight: 0.10 },
  { id: "knife-edge", name: "Knife Edge", weight: 0.15 },
  { id: "ladder", name: "Ladder", weight: 0.10 },
] as const;

export const FOOTBALL_KEEP_CUT_BOARD_STYLES: readonly FootballKeepCutBoardStyle[] = [
  { id: "wild-card", name: "Wild Card", weight: 0.30 },
  { id: "loaded", name: "Loaded", weight: 0.15 },
  { id: "middle-maze", name: "Middle Maze", weight: 0.15 },
  { id: "top-bottom", name: "Top + Bottom", weight: 0.15 },
  { id: "knife-edge", name: "Knife Edge", weight: 0.20 },
  { id: "ladder", name: "Ladder", weight: 0.05 },
] as const;

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
 * Legacy public presentation helper. Generation never uses this collapsed rating band;
 * it consumes the canonical greatness tier ladder directly.
 */
export function footballComparisonTier(itemOrRating: FootballRankFiveItem | number): FootballComparisonTierId {
  return typeof itemOrRating === "number"
    ? getFootballRatingBand(itemOrRating)
    : comparisonTierForGreatness(footballGreatnessTierForItem(itemOrRating));
}

function weightedBoardType(
  rows: readonly FootballBoardType[],
  random: () => number,
) {
  let cursor = random();
  for (const row of rows) {
    cursor -= row.weight;
    if (cursor <= 0) return row;
  }
  return rows.at(-1)!;
}

export function footballBlindRankBoardTypeForSeed(scopeId: string, seed: string) {
  return weightedBoardType(
    FOOTBALL_BLIND_RANK_ARCHETYPES,
    seededLineupRandom("football-rank-five", "board-type", scopeId, seed),
  );
}

export function footballBlindRankArchetypeForSeed(scopeId: string, seed: string) {
  return footballBlindRankBoardTypeForSeed(scopeId, seed);
}

export function footballKeepCutBoardTypeForSeed(scopeId: string, seed: string) {
  return weightedBoardType(
    FOOTBALL_KEEP_CUT_BOARD_STYLES,
    seededLineupRandom("football-keep-cut", "board-type", scopeId, seed),
  );
}

export function footballKeepCutBoardStyleForSeed(scopeId: string, seed: string) {
  return footballKeepCutBoardTypeForSeed(scopeId, seed);
}

function randomInteger(random: () => number, min: number, max: number) {
  if (max <= min) return min;
  return min + Math.floor(random() * (max - min + 1));
}

function clampTierIndex(index: number, tierCount: number) {
  return Math.max(0, Math.min(tierCount - 1, index));
}

function ladderTargets(size: number, tierCount: number) {
  if (tierCount <= 1) return Array.from({ length: size }, () => 0);
  return Array.from({ length: size }, (_, index) => (
    Math.round((index * (tierCount - 1)) / Math.max(1, size - 1))
  ));
}

function boardTierTargets(
  boardType: FootballBoardTypeId,
  game: "blind" | "keep-cut",
  tierCount: number,
  random: () => number,
) {
  const size = game === "blind" ? BLIND_RANK_BOARD_SIZE : KEEP_CUT_BOARD_SIZE;
  if (tierCount <= 1) return Array.from({ length: size }, () => 0);

  switch (boardType) {
    case "wild-card":
      return Array.from({ length: size }, () => randomInteger(random, 0, tierCount - 1));

    case "loaded": {
      const highTierCount = Math.max(1, Math.ceil(tierCount * 0.4));
      const targets = Array.from({ length: size }, () => randomInteger(random, 0, highTierCount - 1));
      if (highTierCount === 1) targets[size - 1] = 1;
      return targets;
    }

    case "middle-maze": {
      const start = clampTierIndex(Math.floor((tierCount - 1) * 0.3), tierCount);
      const end = clampTierIndex(Math.ceil((tierCount - 1) * 0.7), tierCount);
      const targets = Array.from({ length: size }, () => randomInteger(random, start, end));
      if (game === "blind" && new Set(targets).size === 1) {
        targets[size - 1] = targets[0] === end ? Math.max(0, end - 1) : Math.min(tierCount - 1, targets[0]! + 1);
      }
      return targets;
    }

    case "top-bottom": {
      const highEnd = clampTierIndex(Math.max(0, Math.ceil(tierCount * 0.3) - 1), tierCount);
      const lowStart = clampTierIndex(Math.floor(tierCount * 0.7), tierCount);
      const highCount = Math.ceil(size / 2);
      return Array.from({ length: size }, (_, index) => (
        index < highCount
          ? randomInteger(random, 0, highEnd)
          : randomInteger(random, lowStart, tierCount - 1)
      ));
    }

    case "knife-edge": {
      if (tierCount === 2) {
        return game === "blind"
          ? [0, 0, 1, 1, randomInteger(random, 0, 1)]
          : [0, 0, 0, 0, 1, 1, 1, 1];
      }

      const anchor = randomInteger(random, 1, tierCount - 2);
      if (game === "blind") {
        return shuffleLineup(
          [anchor, anchor, anchor - 1, anchor + 1, random() < 0.5 ? anchor - 1 : anchor + 1],
          random,
        );
      }

      return shuffleLineup([
        ...Array.from({ length: 3 }, () => randomInteger(random, 0, anchor - 1)),
        anchor,
        anchor,
        ...Array.from({ length: 3 }, () => randomInteger(random, anchor + 1, tierCount - 1)),
      ], random);
    }

    case "ladder":
      return shuffleLineup(ladderTargets(size, tierCount), random);
  }
}

function isRecognizable(item: FootballRankFiveItem) {
  const tier = (item as RecognizableFootballItem).recognizabilityTier;
  return tier === "A" || tier === "B";
}

function recognizabilityQuota(
  game: "blind" | "keep-cut",
  items: readonly FootballRankFiveItem[],
) {
  const recognizable = items.filter(isRecognizable).length;
  if (game === "blind" && items.length >= 10 && recognizable >= 4) return 2;
  if (game === "keep-cut" && items.length >= 16 && recognizable >= 6) return 3;
  return 0;
}

function healthyTierCap(
  game: "blind" | "keep-cut",
  items: readonly FootballRankFiveItem[],
  tierCount: number,
) {
  if (tierCount < 3) return game === "blind" ? BLIND_RANK_BOARD_SIZE : KEEP_CUT_BOARD_SIZE;
  if (game === "blind" && items.length >= 10) return 2;
  if (game === "keep-cut" && items.length >= 16) return 4;
  return game === "blind" ? BLIND_RANK_BOARD_SIZE : KEEP_CUT_BOARD_SIZE;
}

function markComparisonItemUsed(
  used: Set<string>,
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  picked: FootballRankFiveItem,
  relaxConflicts: boolean,
) {
  used.add(picked.id);
  if (relaxConflicts) return;
  for (const candidate of items) {
    if (footballComparisonItemsConflict(scopeId, picked, candidate)) used.add(candidate.id);
  }
}

function tierCountForSelection(
  selected: readonly FootballRankFiveItem[],
  tier: FootballGreatnessTier,
) {
  return selected.filter((item) => footballGreatnessTierForItem(item) === tier).length;
}

function relaxedDistanceForAttempt(attempt: number, tierCount: number) {
  if (attempt < STRICT_ATTEMPTS) return 0;
  if (attempt < NEIGHBOR_RELAX_ATTEMPTS) return 1;
  return tierCount;
}

function selectBoardComposition(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
  boardType: FootballBoardTypeId,
  game: "blind" | "keep-cut",
  attempt: number,
) {
  const tiers = footballGreatnessTiersForCategory(items);
  const size = game === "blind" ? BLIND_RANK_BOARD_SIZE : KEEP_CUT_BOARD_SIZE;
  const random = seededLineupRandom("football-comparison", game, "composition", scopeId, seed, boardType, attempt);
  const targets = boardTierTargets(boardType, game, tiers.length, random);
  const targetOrder = shuffleLineup(targets, random);
  const used = new Set<string>();
  const selected: FootballRankFiveItem[] = [];
  const quota = recognizabilityQuota(game, items);
  const tierCap = healthyTierCap(game, items, tiers.length);
  const allowedDistance = relaxedDistanceForAttempt(attempt, tiers.length);
  const relaxConflicts = attempt >= NEIGHBOR_RELAX_ATTEMPTS && items.length <= SPARSE_CONFLICT_RELAX_POOL_MAX;

  for (const targetIndex of targetOrder) {
    const remainingSlots = size - selected.length;
    const recognizableSelected = selected.filter(isRecognizable).length;
    const recognizableStillNeeded = Math.max(0, quota - recognizableSelected);
    const mustPickRecognizable = recognizableStillNeeded >= remainingSlots;

    const eligible = items.filter((candidate) => {
      if (used.has(candidate.id)) return false;
      const tier = footballGreatnessTierForItem(candidate);
      const candidateTierIndex = tiers.indexOf(tier);
      if (candidateTierIndex < 0) return false;
      if (Math.abs(candidateTierIndex - targetIndex) > allowedDistance) return false;
      if (tierCountForSelection(selected, tier) >= tierCap) return false;
      if (mustPickRecognizable && !isRecognizable(candidate)) return false;
      return true;
    });
    if (!eligible.length) return null;

    const nearestDistance = Math.min(...eligible.map((candidate) => (
      Math.abs(tiers.indexOf(footballGreatnessTierForItem(candidate)) - targetIndex)
    )));
    let nearest = eligible.filter((candidate) => (
      Math.abs(tiers.indexOf(footballGreatnessTierForItem(candidate)) - targetIndex) === nearestDistance
    ));

    if (!mustPickRecognizable && recognizableStillNeeded > 0) {
      const recognizableNearest = nearest.filter(isRecognizable);
      if (recognizableNearest.length && random() < 0.62) nearest = recognizableNearest;
    }

    const picked = shuffleLineup(nearest, random)[0];
    if (!picked) return null;
    selected.push(picked);
    markComparisonItemUsed(used, items, scopeId, picked, relaxConflicts);
  }

  if (selected.length !== size) return null;
  if (new Set(selected.map((item) => item.id)).size !== size) return null;
  if (selected.filter(isRecognizable).length < quota) return null;

  const selectedTiers = selected.map(footballGreatnessTierForItem);
  if (game === "blind" && tiers.length > 1 && new Set(selectedTiers).size < 2) return null;
  if (game === "blind" && tierCap === 2) {
    const maxTierCount = Math.max(...tiers.map((tier) => tierCountForSelection(selected, tier)));
    if (maxTierCount > 2) return null;
  }
  if (game === "keep-cut" && tierCap === 4) {
    const maxTierCount = Math.max(...tiers.map((tier) => tierCountForSelection(selected, tier)));
    if (maxTierCount > 4 || new Set(selectedTiers).size < 2) return null;
  }

  return selected;
}

function tierMetrics(
  selected: readonly FootballRankFiveItem[],
  categoryItems: readonly FootballRankFiveItem[],
) {
  const tiers = footballGreatnessTiersForCategory(categoryItems);
  const tierIndex = (item: FootballRankFiveItem) => tiers.indexOf(footballGreatnessTierForItem(item));
  const ordered = [...selected].sort((left, right) => tierIndex(left) - tierIndex(right));
  const strongestTier = tiers[0];
  const weakestTier = tiers.at(-1);
  const eliteItems = strongestTier
    ? selected.filter((item) => footballGreatnessTierForItem(item) === strongestTier).length
    : 0;
  const badItems = weakestTier
    ? selected.filter((item) => footballGreatnessTierForItem(item) === weakestTier).length
    : 0;
  const cutoffGap = ordered.length >= KEEP_CUT_BOARD_SIZE
    ? Math.abs(tierIndex(ordered[KEEP_COUNT - 1]!) - tierIndex(ordered[KEEP_COUNT]!))
    : 0;

  return {
    badItems,
    eliteItems,
    cutoffGap,
    distinctTiers: new Set(selected.map(footballGreatnessTierForItem)).size,
  };
}

function revealShuffle(
  selected: readonly FootballRankFiveItem[],
  game: "blind" | "keep-cut",
  scopeId: string,
  seed: string,
) {
  return shuffleLineup(
    [...selected],
    seededLineupRandom("football-comparison", game, "reveal", scopeId, seed),
  );
}

export function footballKeepCutRequiredDistinctTiers(items: readonly FootballRankFiveItem[]) {
  return Math.min(2, footballGreatnessTiersForCategory(items).length);
}

/** Compatibility helper retained for existing diagnostics; generation no longer uses an elite cap. */
export function footballKeepCutEliteCap(items: readonly FootballRankFiveItem[]) {
  const tiers = footballGreatnessTiersForCategory(items);
  if (!tiers.length) return 0;
  const topTierCount = items.filter((item) => footballGreatnessTierForItem(item) === tiers[0]).length;
  return Math.min(KEEP_COUNT, topTierCount);
}

export function footballKeepCutBoardIsCompetitive(
  items: readonly FootballRankFiveItem[],
  pool: readonly FootballRankFiveItem[] = items,
) {
  if (items.length !== KEEP_CUT_BOARD_SIZE) return false;
  if (new Set(items.map((item) => item.id)).size !== KEEP_CUT_BOARD_SIZE) return false;
  const availableTierCount = footballGreatnessTiersForCategory(pool).length;
  const distinctTiers = new Set(items.map(footballGreatnessTierForItem)).size;
  if (availableTierCount > 1 && distinctTiers < 2) return false;
  if (pool.length >= 16 && availableTierCount >= 3) {
    const maxTierCount = Math.max(...footballGreatnessTiersForCategory(pool).map((tier) => (
      items.filter((item) => footballGreatnessTierForItem(item) === tier).length
    )));
    if (maxTierCount > 4) return false;
  }
  return true;
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
  const boardType = requestedArchetypeId
    ? FOOTBALL_BLIND_RANK_ARCHETYPES.find((row) => row.id === requestedArchetypeId)
    : footballBlindRankBoardTypeForSeed(scopeId, seed);
  if (!boardType) throw new Error(`Unsupported Football Blind Rank board type: ${String(requestedArchetypeId)}`);

  for (let attempt = 0; attempt < BOARD_ATTEMPTS; attempt += 1) {
    const selected = selectBoardComposition(items, scopeId, seed, boardType.id, "blind", attempt);
    if (!selected) continue;
    const metrics = tierMetrics(selected, items);
    return {
      items: revealShuffle(selected, "blind", scopeId, seed),
      boardType: boardType.id,
      archetype: boardType.id,
      badItems: metrics.badItems,
      attemptsUsed: attempt + 1,
    };
  }

  throw new Error(`Football Blind Rank could not build a ${boardType.name} five-subject board for ${scopeId}.`);
}

export function buildFootballKeepCutBoard(
  items: readonly FootballRankFiveItem[],
  scopeId: string,
  seed: string,
): FootballKeepCutBoard {
  if (items.length < KEEP_CUT_BOARD_SIZE) {
    throw new Error(`Football Keep/Cut needs at least ${KEEP_CUT_BOARD_SIZE} comparison subjects.`);
  }
  const boardType = footballKeepCutBoardTypeForSeed(scopeId, seed);
  const availableTierCount = footballGreatnessTiersForCategory(items).length;

  for (let attempt = 0; attempt < BOARD_ATTEMPTS; attempt += 1) {
    const selected = selectBoardComposition(items, scopeId, seed, boardType.id, "keep-cut", attempt);
    if (!selected) continue;
    const metrics = tierMetrics(selected, items);
    if (boardType.id === "knife-edge" && availableTierCount >= 3 && attempt < NEIGHBOR_RELAX_ATTEMPTS && metrics.cutoffGap !== 0) {
      continue;
    }
    if (!footballKeepCutBoardIsCompetitive(selected, items)) continue;
    return {
      items: revealShuffle(selected, "keep-cut", scopeId, seed),
      boardType: boardType.id,
      style: boardType.id,
      badItems: metrics.badItems,
      eliteItems: metrics.eliteItems,
      cutoffGap: metrics.cutoffGap,
      distinctTiers: metrics.distinctTiers,
      attemptsUsed: attempt + 1,
    };
  }

  throw new Error(`Football Keep/Cut could not build a ${boardType.name} eight-subject board for ${scopeId}.`);
}
