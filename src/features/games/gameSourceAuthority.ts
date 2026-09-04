import {
  buildFootballComparisonCandidatePool,
  footballComparisonCategorySpecs,
  type FootballComparisonCandidate,
} from "../back-room/footballComparisonAuthority";
import { getFootballRatingBand, type FootballRatingBand } from "../back-room/footballContentContract";
import {
  footballSubjectMeetsFactRequirements,
  type FootballFactRequirementGroup,
} from "../back-room/footballFactualEligibility";
import {
  footballRankFivePacks as reviewedFootballRankFivePacks,
  type FootballRankFiveItem,
  type FootballRankFivePackId,
} from "../back-room/footballRankFiveModel";

export type GameSourceOwnerId =
  | "ufc-factual-ledger"
  | "ufc-calculated-ranking"
  | "ufc-approved-play-ratings"
  | "ufc-wavelength-catalog"
  | "ufc-auction-runtime"
  | "football-factual-registry"
  | "football-comparison-authority"
  | "football-wavelength-catalog";

export type GameSourceKind = "factual" | "comparison" | "hybrid" | "subjective-catalog" | "runtime";
export type GameComparisonResolution =
  | "exact-rating"
  | "greatness-tier"
  | "greatness-tier-three-way"
  | "canonical-category-score";

export interface GameSourceContractEntry {
  status: "existing" | "future";
  kind: GameSourceKind;
  owners: readonly GameSourceOwnerId[];
  eligibility: "canonical-evidence-required" | "approved-catalog-only" | "backend-contract";
  comparisonResolution?: GameComparisonResolution;
}

/**
 * Cross-sport Games source contract. This module declares ownership and delegates
 * eligibility to the existing canonical owners; it never stores facts, ratings,
 * subjects, greatness tiers, or a fallback roster of its own.
 *
 * Football greatness gameplay follows docs/football-greatness-tier-philosophy.md:
 * exact/private comparison scores may support calibration or matchup selection, but
 * they are not official within-tier truth. Mechanic-specific tier UI/grading changes
 * remain owned by the focused Blind Resume and Daily Double PRs.
 */
export const GAME_SOURCE_AUTHORITY = {
  "find-the-leader": {
    UFC: { status: "existing", kind: "factual", owners: ["ufc-factual-ledger"], eligibility: "canonical-evidence-required" },
    Football: { status: "existing", kind: "factual", owners: ["football-factual-registry"], eligibility: "canonical-evidence-required" },
  },
  wavelength: {
    UFC: { status: "existing", kind: "subjective-catalog", owners: ["ufc-wavelength-catalog"], eligibility: "approved-catalog-only" },
    Football: { status: "existing", kind: "subjective-catalog", owners: ["football-wavelength-catalog"], eligibility: "approved-catalog-only" },
  },
  "blind-resume": {
    UFC: {
      status: "existing",
      kind: "hybrid",
      owners: ["ufc-factual-ledger", "ufc-calculated-ranking"],
      eligibility: "canonical-evidence-required",
      comparisonResolution: "exact-rating",
    },
    Football: {
      status: "existing",
      kind: "hybrid",
      owners: ["football-factual-registry", "football-comparison-authority"],
      eligibility: "canonical-evidence-required",
      comparisonResolution: "greatness-tier-three-way",
    },
  },
  "hit-the-number": {
    UFC: { status: "existing", kind: "factual", owners: ["ufc-factual-ledger"], eligibility: "canonical-evidence-required" },
    Football: { status: "existing", kind: "factual", owners: ["football-factual-registry"], eligibility: "canonical-evidence-required" },
  },
  "blind-rank-5": {
    UFC: {
      status: "existing",
      kind: "comparison",
      owners: ["ufc-calculated-ranking", "ufc-approved-play-ratings"],
      eligibility: "canonical-evidence-required",
      comparisonResolution: "exact-rating",
    },
    Football: {
      status: "existing",
      kind: "comparison",
      owners: ["football-comparison-authority"],
      eligibility: "canonical-evidence-required",
      comparisonResolution: "greatness-tier",
    },
  },
  "keep-4-cut-4": {
    UFC: {
      status: "existing",
      kind: "comparison",
      owners: ["ufc-calculated-ranking", "ufc-approved-play-ratings"],
      eligibility: "canonical-evidence-required",
      comparisonResolution: "exact-rating",
    },
    Football: {
      status: "existing",
      kind: "comparison",
      owners: ["football-comparison-authority"],
      eligibility: "canonical-evidence-required",
      comparisonResolution: "greatness-tier",
    },
  },
  "20-questions": {
    UFC: { status: "future", kind: "factual", owners: ["ufc-factual-ledger"], eligibility: "canonical-evidence-required" },
    Football: { status: "future", kind: "factual", owners: ["football-factual-registry"], eligibility: "canonical-evidence-required" },
  },
  "who-am-i": {
    UFC: { status: "future", kind: "factual", owners: ["ufc-factual-ledger"], eligibility: "canonical-evidence-required" },
    Football: { status: "future", kind: "factual", owners: ["football-factual-registry"], eligibility: "canonical-evidence-required" },
  },
  auction: {
    UFC: { status: "existing", kind: "runtime", owners: ["ufc-auction-runtime", "ufc-calculated-ranking", "ufc-approved-play-ratings"], eligibility: "backend-contract" },
  },
  "draft-room": {
    Football: {
      status: "future",
      kind: "comparison",
      owners: ["football-comparison-authority"],
      eligibility: "canonical-evidence-required",
      comparisonResolution: "canonical-category-score",
    },
  },
} as const satisfies Record<string, Partial<Record<"UFC" | "Football", GameSourceContractEntry>>>;

/** Factual Football games fail closed through the canonical factual ledger. */
export function footballGameSubjectMeetsFactRequirements(
  subjectId: string,
  requirements: readonly FootballFactRequirementGroup[],
) {
  return footballSubjectMeetsFactRequirements(subjectId, requirements);
}

/**
 * Games accept only rated outputs returned by the canonical comparison authority.
 * Reviewed calibration may grade a matching canonical identity because the authority
 * intentionally owns that result; reviewed rows never create membership on their own.
 * Newly calculated candidates must still meet the category's canonical fact floor.
 */
export function footballGameComparisonCandidateIsEligible(
  packId: FootballRankFivePackId,
  candidate: Pick<FootballComparisonCandidate, "evaluationSource" | "factMetricIds" | "rankingStatus">,
) {
  if (candidate.rankingStatus !== "rated") return false;
  if (candidate.evaluationSource === "reviewed") return true;
  return candidate.factMetricIds.length >= footballComparisonCategorySpecs[packId].minimumFacts;
}

function reviewedItemsForPack(packId: FootballRankFivePackId) {
  return reviewedFootballRankFivePacks.find((pack) => pack.id === packId)?.items ?? [];
}

/** One Games-facing path into the canonical Football comparison authority. */
export function footballGameComparisonCandidates(
  packId: FootballRankFivePackId,
  reviewedItems: readonly FootballRankFiveItem[] = reviewedItemsForPack(packId),
) {
  return buildFootballComparisonCandidatePool(packId, reviewedItems)
    .filter((candidate) => footballGameComparisonCandidateIsEligible(packId, candidate));
}

export type FootballGameComparisonContract = "career" | "season" | "team" | "program" | "coach";
export type FootballGameComparisonVerdict = "left" | "tie" | "right";

const RANKING_SEMANTICS_BY_CONTRACT = {
  career: ["career-greatness"],
  season: ["single-season-greatness"],
  team: ["team-season-greatness"],
  program: ["program-franchise-greatness", "bounded-era-greatness"],
  coach: ["coach-greatness"],
} as const satisfies Record<FootballGameComparisonContract, readonly FootballComparisonCandidate["rankingSemantic"][]>;

const FOOTBALL_GREATNESS_TIER_ORDER: readonly FootballRatingBand[] = [
  "elite",
  "great",
  "good",
  "average",
  "below-average",
  "bad",
];

export interface FootballGameComparisonResolution {
  owner: "football-comparison-authority";
  contract: FootballGameComparisonContract;
  packId: FootballRankFivePackId;
  left: FootballComparisonCandidate;
  right: FootballComparisonCandidate;
  leftTier: FootballRatingBand;
  rightTier: FootballRatingBand;
  verdict: FootballGameComparisonVerdict;
}

/**
 * Blind Resume and other three-way comparison mechanics resolve through canonical
 * comparison candidates plus the locked Football greatness-tier contract. The private
 * rating remains available for matchup selection only; it never breaks a same-tier tie.
 * A semantic mismatch or missing canonical candidate fails closed.
 */
export function footballGameComparisonResolution(
  packId: FootballRankFivePackId,
  leftId: string,
  rightId: string,
  contract: FootballGameComparisonContract,
): FootballGameComparisonResolution | null {
  if (!leftId || !rightId || leftId === rightId) return null;
  const candidates = footballGameComparisonCandidates(packId);
  const left = candidates.find((candidate) => candidate.id === leftId);
  const right = candidates.find((candidate) => candidate.id === rightId);
  if (!left || !right) return null;

  const allowedSemantics = RANKING_SEMANTICS_BY_CONTRACT[contract];
  if (!allowedSemantics.includes(left.rankingSemantic) || !allowedSemantics.includes(right.rankingSemantic)) {
    return null;
  }

  const leftTier = getFootballRatingBand(left.rating);
  const rightTier = getFootballRatingBand(right.rating);
  const leftIndex = FOOTBALL_GREATNESS_TIER_ORDER.indexOf(leftTier);
  const rightIndex = FOOTBALL_GREATNESS_TIER_ORDER.indexOf(rightTier);
  const verdict: FootballGameComparisonVerdict = leftIndex === rightIndex
    ? "tie"
    : leftIndex < rightIndex
      ? "left"
      : "right";

  return {
    owner: "football-comparison-authority",
    contract,
    packId,
    left,
    right,
    leftTier,
    rightTier,
    verdict,
  };
}
