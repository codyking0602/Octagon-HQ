import {
  calculateFootballCfbCareerGreatness,
  footballCfbCareerGreatnessModels,
  footballCfbKickerPeakComponents,
  footballCfbPunterPeakComponents,
  type FootballCfbCareerGreatnessInput,
  type FootballCfbCareerGreatnessPoolId,
  type FootballCfbCareerGreatnessResult,
  type FootballCfbGreatnessComponentSpec,
  type FootballCfbGreatnessEvidence,
  type FootballCfbOlDraftEvaluationEvidence,
} from "./footballCfbCareerGreatness";
import { getFootballFactualRecord, type FootballFactMetricId } from "./footballFactualStatsCore";
import {
  queryFootballSubjects,
  type FootballSubjectPosition,
  type FootballSubjectProfile,
} from "./footballSubjectRegistry";

const RECOGNIZABLE_TIERS = ["A", "B", "C"] as const;
const CFBFAST_R_PLAYER_FACT_START_SEASON = 2014;

export const footballCfbCareerGreatnessUniverseHealthFloors: Readonly<Record<FootballCfbCareerGreatnessPoolId, number>> = {
  QB: 60,
  RB: 70,
  WR: 55,
  TE: 30,
  OL: 50,
  "DL / EDGE": 45,
  LB: 45,
  Secondary: 45,
  "K / P": 25,
};

export type FootballCfbCareerGreatnessUniverseReviewFlag =
  | "missing-component-evidence"
  | "missing-historical-evidence"
  | "tier-boundary-review"
  | "suspicious-output";

export interface FootballCfbCareerGreatnessUniverseRow {
  readonly subjectId: string;
  readonly name: string;
  readonly position: FootballSubjectPosition;
  readonly poolId: FootballCfbCareerGreatnessPoolId;
  readonly school?: string;
  readonly startSeason?: number;
  readonly endSeason?: number;
  readonly recognizabilityTier: "A" | "B" | "C";
  /** Raw evidence remains owned by footballFactualStats; this is only the metric-id audit trail used for PR 3 repairs. */
  readonly canonicalFactMetricIds: readonly FootballFactMetricId[];
  readonly calculation: FootballCfbCareerGreatnessResult;
  readonly reviewFlags: readonly FootballCfbCareerGreatnessUniverseReviewFlag[];
}

function poolForPosition(position?: FootballSubjectPosition): FootballCfbCareerGreatnessPoolId | null {
  switch (position) {
    case "QB": return "QB";
    case "RB": return "RB";
    case "WR": return "WR";
    case "TE": return "TE";
    case "OL": return "OL";
    case "DL": return "DL / EDGE";
    case "LB": return "LB";
    case "DB": return "Secondary";
    case "K":
    case "P": return "K / P";
    default: return null;
  }
}

function missingEvidenceFor(components: readonly FootballCfbGreatnessComponentSpec[]) {
  return Object.fromEntries(
    components.map((component) => [component.id, { status: "missing" } satisfies FootballCfbGreatnessEvidence]),
  );
}

/**
 * Draft position is the lone NFL datum allowed by the locked CFB framework, and only as OL college-player
 * corroboration. We score it only when the canonical identity makes the band unambiguous. A first-round pick
 * after No. 10 remains missing because the current factual owner does not establish whether he was the first OL taken.
 */
function olDraftEvaluationForSubject(subject: FootballSubjectProfile): FootballCfbOlDraftEvaluationEvidence {
  if (subject.undrafted === true) return { status: "known", value: "later-or-undrafted" };
  if (subject.draftRound == null) return { status: "missing" };
  if (subject.draftRound === 1) {
    if (subject.draftPick == null) return { status: "missing" };
    if (subject.draftPick <= 5) return { status: "known", value: "top-five" };
    if (subject.draftPick <= 10) return { status: "known", value: "top-ten-or-first-ol-round-one" };
    return { status: "missing" };
  }
  if (subject.draftRound === 2) return { status: "known", value: "second-round" };
  if (subject.draftRound === 3) return { status: "known", value: "third-round" };
  return { status: "known", value: "later-or-undrafted" };
}

function calculatorInputForSubject(subject: FootballSubjectProfile, poolId: FootballCfbCareerGreatnessPoolId): FootballCfbCareerGreatnessInput {
  const model = footballCfbCareerGreatnessModels[poolId];
  const support = missingEvidenceFor(model.supportComponents);

  if (poolId === "K / P") {
    const specialistRole = subject.position === "K" ? "K" : "P";
    return {
      poolId,
      peak: {},
      support,
      specialistRole,
      ...(specialistRole === "K"
        ? { kickerPeak: missingEvidenceFor(footballCfbKickerPeakComponents) }
        : { punterPeak: missingEvidenceFor(footballCfbPunterPeakComponents) }),
    };
  }

  const peakComponents = poolId === "OL"
    ? model.peakComponents.filter((component) => component.id !== "nfl-draft-evaluation")
    : model.peakComponents;

  return {
    poolId,
    peak: missingEvidenceFor(peakComponents),
    support,
    ...(poolId === "QB" ? { qbNationalTitleAsPrimary: { status: "missing" as const } } : {}),
    ...(poolId === "OL" ? { olDraftEvaluation: olDraftEvaluationForSubject(subject) } : {}),
  };
}

function latestKnownCareerSeason(subject: FootballSubjectProfile) {
  if (subject.endSeason != null) return subject.endSeason;
  if (subject.activeDecades?.length) return Math.max(...subject.activeDecades) + 9;
  return null;
}

function isHistoricalCoverageGap(subject: FootballSubjectProfile, calculation: FootballCfbCareerGreatnessResult) {
  if (calculation.evidenceCompleteness === "complete") return false;
  const latestSeason = latestKnownCareerSeason(subject);
  return latestSeason != null && latestSeason < CFBFAST_R_PLAYER_FACT_START_SEASON;
}

function isTierBoundaryCase(calculation: FootballCfbCareerGreatnessResult) {
  if (calculation.bestPossibleTier !== calculation.worstPossibleTier) return true;
  if (calculation.peak.exact == null || calculation.support.exact == null) return false;
  const model = footballCfbCareerGreatnessModels[calculation.poolId];
  const routes = [...model.tier1, ...model.tier2, ...model.tier3];
  return routes.some((route) => (
    Math.abs(calculation.peak.exact! - route.peak) <= 1
    && (route.support == null || Math.abs(calculation.support.exact! - route.support) <= 1)
  ));
}

function isSuspiciousOutput(calculation: FootballCfbCareerGreatnessResult, factMetricIds: readonly FootballFactMetricId[]) {
  if (!calculation.preliminaryTier) return false;
  if (calculation.evidenceCompleteness !== "complete" && calculation.evidenceCompleteness !== "structurally-normalized") return true;
  return factMetricIds.length === 0;
}

function universeReviewFlags(
  subject: FootballSubjectProfile,
  calculation: FootballCfbCareerGreatnessResult,
  factMetricIds: readonly FootballFactMetricId[],
): FootballCfbCareerGreatnessUniverseReviewFlag[] {
  const flags: FootballCfbCareerGreatnessUniverseReviewFlag[] = [];
  if (calculation.evidenceCompleteness === "incomplete" || calculation.evidenceCompleteness === "insufficient") {
    flags.push("missing-component-evidence");
  }
  if (isHistoricalCoverageGap(subject, calculation)) flags.push("missing-historical-evidence");
  if (isTierBoundaryCase(calculation)) flags.push("tier-boundary-review");
  if (isSuspiciousOutput(calculation, factMetricIds)) flags.push("suspicious-output");
  return flags;
}

function recognizableCfbCareerSubjects() {
  const byId = new Map<string, FootballSubjectProfile>();
  for (const subject of queryFootballSubjects({
    kind: "player-career",
    league: "CFB",
    recognizabilityTiers: RECOGNIZABLE_TIERS,
    casualEligible: true,
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  })) {
    if (poolForPosition(subject.position) && !byId.has(subject.id)) byId.set(subject.id, subject);
  }
  return [...byId.values()];
}

/**
 * PR 2 full-universe calculation. Membership comes only from the canonical Stage 12 registry. Raw facts come only
 * from footballFactualStats. The calculator receives point evidence only when the canonical owners can support it;
 * unsupported stat-to-point translations remain missing for targeted PR 3 research instead of becoming a fallback
 * ranking model or a hand-tiered parallel database.
 */
export const footballCfbCareerGreatnessUniverse: readonly FootballCfbCareerGreatnessUniverseRow[] = recognizableCfbCareerSubjects()
  .map((subject) => {
    const position = subject.position!;
    const poolId = poolForPosition(position)!;
    const factualRecord = getFootballFactualRecord(subject.id);
    const canonicalFactMetricIds = (factualRecord?.facts ?? [])
      .map((fact) => fact.metricId)
      .filter((metricId): metricId is FootballFactMetricId => metricId.startsWith("cfb-"));
    const calculation = calculateFootballCfbCareerGreatness(calculatorInputForSubject(subject, poolId));
    return {
      subjectId: subject.id,
      name: subject.name,
      position,
      poolId,
      ...(subject.school ? { school: subject.school } : {}),
      ...(subject.startSeason != null ? { startSeason: subject.startSeason } : {}),
      ...(subject.endSeason != null ? { endSeason: subject.endSeason } : {}),
      recognizabilityTier: subject.recognizabilityTier as "A" | "B" | "C",
      canonicalFactMetricIds,
      calculation,
      reviewFlags: universeReviewFlags(subject, calculation, canonicalFactMetricIds),
    };
  })
  .sort((a, b) => a.poolId.localeCompare(b.poolId) || a.name.localeCompare(b.name) || a.subjectId.localeCompare(b.subjectId));

export const footballCfbCareerGreatnessUniversePoolCounts: Readonly<Record<FootballCfbCareerGreatnessPoolId, number>> = Object.fromEntries(
  (Object.keys(footballCfbCareerGreatnessUniverseHealthFloors) as FootballCfbCareerGreatnessPoolId[])
    .map((poolId) => [poolId, footballCfbCareerGreatnessUniverse.filter((row) => row.poolId === poolId).length]),
) as Readonly<Record<FootballCfbCareerGreatnessPoolId, number>>;
