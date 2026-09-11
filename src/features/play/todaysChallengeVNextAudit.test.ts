import { describe, expect, it } from "vitest";
import ufcComboRotation from "../../../supabase/migrations/202612310035_daily_rank_keep_combo_rotation.sql?raw";
import ufcV5Reroll from "../../../supabase/migrations/202612310058_reroll_august_26_hit_the_number.sql?raw";
import ufcV6Reroll from "../../../supabase/migrations/202612310069_reroll_august_30_daily_double.sql?raw";
import {
  WHO_AM_I_RESCUE_SCORE,
  WHO_AM_I_RESCUE_SECOND_SCORE,
  WHO_AM_I_WINDOW_SCORES,
  WHO_AM_I_WRONG_GUESS_PENALTY,
} from "../games/whoAmIEngine";
import {
  buildFootballTodayPersistenceSetup,
  footballTodayGameForDay,
} from "./footballTodayChallengeSession";
import { playGameDefinition } from "./playRegistry";

function rotationGames(source: string) {
  const match = source.match(/v_replacement_starts_on,\s*array\[(.*?)\]\s*::text\[\]/s);
  if (!match) throw new Error("UFC Daily rotation array is missing.");
  return [...match[1]!.matchAll(/'(find_leader|blind_resume|wavelength|keep_4_cut_4|hit_the_number)'/g)]
    .map((row) => row[1]!);
}

describe("Stage 11 Today’s Challenge vNext audit", () => {
  it("locks the active UFC five-family baseline without creating a separate Blind Rank day", () => {
    const games = rotationGames(ufcComboRotation);
    const counts = games.reduce<Record<string, number>>((result, game) => ({
      ...result,
      [game]: (result[game] ?? 0) + 1,
    }), {});

    expect(games).toHaveLength(60);
    expect(counts).toEqual({
      hit_the_number: 12,
      find_leader: 15,
      wavelength: 12,
      blind_resume: 15,
      keep_4_cut_4: 6,
    });
    expect(games).not.toContain("blind_rank_5");

    expect(ufcV5Reroll).toContain("v_source_version constant text := 'play-rotation-v4'");
    expect(ufcV5Reroll).toContain("source.game_cycle");
    expect(ufcV6Reroll).toContain("v_source_version constant text := 'play-rotation-v5'");
    expect(ufcV6Reroll).toContain("source.game_cycle");
  });

  it("keeps the active Football five-day rotation equal and treats Keep/Cut as Daily Double", () => {
    expect([
      "2026-09-05",
      "2026-09-06",
      "2026-09-07",
      "2026-09-08",
      "2026-09-09",
    ].map(footballTodayGameForDay)).toEqual([
      "hit_the_number",
      "find_leader",
      "blind_resume",
      "wavelength",
      "keep_4_cut_4",
    ]);

    const dailyDouble = buildFootballTodayPersistenceSetup("2026-09-09");
    expect(dailyDouble.gameType).toBe("keep_4_cut_4");
    expect(dailyDouble.contentVersion).toBe("football-daily-double-v1");
    expect(dailyDouble.scoringVersion).toBe("play-official-score-v4");
  });

  it("keeps Who Am I replayable-only until a separate Daily contract is approved", () => {
    for (const sport of ["ufc", "football"] as const) {
      const game = playGameDefinition("who-am-i", sport);
      expect(game.availability).toBeUndefined();
      expect(game.lineup).toMatchObject({
        defaultType: "replayable",
        supportedTypes: ["replayable"],
        challengeEligible: false,
        dailyEligible: false,
        streakEligible: false,
        reminderEligible: false,
        historyRecording: "casual-only",
      });
    }
  });

  it("records the mature casual Who Am I score ladder without treating it as Daily calibration proof", () => {
    expect(WHO_AM_I_WINDOW_SCORES).toEqual([100, 95, 90, 80, 70]);
    expect(WHO_AM_I_WRONG_GUESS_PENALTY).toBe(10);
    expect(WHO_AM_I_RESCUE_SCORE).toBe(45);
    expect(WHO_AM_I_RESCUE_SECOND_SCORE).toBe(30);
  });
});
