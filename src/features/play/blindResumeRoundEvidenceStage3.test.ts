import { describe, expect, it } from "vitest";
import { blindResumeStats, createBlindResumeRounds } from "./blindResumeEngine";
import { rankedPlayFighters } from "./playFighterPool";

describe("Stage 3 UFC Blind Resume audited-round fairness", () => {
  it("does not confuse no audited rounds with a genuine zero-percent round record", () => {
    const original = createBlindResumeRounds("stage3b-audited-round-disclosure").pairs[0]!;
    const pair = {
      ...original,
      fighterA: {
        ...original.fighterA,
        model: {
          ...original.fighterA.model,
          visibleStats: {
            ...original.fighterA.model.visibleStats,
            roundsWonPct: 0,
            auditedPrimeRoundCount: 0,
          },
        },
      },
      fighterB: {
        ...original.fighterB,
        model: {
          ...original.fighterB.model,
          visibleStats: {
            ...original.fighterB.model.visibleStats,
            roundsWonPct: 0,
            auditedPrimeRoundCount: 7,
          },
        },
      },
    };
    const row = blindResumeStats(pair).find((stat) => stat.label === "Rounds won");
    expect(row).toEqual({ label: "Rounds won", valueA: "N/A", valueB: "0% (7 audited)" });
  });

  it("makes the evidence sample size visible for an actually measured percentage", () => {
    const original = createBlindResumeRounds("stage3b-prime-round-sample").pairs[0]!;
    const pair = {
      ...original,
      fighterA: {
        ...original.fighterA,
        model: {
          ...original.fighterA.model,
          visibleStats: {
            ...original.fighterA.model.visibleStats,
            roundsWonPct: 52.34,
            auditedPrimeRoundCount: 17,
          },
        },
      },
    };
    expect(blindResumeStats(pair).find((stat) => stat.label === "Rounds won")?.valueA)
      .toBe("52.3% (17 audited)");
  });

  it("keeps real ranked fighter round values finite and measured sample counts nonnegative", () => {
    expect(rankedPlayFighters.length).toBeGreaterThan(0);
    for (const fighter of rankedPlayFighters) {
      const { roundsWonPct, auditedPrimeRoundCount } = fighter.model.visibleStats;
      expect(Number.isFinite(roundsWonPct)).toBe(true);
      expect(Number.isInteger(auditedPrimeRoundCount)).toBe(true);
      expect(auditedPrimeRoundCount).toBeGreaterThanOrEqual(0);
      expect(roundsWonPct).toBeGreaterThanOrEqual(0);
      expect(roundsWonPct).toBeLessThanOrEqual(100);
      if (auditedPrimeRoundCount === 0) expect(roundsWonPct).toBe(0);
    }
  });
});
