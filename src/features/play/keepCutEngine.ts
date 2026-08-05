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
import {
  BLIND_RANK_ARCHETYPES,
  blindRankArchetypeForSeed,
  blindRankTier,
  createBlindRankLineup,
  type BlindRankArchetypeId,
  type BlindRankTierId,
} from "./blindRankEngine";
import { OFFICIAL_COMPARISON_GRADING_RULES } from "./officialScoreContract";

export type KeepCutPackId = BlindRankPackId;
export type KeepCutTierId = BlindRankTierId;

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

export type KeepCutScoreLabel = "Legendary four" | "Excellent keeps" | "Solid card" | "Tough cuts" | "Rough room";

const KEEP_COUNT = 4;
const BOARD_SIZE = 8;
const PRIMARY_GENERATION_ATTEMPTS = 18;
const BALANCED_FALLBACK_ATTEMPTS = 18;
const MAX_BAD_FIGHTERS = 2;

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

export const KEEP_CUT_ROLES = BLIND_RANK_ARCHETYPES;

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
  return blindRankTier(score);
}

function shapeFor(packId: KeepCutPackId, fighters: readonly PlayFighter[]) {
  return ["elite", "great", "good", "average", "below-average", "bad"]
    .map((tier) => `${tier}:${fighters.filter((fighter) => keepCutTier(keepCutRating(packId, fighter)) === tier).length}`)
    .join("|");
}

export function keepCutBoardIsCompetitive(packId: KeepCutPackId, fighters: readonly PlayFighter[]) {
  if (fighters.length !== BOARD_SIZE) return false;
  if (new Set(fighters.map((fighter) => fighter.id)).size !== BOARD_SIZE) return false;
  const scores = fighters.map((fighter) => keepCutRating(packId, fighter)).sort((a, b) => b - a);
  const tiers = scores.map(keepCutTier);
  const high = tiers.filter((tier) => tier === "elite" || tier === "great").length;
  const middle = tiers.filter((tier) => tier === "good" || tier === "average").length;
  const low = tiers.filter((tier) => tier === "below-average" || tier === "bad").length;
  const bad = tiers.filter((tier) => tier === "bad").length;
  const finalCutGap = Math.abs(scores[3]! - scores[4]!);
  return high >= 1 && high <= 4 && middle >= 2 && low >= 1 && bad <= MAX_BAD_FIGHTERS && finalCutGap <= 20;
}

function combinedBlindRankBoard(
  packId: KeepCutPackId,
  seed: string,
  attempt: number,
  forcedArchetype?: BlindRankArchetypeId,
) {
  try {
    const random = seededLineupRandom("keep-cut", packId, seed, attempt, forcedArchetype ?? "weighted");
    const firstSeed = `${seed}:keep:${attempt}:a`;
    const secondSeed = `${seed}:keep:${attempt}:b`;
    const first = createBlindRankLineup(
      packId,
      firstSeed,
      forcedArchetype ? { archetype: forcedArchetype } : undefined,
    );
    const secondArchetype = forcedArchetype ?? blindRankArchetypeForSeed(packId, secondSeed).id;
    const second = createBlindRankLineup(packId, secondSeed, { archetype: secondArchetype });
    const rows = shuffleLineup([...first.fighters, ...second.fighters], random);
    const byId = new Map<string, PlayFighter>();
    for (const fighter of rows) {
      if (!byId.has(fighter.id)) byId.set(fighter.id, fighter);
      if (byId.size === BOARD_SIZE) break;
    }
    const fighters = shuffleLineup([...byId.values()], random);
    return keepCutBoardIsCompetitive(packId, fighters) ? fighters : null;
  } catch {
    return null;
  }
}

export function createKeepCutSeed() {
  return createReplaySeed("keep-cut");
}

export function createKeepCutLineup(packId: KeepCutPackId, seed: string): KeepCutLineup {
  for (let attempt = 0; attempt < PRIMARY_GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = combinedBlindRankBoard(packId, seed, attempt);
    if (candidate) {
      return {
        packId,
        seed,
        fighters: candidate,
        assignments: [],
        shape: shapeFor(packId, candidate),
        recentOverlap: 0,
        repeatedShape: false,
        attemptsUsed: attempt + 1,
        fallbackUsed: false,
      };
    }
  }

  // The only degradation path remains inside this owner and reuses PR 5's canonical
  // Balanced archetype. It is deterministic, separately bounded, and still must pass
  // the exact same eight-fighter competitive-board contract before it can be returned.
  for (let attempt = 0; attempt < BALANCED_FALLBACK_ATTEMPTS; attempt += 1) {
    const candidate = combinedBlindRankBoard(packId, `${seed}:balanced-fallback`, attempt, "balanced");
    if (candidate) {
      return {
        packId,
        seed,
        fighters: candidate,
        assignments: [],
        shape: shapeFor(packId, candidate),
        recentOverlap: 0,
        repeatedShape: false,
        attemptsUsed: PRIMARY_GENERATION_ATTEMPTS + attempt + 1,
        fallbackUsed: true,
      };
    }
  }

  throw new Error(`Keep 4, Cut 4 could not build a competitive lineup for ${packFor(packId).name}.`);
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
