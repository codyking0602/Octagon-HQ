import { describe, expect, it } from "vitest";
import {
  createFootballReviewedRatingCalibration,
  reconcileFootballRatingToReviewedAnchors,
} from "./footballReviewedAnchorCalibration";

describe("Football reviewed-anchor calibration", () => {
  it("fits a monotone curve even when individual reviewed anchors cross", () => {
    const calibration = createFootballReviewedRatingCalibration([
      { modelScore: 0.2, reviewedRating: 30 },
      { modelScore: 0.4, reviewedRating: 60 },
      { modelScore: 0.6, reviewedRating: 55 },
      { modelScore: 0.8, reviewedRating: 90 },
    ]);

    expect(calibration).not.toBeNull();
    const ratings = [0.2, 0.4, 0.6, 0.8].map((score) => (
      reconcileFootballRatingToReviewedAnchors(score, calibration!)
    ));
    expect(ratings).toEqual([...ratings].sort((left, right) => left - right));
  });

  it("interpolates between reviewed anchors and clamps extrapolated ratings", () => {
    const calibration = createFootballReviewedRatingCalibration([
      { modelScore: 0.2, reviewedRating: 20 },
      { modelScore: 0.4, reviewedRating: 40 },
      { modelScore: 0.6, reviewedRating: 70 },
      { modelScore: 0.8, reviewedRating: 90 },
    ]);

    expect(reconcileFootballRatingToReviewedAnchors(0.5, calibration!)).toBe(55);
    expect(reconcileFootballRatingToReviewedAnchors(0, calibration!)).toBe(0);
    expect(reconcileFootballRatingToReviewedAnchors(1, calibration!)).toBe(100);
  });

  it("refuses to manufacture a reviewed scale from too few anchors", () => {
    expect(createFootballReviewedRatingCalibration([
      { modelScore: 0.2, reviewedRating: 30 },
      { modelScore: 0.5, reviewedRating: 60 },
      { modelScore: 0.8, reviewedRating: 90 },
    ])).toBeNull();
  });
});
