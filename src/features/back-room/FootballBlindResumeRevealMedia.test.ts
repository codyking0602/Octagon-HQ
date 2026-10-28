import { describe, expect, it } from "vitest";
import { resolvedFootballBlindResumeMatchups } from "./footballBlindResumeModel";
import { footballBlindResumeRevealAsset } from "./footballBlindResumePresentation";

describe("Football Blind Resume reveal media", () => {
  it("resolves a canonical team or program mark for every curated reveal subject", () => {
    const subjectIds = [...new Set(
      resolvedFootballBlindResumeMatchups().flatMap((matchup) => [matchup.leftId, matchup.rightId]),
    )];
    const missing = subjectIds.filter((subjectId) => !footballBlindResumeRevealAsset(subjectId));

    expect(missing).toEqual([]);
  });

  it("covers the legacy CFB era boundaries used by Blind Resume, including Alabama", () => {
    expect(footballBlindResumeRevealAsset("alabama-program")?.label).toBe("Alabama");
    expect(footballBlindResumeRevealAsset("alabama-2009-2020")?.label).toBe("Alabama");
    expect(footballBlindResumeRevealAsset("clemson-2015-2020")?.label).toBe("Clemson");
    expect(footballBlindResumeRevealAsset("georgia-2021-2024")?.label).toBe("Georgia");
    expect(footballBlindResumeRevealAsset("nick-saban-cfb")?.label).toBe("Alabama");
  });
});
