import { describe, expect, it } from "vitest";
import { isOfficialDailyRoute } from "./TodayChallengeGameRoute";

describe("Today’s Challenge route ownership", () => {
  it("keeps bare Find the Leader on the official runtime while production is pinned", () => {
    expect(isOfficialDailyRoute("find_leader", "")).toBe(true);
    expect(isOfficialDailyRoute("find_leader", "?mode=daily")).toBe(true);
  });

  it("preserves replayable, shared, and direct-challenge Find the Leader routes", () => {
    expect(isOfficialDailyRoute("find_leader", "?mode=replayable")).toBe(false);
    expect(isOfficialDailyRoute("find_leader", "?challenge=ABC123")).toBe(false);
    expect(isOfficialDailyRoute("find_leader", "?match=ABC123")).toBe(false);
    expect(isOfficialDailyRoute("find_leader", "?day=2026-08-05")).toBe(false);
    expect(isOfficialDailyRoute("find_leader", "?definition=wins&seed=test")).toBe(false);
  });

  it("keeps standalone games casual unless daily mode is explicit", () => {
    for (const gameType of ["wavelength", "blind_resume"] as const) {
      expect(isOfficialDailyRoute(gameType, "")).toBe(false);
      expect(isOfficialDailyRoute(gameType, "?challenge=friend")).toBe(false);
      expect(isOfficialDailyRoute(gameType, "?mode=daily")).toBe(true);
    }
  });

  it("routes Daily-only Blind Rank and Keep/Cut through the official runtime while preserving challenge links", () => {
    for (const gameType of ["blind_rank_5", "keep_4_cut_4"] as const) {
      expect(isOfficialDailyRoute(gameType, "")).toBe(true);
      expect(isOfficialDailyRoute(gameType, "?challenge=friend")).toBe(false);
      expect(isOfficialDailyRoute(gameType, "?mode=replayable")).toBe(false);
      expect(isOfficialDailyRoute(gameType, "?mode=daily")).toBe(true);
    }
  });
});
