import { describe, expect, it } from "vitest";
import { playLandingGameIds } from "./PlayLandingPresentation";
import {
  hasDailyOnlyCompatibilityIntent,
  isOfficialDailyRoute,
} from "./TodayChallengeGameRoute";

describe("Blind Rank and Keep/Cut Daily-only product role", () => {
  it("keeps both mechanics out of normal UFC and Football All Games discovery", () => {
    for (const sport of ["ufc", "football"] as const) {
      expect(playLandingGameIds(sport)).not.toContain("blind-rank");
      expect(playLandingGameIds(sport)).not.toContain("keep-cut");
    }
  });

  it("routes plain UFC Blind Rank and Keep/Cut entry points into the official Daily runtime", () => {
    expect(isOfficialDailyRoute("blind_rank_5", "")).toBe(true);
    expect(isOfficialDailyRoute("keep_4_cut_4", "")).toBe(true);
    expect(isOfficialDailyRoute("blind_rank_5", "?mode=daily")).toBe(true);
    expect(isOfficialDailyRoute("keep_4_cut_4", "?mode=daily")).toBe(true);
  });

  it("preserves compatible replayable, challenge, and lineup deep links without creating a second Daily path", () => {
    const compatibilityQueries = [
      "?mode=replayable",
      "?challenge=ABCD1234",
      "?match=11111111-1111-4111-8111-111111111111",
      "?pack=ufc-careers&lineup=one,two,three,four,five",
    ];

    for (const search of compatibilityQueries) {
      expect(hasDailyOnlyCompatibilityIntent(search)).toBe(true);
      expect(isOfficialDailyRoute("blind_rank_5", search)).toBe(false);
      expect(isOfficialDailyRoute("keep_4_cut_4", search)).toBe(false);
    }
  });

  it("does not alter the established routing policy for other Daily games", () => {
    expect(isOfficialDailyRoute("find_leader", "")).toBe(true);
    expect(isOfficialDailyRoute("find_leader", "?mode=replayable")).toBe(false);
    expect(isOfficialDailyRoute("wavelength", "")).toBe(false);
    expect(isOfficialDailyRoute("wavelength", "?mode=daily")).toBe(true);
  });
});
