import {
  getFootballFact,
  type FootballFactMetricId,
} from "./footballFactualStatsCore";
import {
  queryFootballSubjects,
  resolveFootballSubjectReference,
  type FootballSubjectProfile,
  type FootballSubjectQuery,
} from "./footballSubjectRegistry";
import type {
  FootballRankFiveItem,
  FootballRankFivePackId,
} from "./footballRankFiveModel";

const CASUAL_TIERS = ["A", "B", "C"] as const;

type ComparisonDirection = "higher" | "lower";

interface FootballComparisonMetricSpec {
  metricId: FootballFactMetricId;
  weight: number;
  direction?: ComparisonDirection;
}

interface FootballComparisonCategorySpec {
  query: FootballSubjectQuery;
  metrics: readonly FootballComparisonMetricSpec[];
  minimumFacts: number;
}

export interface FootballComparisonCandidate extends FootballRankFiveItem {
  canonicalSubjectId: string;
  evaluationSource: "reviewed" | "canonical-facts";
  recognizabilityTier: FootballSubjectProfile["recognizabilityTier"];
  factMetricIds: readonly FootballFactMetricId[];
}

const category = (
  query: FootballSubjectQuery,
  metrics: readonly FootballComparisonMetricSpec[],
  minimumFacts: number,
): FootballComparisonCategorySpec => ({
  query: {
    ...query,
    recognizabilityTiers: CASUAL_TIERS,
    casualEligible: true,
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  },
  metrics,
  minimumFacts,
});

const higher = (metricId: FootballFactMetricId, weight: number): FootballComparisonMetricSpec => ({ metricId, weight });
const lower = (metricId: FootballFactMetricId, weight: number): FootballComparisonMetricSpec => ({ metricId, weight, direction: "lower" });

/**
 * Shared category contract for Football comparison games. Membership starts from this canonical query.
 * Legacy rating catalogs may calibrate matching identities, but are never used as the candidate source.
 */
export const footballComparisonCategorySpecs: Readonly<Record<FootballRankFivePackId, FootballComparisonCategorySpec>> = {
  "nfl-quarterbacks": category(
    { kind: "player-career", league: "NFL", position: "QB" },
    [
      higher("nfl-career-passing-yards", 0.18),
      higher("nfl-career-passing-touchdowns", 0.18),
      higher("nfl-career-passer-rating", 0.17),
      higher("nfl-career-passing-yards-per-attempt", 0.12),
      higher("nfl-career-completion-percentage", 0.10),
      higher("nfl-career-passing-touchdown-interception-ratio", 0.15),
      higher("nfl-career-games", 0.10),
    ],
    3,
  ),
  "nfl-running-backs": category(
    { kind: "player-career", league: "NFL", position: "RB" },
    [
      higher("nfl-career-rushing-yards", 0.25),
      higher("nfl-career-scrimmage-yards", 0.20),
      higher("nfl-career-rushing-touchdowns", 0.15),
      higher("nfl-career-scrimmage-touchdowns", 0.15),
      higher("nfl-career-rushing-yards-per-attempt", 0.10),
      higher("nfl-career-rushing-yards-per-game", 0.10),
      higher("nfl-career-receiving-yards-per-game", 0.05),
    ],
    3,
  ),
  "nfl-wide-receivers": category(
    { kind: "player-career", league: "NFL", position: "WR" },
    [
      higher("nfl-career-receiving-yards", 0.50),
      higher("nfl-career-receiving-touchdowns", 0.30),
      higher("nfl-career-receptions", 0.20),
    ],
    2,
  ),
  "nfl-tight-ends": category(
    { kind: "player-career", league: "NFL", position: "TE" },
    [
      higher("nfl-career-receiving-yards", 0.50),
      higher("nfl-career-receiving-touchdowns", 0.30),
      higher("nfl-career-receptions", 0.20),
    ],
    2,
  ),
  "nfl-defensive-players": category(
    { kind: "player-career", league: "NFL", positions: ["DL", "LB", "DB"] },
    [
      higher("nfl-career-sacks", 0.45),
      higher("nfl-career-interceptions", 0.35),
      higher("nfl-defensive-player-of-year-awards", 0.12),
      higher("nfl-first-team-all-pros", 0.08),
    ],
    1,
  ),
  // NFL coach relationship facts are the remaining PR9 factual-readiness lane. Reviewed rows remain eligible,
  // but a new coach cannot become playable merely from recognizability without objective evaluation inputs.
  "nfl-head-coaches": category(
    { kind: "coach", league: "NFL" },
    [],
    1,
  ),
  "nfl-qb-seasons": category(
    { kind: "player-season", league: "NFL", position: "QB" },
    [
      higher("nfl-season-passing-yards", 0.25),
      higher("nfl-season-passing-touchdowns", 0.30),
      higher("nfl-season-passer-rating", 0.30),
      lower("nfl-season-interceptions", 0.15),
    ],
    3,
  ),
  "nfl-team-seasons": category(
    { kind: "team-season", league: "NFL" },
    [
      higher("nfl-team-overall-wins", 0.30),
      lower("nfl-team-overall-losses", 0.10),
      higher("nfl-team-points-per-game", 0.20),
      lower("nfl-team-opponent-points-per-game", 0.20),
      higher("nfl-super-bowl-title", 0.20),
    ],
    2,
  ),
  "college-quarterbacks": category(
    { kind: "player-career", league: "CFB", position: "QB" },
    [
      higher("cfb-best-season-passing-yards", 0.25),
      higher("cfb-best-season-passing-touchdowns", 0.25),
      higher("cfb-best-season-passer-rating", 0.25),
      lower("cfb-best-season-interceptions", 0.10),
      higher("cfb-heisman-awards", 0.15),
    ],
    2,
  ),
  "college-head-coaches": category(
    { kind: "coach", league: "CFB" },
    [
      higher("cfb-coach-career-wins", 0.35),
      lower("cfb-coach-career-losses", 0.10),
      higher("cfb-coach-national-titles", 0.35),
      higher("cfb-coach-conference-titles", 0.20),
    ],
    2,
  ),
  "college-programs": category(
    { kind: "program", league: "CFB" },
    [
      higher("cfb-program-wins-since-2000", 0.30),
      lower("cfb-program-losses-since-2000", 0.10),
      higher("cfb-program-national-titles-since-2000", 0.30),
      higher("cfb-program-conference-titles-since-2000", 0.15),
      higher("cfb-program-cfp-appearances", 0.10),
      higher("cfb-program-title-game-appearances-since-2000", 0.05),
    ],
    2,
  ),
  "college-program-eras": category(
    { kind: "program-era", league: "CFB" },
    [
      higher("cfb-era-wins", 0.25),
      lower("cfb-era-losses", 0.10),
      higher("cfb-era-national-titles", 0.35),
      higher("cfb-era-conference-titles", 0.15),
      higher("cfb-era-cfp-appearances", 0.10),
      higher("cfb-era-title-game-appearances", 0.05),
    ],
    2,
  ),
  "college-team-seasons": category(
    { kind: "team-season", league: "CFB" },
    [
      higher("cfb-team-wins", 0.25),
      lower("cfb-team-losses", 0.10),
      higher("cfb-team-points-per-game", 0.20),
      lower("cfb-team-opponent-points-per-game", 0.20),
      higher("cfb-national-title", 0.25),
    ],
    2,
  ),
};

export function footballComparisonEligibilityQuery(packId: FootballRankFivePackId): FootballSubjectQuery {
  return footballComparisonCategorySpecs[packId].query;
}

function reviewedByCanonicalId(
  packId: FootballRankFivePackId,
  reviewedItems: readonly FootballRankFiveItem[],
) {
  const query = footballComparisonEligibilityQuery(packId);
  const values = new Map<string, FootballRankFiveItem>();
  for (const item of reviewedItems) {
    const subject = resolveFootballSubjectReference(item.id, item.name, query);
    if (subject && !values.has(subject.id)) values.set(subject.id, item);
  }
  return values;
}

function factsForSubject(subjectId: string, metrics: readonly FootballComparisonMetricSpec[]) {
  return metrics.flatMap((metric) => {
    const result = getFootballFact(subjectId, metric.metricId);
    return result ? [{ metric, value: result.fact.value }] : [];
  });
}

function percentile(value: number, values: readonly number[], direction: ComparisonDirection) {
  if (values.length <= 1) return 0.5;
  const below = values.filter((candidate) => candidate < value).length;
  const equal = values.filter((candidate) => candidate === value).length;
  const rank = (below + Math.max(0, equal - 1) / 2) / (values.length - 1);
  return direction === "lower" ? 1 - rank : rank;
}

function subtitleForSubject(subject: FootballSubjectProfile) {
  if (subject.kind === "player-career") {
    const seasons = subject.startSeason != null && subject.endSeason != null
      ? `${subject.startSeason}–${subject.endSeason}`
      : null;
    return [subject.position, subject.school, seasons].filter(Boolean).join(" · ") || subject.league;
  }
  if (subject.kind === "player-season") return [subject.position, subject.season].filter(Boolean).join(" · ") || subject.league;
  if (subject.kind === "coach") return subject.school ? `${subject.school} · Head coach` : `${subject.league} head coach`;
  if (subject.kind === "program-era") return [subject.school, subject.startSeason && subject.endSeason ? `${subject.startSeason}–${subject.endSeason}` : null].filter(Boolean).join(" · ") || "Program era";
  if (subject.kind === "team-season") return subject.season ? `${subject.league} · ${subject.season}` : `${subject.league} team season`;
  return subject.school ?? `${subject.league} program`;
}

/**
 * Builds an evaluated comparison pool from the deep canonical query result.
 * Reviewed rows calibrate matching subjects only; subjects absent from that list remain eligible when canonical facts suffice.
 */
export function buildFootballComparisonCandidatePool(
  packId: FootballRankFivePackId,
  reviewedItems: readonly FootballRankFiveItem[] = [],
): readonly FootballComparisonCandidate[] {
  const spec = footballComparisonCategorySpecs[packId];
  const subjects = queryFootballSubjects(spec.query);
  const reviewed = reviewedByCanonicalId(packId, reviewedItems);
  const raw = subjects.map((subject) => ({
    subject,
    reviewed: reviewed.get(subject.id),
    facts: factsForSubject(subject.id, spec.metrics),
  })).filter((candidate) => candidate.reviewed || candidate.facts.length >= spec.minimumFacts);

  const metricValues = new Map<FootballFactMetricId, number[]>();
  for (const metric of spec.metrics) {
    metricValues.set(metric.metricId, raw.flatMap((candidate) => {
      const fact = candidate.facts.find((row) => row.metric.metricId === metric.metricId);
      return fact ? [fact.value] : [];
    }));
  }

  return raw.map(({ subject, reviewed: reviewedItem, facts }) => {
    if (reviewedItem) {
      return {
        ...reviewedItem,
        canonicalSubjectId: subject.id,
        evaluationSource: "reviewed" as const,
        recognizabilityTier: subject.recognizabilityTier,
        factMetricIds: facts.map((row) => row.metric.metricId),
      };
    }

    const weighted = facts.reduce((total, row) => {
      const values = metricValues.get(row.metric.metricId) ?? [];
      const score = percentile(row.value, values, row.metric.direction ?? "higher");
      return total + score * row.metric.weight;
    }, 0);
    const availableWeight = facts.reduce((total, row) => total + row.metric.weight, 0);
    const normalized = availableWeight > 0 ? weighted / availableWeight : 0.5;
    const rating = Math.max(35, Math.min(96, Math.round(45 + normalized * 51)));

    return {
      id: subject.id,
      name: subject.name,
      subtitle: subtitleForSubject(subject),
      league: subject.league,
      rating,
      ratingBasis: `Canonical data-derived comparison across ${facts.length} qualified metric${facts.length === 1 ? "" : "s"}.`,
      canonicalSubjectId: subject.id,
      evaluationSource: "canonical-facts" as const,
      recognizabilityTier: subject.recognizabilityTier,
      factMetricIds: facts.map((row) => row.metric.metricId),
    };
  });
}
