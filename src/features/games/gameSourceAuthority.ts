import {
  buildFootballComparisonCandidatePool,
  footballComparisonCategorySpecs,
  type FootballComparisonCandidate,
} from "../back-room/footballComparisonAuthority";
import {
  footballSubjectMeetsFactRequirements,
  type FootballFactRequirementGroup,
} from "../back-room/footballFactualEligibility";
import type {
  FootballRankFiveItem,
  FootballRankFivePackId,
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

/** One Games-facing path into the canonical Football comparison authority. */
export function footballGameComparisonCandidates(
  packId: FootballRankFivePackId,
  reviewedItems: readonly FootballRankFiveItem[] = [],
) {
  return buildFootballComparisonCandidatePool(packId, reviewedItems)
    .filter((candidate) => footballGameComparisonCandidateIsEligible(packId, candidate));
}
