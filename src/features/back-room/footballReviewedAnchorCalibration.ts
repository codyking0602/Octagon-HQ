import type { FootballRankingDimension } from "./footballRankingFramework";

export interface FootballReviewedRatingCalibrationSample {
  modelScore: number;
  reviewedRating: number;
}

export interface FootballReviewedRatingCalibrationPoint {
  modelScore: number;
  reviewedRating: number;
}

export interface FootballReviewedRatingCalibration {
  anchorCount: number;
  points: readonly FootballReviewedRatingCalibrationPoint[];
}

export interface FootballReviewedRatingProfileSample {
  dimensionScores: Readonly<Partial<Record<FootballRankingDimension, number>>>;
  reviewedRating: number;
  eraMidpoint?: number | null;
}

const MIN_REVIEWED_ANCHORS = 4;
const MIN_MODEL_SCORE_SPAN = 0.05;
const PROFILE_NEIGHBOR_COUNT = 5;
const MIN_PROFILE_NEIGHBORS = 3;
const PROFILE_RATING_WEIGHT = 0.90;
const SPARSE_PROFILE_MIN_ANCHORS = 4;
const SPARSE_PROFILE_MAX_ANCHORS = 20;
const SPARSE_PROFILE_RATING_WEIGHT = 0.25;
const SPARSE_PROFILE_MAX_ADJUSTMENT = 10;
const ERA_DISTANCE_WEIGHT = 2;
const ERA_DISTANCE_FULL_PENALTY_SEASONS = 30;

function clampRating(value: number) {
  return Math.max(0, Math.min(100, value));
}

/**
 * Fits a monotone calibration curve from the private canonical model score to the
 * human-reviewed rating scale. Pool-adjacent-violators removes local anchor
 * inversions without inventing a second category model or changing reviewed truth.
 */
export function createFootballReviewedRatingCalibration(
  samples: readonly FootballReviewedRatingCalibrationSample[],
): FootballReviewedRatingCalibration | null {
  const groupedByScore = new Map<number, { ratingSum: number; count: number }>();
  for (const sample of samples) {
    if (!Number.isFinite(sample.modelScore) || !Number.isFinite(sample.reviewedRating)) continue;
    const modelScore = Math.max(0, Math.min(1, sample.modelScore));
    const reviewedRating = clampRating(sample.reviewedRating);
    const existing = groupedByScore.get(modelScore);
    if (existing) {
      existing.ratingSum += reviewedRating;
      existing.count += 1;
    } else {
      groupedByScore.set(modelScore, { ratingSum: reviewedRating, count: 1 });
    }
  }

  const grouped = [...groupedByScore.entries()]
    .map(([modelScore, value]) => ({
      modelScore,
      reviewedRating: value.ratingSum / value.count,
      weight: value.count,
    }))
    .sort((left, right) => left.modelScore - right.modelScore);

  const anchorCount = grouped.reduce((sum, point) => sum + point.weight, 0);
  if (anchorCount < MIN_REVIEWED_ANCHORS || grouped.length < 2) return null;
  if (grouped.at(-1)!.modelScore - grouped[0]!.modelScore < MIN_MODEL_SCORE_SPAN) return null;

  const blocks: Array<{
    points: typeof grouped;
    weight: number;
    reviewedRating: number;
  }> = [];

  for (const point of grouped) {
    blocks.push({ points: [point], weight: point.weight, reviewedRating: point.reviewedRating });
    while (blocks.length >= 2) {
      const current = blocks.at(-1)!;
      const previous = blocks.at(-2)!;
      if (previous.reviewedRating <= current.reviewedRating) break;

      const mergedWeight = previous.weight + current.weight;
      const mergedRating = (
        previous.reviewedRating * previous.weight
        + current.reviewedRating * current.weight
      ) / mergedWeight;
      blocks.splice(blocks.length - 2, 2, {
        points: [...previous.points, ...current.points],
        weight: mergedWeight,
        reviewedRating: mergedRating,
      });
    }
  }

  const points = blocks.flatMap((block) => block.points.map((point) => ({
    modelScore: point.modelScore,
    reviewedRating: block.reviewedRating,
  })));

  return { anchorCount, points };
}

function calibratedValue(
  modelScore: number,
  calibration: FootballReviewedRatingCalibration,
) {
  const score = Math.max(0, Math.min(1, modelScore));
  const points = calibration.points;
  if (points.length === 1) return points[0]!.reviewedRating;

  let left = points[0]!;
  let right = points[1]!;
  if (score >= points.at(-1)!.modelScore) {
    left = points.at(-2)!;
    right = points.at(-1)!;
  } else if (score > points[0]!.modelScore) {
    for (let index = 1; index < points.length; index += 1) {
      if (score <= points[index]!.modelScore) {
        left = points[index - 1]!;
        right = points[index]!;
        break;
      }
    }
  }

  const scoreSpan = right.modelScore - left.modelScore;
  if (scoreSpan <= 0) return (left.reviewedRating + right.reviewedRating) / 2;
  const ratio = (score - left.modelScore) / scoreSpan;
  return left.reviewedRating + ratio * (right.reviewedRating - left.reviewedRating);
}

export function reconcileFootballRatingToReviewedAnchors(
  modelScore: number,
  calibration: FootballReviewedRatingCalibration,
) {
  return Math.round(clampRating(calibratedValue(modelScore, calibration)));
}

function reviewedProfileDistance(
  targetScores: Readonly<Partial<Record<FootballRankingDimension, number>>>,
  sample: FootballReviewedRatingProfileSample,
  targetEraMidpoint?: number | null,
) {
  const dimensions = Object.keys(targetScores) as FootballRankingDimension[];
  const common = dimensions.flatMap((dimension) => {
    const target = targetScores[dimension];
    const anchor = sample.dimensionScores[dimension];
    return target == null || anchor == null ? [] : [Math.abs(target - anchor)];
  });
  if (common.length < 2) return null;

  const dimensionDistance = common.reduce((sum, value) => sum + value, 0) / common.length;
  const eraDistance = targetEraMidpoint != null && sample.eraMidpoint != null
    ? Math.min(1, Math.abs(targetEraMidpoint - sample.eraMidpoint) / ERA_DISTANCE_FULL_PENALTY_SEASONS)
    : 0;
  return dimensionDistance + eraDistance * ERA_DISTANCE_WEIGHT;
}

/**
 * A scalar model score can hide why two careers differ. This calibration step
 * compares the model's actual greatness-dimension profile to nearby reviewed
 * careers, with an era preference. Sparse reviewed neighborhoods are deliberately
 * bounded so a handful of anchors cannot flatten hundreds of generated careers.
 * Reviewed rows stay exact and generated subjects never become manual overrides.
 */
export function reconcileFootballRatingToReviewedProfiles(
  dimensionScores: Readonly<Partial<Record<FootballRankingDimension, number>>>,
  samples: readonly FootballReviewedRatingProfileSample[],
  scaleRating: number,
  eraMidpoint?: number | null,
) {
  const neighbors = samples
    .flatMap((sample) => {
      const distance = reviewedProfileDistance(dimensionScores, sample, eraMidpoint);
      return distance == null ? [] : [{ sample, distance }];
    })
    .sort((left, right) => left.distance - right.distance || right.sample.reviewedRating - left.sample.reviewedRating)
    .slice(0, PROFILE_NEIGHBOR_COUNT);

  if (neighbors.length < MIN_PROFILE_NEIGHBORS) return Math.round(clampRating(scaleRating));

  const weighted = neighbors.map(({ sample, distance }) => ({
    rating: clampRating(sample.reviewedRating),
    weight: 1 / Math.max(0.05, distance),
  }));
  const totalWeight = weighted.reduce((sum, row) => sum + row.weight, 0);
  if (totalWeight <= 0) return Math.round(clampRating(scaleRating));

  const profileRating = weighted.reduce((sum, row) => sum + row.rating * row.weight, 0) / totalWeight;
  const sparseReviewedProfile = samples.length >= SPARSE_PROFILE_MIN_ANCHORS
    && samples.length <= SPARSE_PROFILE_MAX_ANCHORS;
  const profileWeight = sparseReviewedProfile ? SPARSE_PROFILE_RATING_WEIGHT : PROFILE_RATING_WEIGHT;
  const blendedRating = profileRating * profileWeight + scaleRating * (1 - profileWeight);
  const boundedRating = sparseReviewedProfile
    ? Math.max(
        scaleRating - SPARSE_PROFILE_MAX_ADJUSTMENT,
        Math.min(scaleRating + SPARSE_PROFILE_MAX_ADJUSTMENT, blendedRating),
      )
    : blendedRating;
  return Math.round(clampRating(boundedRating));
}
