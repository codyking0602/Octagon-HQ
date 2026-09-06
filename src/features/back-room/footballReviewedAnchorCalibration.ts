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

const MIN_REVIEWED_ANCHORS = 4;
const MIN_MODEL_SCORE_SPAN = 0.05;

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
