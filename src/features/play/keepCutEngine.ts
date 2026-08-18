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
import { OFFICIAL_COMPARISON_GRADING_RULES } from "./officialScoreContract";

export type KeepCutPackId = BlindRankPackId;
export type KeepCutTierId = "elite" | "great" | "good" | "average" | "below-average" | "bad";
export type KeepCutBoardStyleId =
  | "knife-edge"
  | "messy-middle"
  | "one-superstar"
  | "bottom-grind"
  | "classic-spread";

export interface KeepCutPack {
  id: KeepCutPackId;
  group: "Careers" | "Divisions" | "Skills";
  name: string;
  prompt: string;
  description: string;
}

export interface KeepCutAssignment {
  roleId: string;
  targetTier: KeepCutTierId;
  actualTier: KeepCutTierId;
  fighterId: string;
}

export interface KeepCutLineup {
  packId: KeepCutPackId;
  seed: string;
  fighters: PlayFighter[];
  assignments: KeepCutAssignment[];
  shape: string;
  recentOverlap: number;
  repeatedShape: boolean;
  attemptsUsed: number;
  fallbackUsed: boolean;
}

export interface KeepCutResult {
  kept: PlayFighter[];
  cut: PlayFighter[];
  keptIds: string[];
  cutIds: string[];
  correctComparisons: number;
  modelTopFourKept: number;
  score: number;
  label: KeepCutScoreLabel;
}

export interface KeepCutBoardStyle {
  id: KeepCutBoardStyleId;
  name: string;
  weight: number;
  targets: readonly KeepCutTierId[];
}

export type KeepCutScoreLabel = "Legendary four" | "Excellent keeps" | "Solid card" | "Tough cuts" | "Rough room";

const KEEP_COUNT = 4;
const BOARD_SIZE = 8;
const GENERATION_ATTEMPTS = 120;
const MAX_BAD_FIGHTERS = 2;
const MAX_ELITE_FIGHTERS = 2;
const MAX_CUTOFF_GAP = 8;
const TIER_ORDER: readonly KeepCutTierId[] = [
  "elite",
  "great",
  "good",
  "average",
  "below-average",
  "bad",
];

export const KEEP_CUT_PACKS: readonly KeepCutPack[] = [
  { id: "ufc-careers", group: "Careers", name: "UFC Careers", prompt: "Keep four UFC careers. Cut four.", description: "Men's UFC-only career value from the canonical Play rating owner." },
  { id: "all-careers", group: "Careers", name: "All UFC Careers", prompt: "Keep four UFC careers. Cut four.", description: "Men and women together on one UFC-only career scale." },
  { id: "womens-careers", group: "Careers", name: "Women’s UFC Careers", prompt: "Keep four UFC careers. Cut four.", description: "Women’s UFC career value from the canonical Play rating owner." },
  { id: "lightweight", group: "Divisions", name: "Lightweight Careers", prompt: "Keep four lightweights. Cut four.", description: "UFC careers rated in the supported lightweight pool." },
  { id: "welterweight", group: "Divisions", name: "Welterweight Careers", prompt: "Keep four welterweights. Cut four.", description: "UFC careers rated in the supported welterweight pool." },
  { id: "heavyweight", group: "Divisions", name: "Heavyweight Careers", prompt: "Keep four heavyweights. Cut four.", description: "UFC careers rated in the supported heavyweight pool." },
  { id: "striking", group: "Skills", name: "Striking", prompt: "Keep four strikers. Cut four.", description: "UFC striking ratings from the canonical Play rating owner." },
  { id: "wrestling-grappling", group: "Skills", name: "Wrestling & Grappling", prompt: "Keep four grapplers. Cut four.", description: "UFC wrestling and grappling ratings from the canonical Play rating owner." },
] as const;

export const KEEP_CUT_BOARD_STYLES: readonly KeepCutBoardStyle[] = [
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

// Compatibility export for any existing Keep/Cut-only consumer. These are Keep/Cut
// board styles, not Blind Rank archetypes.
export const KEEP_CUT_ROLES = KEEP_CUT_BOARD_STYLES;

interface RatedRow {
  fighter: PlayFighter;
  score: number;
  tier: KeepCutTierId;
}

interface KeepCutBoardProfile {
  style: KeepCutBoardStyle;
  targets: KeepCutTierId[];
  eliteCount: number;
  badCount: number;
}

function packFor(packId: KeepCutPackId) {
  return KEEP_CUT_PACKS.find((pack) => pack.id === packId) ?? KEEP_CUT_PACKS[0]!;
}

export function keepCutRating(packId: KeepCutPackId, fighter: PlayFighter) {
  return blindRankRating(fighter, packId);
}

export function keepCutPool(packId: KeepCutPackId) {
  return blindRankPool(packId).filter((fighter) => Number.isFinite(keepCutRating(packId, fighter)));
}

export function keepCutTier(score: number): KeepCutTierId {
  if (score >= 92) return "elite";
  if (score >= 82) return "great";
  if (score >= 70) return "good";
  if (score >= 55) return "average";
  if (score >= 35) return "below-average";
  return "bad";
}

function shapeFor(packId: KeepCutPackId, fighters: readonly PlayFighter[]) {
  return TIER_ORDER
    .map((tier) => `${tier}:${fighters.filter((fighter) => keepCutTier(keepCutRating(packId, fighter)) === tier).length}`)
    .join("|");
}

export function keepCutBoardStyleForSeed(packId: KeepCutPackId, seed: string): KeepCutBoardStyle {
  const random = seededLineupRandom("keep-cut", "board-style", packId, seed);
  let cursor = random();
  for (const style of KEEP_CUT_BOARD_STYLES) {
    cursor -= style.weight;
    if (cursor <= 0) return style;
  }
  return KEEP_CUT_BOARD_STYLES.at(-1)!;
}

function desiredEliteCount(styleId: KeepCutBoardStyleId, random: () => number) {
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

function desiredBadCount(styleId: KeepCutBoardStyleId, random: () => number) {
  const roll = random();
  switch (styleId) {
    case "knife-edge":
      return roll < 0.125 ? 1 : 0;
    case "messy-middle":
    case "one-superstar":
      return roll < 0.5 ? 1 : 0;
    case "bottom-grind":
      return roll < 0.5 ? 2 : 1;
    case "classic-spread":
      return 1;
  }
}

function replaceHighestTargets(targets: KeepCutTierId[], tier: KeepCutTierId, count: number) {
  const already = targets.filter((target) => target === tier).length;
  for (let index = 0; index < count - already; index += 1) {
    const replaceAt = targets.findIndex((target) => target !== tier && target !== "bad");
    if (replaceAt >= 0) targets[replaceAt] = tier;
  }
}

function replaceLowestTargets(targets: KeepCutTierId[], tier: KeepCutTierId, count: number) {
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

function boardProfileForSeed(packId: KeepCutPackId, seed: string): KeepCutBoardProfile {
  const style = keepCutBoardStyleForSeed(packId, seed);
  const random = seededLineupRandom("keep-cut", "board-profile", packId, seed, style.id);
  const eliteCount = desiredEliteCount(style.id, random);
  const badCount = desiredBadCount(style.id, random);
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

  return { style, targets, eliteCount, badCount };
}

function chooseRow(
  rows: readonly RatedRow[],
  targetTier: KeepCutTierId,
  used: Set<string>,
  badCount: number,
  random: () => number,
) {
  const eligible = rows.filter((row) => (
    !used.has(row.fighter.id)
    && !(row.tier === "bad" && badCount >= MAX_BAD_FIGHTERS)
  ));
  const exact = shuffleLineup(eligible.filter((row) => row.tier === targetTier), random)[0];
  if (exact) return exact;

  const targetIndex = TIER_ORDER.indexOf(targetTier);
  const adjacentTiers = shuffleLineup(
    [targetIndex - 1, targetIndex + 1]
      .filter((index) => index >= 0 && index < TIER_ORDER.length)
      .map((index) => TIER_ORDER[index]!),
    random,
  );
  for (const tier of adjacentTiers) {
    const adjacent = shuffleLineup(eligible.filter((row) => row.tier === tier), random)[0];
    if (adjacent) return adjacent;
  }

  return shuffleLineup(eligible, random)
    .sort((left, right) => {
      const leftDistance = Math.abs(TIER_ORDER.indexOf(left.tier) - targetIndex);
      const rightDistance = Math.abs(TIER_ORDER.indexOf(right.tier) - targetIndex);
      return leftDistance - rightDistance;
    })[0] ?? null;
}

function tierCount(packId: KeepCutPackId, fighters: readonly PlayFighter[], tier: KeepCutTierId) {
  return fighters.filter((fighter) => keepCutTier(keepCutRating(packId, fighter)) === tier).length;
}

export function keepCutBoardIsCompetitive(packId: KeepCutPackId, fighters: readonly PlayFighter[]) {
  if (fighters.length !== BOARD_SIZE) return false;
  if (new Set(fighters.map((fighter) => fighter.id)).size !== BOARD_SIZE) return false;

  const scores = fighters.map((fighter) => keepCutRating(packId, fighter)).sort((a, b) => b - a);
  const tiers = scores.map(keepCutTier);
  const coreChoices = tiers.filter((tier) => (
    tier === "good" || tier === "average" || tier === "below-average"
  )).length;
  const elite = tiers.filter((tier) => tier === "elite").length;
  const bad = tiers.filter((tier) => tier === "bad").length;
  const distinctTiers = new Set(tiers).size;
  const cutoffGap = Math.abs(scores[3]! - scores[4]!);

  return (
    coreChoices >= 4
    && elite <= MAX_ELITE_FIGHTERS
    && bad <= MAX_BAD_FIGHTERS
    && distinctTiers >= 3
    && cutoffGap <= MAX_CUTOFF_GAP
  );
}

function attemptBoard(
  packId: KeepCutPackId,
  seed: string,
  profile: KeepCutBoardProfile,
  attempt: number,
) {
  const random = seededLineupRandom("keep-cut", packId, seed, profile.style.id, attempt);
  const rows = keepCutPool(packId).map((fighter) => {
    const score = keepCutRating(packId, fighter);
    return { fighter, score, tier: keepCutTier(score) };
  });
  if (rows.length < BOARD_SIZE) return null;

  const used = new Set<string>();
  const selected: PlayFighter[] = [];
  const assignments: KeepCutAssignment[] = [];
  let badCount = 0;

  for (let index = 0; index < profile.targets.length; index += 1) {
    const targetTier = profile.targets[index]!;
    const picked = chooseRow(rows, targetTier, used, badCount, random);
    if (!picked) return null;
    used.add(picked.fighter.id);
    selected.push(picked.fighter);
    badCount += picked.tier === "bad" ? 1 : 0;
    assignments.push({
      roleId: `${profile.style.id}-${index + 1}`,
      targetTier,
      actualTier: picked.tier,
      fighterId: picked.fighter.id,
    });
  }

  if (tierCount(packId, selected, "elite") !== profile.eliteCount) return null;
  if (tierCount(packId, selected, "bad") !== profile.badCount) return null;
  if (!keepCutBoardIsCompetitive(packId, selected)) return null;

  return {
    fighters: shuffleLineup(selected, random),
    assignments,
  };
}

export function createKeepCutSeed() {
  return createReplaySeed("keep-cut");
}

export function createKeepCutLineup(packId: KeepCutPackId, seed: string): KeepCutLineup {
  const profile = boardProfileForSeed(packId, seed);

  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = attemptBoard(packId, seed, profile, attempt);
    if (!candidate) continue;
    return {
      packId,
      seed,
      fighters: candidate.fighters,
      assignments: candidate.assignments,
      shape: shapeFor(packId, candidate.fighters),
      recentOverlap: 0,
      repeatedShape: false,
      attemptsUsed: attempt + 1,
      fallbackUsed: candidate.assignments.some((assignment) => assignment.targetTier !== assignment.actualTier),
    };
  }

  throw new Error(
    `Keep 4, Cut 4 could not build a ${profile.style.name} lineup for ${packFor(packId).name} without weakening the board contract.`,
  );
}

export function resolveKeepCutChallenge(packId: KeepCutPackId, lineupIds: readonly string[]) {
  const validIds = new Set(keepCutPool(packId).map((fighter) => fighter.id));
  if (!validateLineupIds(lineupIds, BOARD_SIZE, validIds).valid) return null;
  const fighters = lineupIds.map((id) => getPlayFighter(id));
  return fighters.every(Boolean) ? fighters as PlayFighter[] : null;
}

export function keepCutScoreLabel(score: number): KeepCutScoreLabel {
  if (score >= 90) return "Legendary four";
  if (score >= 78) return "Excellent keeps";
  if (score >= 62) return "Solid card";
  if (score >= 45) return "Tough cuts";
  return "Rough room";
}

export function scoreKeepCutSelection(packId: KeepCutPackId, board: readonly PlayFighter[], keptIds: readonly string[]): KeepCutResult {
  if (board.length !== BOARD_SIZE || new Set(board.map((fighter) => fighter.id)).size !== BOARD_SIZE) {
    throw new Error("Keep/Cut scoring requires one unique eight-fighter board.");
  }
  if (keptIds.length !== KEEP_COUNT || new Set(keptIds).size !== KEEP_COUNT) {
    throw new Error("Keep/Cut scoring requires exactly four kept fighters.");
  }
  const boardIds = new Set(board.map((fighter) => fighter.id));
  if (keptIds.some((id) => !boardIds.has(id))) throw new Error("Kept fighters must come from the board.");

  const keptSet = new Set(keptIds);
  const kept = board.filter((fighter) => keptSet.has(fighter.id));
  const cut = board.filter((fighter) => !keptSet.has(fighter.id));
  const rules = OFFICIAL_COMPARISON_GRADING_RULES["keep-cut"];
  let correctComparisons = 0;

  for (const keptFighter of kept) {
    const keptRating = keepCutRating(packId, keptFighter);
    for (const cutFighter of cut) {
      const cutRating = keepCutRating(packId, cutFighter);
      if (keptRating >= cutRating - rules.ratingTieTolerance) correctComparisons += 1;
    }
  }

  const score = Math.max(
    0,
    Math.min(100, Math.round(correctComparisons * rules.normalizedPointsPerComparison)),
  );
  const modelTopFourIds = new Set(
    [...board]
      .sort((left, right) => {
        const ratingDifference = keepCutRating(packId, right) - keepCutRating(packId, left);
        return ratingDifference || left.id.localeCompare(right.id);
      })
      .slice(0, KEEP_COUNT)
      .map((fighter) => fighter.id),
  );
  const modelTopFourKept = kept.filter((fighter) => modelTopFourIds.has(fighter.id)).length;

  return {
    kept,
    cut,
    keptIds: kept.map((fighter) => fighter.id),
    cutIds: cut.map((fighter) => fighter.id),
    correctComparisons,
    modelTopFourKept,
    score,
    label: keepCutScoreLabel(score),
  };
}

export function keepCutChallengeUrl(packId: KeepCutPackId, lineup: readonly PlayFighter[]) {
  const url = new URL("/play/keep-cut", window.location.origin);
  url.searchParams.set("pack", packId);
  url.searchParams.set("lineup", lineup.map((fighter) => fighter.id).join(","));
  return url.toString();
}
