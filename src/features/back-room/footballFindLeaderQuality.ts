import type { FootballFactUnit } from "./footballFactualStatsCore";

export type FootballFindLeaderQualityReason =
  | "binary-flag"
  | "too-few-candidates"
  | "non-finite-value"
  | "too-few-distinct-values"
  | "tied-leader"
  | "no-spread"
  | "trivial-leader";

export interface FootballFindLeaderQualityInput {
  unit: FootballFactUnit;
  values: readonly number[];
  minCandidates?: number;
}

export interface FootballFindLeaderQualityResult {
  eligible: boolean;
  reasons: readonly FootballFindLeaderQualityReason[];
  candidateCount: number;
  distinctValueCount: number;
  topTieCount: number;
}

/**
 * Canonical eligibility gate for factual Find the Leader stats.
 * It deliberately judges only the numerical question shape; PR3/game wiring decides which eligible metrics to expose.
 */
export function evaluateFootballFindLeaderQuality({
  unit,
  values,
  minCandidates = 8,
}: FootballFindLeaderQualityInput): FootballFindLeaderQualityResult {
  const reasons: FootballFindLeaderQualityReason[] = [];
  const finiteValues = values.filter(Number.isFinite);

  if (unit === "flag") reasons.push("binary-flag");
  if (values.length < minCandidates) reasons.push("too-few-candidates");
  if (finiteValues.length !== values.length) reasons.push("non-finite-value");

  const distinctValueCount = new Set(finiteValues).size;
  if (finiteValues.length > 0 && distinctValueCount < 4) reasons.push("too-few-distinct-values");

  const sorted = [...finiteValues].sort((left, right) => right - left);
  const leader = sorted[0];
  const runnerUp = sorted[1];
  const minimum = sorted.at(-1);
  const topTieCount = leader == null ? 0 : sorted.filter((value) => value === leader).length;

  if (topTieCount > 1) reasons.push("tied-leader");

  if (leader != null && minimum != null) {
    const spread = leader - minimum;
    if (spread <= 0) {
      reasons.push("no-spread");
    } else if (runnerUp != null && (leader - runnerUp) / spread > 0.65) {
      reasons.push("trivial-leader");
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    candidateCount: values.length,
    distinctValueCount,
    topTieCount,
  };
}
