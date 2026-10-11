import { describe, expect, it } from "vitest";
import { footballGmPlayerById, footballGmProjectedGradeForPlayer } from "./footballGmEngine";
import { FOOTBALL_GM_SCORE_WEIGHTS, footballGmScoreFromComponents } from "./footballGmStrategy";

describe("Weekly NFL GM October 13 launch contract", () => {
  it("uses the same existing 90/10 franchise score in Casual and Weekly", () => {
    expect(FOOTBALL_GM_SCORE_WEIGHTS).toEqual({ rosterManagement: 0.90, threeYearResume: 0.10 });
    expect(footballGmScoreFromComponents(80, 100)).toBe(82);
    expect(footballGmScoreFromComponents(100, 80)).toBe(98);
  });

  it("retains Josh Allen's grade and guarantees Jaxson Dart a breakout into Starter territory", () => {
    const allen = footballGmPlayerById("BUF|QB|joshallen");
    const dart = footballGmPlayerById("NYG|QB|jaxsondart");
    expect(allen).not.toBeNull();
    expect(dart).not.toBeNull();
    if (!allen || !dart) return;

    const eliteSeed = "weekly-gm:2026-10-13:elite:fixture:gmdev1";
    const youngSeed = "weekly-gm:2026-10-13:young:fixture:gmdev1";
    for (const year of [2, 3] as const) {
      expect(footballGmProjectedGradeForPlayer(allen, year, eliteSeed)).toBe(allen.currentGrade);
      expect(footballGmProjectedGradeForPlayer(dart, year, youngSeed)).toBe(dart.currentGrade + 4);
      expect(footballGmProjectedGradeForPlayer(dart, year, youngSeed)).toBeGreaterThanOrEqual(83);
    }
    expect(footballGmProjectedGradeForPlayer(dart, 1, youngSeed)).toBe(dart.currentGrade);
    expect(footballGmProjectedGradeForPlayer(allen, 1, eliteSeed)).toBe(allen.currentGrade);
  });
});
