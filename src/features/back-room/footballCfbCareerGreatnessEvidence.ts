import {
  footballCfbCareerGreatnessModels,
  footballCfbKickerPeakComponents,
  footballCfbPunterPeakComponents,
  type FootballCfbCareerGreatnessInput,
  type FootballCfbCareerGreatnessPoolId,
  type FootballCfbGreatnessComponentSpec,
  type FootballCfbGreatnessEvidence,
  type FootballCfbOlDraftEvaluationEvidence,
} from "./footballCfbCareerGreatness";
import type {
  FootballFactMetricId,
  FootballFactualRecord,
} from "./footballFactualStats";
import type { FootballSubjectProfile } from "./footballSubjectRegistry";

export interface FootballCfbCareerGreatnessEvidenceBuild {
  readonly input: FootballCfbCareerGreatnessInput;
  readonly consumedFactMetricIds: readonly FootballFactMetricId[];
  readonly factBackedComponentIds: readonly string[];
}

const missing = (): FootballCfbGreatnessEvidence => ({ status: "missing" });
const known = (value: number): FootballCfbGreatnessEvidence => ({ status: "known", value });

function evidenceRecord(components: readonly FootballCfbGreatnessComponentSpec[]) {
  return Object.fromEntries(components.map((component) => [component.id, missing()]));
}

function scoreBand(value: number, bands: readonly (readonly [number, number])[]) {
  return bands.find(([minimum]) => value >= minimum)?.[1] ?? 0;
}

function maxKnown(values: readonly (number | null)[]) {
  const knownValues = values.filter((value): value is number => value != null);
  return knownValues.length ? Math.max(...knownValues) : null;
}

function sumWhenAll(values: readonly (number | null)[]) {
  if (values.some((value) => value == null)) return null;
  return (values as readonly number[]).reduce((sum, value) => sum + value, 0);
}

function factMap(record: FootballFactualRecord | null) {
  return new Map((record?.facts ?? [])
    .filter((fact) => fact.metricId.startsWith("cfb-"))
    .map((fact) => [fact.metricId, fact.value] as const));
}

function peakEvidenceFromFacts(
  poolId: FootballCfbCareerGreatnessPoolId,
  components: readonly FootballCfbGreatnessComponentSpec[],
  facts: ReadonlyMap<FootballFactMetricId, number>,
) {
  const evidence = evidenceRecord(components);
  const consumed = new Set<FootballFactMetricId>();
  const backed = new Set<string>();
  const use = (metricId: FootballFactMetricId) => {
    const value = facts.get(metricId);
    if (value != null) consumed.add(metricId);
    return value ?? null;
  };
  const set = (componentId: string, value: number | null) => {
    if (value == null) return;
    evidence[componentId] = known(value);
    backed.add(componentId);
  };

  if (poolId === "QB") {
    const passingYards = use("cfb-best-season-passing-yards");
    const passingTouchdowns = use("cfb-best-season-passing-touchdowns");
    const passerRating = use("cfb-best-season-passer-rating");
    const rushingYards = use("cfb-best-season-rushing-yards");
    const rushingTouchdowns = use("cfb-best-season-rushing-touchdowns");

    const passingScore = maxKnown([
      passingYards == null ? null : scoreBand(passingYards, [[5500, 20], [5000, 19], [4500, 18], [4000, 17], [3500, 15], [3000, 13], [2500, 11], [2000, 9]]),
      passingTouchdowns == null ? null : scoreBand(passingTouchdowns, [[60, 20], [50, 19], [45, 18], [40, 17], [35, 15], [30, 13], [25, 11], [20, 9]]),
      passerRating == null ? null : scoreBand(passerRating, [[200, 20], [190, 19], [180, 18], [170, 17], [160, 15], [150, 13], [140, 11], [130, 9]]),
    ]);
    set("passing-efficiency-dominance", passingScore);

    const totalYards = sumWhenAll([passingYards, rushingYards]);
    set("total-offensive-value", totalYards == null ? null : scoreBand(totalYards, [[6000, 20], [5500, 19], [5000, 18], [4500, 17], [4000, 15], [3500, 13], [3000, 11], [2500, 9]]));
    const totalTouchdowns = sumWhenAll([passingTouchdowns, rushingTouchdowns]);
    set("scoring-creation", totalTouchdowns == null ? null : scoreBand(totalTouchdowns, [[65, 10], [55, 9], [45, 8], [35, 7], [30, 6], [25, 5], [20, 4]]));
  }

  if (poolId === "RB") {
    const rushingYards = use("cfb-best-season-rushing-yards");
    const rushingTouchdowns = use("cfb-best-season-rushing-touchdowns");
    const receivingYards = use("cfb-best-season-receiving-yards");
    const receivingTouchdowns = use("cfb-best-season-receiving-touchdowns");
    set("rushing-dominance", rushingYards == null ? null : scoreBand(rushingYards, [[2600, 25], [2300, 24], [2100, 23], [1900, 21], [1700, 19], [1500, 17], [1300, 14], [1100, 11], [900, 8]]));
    if (rushingYards != null && receivingYards != null) {
      set("total-scrimmage-dominance", scoreBand(rushingYards + receivingYards, [[2600, 10], [2300, 9], [2000, 8], [1800, 7], [1600, 6], [1400, 5], [1200, 4]]));
    }
    if (rushingTouchdowns != null && receivingTouchdowns != null) {
      set("scoring-dominance", scoreBand(rushingTouchdowns + receivingTouchdowns, [[30, 5], [24, 4.5], [20, 4], [16, 3], [12, 2]]));
    }
  }

  if (poolId === "WR" || poolId === "TE") {
    const receptions = use("cfb-best-season-receptions");
    const receivingYards = use("cfb-best-season-receiving-yards");
    const receivingTouchdowns = use("cfb-best-season-receiving-touchdowns");
    if (poolId === "WR") {
      set("receiving-dominance", receivingYards == null ? null : scoreBand(receivingYards, [[2000, 30], [1800, 29], [1600, 27], [1400, 24], [1200, 21], [1000, 17], [800, 13], [600, 9]]));
      if (receptions != null && receptions > 0 && receivingYards != null) {
        set("efficiency-explosiveness", scoreBand(receivingYards / receptions, [[22, 15], [20, 14], [18, 12], [16, 10], [14, 8], [12, 6]]));
      }
      set("scoring-dominance", receivingTouchdowns == null ? null : scoreBand(receivingTouchdowns, [[22, 10], [18, 9], [15, 8], [12, 7], [9, 5], [6, 3]]));
    } else {
      set("receiving-production", receivingYards == null ? null : scoreBand(receivingYards, [[1400, 20], [1200, 18], [1000, 16], [850, 14], [700, 11], [550, 8], [400, 5]]));
      if (receptions != null && receptions > 0 && receivingYards != null) {
        set("efficiency-explosiveness", scoreBand(receivingYards / receptions, [[20, 10], [18, 9], [16, 8], [14, 7], [12, 5], [10, 3]]));
      }
      set("scoring-dominance", receivingTouchdowns == null ? null : scoreBand(receivingTouchdowns, [[16, 10], [13, 9], [10, 8], [8, 6], [6, 4], [4, 2]]));
    }
  }

  if (poolId === "DL / EDGE" || poolId === "LB") {
    const sacks = use("cfb-best-season-sacks");
    const tacklesForLoss = use("cfb-best-season-tackles-for-loss");
    if (sacks != null && tacklesForLoss != null) {
      const maxPoints = poolId === "DL / EDGE" ? 25 : 15;
      const sackPoints = scoreBand(sacks, [[18, maxPoints], [15, maxPoints * 0.9], [12, maxPoints * 0.8], [10, maxPoints * 0.7], [8, maxPoints * 0.55], [5, maxPoints * 0.35]]);
      const tflPoints = scoreBand(tacklesForLoss, [[30, maxPoints], [26, maxPoints * 0.9], [22, maxPoints * 0.8], [18, maxPoints * 0.7], [14, maxPoints * 0.55], [10, maxPoints * 0.35]]);
      set("backfield-disruption", Math.round(((sackPoints + tflPoints) / 2) * 1000) / 1000);
    }
    if (poolId === "LB") {
      const interceptions = use("cfb-best-season-defensive-interceptions");
      set("coverage-turnover-impact", interceptions == null ? null : scoreBand(interceptions, [[8, 15], [6, 13], [5, 11], [4, 9], [3, 7], [2, 5], [1, 3]]));
    }
  }

  if (poolId === "Secondary") {
    const interceptions = use("cfb-best-season-defensive-interceptions");
    set("ball-disruption-takeaways", interceptions == null ? null : scoreBand(interceptions, [[10, 15], [8, 14], [7, 13], [6, 12], [5, 10], [4, 8], [3, 6], [2, 4], [1, 2]]));
  }

  return { evidence, consumed, backed };
}

/**
 * Draft position is the lone NFL datum allowed by the locked CFB framework, and only as OL college-player
 * corroboration. A first-round pick after No. 10 remains unresolved because draft order alone does not establish
 * whether he was the first offensive lineman selected.
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

/**
 * Translate only facts that directly support a locked Peak component. Career accumulation is deliberately not used
 * as a Peak substitute, and recognizability never supplies greatness points. Components that require awards,
 * repeat-season proof, big-stage context, coverage suppression, blocking evaluation, era context, or specialist
 * detail stay missing until those facts are present in the canonical factual owner.
 */
export function buildFootballCfbCareerGreatnessEvidence(
  subject: FootballSubjectProfile,
  poolId: FootballCfbCareerGreatnessPoolId,
  factualRecord: FootballFactualRecord | null,
): FootballCfbCareerGreatnessEvidenceBuild {
  const model = footballCfbCareerGreatnessModels[poolId];
  const facts = factMap(factualRecord);
  const support = evidenceRecord(model.supportComponents);

  if (poolId === "K / P") {
    const specialistRole = subject.position === "K" ? "K" : "P";
    return {
      input: {
        poolId,
        peak: {},
        support,
        specialistRole,
        ...(specialistRole === "K"
          ? { kickerPeak: evidenceRecord(footballCfbKickerPeakComponents) }
          : { punterPeak: evidenceRecord(footballCfbPunterPeakComponents) }),
      },
      consumedFactMetricIds: [],
      factBackedComponentIds: [],
    };
  }

  const peakComponents = poolId === "OL"
    ? model.peakComponents.filter((component) => component.id !== "nfl-draft-evaluation")
    : model.peakComponents;
  const peak = peakEvidenceFromFacts(poolId, peakComponents, facts);
  const olDraftEvaluation = poolId === "OL" ? olDraftEvaluationForSubject(subject) : null;

  return {
    input: {
      poolId,
      peak: peak.evidence,
      support,
      ...(poolId === "QB" ? { qbNationalTitleAsPrimary: { status: "missing" as const } } : {}),
      ...(olDraftEvaluation ? { olDraftEvaluation } : {}),
    },
    consumedFactMetricIds: [...peak.consumed],
    factBackedComponentIds: [
      ...peak.backed,
      ...(olDraftEvaluation?.status === "known" ? ["nfl-draft-evaluation"] : []),
    ],
  };
}
