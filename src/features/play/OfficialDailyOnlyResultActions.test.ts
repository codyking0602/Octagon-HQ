import { describe, expect, it } from "vitest";
import { officialDailyGameAllowsCasualReplay } from "./OfficialTodayChallengePage";

describe("official Daily result actions", () => {
  it("does not offer a normal casual replay for Daily-only Blind Rank or Keep/Cut", () => {
    expect(officialDailyGameAllowsCasualReplay("blind_rank_5")).toBe(false);
    expect(officialDailyGameAllowsCasualReplay("keep_4_cut_4")).toBe(false);
  });

  it("preserves casual replay actions for the existing standalone games", () => {
    expect(officialDailyGameAllowsCasualReplay("find_leader")).toBe(true);
    expect(officialDailyGameAllowsCasualReplay("wavelength")).toBe(true);
    expect(officialDailyGameAllowsCasualReplay("blind_resume")).toBe(true);
    expect(officialDailyGameAllowsCasualReplay("hit_the_number")).toBe(true);
  });
});
