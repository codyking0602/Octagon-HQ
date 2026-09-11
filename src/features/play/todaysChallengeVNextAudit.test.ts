import { describe, expect, it } from "vitest";
import {
  WHO_AM_I_RESCUE_SCORE,
  WHO_AM_I_RESCUE_SECOND_SCORE,
  WHO_AM_I_WINDOW_SCORES,
} from "../games/whoAmIEngine";
import { playGameDefinition } from "./playRegistry";
import { TODAY_CHALLENGE_ADAPTERS } from "./todaysChallengeAdapters";

describe("Today's Challenge vNext Stage 11 audit baseline", () => {
  it("keeps Who Am I public-release-ready but outside competitive Daily ownership for both sports", () => {
    for (const sport of ["ufc", "football"] as const) {
      const definition = playGameDefinition("who-am-i", sport);
      expect(definition.availability).toBe("preview");
      expect(definition.lineup.supportedTypes).toEqual(["replayable"]);
      expect(definition.lineup.challengeEligible).toBe(false);
      expect(definition.lineup.dailyEligible).toBe(false);
      expect(definition.lineup.streakEligible).toBe(false);
      expect(definition.lineup.reminderEligible).toBe(false);
      expect(definition.lineup.historyRecording).toBe("casual-only");
    }
  });

  it("keeps the current official Daily adapter owner limited to the established runtime game types", () => {
    expect(Object.keys(TODAY_CHALLENGE_ADAPTERS).sort()).toEqual([
      "blind_rank_5",
      "blind_resume",
      "find_leader",
      "hit_the_number",
      "keep_4_cut_4",
      "wavelength",
    ]);
    expect("who_am_i" in TODAY_CHALLENGE_ADAPTERS).toBe(false);
  });

  it("keeps the Who Am I casual score ladder bounded and ordered for a future Daily proof", () => {
    expect(WHO_AM_I_WINDOW_SCORES).toEqual([100, 95, 90, 80, 70]);
    expect(WHO_AM_I_WINDOW_SCORES.every((score) => score >= 0 && score <= 100)).toBe(true);
    expect(WHO_AM_I_RESCUE_SCORE).toBe(45);
    expect(WHO_AM_I_RESCUE_SECOND_SCORE).toBe(30);
    expect(WHO_AM_I_RESCUE_SCORE).toBeLessThan(WHO_AM_I_WINDOW_SCORES.at(-1)!);
    expect(WHO_AM_I_RESCUE_SECOND_SCORE).toBeLessThan(WHO_AM_I_RESCUE_SCORE);
  });
});
