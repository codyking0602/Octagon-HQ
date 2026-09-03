/**
 * CFB career-greatness implementation unit owned by footballComparisonAuthority.
 *
 * This module contains deterministic tier math only. It is not a factual source,
 * recognizability owner, candidate-universe owner, or alternate comparison path.
 * Callers must supply reviewed component evidence derived through the canonical
 * Football factual/query ownership before using these calculators.
 */

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

export type FootballCfbCareerGreatnessTier = 1 | 2 | 3;

export type FootballCfbGreatnessEvidenceCompleteness = "complete" | "normalized-structural" | "incomplete";

export type FootballCfbGreatnessReviewFlag =
  | "missing-evidence"
  | "structurally-unavailable-evidence"
  | "normalized-structural-evidence"
  | "ol-draft-tier-dependence";

export type FootballCfbScoreEvidence =
  | Readonly<{ status: "available"; points: number }>
  | Readonly<{ status: "missing" }>
  | Readonly<{ status: "structurally-unavailable" }>;

export const footballCfbScore = (points: number): FootballCfbScoreEvidence => ({ status: "available", points });
export const footballCfbMissingScore = (): FootballCfbScoreEvidence => ({ status: "missing" });
export const footballCfbStructurallyUnavailableScore = (): FootballCfbScoreEvidence => ({ status: "structurally-unavailable" });

export type FootballCfbOlDraftEvaluationBand =
  | "top-five"
  | "top-ten-or-first-ol-round-one"
  | "other-first-round"
  | "second-round"
  | "third-round"
  | "later-or-undrafted";

export type FootballCfbOlDraftEvaluationEvidence =
  | Readonly<{ status: "available"; band: FootballCfbOlDraftEvaluationBand }>
  | Readonly<{ status: "missing" }>
  | Readonly<{ status: "structurally-unavailable" }>;

export interface FootballCfbQbCareerGreatnessInput {
  pool: "QB";
  peak: Readonly<{
    passingDominance: FootballCfbScoreEvidence;
    totalOffensiveValue: FootballCfbScoreEvidence;
    scoringCreation: FootballCfbScoreEvidence;
    eraCompetitionDominance: FootballCfbScoreEvidence;
  }>;
  sustain: FootballCfbScoreEvidence;
  awardsNationalStanding: FootballCfbScoreEvidence;
  winningPostseason: FootballCfbScoreEvidence;
  nationalTitleAsPrimaryQb: boolean;
}

export interface FootballCfbRbCareerGreatnessInput {
  pool: "RB";
  peak: Readonly<{
    rushingDominance: FootballCfbScoreEvidence;
    efficiencyExplosiveness: FootballCfbScoreEvidence;
    totalScrimmageDominance: FootballCfbScoreEvidence;
    scoringDominance: FootballCfbScoreEvidence;
    eraCompetitionDominance: FootballCfbScoreEvidence;
  }>;
  sustain: FootballCfbScoreEvidence;
  awardsNationalStanding: FootballCfbScoreEvidence;
  bigStageImpact: FootballCfbScoreEvidence;
}

export interface FootballCfbWrCareerGreatnessInput {
  pool: "WR";
  peak: Readonly<{
    receivingDominance: FootballCfbScoreEvidence;
    efficiencyExplosiveness: FootballCfbScoreEvidence;
    scoringDominance: FootballCfbScoreEvidence;
    offensiveCentrality: FootballCfbScoreEvidence;
    eraCompetitionDominance: FootballCfbScoreEvidence;
  }>;
  sustain: FootballCfbScoreEvidence;
  awardsNationalStanding: FootballCfbScoreEvidence;
  bigStageImpact: FootballCfbScoreEvidence;
}

export interface FootballCfbTeCareerGreatnessInput {
  pool: "TE";
  peak: Readonly<{
    receivingProduction: FootballCfbScoreEvidence;
    efficiencyExplosiveness: FootballCfbScoreEvidence;
    scoringDominance: FootballCfbScoreEvidence;
    offensiveCentralityVersatility: FootballCfbScoreEvidence;
    eraRelativeTeDominance: FootballCfbScoreEvidence;
    competitionProof: FootballCfbScoreEvidence;
  }>;
  sustain: FootballCfbScoreEvidence;
  awardsNationalStanding: FootballCfbScoreEvidence;
  bigStageImpact: FootballCfbScoreEvidence;
}

export interface FootballCfbOlCareerGreatnessInput {
  pool: "OL";
  peak: Readonly<{
    nationalOlStandingAllAmerica: FootballCfbScoreEvidence;
    majorOlAwardStanding: FootballCfbScoreEvidence;
    crossPositionNationalStanding: FootballCfbScoreEvidence;
    documentedIndividualDominance: FootballCfbScoreEvidence;
    competitionProof: FootballCfbScoreEvidence;
    olUnitCentrality: FootballCfbScoreEvidence;
  }>;
  draftEvaluation: FootballCfbOlDraftEvaluationEvidence;
  sustain: FootballCfbScoreEvidence;
  bigStageImpact: FootballCfbScoreEvidence;
}

export interface FootballCfbDlEdgeCareerGreatnessInput {
  pool: "DL / EDGE";
  peak: Readonly<{
    backfieldDisruption: FootballCfbScoreEvidence;
    disruptionRateEfficiency: FootballCfbScoreEvidence;
    overallDefensiveRunImpact: FootballCfbScoreEvidence;
    havocPlaymaking: FootballCfbScoreEvidence;
    eraRelativeDominance: FootballCfbScoreEvidence;
    competitionProof: FootballCfbScoreEvidence;
  }>;
  sustain: FootballCfbScoreEvidence;
  awardsNationalStanding: FootballCfbScoreEvidence;
  bigStageImpact: FootballCfbScoreEvidence;
}

export interface FootballCfbLbCareerGreatnessInput {
  pool: "LB";
  peak: Readonly<{
    tacklingDownToDownDominance: FootballCfbScoreEvidence;
    backfieldDisruption: FootballCfbScoreEvidence;
    coverageTurnoverImpact: FootballCfbScoreEvidence;
    defensiveCentralityTotalPlaymaking: FootballCfbScoreEvidence;
    eraRelativeDominance: FootballCfbScoreEvidence;
    competitionProof: FootballCfbScoreEvidence;
  }>;
  sustain: FootballCfbScoreEvidence;
  awardsNationalStanding: FootballCfbScoreEvidence;
  bigStageImpact: FootballCfbScoreEvidence;
}

export interface FootballCfbSecondaryCareerGreatnessInput {
  pool: "Secondary";
  peak: Readonly<{
    coverageDominanceSuppression: FootballCfbScoreEvidence;
    ballDisruptionTakeaways: FootballCfbScoreEvidence;
    totalDefensiveImpact: FootballCfbScoreEvidence;
    havocVersatility: FootballCfbScoreEvidence;
    eraRelativeDominance: FootballCfbScoreEvidence;
    competitionProof: FootballCfbScoreEvidence;
  }>;
  /** Portion of havocVersatility attributable to offense/special teams. Capped at five. */
  offenseSpecialTeamsVersatilityPoints?: number;
  sustain: FootballCfbScoreEvidence;
  awardsNationalStanding: FootballCfbScoreEvidence;
  bigStageImpact: FootballCfbScoreEvidence;
}

export interface FootballCfbKickerPeakInput {
  accuracyAdjustedForDifficulty: FootballCfbScoreEvidence;
  rangeDeepKickAbility: FootballCfbScoreEvidence;
  fieldGoalVolumeScoringResponsibility: FootballCfbScoreEvidence;
  conversionReliability: FootballCfbScoreEvidence;
  eraRelativeDominance: FootballCfbScoreEvidence;
  competitionProof: FootballCfbScoreEvidence;
}

export interface FootballCfbPunterPeakInput {
  grossDistanceDominance: FootballCfbScoreEvidence;
  fieldPositionPlacement: FootballCfbScoreEvidence;
  netReturnSuppression: FootballCfbScoreEvidence;
  workloadRepeatExecution: FootballCfbScoreEvidence;
  eraRelativeDominance: FootballCfbScoreEvidence;
  competitionProof: FootballCfbScoreEvidence;
}

export interface FootballCfbKpCareerGreatnessInput {
  pool: "K / P";
  /** Null means the player did not perform this role; missing evidence uses an evidence status inside the branch. */
  kickerPeak: Readonly<FootballCfbKickerPeakInput> | null;
  /** Null means the player did not perform this role; missing evidence uses an evidence status inside the branch. */
  punterPeak: Readonly<FootballCfbPunterPeakInput> | null;
  sustain: FootballCfbScoreEvidence;
  awardsNationalStanding: FootballCfbScoreEvidence;
  bigStageImpact: FootballCfbScoreEvidence;
}

export type FootballCfbCareerGreatnessInput =
  | FootballCfbQbCareerGreatnessInput
  | FootballCfbRbCareerGreatnessInput
  | FootballCfbWrCareerGreatnessInput
  | FootballCfbTeCareerGreatnessInput
  | FootballCfbOlCareerGreatnessInput
  | FootballCfbDlEdgeCareerGreatnessInput
  | FootballCfbLbCareerGreatnessInput
  | FootballCfbSecondaryCareerGreatnessInput
  | FootballCfbKpCareerGreatnessInput;

export interface FootballCfbGreatnessComponentEvidence {
  section: "peak" | "support";
  component: string;
  maxPoints: number;
  evidence: FootballCfbScoreEvidence;
}

export interface FootballCfbCareerGreatnessResult {
  pool: FootballCfbCareerGreatnessPoolId;
  peak: number | null;
  support: number | null;
  preliminaryTier: FootballCfbCareerGreatnessTier | null;
  evidenceCompleteness: FootballCfbGreatnessEvidenceCompleteness;
  componentEvidence: readonly FootballCfbGreatnessComponentEvidence[];
  reviewFlags: readonly FootballCfbGreatnessReviewFlag[];
  kickerPeak?: number | null;
  punterPeak?: number | null;
  dualRoleBonus?: number;
}

type ComponentMaximums = Readonly<Record<string, number>>;

const QB_SCALE = 60 / 55;
const RB_SCALE = 70 / 60;

const qbPeakMaximums = {
  passingDominance: 20 * QB_SCALE,
  totalOffensiveValue: 20 * QB_SCALE,
  scoringCreation: 10 * QB_SCALE,
  eraCompetitionDominance: 5 * QB_SCALE,
} as const;

const rbPeakMaximums = {
  rushingDominance: 25 * RB_SCALE,
  efficiencyExplosiveness: 15 * RB_SCALE,
  totalScrimmageDominance: 10 * RB_SCALE,
  scoringDominance: 5 * RB_SCALE,
  eraCompetitionDominance: 5 * RB_SCALE,
} as const;

const wrPeakMaximums = {
  receivingDominance: 30,
  efficiencyExplosiveness: 15,
  scoringDominance: 10,
  offensiveCentrality: 10,
  eraCompetitionDominance: 5,
} as const;

const tePeakMaximums = {
  receivingProduction: 20,
  efficiencyExplosiveness: 10,
  scoringDominance: 10,
  offensiveCentralityVersatility: 10,
  eraRelativeTeDominance: 15,
  competitionProof: 5,
} as const;

const olPeakMaximums = {
  nationalOlStandingAllAmerica: 25,
  majorOlAwardStanding: 20,
  crossPositionNationalStanding: 15,
  documentedIndividualDominance: 10,
  competitionProof: 5,
  olUnitCentrality: 5,
  draftEvaluation: 5,
} as const;

const dlEdgePeakMaximums = {
  backfieldDisruption: 25,
  disruptionRateEfficiency: 15,
  overallDefensiveRunImpact: 10,
  havocPlaymaking: 10,
  eraRelativeDominance: 5,
  competitionProof: 5,
} as const;

const lbPeakMaximums = {
  tacklingDownToDownDominance: 20,
  backfieldDisruption: 15,
  coverageTurnoverImpact: 15,
  defensiveCentralityTotalPlaymaking: 10,
  eraRelativeDominance: 5,
  competitionProof: 5,
} as const;

const secondaryPeakMaximums = {
  coverageDominanceSuppression: 20,
  ballDisruptionTakeaways: 15,
  totalDefensiveImpact: 15,
  havocVersatility: 10,
  eraRelativeDominance: 5,
  competitionProof: 5,
} as const;

const kickerPeakMaximums = {
  accuracyAdjustedForDifficulty: 25,
  rangeDeepKickAbility: 15,
  fieldGoalVolumeScoringResponsibility: 10,
  conversionReliability: 10,
  eraRelativeDominance: 5,
  competitionProof: 5,
} as const;

const punterPeakMaximums = {
  grossDistanceDominance: 20,
  fieldPositionPlacement: 20,
  netReturnSuppression: 15,
  workloadRepeatExecution: 5,
  eraRelativeDominance: 5,
  competitionProof: 5,
} as const;

const standardSupportMaximums = {
  sustain: 10,
  awardsNationalStanding: 15,
  bigStageImpact: 5,
} as const;

const qbSupportMaximums = {
  sustain: 10,
  awardsNationalStanding: 15,
  winningPostseason: 15,
} as const;

const olSupportMaximums = {
  sustain: 10,
  bigStageImpact: 5,
} as const;

export const footballCfbCareerGreatnessPoolSpecs = {
  QB: { peakMax: 60, supportMax: 40, peakComponentMaximums: qbPeakMaximums, supportComponentMaximums: qbSupportMaximums },
  RB: { peakMax: 70, supportMax: 30, peakComponentMaximums: rbPeakMaximums, supportComponentMaximums: standardSupportMaximums },
  WR: { peakMax: 70, supportMax: 30, peakComponentMaximums: wrPeakMaximums, supportComponentMaximums: standardSupportMaximums },
  TE: { peakMax: 70, supportMax: 30, peakComponentMaximums: tePeakMaximums, supportComponentMaximums: standardSupportMaximums },
  OL: { peakMax: 85, supportMax: 15, peakComponentMaximums: olPeakMaximums, supportComponentMaximums: olSupportMaximums },
  "DL / EDGE": { peakMax: 70, supportMax: 30, peakComponentMaximums: dlEdgePeakMaximums, supportComponentMaximums: standardSupportMaximums },
  LB: { peakMax: 70, supportMax: 30, peakComponentMaximums: lbPeakMaximums, supportComponentMaximums: standardSupportMaximums },
  Secondary: { peakMax: 70, supportMax: 30, peakComponentMaximums: secondaryPeakMaximums, supportComponentMaximums: standardSupportMaximums },
  "K / P": { peakMax: 70, supportMax: 30, kickerPeakComponentMaximums: kickerPeakMaximums, punterPeakComponentMaximums: punterPeakMaximums, supportComponentMaximums: standardSupportMaximums },
} as const;

const sumMaximums = (maximums: ComponentMaximums) => Object.values(maximums).reduce((sum, value) => sum + value, 0);

function assertFinitePoints(component: string, points: number, maxPoints: number) {
  if (!Number.isFinite(points) || points < 0 || points > maxPoints) {
    throw new RangeError(`${component} must be between 0 and ${maxPoints}; received ${points}`);
  }
}

function aggregateComponents(
  components: Readonly<Record<string, FootballCfbScoreEvidence>>,
  maximums: ComponentMaximums,
  normalizeStructuralUnavailable: boolean,
) {
  const componentEvidence: FootballCfbGreatnessComponentEvidence[] = [];
  const missing: string[] = [];
  const structurallyUnavailable: string[] = [];
  let availablePoints = 0;
  let availableMax = 0;

  for (const [component, maxPoints] of Object.entries(maximums)) {
    const evidence = components[component];
    if (!evidence) throw new Error(`Missing calculator component contract: ${component}`);
    componentEvidence.push({ section: "peak", component, maxPoints, evidence });
    if (evidence.status === "available") {
      assertFinitePoints(component, evidence.points, maxPoints);
      availablePoints += evidence.points;
      availableMax += maxPoints;
    } else if (evidence.status === "missing") {
      missing.push(component);
    } else {
      structurallyUnavailable.push(component);
    }
  }

  if (missing.length > 0 || (structurallyUnavailable.length > 0 && !normalizeStructuralUnavailable) || availableMax === 0) {
    return { score: null, componentEvidence, missing, structurallyUnavailable, normalized: false };
  }

  const fullMax = sumMaximums(maximums);
  const score = structurallyUnavailable.length > 0
    ? Math.min(fullMax, availablePoints * (fullMax / availableMax))
    : availablePoints;
  return { score, componentEvidence, missing, structurallyUnavailable, normalized: structurallyUnavailable.length > 0 };
}

function supportComponents(
  values: Readonly<Record<string, FootballCfbScoreEvidence>>,
  maximums: ComponentMaximums,
) {
  const componentEvidence: FootballCfbGreatnessComponentEvidence[] = [];
  const missing: string[] = [];
  const structurallyUnavailable: string[] = [];
  let score = 0;

  for (const [component, maxPoints] of Object.entries(maximums)) {
    const evidence = values[component];
    if (!evidence) throw new Error(`Missing support component contract: ${component}`);
    componentEvidence.push({ section: "support", component, maxPoints, evidence });
    if (evidence.status === "available") {
      assertFinitePoints(component, evidence.points, maxPoints);
      score += evidence.points;
    } else if (evidence.status === "missing") {
      missing.push(component);
    } else {
      structurallyUnavailable.push(component);
    }
  }

  return {
    score: missing.length === 0 && structurallyUnavailable.length === 0 ? score : null,
    componentEvidence,
    missing,
    structurallyUnavailable,
  };
}

function availablePoints(evidence: FootballCfbScoreEvidence): number | null {
  return evidence.status === "available" ? evidence.points : null;
}

function classifyQb(
  peak: number,
  support: number,
  sustain: number,
  awards: number,
  nationalTitleAsPrimaryQb: boolean,
): FootballCfbCareerGreatnessTier | null {
  if (
    (peak >= 58 && nationalTitleAsPrimaryQb)
    || (peak >= 54 && nationalTitleAsPrimaryQb && sustain + awards >= 17)
    || (peak >= 54 && support >= 33)
  ) return 1;
  if (peak >= 54 && support >= 14) return 2;
  if ((peak >= 48 && support >= 12) || (peak >= 45 && support >= 27)) return 3;
  return null;
}

function classifyNonQb(pool: Exclude<FootballCfbCareerGreatnessPoolId, "QB" | "OL">, peak: number, support: number): FootballCfbCareerGreatnessTier | null {
  const tier1 = pool === "RB"
    ? (peak >= 67 && support >= 10) || (peak >= 61 && support >= 15) || (peak >= 58 && support >= 27)
    : pool === "WR"
      ? (peak >= 66 && support >= 8) || (peak >= 63 && support >= 14) || (peak >= 60 && support >= 18)
      : pool === "TE"
        ? (peak >= 68 && support >= 10) || (peak >= 64 && support >= 15) || (peak >= 61 && support >= 23)
        : pool === "DL / EDGE"
          ? (peak >= 68 && support >= 8) || (peak >= 65 && support >= 15) || (peak >= 62 && support >= 24)
          : pool === "LB"
            ? (peak >= 68 && support >= 8) || (peak >= 64 && support >= 15) || (peak >= 60 && support >= 24)
            : (peak >= 68 && support >= 8) || (peak >= 64 && support >= 15) || (peak >= 60 && support >= 24);
  if (tier1) return 1;

  const tier2 = pool === "RB"
    ? (peak >= 55 && support >= 10) || (peak >= 52 && support >= 23)
    : pool === "WR"
      ? (peak >= 58 && support >= 8) || (peak >= 55 && support >= 14)
      : pool === "TE"
        ? (peak >= 60 && support >= 8) || (peak >= 57 && support >= 15)
        : pool === "DL / EDGE" || pool === "LB"
          ? (peak >= 61 && support >= 8) || (peak >= 57 && support >= 15)
          : (peak >= 60 && support >= 8) || (peak >= 56 && support >= 15);
  if (tier2) return 2;

  const tier3 = pool === "RB"
    ? (peak >= 50 && support >= 6) || (peak >= 47 && support >= 16)
    : pool === "WR"
      ? (peak >= 52 && support >= 5) || (peak >= 49 && support >= 11)
      : pool === "TE"
        ? (peak >= 54 && support >= 5) || (peak >= 51 && support >= 11)
        : pool === "DL / EDGE" || pool === "LB"
          ? (peak >= 54 && support >= 5) || (peak >= 50 && support >= 12)
          : (peak >= 53 && support >= 5) || (peak >= 49 && support >= 12);
  return tier3 ? 3 : null;
}

function classifyOl(peak: number, support: number): FootballCfbCareerGreatnessTier | null {
  if (peak >= 82 || (peak >= 75 && support >= 4) || (peak >= 68 && support >= 10) || (peak >= 64 && support >= 13)) return 1;
  if (peak >= 72 || (peak >= 65 && support >= 4) || (peak >= 60 && support >= 9)) return 2;
  if (peak >= 63 || (peak >= 56 && support >= 3) || (peak >= 52 && support >= 7)) return 3;
  return null;
}

export function scoreFootballCfbOlDraftEvaluation(evidence: FootballCfbOlDraftEvaluationEvidence): FootballCfbScoreEvidence {
  if (evidence.status !== "available") return evidence;
  const points: Record<FootballCfbOlDraftEvaluationBand, number> = {
    "top-five": 5,
    "top-ten-or-first-ol-round-one": 4,
    "other-first-round": 3,
    "second-round": 2,
    "third-round": 1,
    "later-or-undrafted": 0,
  };
  return footballCfbScore(points[evidence.band]);
}

function repeatBandScore(
  evidence: FootballCfbScoreEvidence,
  bands: readonly Readonly<{ minimum: number; points: number }>[],
  component: string,
  peakMax: number,
): FootballCfbScoreEvidence {
  if (evidence.status !== "available") return evidence;
  assertFinitePoints(component, evidence.points, peakMax);
  return footballCfbScore(bands.find((band) => evidence.points >= band.minimum)?.points ?? 0);
}

export function calculateFootballCfbRbSustain(
  secondBestPeak60: FootballCfbScoreEvidence,
  thirdBestPeak60: FootballCfbScoreEvidence,
): FootballCfbScoreEvidence {
  const second = repeatBandScore(secondBestPeak60, [
    { minimum: 52, points: 7 },
    { minimum: 48, points: 5 },
    { minimum: 44, points: 3 },
    { minimum: 40, points: 1 },
  ], "RB second-best Peak60", 60);
  const third = repeatBandScore(thirdBestPeak60, [
    { minimum: 48, points: 3 },
    { minimum: 44, points: 2 },
    { minimum: 40, points: 1 },
  ], "RB third-best Peak60", 60);
  if (second.status === "missing" || third.status === "missing") return footballCfbMissingScore();
  if (second.status === "structurally-unavailable" || third.status === "structurally-unavailable") return footballCfbStructurallyUnavailableScore();
  return footballCfbScore(Math.min(10, second.points + third.points));
}

export function calculateFootballCfbWrSustain(
  secondBestPeak70: FootballCfbScoreEvidence,
  thirdBestPeak70: FootballCfbScoreEvidence,
): FootballCfbScoreEvidence {
  const second = repeatBandScore(secondBestPeak70, [
    { minimum: 60, points: 7 },
    { minimum: 56, points: 5 },
    { minimum: 52, points: 3 },
    { minimum: 48, points: 1 },
  ], "WR second-best Peak", 70);
  const third = repeatBandScore(thirdBestPeak70, [
    { minimum: 56, points: 3 },
    { minimum: 52, points: 2 },
    { minimum: 48, points: 1 },
  ], "WR third-best Peak", 70);
  if (second.status === "missing" || third.status === "missing") return footballCfbMissingScore();
  if (second.status === "structurally-unavailable" || third.status === "structurally-unavailable") return footballCfbStructurallyUnavailableScore();
  return footballCfbScore(Math.min(10, second.points + third.points));
}

function dualRoleBonus(secondaryPeak: number): number {
  if (secondaryPeak >= 65) return 4;
  if (secondaryPeak >= 61) return 3;
  if (secondaryPeak >= 56) return 2;
  if (secondaryPeak >= 50) return 1;
  return 0;
}

function resultCompleteness(missing: readonly string[], unavailable: readonly string[], normalized: boolean): FootballCfbGreatnessEvidenceCompleteness {
  if (missing.length > 0) return "incomplete";
  if (unavailable.length > 0 && !normalized) return "incomplete";
  return normalized ? "normalized-structural" : "complete";
}

function resultFlags(missing: readonly string[], unavailable: readonly string[], normalized: boolean, olDraftDependent = false): FootballCfbGreatnessReviewFlag[] {
  const flags: FootballCfbGreatnessReviewFlag[] = [];
  if (missing.length > 0) flags.push("missing-evidence");
  if (unavailable.length > 0) flags.push("structurally-unavailable-evidence");
  if (normalized) flags.push("normalized-structural-evidence");
  if (olDraftDependent) flags.push("ol-draft-tier-dependence");
  return flags;
}

function calculateStandardNonQb(
  input: FootballCfbRbCareerGreatnessInput | FootballCfbWrCareerGreatnessInput | FootballCfbTeCareerGreatnessInput | FootballCfbDlEdgeCareerGreatnessInput | FootballCfbLbCareerGreatnessInput | FootballCfbSecondaryCareerGreatnessInput,
): FootballCfbCareerGreatnessResult {
  if (input.pool === "Secondary") {
    const specialTeamsPoints = input.offenseSpecialTeamsVersatilityPoints ?? 0;
    assertFinitePoints("Secondary offense/special-teams versatility", specialTeamsPoints, 5);
    const havoc = input.peak.havocVersatility;
    if (havoc.status === "available" && specialTeamsPoints > havoc.points) {
      throw new RangeError("Secondary offense/special-teams versatility cannot exceed total havoc/versatility points");
    }
  }

  const maximums = input.pool === "RB"
    ? rbPeakMaximums
    : input.pool === "WR"
      ? wrPeakMaximums
      : input.pool === "TE"
        ? tePeakMaximums
        : input.pool === "DL / EDGE"
          ? dlEdgePeakMaximums
          : input.pool === "LB"
            ? lbPeakMaximums
            : secondaryPeakMaximums;
  const peak = aggregateComponents(input.peak, maximums, false);
  const supportValues = {
    sustain: input.sustain,
    awardsNationalStanding: input.awardsNationalStanding,
    bigStageImpact: input.bigStageImpact,
  };
  const support = supportComponents(supportValues, standardSupportMaximums);
  const missing = [...peak.missing, ...support.missing];
  const unavailable = [...peak.structurallyUnavailable, ...support.structurallyUnavailable];
  const tier = peak.score != null && support.score != null ? classifyNonQb(input.pool, peak.score, support.score) : null;

  return {
    pool: input.pool,
    peak: peak.score,
    support: support.score,
    preliminaryTier: tier,
    evidenceCompleteness: resultCompleteness(missing, unavailable, peak.normalized),
    componentEvidence: [...peak.componentEvidence, ...support.componentEvidence],
    reviewFlags: resultFlags(missing, unavailable, peak.normalized),
  };
}

export function calculateFootballCfbCareerGreatness(input: FootballCfbCareerGreatnessInput): FootballCfbCareerGreatnessResult {
  if (input.pool === "QB") {
    const peak = aggregateComponents(input.peak, qbPeakMaximums, false);
    const support = supportComponents({
      sustain: input.sustain,
      awardsNationalStanding: input.awardsNationalStanding,
      winningPostseason: input.winningPostseason,
    }, qbSupportMaximums);
    const sustain = availablePoints(input.sustain);
    const awards = availablePoints(input.awardsNationalStanding);
    const missing = [...peak.missing, ...support.missing];
    const unavailable = [...peak.structurallyUnavailable, ...support.structurallyUnavailable];
    const tier = peak.score != null && support.score != null && sustain != null && awards != null
      ? classifyQb(peak.score, support.score, sustain, awards, input.nationalTitleAsPrimaryQb)
      : null;
    return {
      pool: input.pool,
      peak: peak.score,
      support: support.score,
      preliminaryTier: tier,
      evidenceCompleteness: resultCompleteness(missing, unavailable, false),
      componentEvidence: [...peak.componentEvidence, ...support.componentEvidence],
      reviewFlags: resultFlags(missing, unavailable, false),
    };
  }

  if (input.pool === "OL") {
    const draftEvidence = scoreFootballCfbOlDraftEvaluation(input.draftEvaluation);
    const peakComponents = { ...input.peak, draftEvaluation: draftEvidence };
    const peak = aggregateComponents(peakComponents, olPeakMaximums, true);
    const support = supportComponents({ sustain: input.sustain, bigStageImpact: input.bigStageImpact }, olSupportMaximums);
    const missing = [...peak.missing, ...support.missing];
    const unavailable = [...peak.structurallyUnavailable, ...support.structurallyUnavailable];
    const tier = peak.score != null && support.score != null ? classifyOl(peak.score, support.score) : null;

    let olDraftDependent = false;
    if (tier != null && draftEvidence.status === "available" && draftEvidence.points > 0 && support.score != null) {
      const withoutDraft = aggregateComponents({ ...peakComponents, draftEvaluation: footballCfbScore(0) }, olPeakMaximums, true);
      const withoutDraftTier = withoutDraft.score != null ? classifyOl(withoutDraft.score, support.score) : null;
      olDraftDependent = withoutDraftTier !== tier;
    }

    return {
      pool: input.pool,
      peak: peak.score,
      support: support.score,
      preliminaryTier: tier,
      evidenceCompleteness: resultCompleteness(missing, unavailable, peak.normalized),
      componentEvidence: [...peak.componentEvidence, ...support.componentEvidence],
      reviewFlags: resultFlags(missing, unavailable, peak.normalized, olDraftDependent),
    };
  }

  if (input.pool === "K / P") {
    if (!input.kickerPeak && !input.punterPeak) throw new Error("K / P calculation requires a kicker Peak branch, a punter Peak branch, or both");
    const kicker = input.kickerPeak ? aggregateComponents(input.kickerPeak, kickerPeakMaximums, true) : null;
    const punter = input.punterPeak ? aggregateComponents(input.punterPeak, punterPeakMaximums, true) : null;
    const support = supportComponents({
      sustain: input.sustain,
      awardsNationalStanding: input.awardsNationalStanding,
      bigStageImpact: input.bigStageImpact,
    }, standardSupportMaximums);
    const branchScores = [kicker?.score, punter?.score].filter((score): score is number => score != null);
    const requiredBranchCount = Number(Boolean(kicker)) + Number(Boolean(punter));
    const dual = Boolean(kicker && punter);
    const branchComplete = branchScores.length === requiredBranchCount;
    const bonus = dual && branchComplete ? dualRoleBonus(Math.min(...branchScores)) : 0;
    const peakScore = branchComplete ? Math.min(70, Math.max(...branchScores) + bonus) : null;
    const peakEvidence = [...(kicker?.componentEvidence ?? []), ...(punter?.componentEvidence ?? [])];
    const missing = [...(kicker?.missing ?? []), ...(punter?.missing ?? []), ...support.missing];
    const unavailable = [...(kicker?.structurallyUnavailable ?? []), ...(punter?.structurallyUnavailable ?? []), ...support.structurallyUnavailable];
    const normalized = Boolean(kicker?.normalized || punter?.normalized);
    const tier = peakScore != null && support.score != null ? classifyNonQb("K / P", peakScore, support.score) : null;

    return {
      pool: input.pool,
      peak: peakScore,
      support: support.score,
      preliminaryTier: tier,
      evidenceCompleteness: resultCompleteness(missing, unavailable, normalized),
      componentEvidence: [...peakEvidence, ...support.componentEvidence],
      reviewFlags: resultFlags(missing, unavailable, normalized),
      kickerPeak: kicker?.score,
      punterPeak: punter?.score,
      dualRoleBonus: bonus,
    };
  }

  return calculateStandardNonQb(input);
}
