export type FootballCfbCareerGreatnessPoolId =
  | "QB"
  | "RB"
  | "WR"
  | "TE"
  | "OL"
  | "DL / EDGE"
  | "LB"
  | "Secondary"
  | "K / P";

export type FootballCfbCareerGreatnessTier = "Tier 1" | "Tier 2" | "Tier 3";

export type FootballCfbGreatnessEvidence =
  | { readonly status: "known"; readonly value: number }
  | { readonly status: "missing" }
  | { readonly status: "structurally-unavailable" };

export type FootballCfbBooleanEvidence =
  | { readonly status: "known"; readonly value: boolean }
  | { readonly status: "missing" };

export type FootballCfbOlDraftEvaluation =
  | "top-five"
  | "top-ten-or-first-ol-round-one"
  | "other-first-round"
  | "second-round"
  | "third-round"
  | "later-or-undrafted";

export type FootballCfbOlDraftEvaluationEvidence =
  | { readonly status: "known"; readonly value: FootballCfbOlDraftEvaluation }
  | { readonly status: "missing" }
  | { readonly status: "structurally-unavailable" };

export interface FootballCfbGreatnessComponentSpec {
  readonly id: string;
  readonly label: string;
  readonly maxPoints: number;
}

export interface FootballCfbGreatnessTierRoute {
  readonly peak: number;
  readonly support?: number;
}

export interface FootballCfbCareerGreatnessModelSpec {
  readonly poolId: FootballCfbCareerGreatnessPoolId;
  readonly peakMax: number;
  readonly peakRawMax: number;
  readonly peakComponents: readonly FootballCfbGreatnessComponentSpec[];
  readonly supportMax: number;
  readonly supportComponents: readonly FootballCfbGreatnessComponentSpec[];
  readonly tier1: readonly FootballCfbGreatnessTierRoute[];
  readonly tier2: readonly FootballCfbGreatnessTierRoute[];
  readonly tier3: readonly FootballCfbGreatnessTierRoute[];
}

export interface FootballCfbCareerGreatnessInput {
  readonly poolId: FootballCfbCareerGreatnessPoolId;
  readonly peak: Readonly<Record<string, FootballCfbGreatnessEvidence>>;
  readonly support: Readonly<Record<string, FootballCfbGreatnessEvidence>>;
  readonly qbNationalTitleAsPrimary?: FootballCfbBooleanEvidence;
  readonly olDraftEvaluation?: FootballCfbOlDraftEvaluationEvidence;
  readonly specialistRole?: "K" | "P" | "K/P";
  readonly kickerPeak?: Readonly<Record<string, FootballCfbGreatnessEvidence>>;
  readonly punterPeak?: Readonly<Record<string, FootballCfbGreatnessEvidence>>;
  readonly secondaryOffenseSpecialTeamsVersatilityPoints?: number;
}

export interface FootballCfbGreatnessScoreRange {
  readonly min: number;
  readonly max: number;
  readonly exact: number | null;
}

export type FootballCfbGreatnessEvidenceCompleteness =
  | "complete"
  | "structurally-normalized"
  | "incomplete"
  | "insufficient";

export type FootballCfbGreatnessFlag =
  | "missing-evidence"
  | "structurally-normalized"
  | "tier-outcome-sensitive-to-missing-evidence"
  | "ol-draft-tier-promotion-review";

export interface FootballCfbCareerGreatnessResult {
  readonly poolId: FootballCfbCareerGreatnessPoolId;
  readonly peak: FootballCfbGreatnessScoreRange;
  readonly support: FootballCfbGreatnessScoreRange;
  readonly total: FootballCfbGreatnessScoreRange;
  readonly peakComponents: Readonly<Record<string, FootballCfbGreatnessScoreRange>>;
  readonly supportComponents: Readonly<Record<string, FootballCfbGreatnessScoreRange>>;
  readonly preliminaryTier: FootballCfbCareerGreatnessTier | null;
  readonly bestPossibleTier: FootballCfbCareerGreatnessTier | null;
  readonly worstPossibleTier: FootballCfbCareerGreatnessTier | null;
  readonly evidenceCompleteness: FootballCfbGreatnessEvidenceCompleteness;
  readonly flags: readonly FootballCfbGreatnessFlag[];
  readonly specialistBranches?: Readonly<{
    kicker?: FootballCfbGreatnessScoreRange;
    punter?: FootballCfbGreatnessScoreRange;
  }>;
}

interface EvaluatedSection {
  readonly score: FootballCfbGreatnessScoreRange;
  readonly components: Readonly<Record<string, FootballCfbGreatnessScoreRange>>;
  readonly hasMissing: boolean;
  readonly hasStructuralUnavailable: boolean;
  readonly insufficient: boolean;
}

const component = (id: string, label: string, maxPoints: number): FootballCfbGreatnessComponentSpec => ({
  id,
  label,
  maxPoints,
});

const sharedNonQbSupport = [
  component("sustained-elite", "Sustained Elite", 10),
  component("awards-national-standing", "Awards / National Standing", 15),
  component("big-stage-impact", "Big-Stage Impact", 5),
] as const;

const qbSupport = [
  component("sustained-elite", "Sustained Elite Play", 10),
  component("awards-national-standing", "Awards / National Standing", 15),
  component("winning-postseason", "Winning / Postseason", 15),
] as const;

const olSupport = [
  component("sustained-elite", "Sustained Elite", 10),
  component("big-stage-impact", "Big-Stage Impact", 5),
] as const;

const qbPeak = [
  component("passing-efficiency-dominance", "Passing efficiency / dominance", 20),
  component("total-offensive-value", "Total offensive value", 20),
  component("scoring-creation", "Scoring creation", 10),
  component("era-competition-dominance", "Era / competition dominance", 5),
] as const;

const rbPeak = [
  component("rushing-dominance", "Rushing dominance", 25),
  component("efficiency-explosiveness", "Efficiency / explosiveness", 15),
  component("total-scrimmage-dominance", "Total scrimmage dominance", 10),
  component("scoring-dominance", "Scoring dominance", 5),
  component("era-competition-dominance", "Era / competition dominance", 5),
] as const;

const wrPeak = [
  component("receiving-dominance", "Receiving dominance", 30),
  component("efficiency-explosiveness", "Efficiency / explosiveness", 15),
  component("scoring-dominance", "Scoring dominance", 10),
  component("offensive-centrality", "Offensive centrality", 10),
  component("era-competition-dominance", "Era / competition dominance", 5),
] as const;

const tePeak = [
  component("receiving-production", "Receiving production", 20),
  component("efficiency-explosiveness", "Efficiency / explosiveness", 10),
  component("scoring-dominance", "Scoring dominance", 10),
  component("offensive-centrality-versatility", "Offensive centrality / versatility", 10),
  component("era-relative-te-dominance", "Era-relative TE dominance", 15),
  component("competition-proof", "Competition proof", 5),
] as const;

const olPeakWithoutDraft = [
  component("national-ol-standing-all-america", "National OL standing / All-America", 25),
  component("major-ol-award-standing", "Major OL award standing", 20),
  component("cross-position-national-standing", "Cross-position national standing", 15),
  component("documented-individual-dominance", "Documented individual dominance", 10),
  component("competition-proof", "Competition proof", 5),
  component("ol-unit-centrality", "OL / unit centrality", 5),
] as const;

const olDraftComponent = component("nfl-draft-evaluation", "NFL draft evaluation (college corroboration only)", 5);

const dlEdgePeak = [
  component("backfield-disruption", "Backfield disruption", 25),
  component("disruption-rate-efficiency", "Disruption rate / efficiency", 15),
  component("overall-defensive-run-impact", "Overall defensive / run impact", 10),
  component("havoc-playmaking", "Havoc / playmaking", 10),
  component("era-relative-dominance", "Era-relative dominance", 5),
  component("competition-proof", "Competition proof", 5),
] as const;

const lbPeak = [
  component("tackling-down-to-down-dominance", "Tackling / down-to-down dominance", 20),
  component("backfield-disruption", "Backfield disruption", 15),
  component("coverage-turnover-impact", "Coverage / turnover impact", 15),
  component("defensive-centrality-total-playmaking", "Defensive centrality / total playmaking", 10),
  component("era-relative-dominance", "Era-relative dominance", 5),
  component("competition-proof", "Competition proof", 5),
] as const;

const secondaryPeak = [
  component("coverage-dominance-suppression", "Coverage dominance / suppression", 20),
  component("ball-disruption-takeaways", "Ball disruption / takeaways", 15),
  component("total-defensive-impact", "Total defensive impact", 15),
  component("havoc-versatility", "Havoc / versatility", 10),
  component("era-relative-dominance", "Era-relative dominance", 5),
  component("competition-proof", "Competition proof", 5),
] as const;

export const footballCfbKickerPeakComponents = [
  component("accuracy-adjusted-for-difficulty", "Accuracy adjusted for difficulty", 25),
  component("range-deep-kick-ability", "Range / deep-kick ability", 15),
  component("fg-volume-scoring-responsibility", "FG volume / scoring responsibility", 10),
  component("conversion-reliability", "Conversion reliability", 10),
  component("era-relative-dominance", "Era-relative dominance", 5),
  component("competition-proof", "Competition proof", 5),
] as const;

export const footballCfbPunterPeakComponents = [
  component("gross-distance-dominance", "Gross distance dominance", 20),
  component("field-position-placement", "Field-position / placement", 20),
  component("net-return-suppression", "Net / return suppression", 15),
  component("workload-repeat-execution", "Workload / repeat execution", 5),
  component("era-relative-dominance", "Era-relative dominance", 5),
  component("competition-proof", "Competition proof", 5),
] as const;

export const footballCfbCareerGreatnessModels: Readonly<Record<FootballCfbCareerGreatnessPoolId, FootballCfbCareerGreatnessModelSpec>> = {
  QB: {
    poolId: "QB",
    peakMax: 60,
    peakRawMax: 55,
    peakComponents: qbPeak,
    supportMax: 40,
    supportComponents: qbSupport,
    tier1: [],
    tier2: [{ peak: 54, support: 14 }],
    tier3: [{ peak: 48, support: 12 }, { peak: 45, support: 27 }],
  },
  RB: {
    poolId: "RB",
    peakMax: 70,
    peakRawMax: 60,
    peakComponents: rbPeak,
    supportMax: 30,
    supportComponents: sharedNonQbSupport,
    tier1: [{ peak: 67, support: 10 }, { peak: 61, support: 15 }, { peak: 58, support: 27 }],
    tier2: [{ peak: 55, support: 10 }, { peak: 52, support: 23 }],
    tier3: [{ peak: 50, support: 6 }, { peak: 47, support: 16 }],
  },
  WR: {
    poolId: "WR",
    peakMax: 70,
    peakRawMax: 70,
    peakComponents: wrPeak,
    supportMax: 30,
    supportComponents: sharedNonQbSupport,
    tier1: [{ peak: 66, support: 8 }, { peak: 63, support: 14 }, { peak: 60, support: 18 }],
    tier2: [{ peak: 58, support: 8 }, { peak: 55, support: 14 }],
    tier3: [{ peak: 52, support: 5 }, { peak: 49, support: 11 }],
  },
  TE: {
    poolId: "TE",
    peakMax: 70,
    peakRawMax: 70,
    peakComponents: tePeak,
    supportMax: 30,
    supportComponents: sharedNonQbSupport,
    tier1: [{ peak: 68, support: 10 }, { peak: 64, support: 15 }, { peak: 61, support: 23 }],
    tier2: [{ peak: 60, support: 8 }, { peak: 57, support: 15 }],
    tier3: [{ peak: 54, support: 5 }, { peak: 51, support: 11 }],
  },
  OL: {
    poolId: "OL",
    peakMax: 85,
    peakRawMax: 85,
    peakComponents: [...olPeakWithoutDraft, olDraftComponent],
    supportMax: 15,
    supportComponents: olSupport,
    tier1: [{ peak: 82 }, { peak: 75, support: 4 }, { peak: 68, support: 10 }, { peak: 64, support: 13 }],
    tier2: [{ peak: 72 }, { peak: 65, support: 4 }, { peak: 60, support: 9 }],
    tier3: [{ peak: 63 }, { peak: 56, support: 3 }, { peak: 52, support: 7 }],
  },
  "DL / EDGE": {
    poolId: "DL / EDGE",
    peakMax: 70,
    peakRawMax: 70,
    peakComponents: dlEdgePeak,
    supportMax: 30,
    supportComponents: sharedNonQbSupport,
    tier1: [{ peak: 68, support: 8 }, { peak: 65, support: 15 }, { peak: 62, support: 24 }],
    tier2: [{ peak: 61, support: 8 }, { peak: 57, support: 15 }],
    tier3: [{ peak: 54, support: 5 }, { peak: 50, support: 12 }],
  },
  LB: {
    poolId: "LB",
    peakMax: 70,
    peakRawMax: 70,
    peakComponents: lbPeak,
    supportMax: 30,
    supportComponents: sharedNonQbSupport,
    tier1: [{ peak: 68, support: 8 }, { peak: 64, support: 15 }, { peak: 60, support: 24 }],
    tier2: [{ peak: 61, support: 8 }, { peak: 57, support: 15 }],
    tier3: [{ peak: 54, support: 5 }, { peak: 50, support: 12 }],
  },
  Secondary: {
    poolId: "Secondary",
    peakMax: 70,
    peakRawMax: 70,
    peakComponents: secondaryPeak,
    supportMax: 30,
    supportComponents: sharedNonQbSupport,
    tier1: [{ peak: 68, support: 8 }, { peak: 64, support: 15 }, { peak: 60, support: 24 }],
    tier2: [{ peak: 60, support: 8 }, { peak: 56, support: 15 }],
    tier3: [{ peak: 53, support: 5 }, { peak: 49, support: 12 }],
  },
  "K / P": {
    poolId: "K / P",
    peakMax: 70,
    peakRawMax: 70,
    peakComponents: [],
    supportMax: 30,
    supportComponents: sharedNonQbSupport,
    tier1: [{ peak: 68, support: 8 }, { peak: 64, support: 15 }, { peak: 60, support: 24 }],
    tier2: [{ peak: 60, support: 8 }, { peak: 56, support: 15 }],
    tier3: [{ peak: 53, support: 5 }, { peak: 49, support: 12 }],
  },
};

const round = (value: number) => Math.round((value + Number.EPSILON) * 1000) / 1000;
const exactRange = (value: number): FootballCfbGreatnessScoreRange => ({ min: round(value), max: round(value), exact: round(value) });

function range(min: number, max: number): FootballCfbGreatnessScoreRange {
  const roundedMin = round(min);
  const roundedMax = round(max);
  return {
    min: roundedMin,
    max: roundedMax,
    exact: roundedMin === roundedMax ? roundedMin : null,
  };
}

function assertExactEvidenceKeys(
  evidence: Readonly<Record<string, FootballCfbGreatnessEvidence>>,
  components: readonly FootballCfbGreatnessComponentSpec[],
  label: string,
) {
  const expected = new Set(components.map((row) => row.id));
  const actual = Object.keys(evidence);
  const unknown = actual.filter((id) => !expected.has(id));
  const absent = components.map((row) => row.id).filter((id) => !(id in evidence));
  if (unknown.length > 0 || absent.length > 0) {
    throw new Error(`${label} evidence keys must match the canonical component contract; unknown=[${unknown.join(", ")}], missing=[${absent.join(", ")}].`);
  }
}

function evaluateSection(
  evidence: Readonly<Record<string, FootballCfbGreatnessEvidence>>,
  components: readonly FootballCfbGreatnessComponentSpec[],
  targetMax: number,
  label: string,
): EvaluatedSection {
  assertExactEvidenceKeys(evidence, components, label);

  let knownPoints = 0;
  let availableMax = 0;
  let missingMax = 0;
  let hasMissing = false;
  let hasStructuralUnavailable = false;
  const rawComponentRanges = new Map<string, FootballCfbGreatnessScoreRange>();

  for (const spec of components) {
    const value = evidence[spec.id];
    if (value.status === "known") {
      if (!Number.isFinite(value.value) || value.value < 0 || value.value > spec.maxPoints) {
        throw new RangeError(`${label}:${spec.id} must be between 0 and ${spec.maxPoints}.`);
      }
      knownPoints += value.value;
      availableMax += spec.maxPoints;
      rawComponentRanges.set(spec.id, exactRange(value.value));
    } else if (value.status === "missing") {
      hasMissing = true;
      availableMax += spec.maxPoints;
      missingMax += spec.maxPoints;
      rawComponentRanges.set(spec.id, range(0, spec.maxPoints));
    } else {
      hasStructuralUnavailable = true;
      rawComponentRanges.set(spec.id, exactRange(0));
    }
  }

  if (availableMax === 0) {
    return {
      score: range(0, targetMax),
      components: Object.fromEntries(components.map((spec) => [spec.id, range(0, spec.maxPoints)])),
      hasMissing,
      hasStructuralUnavailable,
      insufficient: true,
    };
  }

  const scale = targetMax / availableMax;
  const scaledComponents = Object.fromEntries(components.map((spec) => {
    const raw = rawComponentRanges.get(spec.id) ?? exactRange(0);
    return [spec.id, range(raw.min * scale, raw.max * scale)];
  }));
  const min = knownPoints * scale;
  const max = Math.min(targetMax, (knownPoints + missingMax) * scale);

  return {
    score: range(min, max),
    components: scaledComponents,
    hasMissing,
    hasStructuralUnavailable,
    insufficient: false,
  };
}

export function scoreFootballCfbOlDraftEvaluation(value: FootballCfbOlDraftEvaluation): number {
  switch (value) {
    case "top-five": return 5;
    case "top-ten-or-first-ol-round-one": return 4;
    case "other-first-round": return 3;
    case "second-round": return 2;
    case "third-round": return 1;
    case "later-or-undrafted": return 0;
  }
}

function evaluateOlPeak(input: FootballCfbCareerGreatnessInput): EvaluatedSection {
  if (!input.olDraftEvaluation) throw new Error("OL greatness requires explicit olDraftEvaluation evidence.");
  const base = evaluateSection(input.peak, olPeakWithoutDraft, 80, "OL peak");
  const draft = input.olDraftEvaluation;
  let score: FootballCfbGreatnessScoreRange;
  let draftRange: FootballCfbGreatnessScoreRange;
  let hasMissing = base.hasMissing;
  let hasStructuralUnavailable = base.hasStructuralUnavailable;

  if (draft.status === "known") {
    const points = scoreFootballCfbOlDraftEvaluation(draft.value);
    draftRange = exactRange(points);
    score = range(base.score.min + points, base.score.max + points);
  } else if (draft.status === "missing") {
    hasMissing = true;
    draftRange = range(0, 5);
    score = range(base.score.min, Math.min(85, base.score.max + 5));
  } else {
    hasStructuralUnavailable = true;
    draftRange = exactRange(0);
    score = range(base.score.min * (85 / 80), base.score.max * (85 / 80));
  }

  return {
    score,
    components: { ...base.components, [olDraftComponent.id]: draftRange },
    hasMissing,
    hasStructuralUnavailable,
    insufficient: base.insufficient,
  };
}

function dualSpecialistBonus(secondaryPeak: number) {
  if (secondaryPeak >= 65) return 4;
  if (secondaryPeak >= 61) return 3;
  if (secondaryPeak >= 56) return 2;
  if (secondaryPeak >= 50) return 1;
  return 0;
}

function combineDualSpecialistPeak(kicker: number, punter: number) {
  const primary = Math.max(kicker, punter);
  const secondary = Math.min(kicker, punter);
  return Math.min(70, primary + dualSpecialistBonus(secondary));
}

function evaluateSpecialistPeak(input: FootballCfbCareerGreatnessInput): EvaluatedSection & {
  readonly specialistBranches: Readonly<{ kicker?: FootballCfbGreatnessScoreRange; punter?: FootballCfbGreatnessScoreRange }>;
} {
  if (!input.specialistRole) throw new Error("K / P greatness requires an explicit specialistRole.");
  if (Object.keys(input.peak).length > 0) throw new Error("K / P Peak evidence belongs in kickerPeak/punterPeak branches, not peak.");

  const kicker = input.kickerPeak
    ? evaluateSection(input.kickerPeak, footballCfbKickerPeakComponents, 70, "Kicker peak")
    : null;
  const punter = input.punterPeak
    ? evaluateSection(input.punterPeak, footballCfbPunterPeakComponents, 70, "Punter peak")
    : null;

  if ((input.specialistRole === "K" || input.specialistRole === "K/P") && !kicker) {
    throw new Error(`${input.specialistRole} greatness requires kickerPeak evidence.`);
  }
  if ((input.specialistRole === "P" || input.specialistRole === "K/P") && !punter) {
    throw new Error(`${input.specialistRole} greatness requires punterPeak evidence.`);
  }

  let score: FootballCfbGreatnessScoreRange;
  if (input.specialistRole === "K") {
    score = kicker!.score;
  } else if (input.specialistRole === "P") {
    score = punter!.score;
  } else {
    score = range(
      combineDualSpecialistPeak(kicker!.score.min, punter!.score.min),
      combineDualSpecialistPeak(kicker!.score.max, punter!.score.max),
    );
  }

  const requiredSections = input.specialistRole === "K"
    ? [kicker!]
    : input.specialistRole === "P"
      ? [punter!]
      : [kicker!, punter!];

  return {
    score,
    components: {},
    hasMissing: requiredSections.some((section) => section.hasMissing),
    hasStructuralUnavailable: requiredSections.some((section) => section.hasStructuralUnavailable),
    insufficient: requiredSections.some((section) => section.insufficient),
    specialistBranches: {
      ...(kicker ? { kicker: kicker.score } : {}),
      ...(punter ? { punter: punter.score } : {}),
    },
  };
}

function meetsAnyRoute(
  peak: number,
  support: number,
  routes: readonly FootballCfbGreatnessTierRoute[],
) {
  return routes.some((route) => peak >= route.peak && support >= (route.support ?? 0));
}

function classifyAtPoint(
  poolId: FootballCfbCareerGreatnessPoolId,
  peak: number,
  support: number,
  supportComponents: Readonly<Record<string, number>>,
  qbNationalTitleAsPrimary: boolean,
): FootballCfbCareerGreatnessTier | null {
  const model = footballCfbCareerGreatnessModels[poolId];

  if (poolId === "QB") {
    const sustainAwards = (supportComponents["sustained-elite"] ?? 0) + (supportComponents["awards-national-standing"] ?? 0);
    const tier1 = (peak >= 58 && qbNationalTitleAsPrimary)
      || (peak >= 54 && qbNationalTitleAsPrimary && sustainAwards >= 17)
      || (peak >= 54 && support >= 33);
    if (tier1) return "Tier 1";
    if (meetsAnyRoute(peak, support, model.tier2)) return "Tier 2";
    if (meetsAnyRoute(peak, support, model.tier3)) return "Tier 3";
    return null;
  }

  if (meetsAnyRoute(peak, support, model.tier1)) return "Tier 1";
  if (meetsAnyRoute(peak, support, model.tier2)) return "Tier 2";
  if (meetsAnyRoute(peak, support, model.tier3)) return "Tier 3";
  return null;
}

function endpointComponents(
  ranges: Readonly<Record<string, FootballCfbGreatnessScoreRange>>,
  endpoint: "min" | "max",
) {
  return Object.fromEntries(Object.entries(ranges).map(([id, value]) => [id, value[endpoint]]));
}

function qbTitleEndpoints(input: FootballCfbCareerGreatnessInput) {
  if (input.poolId !== "QB") return { min: false, max: false, hasMissing: false };
  if (!input.qbNationalTitleAsPrimary) throw new Error("QB greatness requires explicit qbNationalTitleAsPrimary evidence.");
  if (input.qbNationalTitleAsPrimary.status === "missing") return { min: false, max: true, hasMissing: true };
  return {
    min: input.qbNationalTitleAsPrimary.value,
    max: input.qbNationalTitleAsPrimary.value,
    hasMissing: false,
  };
}

function overallCompleteness(
  peak: EvaluatedSection,
  support: EvaluatedSection,
  extraMissing: boolean,
): FootballCfbGreatnessEvidenceCompleteness {
  if (peak.insufficient || support.insufficient) return "insufficient";
  if (peak.hasMissing || support.hasMissing || extraMissing) return "incomplete";
  if (peak.hasStructuralUnavailable || support.hasStructuralUnavailable) return "structurally-normalized";
  return "complete";
}

function olDraftPromotionFlag(
  input: FootballCfbCareerGreatnessInput,
  peak: EvaluatedSection,
  support: EvaluatedSection,
): boolean {
  if (input.poolId !== "OL" || input.olDraftEvaluation?.status !== "known") return false;
  const draftPoints = scoreFootballCfbOlDraftEvaluation(input.olDraftEvaluation.value);
  if (draftPoints === 0 || peak.score.exact == null || support.score.exact == null) return false;
  const supportPoint = endpointComponents(support.components, "min");
  const withDraft = classifyAtPoint("OL", peak.score.exact, support.score.exact, supportPoint, false);
  const withoutDraft = classifyAtPoint("OL", Math.max(0, peak.score.exact - draftPoints), support.score.exact, supportPoint, false);
  return withDraft !== withoutDraft && (withDraft != null || withoutDraft != null);
}

function validateSecondaryVersatility(input: FootballCfbCareerGreatnessInput) {
  if (input.poolId !== "Secondary" || input.secondaryOffenseSpecialTeamsVersatilityPoints == null) return;
  const contribution = input.secondaryOffenseSpecialTeamsVersatilityPoints;
  if (!Number.isFinite(contribution) || contribution < 0 || contribution > 5) {
    throw new RangeError("Secondary offense / special-teams versatility contribution must be between 0 and 5 points.");
  }
  const havoc = input.peak["havoc-versatility"];
  if (havoc?.status === "known" && contribution > havoc.value) {
    throw new RangeError("Secondary offense / special-teams versatility contribution cannot exceed total Havoc / Versatility points.");
  }
}

/**
 * Deterministic Stage 16 CFB player-career greatness calculator.
 *
 * The calculator owns the locked position component ceilings and Tier 1-3 gates only.
 * It deliberately has no recognizability input and no NFL-career-performance input.
 * Missing evidence stays a range; structurally unavailable evidence is normalized over
 * the evidence mechanisms available to that player/era rather than silently becoming zero.
 * Tier 4/5 gates remain intentionally unresolved until the full-universe distribution audit.
 */
export function calculateFootballCfbCareerGreatness(
  input: FootballCfbCareerGreatnessInput,
): FootballCfbCareerGreatnessResult {
  const model = footballCfbCareerGreatnessModels[input.poolId];
  validateSecondaryVersatility(input);

  let peak: EvaluatedSection;
  let specialistBranches: FootballCfbCareerGreatnessResult["specialistBranches"];
  if (input.poolId === "OL") {
    peak = evaluateOlPeak(input);
  } else if (input.poolId === "K / P") {
    const specialist = evaluateSpecialistPeak(input);
    peak = specialist;
    specialistBranches = specialist.specialistBranches;
  } else {
    peak = evaluateSection(input.peak, model.peakComponents, model.peakMax, `${input.poolId} peak`);
  }

  const support = evaluateSection(input.support, model.supportComponents, model.supportMax, `${input.poolId} support`);
  const title = qbTitleEndpoints(input);
  const bestPossibleTier = classifyAtPoint(
    input.poolId,
    peak.score.max,
    support.score.max,
    endpointComponents(support.components, "max"),
    title.max,
  );
  const worstPossibleTier = classifyAtPoint(
    input.poolId,
    peak.score.min,
    support.score.min,
    endpointComponents(support.components, "min"),
    title.min,
  );
  const preliminaryTier = bestPossibleTier === worstPossibleTier ? bestPossibleTier : null;
  const evidenceCompleteness = overallCompleteness(peak, support, title.hasMissing);
  const flags: FootballCfbGreatnessFlag[] = [];

  if (evidenceCompleteness === "incomplete") flags.push("missing-evidence");
  if (peak.hasStructuralUnavailable || support.hasStructuralUnavailable) flags.push("structurally-normalized");
  if (bestPossibleTier !== worstPossibleTier) flags.push("tier-outcome-sensitive-to-missing-evidence");
  if (olDraftPromotionFlag(input, peak, support)) flags.push("ol-draft-tier-promotion-review");

  return {
    poolId: input.poolId,
    peak: peak.score,
    support: support.score,
    total: range(peak.score.min + support.score.min, peak.score.max + support.score.max),
    peakComponents: peak.components,
    supportComponents: support.components,
    preliminaryTier,
    bestPossibleTier,
    worstPossibleTier,
    evidenceCompleteness,
    flags,
    ...(specialistBranches ? { specialistBranches } : {}),
  };
}
