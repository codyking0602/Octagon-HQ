import { describe, expect, it } from "vitest";
import {
  FOOTBALL_RANKING_FRAMEWORK_VERSION,
  applyFootballRankingContextAdjustment,
  footballRankingSemanticContracts,
  rateFootballRankingEvidence,
  scoreFootballAnchoredValue,
} from "./footballRankingFramework";

describe("Football ranking framework", () => {
  it("defines separate versioned greatness semantics and dimensions", () => {
    expect(FOOTBALL_RANKING_FRAMEWORK_VERSION).toBe("stage15-v2");
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
    expect(scoreFootballAnchoredValue(35, anchors)).toBe(baseline);
    expect(scoreFootballAnchoredValue(35, [...anchors])).toBe(baseline);
  });

  it("keeps lower-is-better anchors deterministic", () => {
    expect(scoreFootballAnchoredValue(10, [5, 10, 15, 20], "lower"))
      .toBeGreaterThan(scoreFootballAnchoredValue(20, [5, 10, 15, 20], "lower"));
  });

  it("keeps missing dimensions neutral and marks sparse evidence low-confidence", () => {
    const sparse = rateFootballRankingEvidence("career-greatness", [
      { dimension: "peak", score: 0.95 },
    ]);
    expect(sparse.status).toBe("low-confidence");
    expect(sparse.coverage).toBeCloseTo(0.30);
    expect(sparse.confidence).toBeCloseTo(0.30);
    expect(sparse.score).toBeCloseTo(0.635);

    const fuller = rateFootballRankingEvidence("career-greatness", [
      { dimension: "peak", score: 0.95 },
      { dimension: "sustained-excellence", score: 0.85 },
      { dimension: "longevity-tail", score: 0.75 },
    ]);
    expect(fuller.status).toBe("rated");
    expect(fuller.coverage).toBeCloseTo(0.70);
    expect(fuller.confidence).toBeGreaterThan(sparse.confidence);
    expect(fuller.score).toBeGreaterThan(sparse.score);
  });

  it("supports weighted signals inside a shared greatness dimension", () => {
    const result = rateFootballRankingEvidence("career-greatness", [
      { dimension: "peak", score: 1, weight: 3 },
      { dimension: "peak", score: 0, weight: 1 },
      { dimension: "sustained-excellence", score: 0.5 },
    ]);
    expect(result.dimensionScores.peak).toBeCloseTo(0.75);
  });

  it("uses an explicit score profile without hiding missing semantic dimensions", () => {
    const result = rateFootballRankingEvidence(
      "career-greatness",
      [
        { signalId: "production", dimension: "sustained-excellence", score: 1, weight: 0.8 },
        { signalId: "honors", dimension: "honors", score: 0.75, weight: 0.2 },
      ],
      [
        { signalId: "production", dimension: "sustained-excellence", weight: 0.8 },
        { signalId: "honors", dimension: "honors", weight: 0.2 },
      ],
    );

    expect(result.score).toBeCloseTo(0.95);
    expect(result.coverage).toBeCloseTo(0.40);
    expect(result.confidence).toBeCloseTo(0.40);
    expect(result.status).toBe("low-confidence");
  });

  it("keeps missing score-profile signals neutral instead of reallocating their weight", () => {
    const result = rateFootballRankingEvidence(
      "career-greatness",
      [{ signalId: "production", dimension: "sustained-excellence", score: 1 }],
      [
        { signalId: "production", dimension: "sustained-excellence", weight: 0.5 },
        { signalId: "honors", dimension: "honors", weight: 0.5 },
      ],
    );
    expect(result.score).toBeCloseTo(0.75);
  });

  it("supports bounded era/position context adjustments without candidate-pool dependence", () => {
    expect(applyFootballRankingContextAdjustment(0.60, 0.10)).toBeCloseTo(0.70);
    expect(applyFootballRankingContextAdjustment(0.60, 0.50)).toBeCloseTo(0.75);
    expect(applyFootballRankingContextAdjustment(0.10, -0.50)).toBe(0);
  });
});
