import {
  getFootballFact,
  type FootballFactMetricId,
} from "./footballFactualStatsCore";
import {
  FOOTBALL_RANKING_FRAMEWORK_VERSION,
  rateFootballRankingEvidence,
  scoreFootballAnchoredValue,
  type FootballRankingDimension,
  type FootballRankingSemantic,
} from "./footballRankingFramework";
import {
  queryFootballSubjects,
  resolveFootballSubjectReference,
  type FootballSubjectProfile,
  type FootballSubjectQuery,
} from "./footballSubjectRegistry";
import {
  getFootballRankFivePack,
  type FootballRankFiveItem,
  type FootballRankFivePackId,
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
  rankingVersion: typeof FOOTBALL_RANKING_FRAMEWORK_VERSION;
  rankingSemantic: FootballRankingSemantic;
  rankingCoverage: number;
  rankingConfidence: number;
  rankingStatus: "rated" | "low-confidence";
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

const rankingSemanticByPack: Readonly<Record<FootballRankFivePackId, FootballRankingSemantic>> = {
  "nfl-quarterbacks": "career-greatness",
  "nfl-running-backs": "career-greatness",
  "nfl-wide-receivers": "career-greatness",
  "nfl-tight-ends": "career-greatness",
  "nfl-defensive-players": "career-greatness",
  "nfl-head-coaches": "coach-greatness",
  "nfl-qb-seasons": "single-season-greatness",
  "nfl-team-seasons": "team-season-greatness",
  "college-quarterbacks": "career-greatness",
  "college-head-coaches": "coach-greatness",
  "college-programs": "program-franchise-greatness",
  "college-program-eras": "bounded-era-greatness",
  "college-team-seasons": "team-season-greatness",
};

const rankingDimensionByMetric: Readonly<Partial<Record<FootballFactMetricId, FootballRankingDimension>>> = {
  "nfl-career-passing-yards": "sustained-excellence",
  "nfl-career-passing-touchdowns": "sustained-excellence",
  "nfl-career-passer-rating": "peak",
  "nfl-career-passing-yards-per-attempt": "contextual-strength",
  "nfl-career-completion-percentage": "contextual-strength",
  "nfl-career-passing-touchdown-interception-ratio": "peak",
  "nfl-career-games": "longevity-tail",
  "nfl-career-rushing-yards": "sustained-excellence",
  "nfl-career-scrimmage-yards": "sustained-excellence",
  "nfl-career-rushing-touchdowns": "peak",
  "nfl-career-scrimmage-touchdowns": "peak",
  "nfl-career-rushing-yards-per-attempt": "contextual-strength",
  "nfl-career-rushing-yards-per-game": "peak",
  "nfl-career-receiving-yards-per-game": "contextual-strength",
  "nfl-career-receiving-yards": "sustained-excellence",
  "nfl-career-receiving-touchdowns": "peak",
  "nfl-career-receptions": "longevity-tail",
  "nfl-career-sacks": "sustained-excellence",
  "nfl-career-interceptions": "peak",
  "nfl-defensive-player-of-year-awards": "honors",
  "nfl-first-team-all-pros": "honors",
  "nfl-season-passing-yards": "peak",
  "nfl-season-passing-touchdowns": "peak",
  "nfl-season-passer-rating": "peak",
  "nfl-season-interceptions": "contextual-strength",
  "nfl-team-overall-wins": "sustained-excellence",
  "nfl-team-overall-losses": "contextual-strength",
  "nfl-team-points-per-game": "peak",
  "nfl-team-opponent-points-per-game": "contextual-strength",
  "nfl-super-bowl-title": "postseason-team-accomplishment",
  "cfb-best-season-passing-yards": "peak",
  "cfb-best-season-passing-touchdowns": "peak",
  "cfb-best-season-passer-rating": "peak",
  "cfb-best-season-interceptions": "contextual-strength",
  "cfb-heisman-awards": "honors",
  "cfb-coach-career-wins": "sustained-excellence",
  "cfb-coach-career-losses": "contextual-strength",
  "cfb-coach-national-titles": "postseason-team-accomplishment",
  "cfb-coach-conference-titles": "honors",
  "cfb-program-wins-since-2000": "sustained-excellence",
  "cfb-program-losses-since-2000": "contextual-strength",
  "cfb-program-national-titles-since-2000": "postseason-team-accomplishment",
  "cfb-program-conference-titles-since-2000": "honors",
  "cfb-program-cfp-appearances": "postseason-team-accomplishment",
  "cfb-program-title-game-appearances-since-2000": "postseason-team-accomplishment",
  "cfb-era-wins": "sustained-excellence",
  "cfb-era-losses": "contextual-strength",
  "cfb-era-national-titles": "postseason-team-accomplishment",
  "cfb-era-conference-titles": "honors",
  "cfb-era-cfp-appearances": "postseason-team-accomplishment",
  "cfb-era-title-game-appearances": "postseason-team-accomplishment",
  "cfb-team-wins": "sustained-excellence",
  "cfb-team-losses": "contextual-strength",
  "cfb-team-points-per-game": "peak",
  "cfb-team-opponent-points-per-game": "contextual-strength",
  "cfb-national-title": "postseason-team-accomplishment",
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

function fixedCalibrationValues(packId: FootballRankFivePackId, spec: FootballComparisonCategorySpec) {
  const calibration = reviewedByCanonicalId(packId, getFootballRankFivePack(packId).items);
  const values = new Map<FootballFactMetricId, number[]>();
  for (const metric of spec.metrics) values.set(metric.metricId, []);
  for (const subjectId of calibration.keys()) {
    for (const fact of factsForSubject(subjectId, spec.metrics)) {
      values.get(fact.metric.metricId)?.push(fact.value);
    }
  }
  return values;
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
 * Data-derived ratings are anchored to the versioned reviewed calibration set, never to the current candidate pool.
 */
export function buildFootballComparisonCandidatePool(
  packId: FootballRankFivePackId,
  reviewedItems: readonly FootballRankFiveItem[] = [],
): readonly FootballComparisonCandidate[] {
  const spec = footballComparisonCategorySpecs[packId];
  const semantic = rankingSemanticByPack[packId];
  const subjects = queryFootballSubjects(spec.query);
  const reviewed = reviewedByCanonicalId(packId, reviewedItems);
  const calibrationValues = fixedCalibrationValues(packId, spec);
  const raw = subjects.map((subject) => ({
    subject,
    reviewed: reviewed.get(subject.id),
    facts: factsForSubject(subject.id, spec.metrics),
  })).filter((candidate) => candidate.reviewed || candidate.facts.length >= spec.minimumFacts);

  return raw.map(({ subject, reviewed: reviewedItem, facts }) => {
    if (reviewedItem) {
      return {
        ...reviewedItem,
        canonicalSubjectId: subject.id,
        evaluationSource: "reviewed" as const,
        recognizabilityTier: subject.recognizabilityTier,
        factMetricIds: facts.map((row) => row.metric.metricId),
        rankingVersion: FOOTBALL_RANKING_FRAMEWORK_VERSION,
        rankingSemantic: semantic,
        rankingCoverage: 1,
        rankingConfidence: 1,
        rankingStatus: "rated" as const,
      };
    }

    const evidence = facts.flatMap((row) => {
      const dimension = rankingDimensionByMetric[row.metric.metricId];
      if (!dimension) return [];
      return [{
        dimension,
        score: scoreFootballAnchoredValue(
          row.value,
          calibrationValues.get(row.metric.metricId) ?? [],
          row.metric.direction ?? "higher",
        ),
      }];
    });
    const ranking = rateFootballRankingEvidence(semantic, evidence);

    return {
      id: subject.id,
      name: subject.name,
      subtitle: subtitleForSubject(subject),
      league: subject.league,
      rating: ranking.rating,
      ratingBasis: `${FOOTBALL_RANKING_FRAMEWORK_VERSION} ${semantic} from ${facts.length} canonical metric${facts.length === 1 ? "" : "s"}; ${Math.round(ranking.coverage * 100)}% dimension coverage, ${Math.round(ranking.confidence * 100)}% confidence.`,
      canonicalSubjectId: subject.id,
      evaluationSource: "canonical-facts" as const,
      recognizabilityTier: subject.recognizabilityTier,
      factMetricIds: facts.map((row) => row.metric.metricId),
      rankingVersion: ranking.version,
      rankingSemantic: ranking.semantic,
      rankingCoverage: ranking.coverage,
      rankingConfidence: ranking.confidence,
      rankingStatus: ranking.status,
    };
  });
}
