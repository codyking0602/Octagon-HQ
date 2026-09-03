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

export interface GameSourceContractEntry {
  status: "existing" | "future";
  kind: GameSourceKind;
  owners: readonly GameSourceOwnerId[];
  eligibility: "canonical-evidence-required" | "approved-catalog-only" | "backend-contract";
}

/**
 * Cross-sport Games source contract. This module declares ownership and delegates
 * eligibility to the existing canonical owners; it never stores facts, ratings,
 * subjects, or a fallback roster of its own.
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
    UFC: { status: "existing", kind: "hybrid", owners: ["ufc-factual-ledger", "ufc-calculated-ranking"], eligibility: "canonical-evidence-required" },
    Football: { status: "existing", kind: "hybrid", owners: ["football-factual-registry", "football-comparison-authority"], eligibility: "canonical-evidence-required" },
  },
  "hit-the-number": {
    UFC: { status: "existing", kind: "factual", owners: ["ufc-factual-ledger"], eligibility: "canonical-evidence-required" },
    Football: { status: "existing", kind: "factual", owners: ["football-factual-registry"], eligibility: "canonical-evidence-required" },
  },
  "blind-rank-5": {
    UFC: { status: "existing", kind: "comparison", owners: ["ufc-calculated-ranking", "ufc-approved-play-ratings"], eligibility: "canonical-evidence-required" },
    Football: { status: "existing", kind: "comparison", owners: ["football-comparison-authority"], eligibility: "canonical-evidence-required" },
  },
  "keep-4-cut-4": {
    UFC: { status: "existing", kind: "comparison", owners: ["ufc-calculated-ranking", "ufc-approved-play-ratings"], eligibility: "canonical-evidence-required" },
    Football: { status: "existing", kind: "comparison", owners: ["football-comparison-authority"], eligibility: "canonical-evidence-required" },
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
    Football: { status: "future", kind: "comparison", owners: ["football-comparison-authority"], eligibility: "canonical-evidence-required" },
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
 * Comparison-game eligibility is stricter than calibration eligibility: legacy
 * reviewed rows may calibrate the canonical comparison owner, but they cannot
 * make a subject playable without the category's required canonical facts.
 */
export function footballGameComparisonCandidateIsEligible(
  packId: FootballRankFivePackId,
  candidate: Pick<FootballComparisonCandidate, "factMetricIds">,
) {
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
