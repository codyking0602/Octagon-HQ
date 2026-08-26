import { describe, expect, it } from "vitest";
import { buildOfficialDailySetup } from "./todaysChallengeRuntime";

describe("Hit the Number Daily choice invariant", () => {
  it("rerolls the August 26 forced-choice seed instead of publishing pick-all eligibility", () => {
    const setup = buildOfficialDailySetup(
      "hit_the_number",
      "2026-08-26",
      "play-rotation-v4",
    );
    const fighterIds = setup.publicSetup.fighterIds as string[];
    const pickCount = Number(setup.publicSetup.pickCount);

    expect(fighterIds.length).toBeGreaterThan(pickCount);
  });

  it("keeps a deterministic horizon of official Daily boards above the required pick count", () => {
    for (let index = 0; index < 120; index += 1) {
      const day = new Date(Date.UTC(2027, 0, index + 1)).toISOString().slice(0, 10);
      const setup = buildOfficialDailySetup("hit_the_number", day, "choice-invariant-v1");
      const fighterIds = setup.publicSetup.fighterIds as string[];
      const pickCount = Number(setup.publicSetup.pickCount);

      expect(fighterIds.length, `forced-choice board generated for ${day}`).toBeGreaterThan(pickCount);
    }
  });
});
