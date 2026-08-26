import { describe, expect, it } from "vitest";
import { buildOfficialDailySetup } from "./todaysChallengeRuntime";

describe("August 26 Hit the Number reroll", () => {
  it("materializes the replacement schedule with more eligible fighters than required picks", () => {
    const setup = buildOfficialDailySetup(
      "hit_the_number",
      "2026-08-26",
      "play-rotation-v5",
    );
    const fighterIds = setup.publicSetup.fighterIds as string[];
    const pickCount = Number(setup.publicSetup.pickCount);

    expect(setup.setupKey).toContain("play-rotation-v5");
    expect(fighterIds.length).toBeGreaterThan(pickCount);
  });
});
