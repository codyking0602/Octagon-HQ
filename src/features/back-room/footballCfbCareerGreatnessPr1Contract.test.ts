import { describe, expect, it } from "vitest";

import {
  calculateFootballCfbCareerGreatness,
  calculateFootballCfbRbSustain,
  calculateFootballCfbWrSustain,
  footballCfbCareerGreatnessModels,
  type FootballCfbGreatnessEvidence,
} from "./footballComparisonAuthority";

const known = (value: number): FootballCfbGreatnessEvidence => ({ status: "known", value });

function exactEvidence(components: readonly { id: string; maxPoints: number }[]) {
  return Object.fromEntries(components.map((component) => [component.id, known(component.maxPoints)]));
}

describe("CFB greatness PR1 locked contract", () => {
  it("does not expose an aggregate score that can become a hidden within-tier ranking", () => {
    const model = footballCfbCareerGreatnessModels.TE;
    const result = calculateFootballCfbCareerGreatness({
      poolId: "TE",
      peak: exactEvidence(model.peakComponents),
      support: exactEvidence(model.supportComponents),
    });

    expect(result.preliminaryTier).toBe("Tier 1");
    expect(result).not.toHaveProperty("total");
    expect(result).not.toHaveProperty("overall");
    expect(result).not.toHaveProperty("rating");
  });

  it("encodes the locked RB second-/third-best Peak60 diminishing-return sustain bands", () => {
    expect(calculateFootballCfbRbSustain(known(52), known(48))).toEqual(known(10));
    expect(calculateFootballCfbRbSustain(known(48), known(44))).toEqual(known(7));
    expect(calculateFootballCfbRbSustain(known(44), known(40))).toEqual(known(4));
    expect(calculateFootballCfbRbSustain(known(39.999), known(39.999))).toEqual(known(0));
  });

  it("encodes the locked WR second-/third-best Peak70 diminishing-return sustain bands", () => {
    expect(calculateFootballCfbWrSustain(known(60), known(56))).toEqual(known(10));
    expect(calculateFootballCfbWrSustain(known(56), known(52))).toEqual(known(7));
    expect(calculateFootballCfbWrSustain(known(52), known(48))).toEqual(known(4));
    expect(calculateFootballCfbWrSustain(known(47.999), known(47.999))).toEqual(known(0));
  });

  it("propagates missing repeat-season evidence instead of manufacturing zero sustain", () => {
    expect(calculateFootballCfbRbSustain({ status: "missing" }, known(48))).toEqual({ status: "missing" });
    expect(calculateFootballCfbWrSustain(known(60), { status: "structurally-unavailable" })).toEqual({ status: "structurally-unavailable" });
  });
});
