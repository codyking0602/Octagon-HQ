import {
  calculateFootballCfbCareerGreatness,
  footballCfbCareerGreatnessModels,
  type FootballCfbCareerGreatnessPoolId,
  type FootballCfbCareerGreatnessResult,
} from "./footballCfbCareerGreatness";
import { buildFootballCfbCareerGreatnessEvidence } from "./footballCfbCareerGreatnessEvidence";
import { getFootballFactualRecord, type FootballFactMetricId } from "./footballFactualStats";
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
  /** Raw evidence remains owned by footballFactualStats; these ids make the PR 3 repair queue auditable. */
  readonly canonicalFactMetricIds: readonly FootballFactMetricId[];
  /** Canonical facts actually consumed by the Peak adapter. Career volume is intentionally not consumed as Peak. */
  readonly consumedFactMetricIds: readonly FootballFactMetricId[];
  /** Locked greatness component ids that received point evidence from canonical facts or the allowed OL draft corroboration. */
  readonly factBackedComponentIds: readonly string[];
  /** Facts that remain available to later support/context work rather than being silently discarded. */
  readonly unconsumedCanonicalFactMetricIds: readonly FootballFactMetricId[];
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

function latestKnownCareerSeason(subject: FootballSubjectProfile) {
  if (subject.endSeason != null) return subject.endSeason;
  if (subject.activeDecades?.length) return Math.max(...subject.activeDecades) + 9;
  return null;
}

function isHistoricalCoverageGap(
  subject: FootballSubjectProfile,
  calculation: FootballCfbCareerGreatnessResult,
  factBackedComponentIds: readonly string[],
) {
  if (calculation.evidenceCompleteness === "complete") return false;
  const latestSeason = latestKnownCareerSeason(subject);
  return latestSeason != null
    && latestSeason < CFBFAST_R_PLAYER_FACT_START_SEASON
    && factBackedComponentIds.length === 0;
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

function isSuspiciousOutput(
  calculation: FootballCfbCareerGreatnessResult,
  factBackedComponentIds: readonly string[],
) {
  if (!calculation.preliminaryTier) return false;
  if (calculation.evidenceCompleteness !== "complete" && calculation.evidenceCompleteness !== "structurally-normalized") return true;
  return factBackedComponentIds.length === 0;
}

function universeReviewFlags(
  subject: FootballSubjectProfile,
  calculation: FootballCfbCareerGreatnessResult,
  factBackedComponentIds: readonly string[],
): FootballCfbCareerGreatnessUniverseReviewFlag[] {
  const flags: FootballCfbCareerGreatnessUniverseReviewFlag[] = [];
  if (calculation.evidenceCompleteness === "incomplete" || calculation.evidenceCompleteness === "insufficient") {
    flags.push("missing-component-evidence");
  }
  if (isHistoricalCoverageGap(subject, calculation, factBackedComponentIds)) flags.push("missing-historical-evidence");
  if (isTierBoundaryCase(calculation)) flags.push("tier-boundary-review");
  if (isSuspiciousOutput(calculation, factBackedComponentIds)) flags.push("suspicious-output");
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
 * Full Stage 12 universe calculation. Membership comes only from the canonical registry and raw facts come only
 * from footballFactualStats. The evidence adapter consumes best-season production where it directly supports a
 * locked Peak component; career accumulation never substitutes for Peak, and unsupported awards/context remain
 * missing for targeted research instead of becoming a second ranking model or a hand-tiered database.
 */
export const footballCfbCareerGreatnessUniverse: readonly FootballCfbCareerGreatnessUniverseRow[] = recognizableCfbCareerSubjects()
  .map((subject) => {
    const position = subject.position!;
    const poolId = poolForPosition(position)!;
    const factualRecord = getFootballFactualRecord(subject.id);
    const canonicalFactMetricIds = (factualRecord?.facts ?? [])
      .map((fact) => fact.metricId)
      .filter((metricId): metricId is FootballFactMetricId => metricId.startsWith("cfb-"));
    const evidence = buildFootballCfbCareerGreatnessEvidence(subject, poolId, factualRecord);
    const calculation = calculateFootballCfbCareerGreatness(evidence.input);
    const consumedSet = new Set(evidence.consumedFactMetricIds);
    const unconsumedCanonicalFactMetricIds = canonicalFactMetricIds.filter((metricId) => !consumedSet.has(metricId));
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
      consumedFactMetricIds: evidence.consumedFactMetricIds,
      factBackedComponentIds: evidence.factBackedComponentIds,
      unconsumedCanonicalFactMetricIds,
      calculation,
      reviewFlags: universeReviewFlags(subject, calculation, evidence.factBackedComponentIds),
    };
  })
  .sort((a, b) => a.poolId.localeCompare(b.poolId) || a.name.localeCompare(b.name) || a.subjectId.localeCompare(b.subjectId));

export const footballCfbCareerGreatnessUniversePoolCounts: Readonly<Record<FootballCfbCareerGreatnessPoolId, number>> = Object.fromEntries(
  (Object.keys(footballCfbCareerGreatnessUniverseHealthFloors) as FootballCfbCareerGreatnessPoolId[])
    .map((poolId) => [poolId, footballCfbCareerGreatnessUniverse.filter((row) => row.poolId === poolId).length]),
) as Readonly<Record<FootballCfbCareerGreatnessPoolId, number>>;
