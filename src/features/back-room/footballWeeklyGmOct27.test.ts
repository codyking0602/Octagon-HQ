import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { FOOTBALL_GM_PLAYER_POOL, footballGmProjectedGradeForPlayer } from "./footballGmEngine";
import {
  OCT27_WEEKLY_GM_PLAYER_IDS,
  oct27WeeklyGmAllows,
  oct27WeeklyGmCandidates,
  oct27WeeklyGmScouting,
} from "./footballWeeklyGmOct27";

describe("Oct 27 Weekly GM choose-your-WR/RB pools", () => {
  it("shows every standard GM scouting badge before the starter is confirmed", () => {
    const page = readFileSync("src/features/back-room/FootballWeeklyGmPage.tsx", "utf8");
    expect(page).toContain("WHAT DO THE SCOUTING BADGES MEAN?");
    expect(page).toContain("scout.tier");
    expect(page).toContain("scout.outlook");
    expect(page).toContain("player.gameContract");
    expect(page).toContain("footballGmRepriceLabel(player.extensionRisk)");
    expect(page).toContain("footballGmMoney(player.salaryApy)");
    expect(page).toContain("no guaranteed result");
  });

  it("uses the exact owner-approved 12 receiver and five running-back choices", () => {
    expect(OCT27_WEEKLY_GM_PLAYER_IDS.elite).toHaveLength(12);
    expect(OCT27_WEEKLY_GM_PLAYER_IDS.young).toHaveLength(5);
    expect(new Set([...OCT27_WEEKLY_GM_PLAYER_IDS.elite, ...OCT27_WEEKLY_GM_PLAYER_IDS.young]).size).toBe(17);
    expect(FOOTBALL_GM_PLAYER_POOL.length).toBeGreaterThan(17);
    expect(OCT27_WEEKLY_GM_PLAYER_IDS.elite).not.toContain("BAL|WR|zayflowers");
    expect(OCT27_WEEKLY_GM_PLAYER_IDS.elite).not.toContain("ATL|WR|drakelondon");
    expect(OCT27_WEEKLY_GM_PLAYER_IDS.elite).not.toContain("NYJ|WR|garrettwilson");
    expect(OCT27_WEEKLY_GM_PLAYER_IDS.young).toContain("SF|RB|christianmccaffrey");
  });

  it("uses current, audited Elite/Impact scout labels, allowing only McCaffrey as Decline Risk", () => {
    for (const scenario of ["elite", "young"] as const) {
      const players = oct27WeeklyGmCandidates(scenario);
      for (const player of players) {
        expect(player.family).toBe(scenario === "elite" ? "WR" : "RB");
        expect(oct27WeeklyGmAllows(scenario, player.id)).toBe(true);
        const { tier, outlook } = oct27WeeklyGmScouting(player);
        expect(["ELITE", "IMPACT"]).toContain(tier);
        if (outlook === "DECLINE RISK") {
          expect(player.id).toBe("SF|RB|christianmccaffrey");
        }
      }
    }
    expect(oct27WeeklyGmScouting(oct27WeeklyGmCandidates("young")[4]!).outlook).toBe("DECLINE RISK");
    expect(oct27WeeklyGmAllows("young", "IND|RB|jonathantaylor")).toBe(false);
    expect(oct27WeeklyGmAllows("elite", "NE|WR|ajbrown")).toBe(false);
  });

  it("retains native contracts and the existing non-guaranteed seeded development engine", () => {
    const choices = [...oct27WeeklyGmCandidates("elite"), ...oct27WeeklyGmCandidates("young")];
    expect(choices.some((p) => p.gameContract === "1YR")).toBe(true);
    expect(choices.some((p) => p.gameContract === "3YR")).toBe(true);
    expect(choices.find((p) => p.name === "Puka Nacua")?.salaryApy).toBe(1_021_245);
    expect(choices.find((p) => p.name === "James Cook III")?.salaryApy).toBe(11_500_000);
    const cmc = choices.find((p) => p.id === "SF|RB|christianmccaffrey")!;
    const results = new Set(Array.from({ length: 40 }, (_, i) =>
      footballGmProjectedGradeForPlayer(cmc, 2, `weekly-gm:2026-10-27:young:simulation-${i}:gmdev1`)));
    expect(results.size).toBeGreaterThan(1);
    expect(footballGmProjectedGradeForPlayer(cmc, 1, "weekly-gm:2026-10-27:young:test:gmdev1"))
      .toBe(cmc.currentGrade);
  });
});
