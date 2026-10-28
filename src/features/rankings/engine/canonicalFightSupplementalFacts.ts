import type { CanonicalFight, UfcBonusType } from "./schemas";

export type CanonicalFightSupplementalMetric =
  | "main-event"
  | "bonuses"
  | "finish-details"
  | "knockdowns";

export interface CanonicalFightSupplementalCoverage {
  totalFights: number;
  auditedFights: number;
  known: Record<CanonicalFightSupplementalMetric, number>;
}

/**
 * A metric is known only when the canonical ledger explicitly says so.
 * Consumers must never turn an absent or `unavailable` supplemental fact into
 * a zero. `not-applicable` finish details are known because the audit has
 * explicitly established that there was no finish to time.
 */
export function canonicalFightSupplementalMetricIsKnown(
  fight: CanonicalFight,
  metric: CanonicalFightSupplementalMetric,
) {
  const facts = fight.supplementalFacts;
  if (!facts) return false;

  switch (metric) {
    case "main-event":
      return facts.mainEvent.status === "verified";
    case "bonuses":
      return facts.bonuses.status === "verified";
    case "finish-details":
      return facts.finish.status === "verified" || facts.finish.status === "not-applicable";
    case "knockdowns":
      return facts.knockdowns.status === "verified";
  }
}

export function canonicalFightSupplementalCoverage(
  fights: readonly CanonicalFight[],
): CanonicalFightSupplementalCoverage {
  const metrics: readonly CanonicalFightSupplementalMetric[] = [
    "main-event",
    "bonuses",
    "finish-details",
    "knockdowns",
  ];
  const known = Object.fromEntries(metrics.map((metric) => [metric, 0])) as Record<
    CanonicalFightSupplementalMetric,
    number
  >;

  for (const fight of fights) {
    for (const metric of metrics) {
      if (canonicalFightSupplementalMetricIsKnown(fight, metric)) known[metric] += 1;
    }
  }

  return {
    totalFights: fights.length,
    auditedFights: fights.filter((fight) => fight.supplementalFacts != null).length,
    known,
  };
}

export function canonicalFightSupplementalMetricIsComplete(
  fights: readonly CanonicalFight[],
  metric: CanonicalFightSupplementalMetric,
) {
  if (fights.length === 0) return false;
  return canonicalFightSupplementalCoverage(fights).known[metric] === fights.length;
}

export function verifiedUfcMainEvent(fight: CanonicalFight): boolean | null {
  return fight.supplementalFacts?.mainEvent.status === "verified"
    ? fight.supplementalFacts.mainEvent.value
    : null;
}

export function verifiedUfcBonuses(fight: CanonicalFight): readonly UfcBonusType[] | null {
  return fight.supplementalFacts?.bonuses.status === "verified"
    ? fight.supplementalFacts.bonuses.values
    : null;
}

export function verifiedUfcFinishDetails(
  fight: CanonicalFight,
): { round: number; timeSeconds: number } | null {
  return fight.supplementalFacts?.finish.status === "verified"
    ? {
        round: fight.supplementalFacts.finish.round,
        timeSeconds: fight.supplementalFacts.finish.timeSeconds,
      }
    : null;
}

export function verifiedUfcKnockdowns(
  fight: CanonicalFight,
): { for: number; against: number } | null {
  return fight.supplementalFacts?.knockdowns.status === "verified"
    ? {
        for: fight.supplementalFacts.knockdowns.for,
        against: fight.supplementalFacts.knockdowns.against,
      }
    : null;
}
