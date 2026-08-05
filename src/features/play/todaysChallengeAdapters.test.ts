import { describe, expect, it } from "vitest";
import {
  TODAY_CHALLENGE_ADAPTERS,
  todayChallengeAdapter,
  todayChallengeGameDefinition,
} from "./todaysChallengeAdapters";

describe("Today’s Challenge adapters", () => {
  it("maps the five canonical backend game identities to existing Play games", () => {
    expect(Object.keys(TODAY_CHALLENGE_ADAPTERS)).toEqual([
      "find_leader",
      "blind_resume",
      "wavelength",
      "blind_rank_5",
      "keep_4_cut_4",
    ]);

    for (const adapter of Object.values(TODAY_CHALLENGE_ADAPTERS)) {
      expect(todayChallengeAdapter(adapter.gameType)).toBe(adapter);
      expect(todayChallengeGameDefinition(adapter.gameType)?.id).toBe(adapter.gameId);
      expect(adapter.dailyRoute).toMatch(/^\/play\//);
      expect(adapter.casualRoute).toMatch(/^\/play\//);
    }
  });

  it("keeps official and casual routes distinct without launching rotation", () => {
    expect(TODAY_CHALLENGE_ADAPTERS.find_leader.dailyRoute).toBe("/play/find-leader");
    expect(TODAY_CHALLENGE_ADAPTERS.find_leader.casualRoute).toContain("mode=replayable");
    expect(TODAY_CHALLENGE_ADAPTERS.wavelength.dailyRoute).toContain("mode=daily");
    expect(TODAY_CHALLENGE_ADAPTERS.blind_resume.dailyRoute).toContain("mode=daily");
    expect(TODAY_CHALLENGE_ADAPTERS.blind_rank_5.dailyRoute).toContain("mode=daily");
    expect(TODAY_CHALLENGE_ADAPTERS.keep_4_cut_4.dailyRoute).toContain("mode=daily");
  });

  it("states the corrected blind Keep 4, Cut 4 contract", () => {
    const copy = TODAY_CHALLENGE_ADAPTERS.keep_4_cut_4.instructions;
    expect(copy).toMatch(/one fighter at a time/i);
    expect(copy).toMatch(/locks/i);
    expect(copy).toMatch(/future fighters stay hidden/i);
    expect(copy).toMatch(/full tray forces/i);
    expect(TODAY_CHALLENGE_ADAPTERS.keep_4_cut_4.nativeDisplay({
      nativeScore: 16,
      publicResult: {},
    })).toBe("16 of 16 comparisons");
  });
});
