import { wavelengthCatalog } from "./wavelengthCatalog";

export const WAVELENGTH_CALIBRATION_BASELINE_COMMIT = "2ff37fa9b835c647faa2a092338c96e41e300c90" as const;
export const WAVELENGTH_CALIBRATION_REVIEW_DATE = "2026-08-04" as const;
export const WAVELENGTH_CALIBRATION_DISAGREEMENT_THRESHOLD = 6 as const;

export type WavelengthCalibrationResolution =
  | "confirmed"
  | "rerated"
  | "rewritten-and-rerated"
  | "quarantined";

export interface WavelengthInheritedReviewEvidence {
  currentId: string;
  baselineText: string;
  baselineRating: number;
  reviewedRating: number;
  resolution: Exclude<WavelengthCalibrationResolution, "quarantined">;
  rationale: string;
}

/**
 * Auditable reconciliation evidence for inherited V1 clues.
 *
 * The baseline values come from the canonical Wavelength owner at
 * WAVELENGTH_CALIBRATION_BASELINE_COMMIT. The reviewed values are the final
 * ratings in wavelength-catalog-v1. Material disagreements are resolved to a
 * reviewed rating or rewritten question; they are never averaged.
 */
export const WAVELENGTH_INHERITED_REVIEW_EVIDENCE: readonly WavelengthInheritedReviewEvidence[] = [
  {
    currentId: "wl-ufc-resume-029",
    baselineText: "Paige VanZant's UFC-only résumé",
    baselineRating: 25,
    reviewedRating: 35,
    resolution: "rerated",
    rationale: "The second pass credited a meaningful UFC run while keeping it below an average durable résumé.",
  },
  {
    currentId: "wl-ufc-resume-031",
    baselineText: "Michael Chandler's UFC-only résumé",
    baselineRating: 53,
    reviewedRating: 60,
    resolution: "rerated",
    rationale: "The review separated UFC résumé quality from the fighter's pre-UFC career and placed the UFC-only result in the strong band.",
  },
  {
    currentId: "wl-championship-052",
    baselineText: "The legitimacy of a typical UFC interim belt",
    baselineRating: 30,
    reviewedRating: 43,
    resolution: "rewritten-and-rerated",
    rationale: "The question was narrowed from legitimacy to historical clarity before the reviewed rating was accepted.",
  },
  {
    currentId: "wl-championship-057",
    baselineText: "Colby Covington's championship credibility",
    baselineRating: 42,
    reviewedRating: 57,
    resolution: "rerated",
    rationale: "The review distinguished repeated title-level contention from an actual undisputed championship résumé.",
  },
  {
    currentId: "wl-ufc-culture-078",
    baselineText: "Dana White's press-conference honesty",
    baselineRating: 20,
    reviewedRating: 26,
    resolution: "rewritten-and-rerated",
    rationale: "The wording was narrowed to transparency so the rating describes the observable promotional product rather than intent.",
  },
  {
    currentId: "wl-events-and-fights-108",
    baselineText: "UFC 300's card depth",
    baselineRating: 85,
    reviewedRating: 90,
    resolution: "confirmed",
    rationale: "The second pass kept the same question and moved it to the exceptional boundary after comparison with other landmark cards.",
  },
  {
    currentId: "wl-personality-and-promotion-156",
    baselineText: "Conor McGregor's promotional impact",
    baselineRating: 86,
    reviewedRating: 99,
    resolution: "rerated",
    rationale: "The review treated promotional impact, not current popularity or fighting quality, as the exact question.",
  },
  {
    currentId: "wl-officiating-and-systems-202",
    baselineText: "UFC judging as a whole",
    baselineRating: 37,
    reviewedRating: 38,
    resolution: "confirmed",
    rationale: "Both passes placed overall judging consistency in the same below-average range.",
  },
  {
    currentId: "wl-officiating-and-systems-210",
    baselineText: "The usefulness of the official UFC rankings",
    baselineRating: 34,
    reviewedRating: 40,
    resolution: "rerated",
    rationale: "The second pass credited their limited matchmaking and broadcast utility without treating them as authoritative standings.",
  },
  {
    currentId: "wl-legacy-and-history-226",
    baselineText: "Greg Hardy's UFC legacy",
    baselineRating: 9,
    reviewedRating: 9,
    resolution: "confirmed",
    rationale: "Both passes placed the UFC legacy in the bottom band.",
  },
  {
    currentId: "wl-fighter-trait-254",
    baselineText: "Max Holloway's chin",
    baselineRating: 93,
    reviewedRating: 94,
    resolution: "confirmed",
    rationale: "Both passes placed the trait in the historically elite band.",
  },
  {
    currentId: "wl-goat-and-prime-294",
    baselineText: "Khabib Nurmagomedov's prime dominance",
    baselineRating: 87,
    reviewedRating: 97,
    resolution: "rerated",
    rationale: "The second pass isolated prime dominance from longevity and broader GOAT résumé questions.",
  },
] as const;

export const WAVELENGTH_QUARANTINE_EVIDENCE = [
  {
    currentId: "wl-quarantine-temporary-rank",
    resolution: "quarantined" as const,
    rationale: "The answer depends on a rapidly changing weekly ranking and cannot remain historically stable without fixing a date.",
  },
] as const;

export const WAVELENGTH_CALIBRATION_AUDIT = {
  initialPass: "The prior canonical clue bank and the expanded structured rating pass established the first rating evidence.",
  independentReviewPass: "A separate anchor review challenged inherited deltas, ambiguous wording, category placement, and band crossings.",
  disagreementThreshold: WAVELENGTH_CALIBRATION_DISAGREEMENT_THRESHOLD,
  materialDisagreementPolicy: "Rewrite, rerate, or quarantine. Never average materially disputed scores.",
  inheritedEvidenceCount: WAVELENGTH_INHERITED_REVIEW_EVIDENCE.length,
  quarantineEvidenceCount: WAVELENGTH_QUARANTINE_EVIDENCE.length,
} as const;

export function validateWavelengthCalibrationAudit() {
  const itemsById = new Map(wavelengthCatalog.map((item) => [item.id, item]));

  for (const evidence of WAVELENGTH_INHERITED_REVIEW_EVIDENCE) {
    const item = itemsById.get(evidence.currentId);
    if (!item || item.rating !== evidence.reviewedRating || item.status !== "approved") return false;

    const difference = Math.abs(evidence.reviewedRating - evidence.baselineRating);
    if (difference >= WAVELENGTH_CALIBRATION_DISAGREEMENT_THRESHOLD) {
      if (evidence.resolution === "confirmed") return false;
      if (evidence.reviewedRating === Math.round((evidence.baselineRating + evidence.reviewedRating) / 2)) return false;
    }
  }

  for (const evidence of WAVELENGTH_QUARANTINE_EVIDENCE) {
    const item = itemsById.get(evidence.currentId);
    if (!item || item.status !== "quarantined") return false;
  }

  return true;
}
