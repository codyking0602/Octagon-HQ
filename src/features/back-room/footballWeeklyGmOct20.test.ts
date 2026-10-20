import { describe, expect, it } from "vitest";
import { footballGmPlayerById, footballGmProjectedGradeForPlayer } from "./footballGmEngine";
import { footballGmDevelopmentResultForPlayer } from "./footballGmScouting";
import { footballWeeklyGmScenarioForWeek, footballWeeklyGmWeekLabel } from "./footballWeeklyGmScenarios";

describe("Oct 20 NFL Weekly GM: date-scoped Dak vs Penix", () => {
  const week = "2026-10-20";
  const dak = footballGmPlayerById("DAL|QB|dakprescott")!;
  const penix = footballGmPlayerById("ATL|QB|michaelpenix")!;

  it("offers Dak and Penix without modifying their real contracts or base ratings", () => {
    expect(dak.currentGrade).toBe(92);
    expect(dak.gameContract).toBe("3YR");
    expect(dak.salaryApy).toBe(60_000_000);
    expect(penix.currentGrade).toBe(78);
    expect(penix.gameContract).toBe("1YR");
    expect(penix.salaryApy).toBe(5_720_659);
    expect(footballWeeklyGmScenarioForWeek(week,"elite").playerId).toBe(dak.id);
    expect(footballWeeklyGmScenarioForWeek(week,"young").playerId).toBe(penix.id);
    expect(footballWeeklyGmWeekLabel(week)).toBe("Oct 20–26");
  });

  it("guarantees Dak 92 → 89 and Penix 78 → 83 for Years 2 and 3 only", () => {
    const eliteSeed = "weekly-gm:2026-10-20:elite:player-a:gmdev1";
    const youngSeed = "weekly-gm:2026-10-20:young:player-b:gmdev1";
    expect(footballGmProjectedGradeForPlayer(dak,1,eliteSeed)).toBe(92);
    expect(footballGmProjectedGradeForPlayer(penix,1,youngSeed)).toBe(78);
    expect(footballGmDevelopmentResultForPlayer(dak,-3,eliteSeed)).toBe("REGRESSED");
    expect(footballGmDevelopmentResultForPlayer(penix,5,youngSeed)).toBe("BREAKOUT");
    for (const year of [2,3] as const) {
      expect(footballGmProjectedGradeForPlayer(dak,year,eliteSeed)).toBe(89);
      expect(footballGmProjectedGradeForPlayer(penix,year,youngSeed)).toBe(83);
    }
  });

  it("preserves all October 13 official outcomes and isolated owner preview", () => {
    const allen = footballGmPlayerById("BUF|QB|joshallen")!;
    const dart = footballGmPlayerById("NYG|QB|jaxsondart")!;
    expect(footballWeeklyGmScenarioForWeek("2026-10-13","elite").playerId).toBe(allen.id);
    expect(footballWeeklyGmScenarioForWeek("1980-01-29","young").playerId).toBe(dart.id);
    expect(footballGmProjectedGradeForPlayer(allen,2,"weekly-gm:2026-10-13:elite:old:gmdev1")).toBe(allen.currentGrade);
    expect(footballGmProjectedGradeForPlayer(dart,3,"weekly-gm:2026-10-13:young:old:gmdev1")).toBe(dart.currentGrade+4);
    expect(footballGmProjectedGradeForPlayer(dak,1,"solo-run:gmdev1")).toBe(92);
    expect(footballGmProjectedGradeForPlayer(penix,1,"solo-run:gmdev1")).toBe(78);
  });
});
