import { getFootballFactualRecord, type FootballFactMetricId } from "./footballFactualStatsCore";

export interface FootballFactRequirementGroup {
  /** A game may accept any one metric in a requirement group. */
  anyOf: readonly FootballFactMetricId[];
}

/**
 * Numerical game eligibility is derived from the canonical factual ledger at query time.
 * Recognition membership stays independent: this helper never owns a roster and never demotes a subject.
 */
export function footballSubjectMeetsFactRequirements(
  subjectId: string,
  requirements: readonly FootballFactRequirementGroup[],
) {
  if (!requirements.length) return true;
  const metricIds = new Set((getFootballFactualRecord(subjectId)?.facts ?? []).map((fact) => fact.metricId));
  return requirements.every((requirement) => requirement.anyOf.some((metricId) => metricIds.has(metricId)));
}
