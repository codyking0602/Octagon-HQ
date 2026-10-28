import {
  blindRankPool,
  blindRankRating,
  getPlayFighter,
  type BlindRankPackId,
  type PlayFighter,
} from "./playFighterPool";
import {
  createReplaySeed,
  seededLineupRandom,
  shuffleLineup,
  validateLineupIds,
} from "./lineupModel";

export type BlindRankTierId = "elite" | "great" | "good" | "average" | "below-average" | "bad";

export interface BlindRankPack {
  id: BlindRankPackId;
  name: string;
  prompt: string;
  intro: string;
}

export interface BlindRankRole {
  id: string;
  name: string;
  weights: Record<BlindRankTierId, number>;
}

export interface BlindRankAssignment {
  roleId: string;
  targetTier: BlindRankTierId;
  actualTier: BlindRankTierId;
  fighterId: string;
  fallback: "exact" | "adjacent" | "emergency";
}

export type BlindRankArchetypeId = "balanced" | "top-heavy" | "bottom-heavy" | "middle-cluster" | "chaos";

export interface BlindRankLineup {
  packId: BlindRankPackId;
  seed: string;
  archetype: BlindRankArchetypeId;
  fighters: PlayFighter[];
  assignments: BlindRankAssignment[];
  badFighters: number;
}

export interface CreateBlindRankLineupOptions {
  archetype?: BlindRankArchetypeId;
}

export const BLIND_RANK_TIERS: readonly { id: BlindRankTierId; name: string; minScore: number }[] = [
  { id: "elite", name: "Elite", minScore: 92 },
  { id: "great", name: "Great", minScore: 82 },
  { id: "good", name: "Good", minScore: 70 },
  { id: "average", name: "Average", minScore: 55 },
  { id: "below-average", name: "Below Average", minScore: 35 },
  { id: "bad", name: "Bad", minScore: 0 },
] as const;

const zeroWeights = (): Record<BlindRankTierId, number> => ({
  elite: 0,
  great: 0,
  good: 0,
  average: 0,
  "below-average": 0,
  bad: 0,
});

function weights(values: Partial<Record<BlindRankTierId, number>>) {
  return { ...zeroWeights(), ...values };
}

export const BLIND_RANK_ROLES: readonly BlindRankRole[] = [
  { id: "top-anchor", name: "Top Anchor", weights: weights({ elite: 0.6, great: 0.4 }) },
  { id: "strong-option", name: "Strong Option", weights: weights({ great: 0.45, good: 0.55 }) },
  { id: "middle-option", name: "Middle Option", weights: weights({ good: 0.5, average: 0.5 }) },
  { id: "trap-option", name: "Potential Trap", weights: weights({ average: 0.55, "below-average": 0.45 }) },
  {
    id: "wildcard",
    name: "Wildcard",
    weights: weights({ elite: 0.08, great: 0.12, good: 0.2, average: 0.25, "below-average": 0.25, bad: 0.1 }),
  },
] as const;

export const blindRankPacks: readonly BlindRankPack[] = [
  { id: "ufc-careers", name: "UFC Careers", prompt: "Rank their UFC careers", intro: "You see one fighter at a time. Place each UFC career from #1 to #5 before the next reveal." },
  { id: "all-careers", name: "All UFC Careers", prompt: "Rank their UFC careers", intro: "Rank men and women together, one UFC career at a time." },
  { id: "womens-careers", name: "Women’s UFC Careers", prompt: "Rank their UFC careers", intro: "You see one woman at a time. Place each UFC career from #1 to #5 before the next reveal." },
  { id: "lightweight", name: "Lightweight Careers", prompt: "Rank their UFC careers", intro: "You see one lightweight at a time. Place each UFC career from #1 to #5." },
  { id: "welterweight", name: "Welterweight Careers", prompt: "Rank their UFC careers", intro: "You see one welterweight at a time. Place each UFC career from #1 to #5." },
  { id: "heavyweight", name: "Heavyweight Careers", prompt: "Rank their UFC careers", intro: "You see one heavyweight at a time. Place each UFC career from #1 to #5." },
  { id: "striking", name: "Striking", prompt: "Rank their striking", intro: "Rank only their UFC striking from #1 to #5. Each placement locks before the next reveal." },
  { id: "wrestling-grappling", name: "Wrestling & Grappling", prompt: "Rank their wrestling and grappling", intro: "Rank their UFC wrestling and grappling from #1 to #5. Each placement locks." },
] as const;

const TIER_ORDER: readonly BlindRankTierId[] = ["elite", "great", "good", "average", "below-average", "bad"];
const BOARD_SIZE = 5;
const MAX_BAD_FIGHTERS = 1;
const PACK_KEY = "octagon-hq:blind-rank-pack:v2";

export interface BlindRankArchetype {
  id: BlindRankArchetypeId;
  name: string;
  weight: number;
  targets: readonly BlindRankTierId[];
  minRange: number;
  minHigh?: number;
  maxHigh?: number;
  minMiddle?: number;
  maxMiddle?: number;
  minLow?: number;
  maxLow?: number;
}

// Keep predictable balanced/top-heavy boards uncommon. Chaos owns half the mix, while
// Middle cluster and Bottom-heavy keep boards centered away from elite-heavy lineups.
// Balanced, Bottom-heavy, and Chaos require low-end fighters, so 72% of seeded boards
// target at least one below-average/bad fighter and 62% target multiple low-end fighters.
export const BLIND_RANK_ARCHETYPES: readonly BlindRankArchetype[] = [
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

const HIGH_TIERS = new Set<BlindRankTierId>(["elite", "great"]);
const MIDDLE_TIERS = new Set<BlindRankTierId>(["good", "average"]);
const LOW_TIERS = new Set<BlindRankTierId>(["below-average", "bad"]);
const ARCHETYPE_REROLL_ATTEMPTS = 80;

const BLIND_RANK_ARCHETYPE_FALLBACKS: Record<BlindRankArchetypeId, readonly BlindRankArchetypeId[]> = {
  balanced: ["chaos", "bottom-heavy"],
  "top-heavy": ["middle-cluster"],
  "bottom-heavy": ["chaos", "balanced"],
  "middle-cluster": ["top-heavy"],
  chaos: ["bottom-heavy", "balanced"],
};

function bandCounts(tiers: readonly BlindRankTierId[]) {
  return tiers.reduce((counts, tier) => {
    if (HIGH_TIERS.has(tier)) counts.high += 1;
    if (MIDDLE_TIERS.has(tier)) counts.middle += 1;
    if (LOW_TIERS.has(tier)) counts.low += 1;
    return counts;
  }, { high: 0, middle: 0, low: 0 });
}

export function blindRankArchetypeForSeed(packId: BlindRankPackId, seed: string): BlindRankArchetype {
  const random = seededLineupRandom("blind-rank", "archetype", packId, seed);
  let cursor = random();
  for (const archetype of BLIND_RANK_ARCHETYPES) {
    cursor -= archetype.weight;
    if (cursor <= 0) return archetype;
  }
  return BLIND_RANK_ARCHETYPES.at(-1)!;
}

function validateArchetypeCandidate(
  archetype: BlindRankArchetype,
  rows: readonly { score: number; tier: BlindRankTierId }[],
) {
  if (rows.length !== BOARD_SIZE) return false;
  const scores = rows.map((row) => row.score);
  const range = Math.max(...scores) - Math.min(...scores);
  if (range < archetype.minRange) return false;
  const counts = bandCounts(rows.map((row) => row.tier));
  if (archetype.minHigh !== undefined && counts.high < archetype.minHigh) return false;
  if (archetype.maxHigh !== undefined && counts.high > archetype.maxHigh) return false;
  if (archetype.minMiddle !== undefined && counts.middle < archetype.minMiddle) return false;
  if (archetype.maxMiddle !== undefined && counts.middle > archetype.maxMiddle) return false;
  if (archetype.minLow !== undefined && counts.low < archetype.minLow) return false;
  if (archetype.maxLow !== undefined && counts.low > archetype.maxLow) return false;
  return true;
}

export function blindRankTier(score: number): BlindRankTierId {
  return BLIND_RANK_TIERS.find((tier) => score >= tier.minScore)?.id ?? "bad";
}

function chooseRow(
  rows: readonly { fighter: PlayFighter; score: number; tier: BlindRankTierId }[],
  targetTier: BlindRankTierId,
  used: Set<string>,
  badCount: number,
  random: () => number,
) {
  const eligible = rows.filter((row) => !used.has(row.fighter.id) && !(row.tier === "bad" && badCount >= MAX_BAD_FIGHTERS));
  const exact = shuffleLineup(eligible.filter((row) => row.tier === targetTier), random)[0];
  if (exact) return { row: exact, fallback: "exact" as const };

  const targetIndex = TIER_ORDER.indexOf(targetTier);
  const adjacentTiers = shuffleLineup(
    [targetIndex - 1, targetIndex + 1]
      .filter((index) => index >= 0 && index < TIER_ORDER.length)
      .map((index) => TIER_ORDER[index])
      .filter((tier) => tier !== "bad" || targetTier === "bad"),
    random,
  );
  for (const tier of adjacentTiers) {
    const adjacent = shuffleLineup(eligible.filter((row) => row.tier === tier), random)[0];
    if (adjacent) return { row: adjacent, fallback: "adjacent" as const };
  }

  const emergency = shuffleLineup(eligible, random).sort((left, right) => {
    const leftDistance = Math.abs(TIER_ORDER.indexOf(left.tier) - targetIndex);
    const rightDistance = Math.abs(TIER_ORDER.indexOf(right.tier) - targetIndex);
    return leftDistance - rightDistance;
  })[0];
  return emergency ? { row: emergency, fallback: "emergency" as const } : null;
}

function attemptLineup(
  packId: BlindRankPackId,
  seed: string,
  archetype: BlindRankArchetype,
  attempt: number,
) {
  const random = seededLineupRandom("blind-rank", packId, seed, attempt);
  const rows = blindRankPool(packId).map((fighter) => {
    const score = blindRankRating(fighter, packId);
    return { fighter, score, tier: blindRankTier(score) };
  });
  if (rows.length < 5) return null;

  const used = new Set<string>();
  const assignments: BlindRankAssignment[] = [];
  const selected: PlayFighter[] = [];
  let badCount = 0;

  for (let index = 0; index < BLIND_RANK_ROLES.length; index += 1) {
    const role = BLIND_RANK_ROLES[index];
    const picked = chooseRow(rows, archetype.targets[index], used, badCount, random);
    if (!picked) return null;
    used.add(picked.row.fighter.id);
    selected.push(picked.row.fighter);
    badCount += picked.row.tier === "bad" ? 1 : 0;
    assignments.push({
      roleId: role.id,
      targetTier: archetype.targets[index],
      actualTier: picked.row.tier,
      fighterId: picked.row.fighter.id,
      fallback: picked.fallback,
    });
  }

  const selectedRows = selected.map((fighter) => {
    const score = blindRankRating(fighter, packId);
    return { fighter, score, tier: blindRankTier(score) };
  });
  if (!validateArchetypeCandidate(archetype, selectedRows)) return null;
  return { fighters: shuffleLineup(selected, random), assignments, badFighters: badCount };
}

function buildArchetypeLineup(
  packId: BlindRankPackId,
  seed: string,
  archetype: BlindRankArchetype,
) {
  for (let attempt = 0; attempt < ARCHETYPE_REROLL_ATTEMPTS; attempt += 1) {
    const candidate = attemptLineup(packId, seed, archetype, attempt);
    if (candidate) return candidate;
  }
  return null;
}

function archetypeById(id: BlindRankArchetypeId) {
  return BLIND_RANK_ARCHETYPES.find((row) => row.id === id)!;
}

export function createBlindRankSeed() {
  return createReplaySeed("blind-rank");
}

export function createBlindRankLineup(
  packId: BlindRankPackId,
  seed: string,
  options: CreateBlindRankLineupOptions = {},
): BlindRankLineup {
  const requestedArchetype = options.archetype
    ? BLIND_RANK_ARCHETYPES.find((row) => row.id === options.archetype)
    : blindRankArchetypeForSeed(packId, seed);
  if (!requestedArchetype) throw new Error(`Unsupported Blind Rank archetype: ${String(options.archetype)}`);

  const candidateArchetypes = [
    requestedArchetype,
    ...BLIND_RANK_ARCHETYPE_FALLBACKS[requestedArchetype.id].map(archetypeById),
  ];

  for (const archetype of candidateArchetypes) {
    const candidate = buildArchetypeLineup(packId, seed, archetype);
    if (candidate) return { packId, seed, archetype: archetype.id, ...candidate };
  }

  throw new Error(
    `Blind Rank could not build a ${requestedArchetype.name} five-fighter lineup for ${packId} without changing its low-end board class.`,
  );
}

export function resolveBlindRankChallenge(packId: BlindRankPackId, lineupIds: readonly string[]) {
  const validIds = new Set(blindRankPool(packId).map((fighter) => fighter.id));
  if (!validateLineupIds(lineupIds, 5, validIds).valid) return null;
  const fighters = lineupIds.map((id) => getPlayFighter(id));
  return fighters.every(Boolean) ? fighters as PlayFighter[] : null;
}

export function blindRankChallengeUrl(packId: BlindRankPackId, lineup: readonly PlayFighter[]) {
  const url = new URL("/play/blind-rank", window.location.origin);
  url.searchParams.set("pack", packId);
  url.searchParams.set("lineup", lineup.map((fighter) => fighter.id).join(","));
  return url.toString();
}

export function loadBlindRankPack(): BlindRankPackId {
  if (typeof window === "undefined") return "ufc-careers";
  const saved = window.localStorage.getItem(PACK_KEY) as BlindRankPackId | null;
  return blindRankPacks.some((pack) => pack.id === saved) ? saved! : "ufc-careers";
}

export function saveBlindRankPack(packId: BlindRankPackId) {
  if (typeof window !== "undefined") window.localStorage.setItem(PACK_KEY, packId);
}
