import { describe, expect, it } from "vitest";
import {
  createFootballReviewedRatingCalibration,
  reconcileFootballRatingToReviewedAnchors,
  reconcileFootballRatingToReviewedProfiles,
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

  it("uses nearby reviewed greatness profiles to correct a misleading scalar score", () => {
    const rating = reconcileFootballRatingToReviewedProfiles(
      { peak: 0.72, "sustained-excellence": 0.68, honors: 0.65, "longevity-tail": 0.70 },
      [
        { dimensionScores: { peak: 0.75, "sustained-excellence": 0.70, honors: 0.65, "longevity-tail": 0.72 }, reviewedRating: 78, eraMidpoint: 2004 },
        { dimensionScores: { peak: 0.68, "sustained-excellence": 0.66, honors: 0.60, "longevity-tail": 0.74 }, reviewedRating: 76, eraMidpoint: 2001 },
        { dimensionScores: { peak: 0.70, "sustained-excellence": 0.62, honors: 0.62, "longevity-tail": 0.68 }, reviewedRating: 73, eraMidpoint: 1998 },
        { dimensionScores: { peak: 0.30, "sustained-excellence": 0.35, honors: 0.10, "longevity-tail": 0.45 }, reviewedRating: 48, eraMidpoint: 2015 },
        { dimensionScores: { peak: 0.20, "sustained-excellence": 0.28, honors: 0.05, "longevity-tail": 0.30 }, reviewedRating: 40, eraMidpoint: 2018 },
      ],
      51,
      2002,
    );

    expect(rating).toBeGreaterThan(62);
    expect(rating).toBeLessThanOrEqual(78);
  });

  it("keeps the monotone scale when too few comparable reviewed profiles exist", () => {
    expect(reconcileFootballRatingToReviewedProfiles(
      { peak: 0.7 },
      [
        { dimensionScores: { peak: 0.7 }, reviewedRating: 80 },
        { dimensionScores: { peak: 0.6 }, reviewedRating: 70 },
      ],
      61,
    )).toBe(61);
  });
});
