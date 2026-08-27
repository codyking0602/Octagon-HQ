import {
  seededLineupRandom,
  shuffleLineup,
} from "../play/lineupModel";
import {
  getFootballRatingBand,
  type FootballRatingBand,
} from "./footballContentContract";
import {
  footballComparisonItemsFromCanonicalLedger,
} from "./footballComparisonLedgerAuthority";
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
const DEFAULT_MAX_KEEP_CUT_ELITE = 2;
const MAX_KEEP_CUT_CUTOFF_GAP = 8;
const TIGHT_KEEP_CUT_CUTOFF_GAP = 4;
const BLIND_RANK_ATTEMPTS = 120;
const KEEP_CUT_ATTEMPTS = 180;
const KEEP_CUT_TIGHT_CANDIDATES = 12;

const TARGET_WINDOWS: Record<FootballComparisonTierId, RatingWindow> = {
  elite: { minPercentile: 0, maxPercentile: 0.34 },
  great: { minPercentile: 0.04, maxPercentile: 0.5 },
  good: { minPercentile: 0.16, maxPercentile: 0.68 },
  average: { minPercentile: 0.32, maxPercentile: 0.84 },
  "below-average": { minPercentile: 0.48, maxPercentile: 0.96 },
  bad: { minPercentile: 0.64, maxPercentile: 1 },
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

function repeatableTierCount(items: readonly FootballRankFiveItem[], tier: FootballComparisonTierId) {
  const minimumDepth = Math.max(3, Math.ceil(items.length * 0.1));
  return availableTierCount(items, tier) >= minimumDepth ? 1 : 0;
}

export function footballKeepCutRequiredDistinctTiers(items: readonly FootballRankFiveItem[]) {
  const availableTiers = new Set(items.map(footballComparisonTier)).size;
  const repeatableTiers = TIER_ORDER.reduce(
    (sum, tier) => sum + repeatableTierCount(items, tier),
    0,
  );
  return Math.min(3, availableTiers, Math.max(2, repeatableTiers));
}

function selectionCandidates(
  pool: readonly FootballRankFiveItem[],
  targetTier: FootballComparisonTierId,
  used: ReadonlySet<string>,
  eliteCount: number,
  maxElite: number,
  badCount: number,
  maxBad: number,
  forceAbsoluteTier: boolean,
  includeSparseExact: boolean,
) {
  const eligible = pool.filter((item) => {
    if (used.has(item.id)) return false;
    const tier = footballComparisonTier(item);
    if (tier === "elite" && eliteCount >= maxElite) return false;
    if (tier === "bad" && badCount >= maxBad) return false;
    return true;
  });
  const exact = eligible.filter((item) => footballComparisonTier(item) === targetTier);
  if (forceAbsoluteTier) return exact;

  const percentiles = percentileById(pool);
  const window = TARGET_WINDOWS[targetTier];
  const inWindow = eligible.filter((item) => {
    const percentile = percentiles.get(item.id) ?? 0.5;
    return percentile >= window.minPercentile && percentile <= window.maxPercentile;
  });
  const exactDepth = availableTierCount(pool, targetTier);
  const minimumExactDepth = Math.max(2, Math.ceil(pool.length * 0.08));
  const combined = [
    ...(includeSparseExact || exactDepth >= minimumExactDepth ? exact : []),
    ...inWindow,
  ].filter((item, index, rows) => rows.findIndex((candidate) => candidate.id === item.id) === index);
  if (combined.length) return combined;
  if (exact.length) return exact;
  if (!eligible.length) return [];

  const minimumDistance = Math.min(...eligible.map((item) => (
    tierDistance(footballComparisonTier(item), targetTier)
  )));
  return eligible.filter((item) => tierDistance(footballComparisonTier(item), targetTier) === minimumDistance);
}

function chooseItem(
  pool: readonly FootballRankFiveItem[],
  targetTier: FootballComparisonTierId,
  used: ReadonlySet<string>,
  eliteCount: number,
  maxElite: number,
  badCount: number,
  maxBad: number,
  random: () => number,
  forceAbsoluteTier = false,
  includeSparseExact = true,
) {
  return shuffleLineup(
    selectionCandidates(
      pool,
      targetTier,
      used,
      eliteCount,
      maxElite,
      badCount,
      maxBad,
      forceAbsoluteTier,
      includeSparseExact,
    ),
    random,
  )[0] ?? null;
}

function sustainablePoolRange(items: readonly FootballRankFiveItem[]) {
  const ordered = sortedPool(items);
  const highIndex = Math.round((ordered.length - 1) * 0.3);
  const lowIndex = Math.round((ordered.length - 1) * 0.7);
  return Math.max(4, ordered[highIndex]!.rating - ordered[lowIndex]!.rating);
}

function requiredBlindRankRange(
  items: readonly FootballRankFiveItem[],
  archetype: FootballBlindRankArchetype,
) {
  const reachable = archetype.targets.flatMap((targetTier) => selectionCandidates(
    items,
    targetTier,
    new Set<string>(),
    0,
    BLIND_RANK_BOARD_SIZE,
    0,
    MAX_BLIND_RANK_BAD,
    false,
    false,
  ));
  const uniqueReachable = reachable.filter(
    (item, index, rows) => rows.findIndex((candidate) => candidate.id === item.id) === index,
  );
  const ratings = uniqueReachable.map((item) => item.rating);
  const reachableRange = ratings.length > 1 ? Math.max(...ratings) - Math.min(...ratings) : 4;
  const repeatableReach = Math.max(4, Math.floor(reachableRange * 0.85));
  return Math.min(archetype.minRange, repeatableReach, sustainablePoolRange(items));
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
  let eliteCount = 0;
  let badCount = 0;

  for (const targetTier of archetype.targets) {
    const forceAbsoluteTier = (
      targetTier === "bad"
      && availableTierCount(items, "bad") >= 2
      && random() < 0.72
    );
    const picked = chooseItem(
      items,
      targetTier,
      used,
      eliteCount,
      BLIND_RANK_BOARD_SIZE,
      badCount,
      MAX_BLIND_RANK_BAD,
      random,
      forceAbsoluteTier,
      false,
    );
    if (!picked) return null;
    selected.push(picked);
    used.add(picked.id);
    eliteCount += footballComparisonTier(picked) === "elite" ? 1 : 0;
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
  items = footballComparisonItemsFromCanonicalLedger(scopeId, items, BLIND_RANK_BOARD_SIZE);
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

function minimumCompetitiveEliteCount(items: readonly FootballRankFiveItem[]) {
  const elite = items.filter((item) => footballComparisonTier(item) === "elite");
  if (elite.length < KEEP_COUNT) return 0;
  const nonElite = sortedPool(items.filter((item) => footballComparisonTier(item) !== "elite"));
  const hasTightNonElitePair = nonElite.some((item, index) => (
    index > 0 && Math.abs(nonElite[index - 1]!.rating - item.rating) <= MAX_KEEP_CUT_CUTOFF_GAP
  ));
  if (hasTightNonElitePair || !nonElite.length) return 0;
  const highestNonElite = nonElite[0]!.rating;
  const hasEliteBridge = elite.some((item) => (
    Math.abs(item.rating - highestNonElite) <= MAX_KEEP_CUT_CUTOFF_GAP
  ));
  return hasEliteBridge ? KEEP_COUNT : 0;
}

function minimumProportionalEliteCount(items: readonly FootballRankFiveItem[]) {
  const availableElite = availableTierCount(items, "elite");
  const eliteShare = availableElite / items.length;
  if (eliteShare <= 0.5) return 0;
  return Math.min(availableElite, Math.ceil(KEEP_CUT_BOARD_SIZE * eliteShare));
}

export function footballKeepCutEliteCap(items: readonly FootballRankFiveItem[]) {
  const availableElite = availableTierCount(items, "elite");
  const availableBad = availableTierCount(items, "bad");
  const nonExtremeCount = items.length - availableElite - availableBad;
  const minimumRequiredElite = Math.max(
    minimumCompetitiveEliteCount(items),
    minimumProportionalEliteCount(items),
    KEEP_CUT_BOARD_SIZE - nonExtremeCount - Math.min(availableBad, MAX_KEEP_CUT_BAD),
    0,
  );
  return Math.max(DEFAULT_MAX_KEEP_CUT_ELITE, minimumRequiredElite);
}

function desiredEliteCount(
  styleId: FootballKeepCutBoardStyleId,
  availableElite: number,
  minimumRequiredElite: number,
  eliteCap: number,
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
  if (minimumRequiredElite === 0 && requested > 0 && availableElite === 1 && random() >= 0.55) {
    requested = 0;
  }
  return Math.min(availableElite, eliteCap, Math.max(minimumRequiredElite, requested));
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
  const availableElite = availableTierCount(items, "elite");
  const availableBad = availableTierCount(items, "bad");
  const nonExtremeCount = items.length - availableElite - availableBad;
  const minimumRequiredElite = Math.max(
    minimumCompetitiveEliteCount(items),
    minimumProportionalEliteCount(items),
    KEEP_CUT_BOARD_SIZE - nonExtremeCount - Math.min(availableBad, MAX_KEEP_CUT_BAD),
    0,
  );
  const eliteCap = footballKeepCutEliteCap(items);
  let eliteCount = desiredEliteCount(
    style.id,
    availableElite,
    minimumRequiredElite,
    eliteCap,
    random,
  );
  const minimumRequiredBad = Math.max(0, KEEP_CUT_BOARD_SIZE - nonExtremeCount - eliteCount);
  let badCount = Math.min(
    availableBad,
    MAX_KEEP_CUT_BAD,
    Math.max(minimumRequiredBad, desiredBadCount(style.id, availableBad, random)),
  );
  const requiredDistinctTiers = footballKeepCutRequiredDistinctTiers(items);
  const nonExtremeTiers = TIER_ORDER
    .filter((tier) => tier !== "elite" && tier !== "bad")
    .reduce((sum, tier) => sum + repeatableTierCount(items, tier), 0);
  let reachableTiers = nonExtremeTiers + Number(eliteCount > 0) + Number(badCount > 0);
  const prefersBadTexture = style.id === "bottom-grind" || style.id === "classic-spread";

  if (reachableTiers < requiredDistinctTiers && prefersBadTexture && badCount === 0 && availableBad > 0) {
    badCount = 1;
    reachableTiers += 1;
  }
  if (reachableTiers < requiredDistinctTiers && eliteCount === 0 && availableElite > 0) {
    eliteCount = Math.min(1, eliteCap);
    reachableTiers += Number(eliteCount > 0);
  }
  if (reachableTiers < requiredDistinctTiers && badCount === 0 && availableBad > 0) {
    badCount = 1;
  }

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

export function footballKeepCutBoardIsCompetitive(
  items: readonly FootballRankFiveItem[],
  pool: readonly FootballRankFiveItem[] = items,
) {
  if (items.length !== KEEP_CUT_BOARD_SIZE) return false;
  if (new Set(items.map((item) => item.id)).size !== KEEP_CUT_BOARD_SIZE) return false;
  const ordered = sortedPool(items);
  const poolPercentiles = percentileById(pool);
  const coreChoices = items.filter((item) => {
    const percentile = poolPercentiles.get(item.id) ?? 0.5;
    return percentile >= 0.18 && percentile <= 0.9;
  }).length;
  const elite = countTier(items, "elite");
  const bad = countTier(items, "bad");
  const distinctTiers = new Set(items.map(footballComparisonTier)).size;
  const requiredDistinctTiers = footballKeepCutRequiredDistinctTiers(pool);
  const cutoffGap = Math.abs(ordered[KEEP_COUNT - 1]!.rating - ordered[KEEP_COUNT]!.rating);

  return (
    coreChoices >= 4
    && elite <= footballKeepCutEliteCap(pool)
    && bad <= MAX_KEEP_CUT_BAD
    && distinctTiers >= requiredDistinctTiers
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
  let selectedElite = 0;
  let selectedBad = 0;

  for (const targetTier of targets) {
    const forceAbsoluteTier = targetTier === "elite" || targetTier === "bad";
    const picked = chooseItem(
      items,
      targetTier,
      used,
      selectedElite,
      eliteCount,
      selectedBad,
      badCount,
      random,
      forceAbsoluteTier,
      false,
    );
    if (!picked) return null;
    selected.push(picked);
    used.add(picked.id);
    selectedElite += footballComparisonTier(picked) === "elite" ? 1 : 0;
    selectedBad += footballComparisonTier(picked) === "bad" ? 1 : 0;
  }

  if (selectedElite !== eliteCount || selectedBad !== badCount) return null;
  if (!footballKeepCutBoardIsCompetitive(selected, items)) return null;
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
  const tightCandidates: Array<Omit<FootballKeepCutBoard, "style" | "attemptsUsed"> & { attempt: number }> = [];

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
      tightCandidates.push({ ...board, attempt });
      if (tightCandidates.length >= KEEP_CUT_TIGHT_CANDIDATES) break;
    }
  }

  if (tightCandidates.length) {
    const random = seededLineupRandom("football-keep-cut", "candidate", scopeId, seed, style.id);
    const selected = shuffleLineup(tightCandidates, random)[0]!;
    const { attempt, ...board } = selected;
    return { ...board, style: style.id, attemptsUsed: attempt + 1 };
  }

  if (best) {
    const { attempt, ...board } = best;
    return { ...board, style: style.id, attemptsUsed: attempt + 1 };
  }
  throw new Error(`Football Keep/Cut could not build a ${style.name} eight-subject board for ${scopeId}.`);
}
