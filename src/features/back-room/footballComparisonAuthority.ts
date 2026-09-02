import {
  getFootballFact,
  type FootballFactMetricId,
} from "./footballFactualStatsCore";
import {
  FOOTBALL_RANKING_FRAMEWORK_VERSION,
  rateFootballRankingEvidence,
  scoreFootballAnchoredValue,
  type FootballRankingDimension,
  type FootballRankingScoreSignal,
  type FootballRankingSemantic,
} from "./footballRankingFramework";
import {
  queryFootballSubjects,
  resolveFootballSubjectReference,
  type FootballSubjectPosition,
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

interface FootballFixedCalibrationValues {
  overall: ReadonlyMap<FootballFactMetricId, readonly number[]>;
  byPosition: ReadonlyMap<string, ReadonlyMap<FootballFactMetricId, readonly number[]>>;
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

const nflOffensiveLineSpec = category(
  { kind: "player-career", league: "NFL", position: "OL" },
  [
    higher("nfl-career-games", 0.25),
    higher("nfl-first-team-all-pros", 0.55),
    higher("nfl-super-bowl-titles", 0.20),
  ],
  1,
);

const nflDefensiveLineEdgeSpec = category(
  { kind: "player-career", league: "NFL", position: "DL" },
  [
    higher("nfl-career-sacks", 0.22),
    higher("nfl-career-tackles-for-loss", 0.12),
    higher("nfl-career-forced-fumbles", 0.08),
    higher("nfl-career-games", 0.13),
    higher("nfl-defensive-player-of-year-awards", 0.18),
    higher("nfl-first-team-all-pros", 0.17),
    higher("nfl-super-bowl-titles", 0.10),
  ],
  1,
);

const nflLinebackerSpec = category(
  { kind: "player-career", league: "NFL", position: "LB" },
  [
    higher("nfl-career-solo-tackles", 0.18),
    higher("nfl-career-sacks", 0.10),
    higher("nfl-career-interceptions", 0.08),
    higher("nfl-career-forced-fumbles", 0.08),
    higher("nfl-career-games", 0.13),
    higher("nfl-defensive-player-of-year-awards", 0.16),
    higher("nfl-first-team-all-pros", 0.17),
    higher("nfl-super-bowl-titles", 0.10),
  ],
  1,
);

const nflSecondarySpec = category(
  { kind: "player-career", league: "NFL", position: "DB" },
  [
    higher("nfl-career-interceptions", 0.18),
    higher("nfl-career-passes-defended", 0.12),
    higher("nfl-career-solo-tackles", 0.08),
    higher("nfl-career-games", 0.13),
    higher("nfl-defensive-player-of-year-awards", 0.14),
    higher("nfl-first-team-all-pros", 0.23),
    higher("nfl-super-bowl-titles", 0.12),
  ],
  1,
);

const nflKickerSpec = category(
  { kind: "player-career", league: "NFL", position: "K" },
  [
    higher("nfl-career-field-goals-made", 0.24),
    higher("nfl-career-field-goal-percentage", 0.26),
    higher("nfl-career-games", 0.15),
    higher("nfl-first-team-all-pros", 0.22),
    higher("nfl-super-bowl-titles", 0.13),
  ],
  1,
);

const nflPunterSpec = category(
  { kind: "player-career", league: "NFL", position: "P" },
  [
    higher("nfl-career-punts", 0.25),
    higher("nfl-career-punting-average", 0.28),
    higher("nfl-career-games", 0.15),
    higher("nfl-first-team-all-pros", 0.22),
    higher("nfl-super-bowl-titles", 0.10),
  ],
  1,
);

export type FootballNflCareerRankingFamilyId = "OL" | "DL / EDGE" | "LB" | "Secondary" | "K / P";

export interface FootballNflCareerRankingFamilyModel {
  positions: readonly FootballSubjectPosition[];
  positionSpecs: Readonly<Partial<Record<FootballSubjectPosition, FootballComparisonCategorySpec>>>;
  calibrationPackId?: FootballRankFivePackId;
  calibrationSubjectIdsByPosition?: Readonly<Partial<Record<FootballSubjectPosition, readonly string[]>>>;
}

/**
 * Stage 15 NFL career models that are not represented by a dedicated Rank Five pack.
 * Defense intentionally keeps DL/EDGE, LB and Secondary as separate position-family models before the existing
 * cross-position defensive game consumes their common 35-99 output scale. K/P shares one family surface while
 * keeping distinct kicking and punting score profiles because their factual production is not interchangeable.
 */
export const footballNflCareerRankingFamilyModels: Readonly<Record<FootballNflCareerRankingFamilyId, FootballNflCareerRankingFamilyModel>> = {
  OL: {
    positions: ["OL"],
    positionSpecs: { OL: nflOffensiveLineSpec },
    calibrationSubjectIdsByPosition: {
      OL: ["nfl-anthony-munoz", "nfl-larry-allen", "nfl-john-hannah", "nfl-tony-boselli"],
    },
  },
  "DL / EDGE": {
    positions: ["DL"],
    positionSpecs: { DL: nflDefensiveLineEdgeSpec },
    calibrationPackId: "nfl-defensive-players",
  },
  LB: {
    positions: ["LB"],
    positionSpecs: { LB: nflLinebackerSpec },
    calibrationPackId: "nfl-defensive-players",
  },
  Secondary: {
    positions: ["DB"],
    positionSpecs: { DB: nflSecondarySpec },
    calibrationPackId: "nfl-defensive-players",
  },
  "K / P": {
    positions: ["K", "P"],
    positionSpecs: { K: nflKickerSpec, P: nflPunterSpec },
    calibrationSubjectIdsByPosition: {
      K: ["nfl-jan-stenerud", "nfl-mark-moseley", "nfl-morten-andersen"],
      P: ["nfl-ray-guy", "nfl-pat-mcafee"],
    },
  },
};

const nflCareerFamilyByPosition: Readonly<Partial<Record<FootballSubjectPosition, FootballNflCareerRankingFamilyId>>> = {
  OL: "OL",
  DL: "DL / EDGE",
  LB: "LB",
  DB: "Secondary",
  K: "K / P",
  P: "K / P",
};

/**
 * Shared category contract for Football comparison games. Membership starts from this canonical query.
 * Legacy rating catalogs may calibrate matching identities, but are never used as the candidate source.
 */
export const footballComparisonCategorySpecs: Readonly<Record<FootballRankFivePackId, FootballComparisonCategorySpec>> = {
  "nfl-quarterbacks": category(
    { kind: "player-career", league: "NFL", position: "QB" },
    [
      higher("nfl-career-passing-yards", 0.12),
      higher("nfl-career-passing-touchdowns", 0.12),
      higher("nfl-career-passer-rating", 0.13),
      higher("nfl-career-passing-yards-per-attempt", 0.08),
      higher("nfl-career-completion-percentage", 0.07),
      higher("nfl-career-passing-touchdown-interception-ratio", 0.13),
      higher("nfl-career-games", 0.10),
      higher("nfl-ap-mvp-awards", 0.10),
      higher("nfl-first-team-all-pros", 0.07),
      higher("nfl-super-bowl-titles", 0.08),
    ],
    3,
  ),
  "nfl-running-backs": category(
    { kind: "player-career", league: "NFL", position: "RB" },
    [
      higher("nfl-career-rushing-yards", 0.13),
      higher("nfl-career-scrimmage-yards", 0.12),
      higher("nfl-career-rushing-touchdowns", 0.08),
      higher("nfl-career-scrimmage-touchdowns", 0.08),
      higher("nfl-career-rushing-yards-per-attempt", 0.10),
      higher("nfl-career-rushing-yards-per-game", 0.08),
      higher("nfl-career-receiving-yards-per-game", 0.08),
      higher("nfl-career-games", 0.10),
      higher("nfl-ap-mvp-awards", 0.07),
      higher("nfl-first-team-all-pros", 0.10),
      higher("nfl-super-bowl-titles", 0.06),
    ],
    3,
  ),
  "nfl-wide-receivers": category(
    { kind: "player-career", league: "NFL", position: "WR" },
    [
      higher("nfl-career-receiving-yards", 0.20),
      higher("nfl-career-receiving-touchdowns", 0.15),
      higher("nfl-career-receptions", 0.10),
      higher("nfl-career-receiving-yards-per-game", 0.15),
      higher("nfl-career-games", 0.10),
      higher("nfl-first-team-all-pros", 0.20),
      higher("nfl-super-bowl-titles", 0.10),
    ],
    2,
  ),
  "nfl-tight-ends": category(
    { kind: "player-career", league: "NFL", position: "TE" },
    [
      higher("nfl-career-receiving-yards", 0.19),
      higher("nfl-career-receiving-touchdowns", 0.15),
      higher("nfl-career-receptions", 0.11),
      higher("nfl-career-receiving-yards-per-game", 0.12),
      higher("nfl-career-games", 0.12),
      higher("nfl-first-team-all-pros", 0.21),
      higher("nfl-super-bowl-titles", 0.10),
    ],
    2,
  ),
  "nfl-defensive-players": category(
    { kind: "player-career", league: "NFL", positions: ["DL", "LB", "DB"] },
    [],
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
  "nfl-career-receptions": "sustained-excellence",
  "nfl-career-solo-tackles": "sustained-excellence",
  "nfl-career-tackles-for-loss": "peak",
  "nfl-career-forced-fumbles": "peak",
  "nfl-career-sacks": "sustained-excellence",
  "nfl-career-interceptions": "peak",
  "nfl-career-passes-defended": "contextual-strength",
  "nfl-career-field-goals-made": "sustained-excellence",
  "nfl-career-field-goal-percentage": "contextual-strength",
  "nfl-career-punts": "sustained-excellence",
  "nfl-career-punting-average": "contextual-strength",
  "nfl-ap-mvp-awards": "honors",
  "nfl-super-bowl-titles": "postseason-team-accomplishment",
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

function reviewedByQuery(query: FootballSubjectQuery, reviewedItems: readonly FootballRankFiveItem[]) {
  const values = new Map<string, FootballRankFiveItem>();
  for (const item of reviewedItems) {
    const subject = resolveFootballSubjectReference(item.id, item.name, query);
    if (subject && !values.has(subject.id)) values.set(subject.id, item);
  }
  return values;
}

function reviewedByCanonicalId(packId: FootballRankFivePackId, reviewedItems: readonly FootballRankFiveItem[]) {
  return reviewedByQuery(footballComparisonEligibilityQuery(packId), reviewedItems);
}

function factsForSubject(subjectId: string, metrics: readonly FootballComparisonMetricSpec[]) {
  return metrics.flatMap((metric) => {
    const result = getFootballFact(subjectId, metric.metricId);
    return result ? [{ metric, value: result.fact.value }] : [];
  });
}

function createMetricValueMap(spec: FootballComparisonCategorySpec) {
  const values = new Map<FootballFactMetricId, number[]>();
  for (const metric of spec.metrics) values.set(metric.metricId, []);
  return values;
}

function fixedCalibrationValuesForSubjectIds(
  spec: FootballComparisonCategorySpec,
  calibrationSubjectIds: readonly string[],
): FootballFixedCalibrationValues {
  const subjectById = new Map(queryFootballSubjects(spec.query).map((subject) => [subject.id, subject]));
  const overall = createMetricValueMap(spec);
  const byPosition = new Map<string, Map<FootballFactMetricId, number[]>>();

  for (const subjectId of calibrationSubjectIds) {
    const subject = subjectById.get(subjectId);
    if (!subject) continue;
    const position = subject.position;
    let positionValues: Map<FootballFactMetricId, number[]> | undefined;
    if (position) {
      positionValues = byPosition.get(position);
      if (!positionValues) {
        positionValues = createMetricValueMap(spec);
        byPosition.set(position, positionValues);
      }
    }

    for (const fact of factsForSubject(subjectId, spec.metrics)) {
      overall.get(fact.metric.metricId)?.push(fact.value);
      positionValues?.get(fact.metric.metricId)?.push(fact.value);
    }
  }

  return { overall, byPosition };
}

function fixedCalibrationValues(packId: FootballRankFivePackId, spec: FootballComparisonCategorySpec): FootballFixedCalibrationValues {
  const calibrationSubjectIds = [...reviewedByQuery(spec.query, getFootballRankFivePack(packId).items).keys()];
  return fixedCalibrationValuesForSubjectIds(spec, calibrationSubjectIds);
}

function calibrationAnchorsFor(
  calibration: FootballFixedCalibrationValues,
  subject: FootballSubjectProfile,
  metricId: FootballFactMetricId,
) {
  const positionAnchors = subject.position
    ? calibration.byPosition.get(subject.position)?.get(metricId)
    : undefined;
  return positionAnchors && positionAnchors.length >= 2
    ? positionAnchors
    : (calibration.overall.get(metricId) ?? []);
}

function scoreSignalsForSpec(spec: FootballComparisonCategorySpec): readonly FootballRankingScoreSignal[] {
  return spec.metrics.flatMap((metric) => {
    const dimension = rankingDimensionByMetric[metric.metricId];
    if (!dimension) return [];
    return [{ signalId: metric.metricId, dimension, weight: metric.weight }];
  });
}

function subtitleForSubject(subject: FootballSubjectProfile) {
  if (subject.kind === "player-career") {
    const seasons = subject.startSeason != null && subject.endSeason != null ? `${subject.startSeason}–${subject.endSeason}` : null;
    return [subject.position, subject.school, seasons].filter(Boolean).join(" · ") || subject.league;
  }
  if (subject.kind === "player-season") return [subject.position, subject.season].filter(Boolean).join(" · ") || subject.league;
  if (subject.kind === "coach") return subject.school ? `${subject.school} · Head coach` : `${subject.league} head coach`;
  if (subject.kind === "program-era") return [subject.school, subject.startSeason && subject.endSeason ? `${subject.startSeason}–${subject.endSeason}` : null].filter(Boolean).join(" · ") || "Program era";
  if (subject.kind === "team-season") return subject.season ? `${subject.league} · ${subject.season}` : `${subject.league} team season`;
  return subject.school ?? `${subject.league} program`;
}

interface FootballComparisonModelBuild {
  query: FootballSubjectQuery;
  semantic: FootballRankingSemantic;
  reviewedItems: readonly FootballRankFiveItem[];
  specForSubject: (subject: FootballSubjectProfile) => FootballComparisonCategorySpec | undefined;
  calibrationForSpec: (spec: FootballComparisonCategorySpec, subject: FootballSubjectProfile) => FootballFixedCalibrationValues;
}

function buildFootballCandidatePoolFromModel({
  query,
  semantic,
  reviewedItems,
  specForSubject,
  calibrationForSpec,
}: FootballComparisonModelBuild): readonly FootballComparisonCandidate[] {
  const subjects = queryFootballSubjects(query);
  const reviewed = reviewedByQuery(query, reviewedItems);
  const calibrationCache = new Map<FootballComparisonCategorySpec, FootballFixedCalibrationValues>();
  const raw = subjects.flatMap((subject) => {
    const spec = specForSubject(subject);
    if (!spec) return [];
    const facts = factsForSubject(subject.id, spec.metrics);
    const reviewedItem = reviewed.get(subject.id);
    return reviewedItem || facts.length >= spec.minimumFacts ? [{ subject, spec, reviewedItem, facts }] : [];
  });

  return raw.map(({ subject, spec, reviewedItem, facts }) => {
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

    let calibration = calibrationCache.get(spec);
    if (!calibration) {
      calibration = calibrationForSpec(spec, subject);
      calibrationCache.set(spec, calibration);
    }
    const scoreSignals = scoreSignalsForSpec(spec);
    const evidence = facts.flatMap((row) => {
      const dimension = rankingDimensionByMetric[row.metric.metricId];
      const anchors = calibrationAnchorsFor(calibration, subject, row.metric.metricId);
      if (!dimension || anchors.length < 2) return [];
      return [{
        signalId: row.metric.metricId,
        dimension,
        weight: row.metric.weight,
        score: scoreFootballAnchoredValue(row.value, anchors, row.metric.direction ?? "higher"),
      }];
    });
    const ranking = rateFootballRankingEvidence(semantic, evidence, scoreSignals);

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

function familyModelForSubject(subject: FootballSubjectProfile) {
  const familyId = subject.position ? nflCareerFamilyByPosition[subject.position] : undefined;
  return familyId ? footballNflCareerRankingFamilyModels[familyId] : undefined;
}

function familyCalibrationForSpec(
  family: FootballNflCareerRankingFamilyModel,
  spec: FootballComparisonCategorySpec,
  subject: FootballSubjectProfile,
) {
  if (family.calibrationPackId) return fixedCalibrationValues(family.calibrationPackId, spec);
  const calibrationSubjectIds = subject.position
    ? family.calibrationSubjectIdsByPosition?.[subject.position] ?? []
    : [];
  return fixedCalibrationValuesForSubjectIds(spec, calibrationSubjectIds);
}

export function buildFootballNflCareerFamilyCandidatePool(
  familyId: FootballNflCareerRankingFamilyId,
): readonly FootballComparisonCandidate[] {
  const family = footballNflCareerRankingFamilyModels[familyId];
  const query = category(
    family.positions.length === 1
      ? { kind: "player-career", league: "NFL", position: family.positions[0] }
      : { kind: "player-career", league: "NFL", positions: family.positions },
    [],
    1,
  ).query;

  return buildFootballCandidatePoolFromModel({
    query,
    semantic: "career-greatness",
    reviewedItems: [],
    specForSubject: (subject) => subject.position ? family.positionSpecs[subject.position] : undefined,
    calibrationForSpec: (spec, subject) => familyCalibrationForSpec(family, spec, subject),
  });
}

export function buildFootballComparisonCandidatePool(packId: FootballRankFivePackId, reviewedItems: readonly FootballRankFiveItem[] = []): readonly FootballComparisonCandidate[] {
  const spec = footballComparisonCategorySpecs[packId];
  const semantic = rankingSemanticByPack[packId];

  if (packId === "nfl-defensive-players") {
    return buildFootballCandidatePoolFromModel({
      query: spec.query,
      semantic,
      reviewedItems,
      specForSubject: (subject) => {
        const family = familyModelForSubject(subject);
        return subject.position && family ? family.positionSpecs[subject.position] : undefined;
      },
      calibrationForSpec: (positionSpec) => fixedCalibrationValues(packId, positionSpec),
    });
  }

  const calibration = fixedCalibrationValues(packId, spec);
  return buildFootballCandidatePoolFromModel({
    query: spec.query,
    semantic,
    reviewedItems,
    specForSubject: () => spec,
    calibrationForSpec: () => calibration,
  });
}
