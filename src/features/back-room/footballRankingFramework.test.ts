import { describe, expect, it } from "vitest";
import {
  FOOTBALL_RANKING_FRAMEWORK_VERSION,
  applyFootballRankingContextAdjustment,
  footballRankingSemanticContracts,
  rateFootballRankingEvidence,
  scoreFootballAnchoredValue,
} from "./footballRankingFramework";

describe("Football Stage 14 ranking framework", () => {
  it("defines separate versioned greatness semantics and dimensions", () => {
    expect(FOOTBALL_RANKING_FRAMEWORK_VERSION).toBe("stage14-v1");
    expect(Object.keys(footballRankingSemanticContracts)).toEqual([
      "career-greatness",
      "single-season-greatness",
      "coach-greatness",
      "program-franchise-greatness",
      "bounded-era-greatness",
      "team-season-greatness",
    ]);
    expect(footballRankingSemanticContracts["career-greatness"].dimensionWeights).toMatchObject({
      peak: 0.30,
      "sustained-excellence": 0.25,
      "longevity-tail": 0.15,
      honors: 0.15,
      "postseason-team-accomplishment": 0.05,
      "contextual-strength": 0.10,
    });
  });

  it("scores against fixed anchors rather than the current candidate pool", () => {
    const anchors = [10, 20, 30, 40, 50];
    const baseline = scoreFootballAnchoredValue(35, anchors);
    const unrelatedCandidates = [-1000, 0, 9999, 10000];
    expect(scoreFootballAnchoredValue(35, anchors)).toBe(baseline);
    expect(scoreFootballAnchoredValue(35, [...anchors])).toBe(baseline);
    expect(unrelatedCandidates).toHaveLength(4);
  });

  it("keeps lower-is-better anchors deterministic", () => {
    expect(scoreFootballAnchoredValue(10, [5, 10, 15, 20], "lower"))
      .toBeGreaterThan(scoreFootballAnchoredValue(20, [5, 10, 15, 20], "lower"));
  });

  it("reports sparse evidence as low-confidence instead of hiding missing dimensions", () => {
    const sparse = rateFootballRankingEvidence("career-greatness", [
      { dimension: "peak", score: 0.95 },
    ]);
    expect(sparse.status).toBe("low-confidence");
    expect(sparse.coverage).toBeCloseTo(0.30);
    expect(sparse.confidence).toBeCloseTo(0.30);

    const fuller = rateFootballRankingEvidence("career-greatness", [
      { dimension: "peak", score: 0.95 },
      { dimension: "sustained-excellence", score: 0.85 },
      { dimension: "longevity-tail", score: 0.75 },
    ]);
    expect(fuller.status).toBe("rated");
    expect(fuller.coverage).toBeCloseTo(0.70);
    expect(fuller.confidence).toBeGreaterThan(sparse.confidence);
  });

  it("supports bounded era/position context adjustments without candidate-pool dependence", () => {
    expect(applyFootballRankingContextAdjustment(0.60, 0.10)).toBeCloseTo(0.70);
    expect(applyFootballRankingContextAdjustment(0.60, 0.50)).toBeCloseTo(0.75);
    expect(applyFootballRankingContextAdjustment(0.10, -0.50)).toBe(0);
  });
});
