import { describe, expect, it } from "vitest";
import {
  OFFICIAL_COMPARISON_GRADING_RULES,
  OFFICIAL_SCORE_CONTRACT_VERSION,
  adaptBlindResumeOfficialScore,
  adaptFindLeaderOfficialScore,
  adaptWavelengthOfficialScore,
  existingOfficialScoreAdapters,
} from "./officialScoreContract";

describe("official Play score contract", () => {
  it("versions every normalized result while preserving the native Find the Leader result", () => {
    expect(adaptFindLeaderOfficialScore(1)).toEqual({
      contractVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
      gameId: "find-leader",
      score: 10,
      native: {
        kind: "find-leader-round",
        value: 1,
        max: 10,
        display: "1/10",
      },
    });

    expect(adaptFindLeaderOfficialScore(10)).toMatchObject({
      score: 100,
      native: { display: "10/10" },
    });
  });

  it("keeps the existing Wavelength score on the shared 0–100 scale", () => {
    expect(adaptWavelengthOfficialScore(0)).toMatchObject({
      contractVersion: "play-official-score-v1",
      gameId: "wavelength",
      score: 0,
      native: { value: 0, max: 100, display: "0/100" },
    });
    expect(adaptWavelengthOfficialScore(83)).toMatchObject({
      score: 83,
      native: { display: "83/100" },
    });
    expect(adaptWavelengthOfficialScore(100).score).toBe(100);
  });

  it("normalizes Blind Resume correct picks without losing the native fraction", () => {
    expect(adaptBlindResumeOfficialScore(0)).toMatchObject({
      gameId: "blind-resume",
      score: 0,
      native: { display: "0/5" },
    });
    expect(adaptBlindResumeOfficialScore(4)).toMatchObject({
      score: 80,
      native: { value: 4, max: 5, display: "4/5" },
    });
    expect(adaptBlindResumeOfficialScore(5).score).toBe(100);
  });

  it("rejects incomplete, out-of-range, and fractional native scores", () => {
    expect(() => adaptFindLeaderOfficialScore(0)).toThrow(RangeError);
    expect(() => adaptFindLeaderOfficialScore(11)).toThrow(RangeError);
    expect(() => adaptFindLeaderOfficialScore(4.5)).toThrow(RangeError);
    expect(() => adaptWavelengthOfficialScore(-1)).toThrow(RangeError);
    expect(() => adaptWavelengthOfficialScore(101)).toThrow(RangeError);
    expect(() => adaptWavelengthOfficialScore(Number.NaN)).toThrow(RangeError);
    expect(() => adaptBlindResumeOfficialScore(-1)).toThrow(RangeError);
    expect(() => adaptBlindResumeOfficialScore(6)).toThrow(RangeError);
  });

  it("provides one complete adapter registry for the already scorable daily games", () => {
    expect(Object.keys(existingOfficialScoreAdapters).sort()).toEqual([
      "blind-resume",
      "find-leader",
      "wavelength",
    ]);
    expect(existingOfficialScoreAdapters["find-leader"](7).score).toBe(70);
    expect(existingOfficialScoreAdapters.wavelength(64).score).toBe(64);
    expect(existingOfficialScoreAdapters["blind-resume"](3).score).toBe(60);
  });

  it("pins the future Blind Rank and Keep/Cut comparison and rounding rules", () => {
    expect(OFFICIAL_COMPARISON_GRADING_RULES["blind-rank"]).toEqual({
      comparisonCount: 10,
      ratingTieTolerance: 1,
      normalizedPointsPerComparison: 10,
      rounding: "none",
    });
    expect(OFFICIAL_COMPARISON_GRADING_RULES["keep-cut"]).toEqual({
      comparisonCount: 16,
      ratingTieTolerance: 1,
      normalizedPointsPerComparison: 6.25,
      rounding: "nearest-whole",
    });

    for (const rules of Object.values(OFFICIAL_COMPARISON_GRADING_RULES)) {
      expect(rules.comparisonCount * rules.normalizedPointsPerComparison).toBe(100);
    }
  });
});
