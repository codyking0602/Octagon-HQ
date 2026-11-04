import { describe, expect, it } from "vitest";
import expansion from "../../../data/curated/football/gm-nfl-approved-43-2026-11-03.json";
import { FOOTBALL_GM_PLAYER_POOL, FOOTBALL_GM_CURRENT_PLAYER_POOL, footballGmPlayerById } from "./footballGmEngine";
import { FOOTBALL_GM_DEVELOPMENT_PROFILE_COUNT, footballGmDevelopmentProfile } from "./wheelFootballGmEconomy";
import { footballGmActualRole, footballGmRoleMultiplier } from "./footballGmPositionalValue";

describe("Nov 2026 approved NFL GM 43-player expansion", () => {
  it("adds exactly 43 current players without changing the original 594 identities", () => {
    expect(expansion.players).toHaveLength(43);
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(637);
    expect(FOOTBALL_GM_CURRENT_PLAYER_POOL).toHaveLength(634);
    expect(FOOTBALL_GM_DEVELOPMENT_PROFILE_COUNT).toBe(637);
    const ids = new Set(FOOTBALL_GM_PLAYER_POOL.map((p) => p.id));
    expect(ids.size).toBe(FOOTBALL_GM_PLAYER_POOL.length);
    for (const row of expansion.players) {
      const player = footballGmPlayerById(row.development.id);
      expect(player?.name).toBe(row.player);
      expect(player?.team).toBe(row.team);
      expect(player?.currentGrade).toBe(row.grade);
      expect(player?.salaryApy).toBe(row.salaryApy);
      expect(player?.gameContract).toBe(row.gameContract);
      expect(player?.eligibleSlots).toEqual(row.family === "Front Seven" ? ["DL", "LB"] : row.gmEligibleSlots);
      expect(player?.currentRosterEligible).toBe(true);
      expect(footballGmDevelopmentProfile(row.development.id)).toEqual(row.development);
      expect(row.development.breakoutPct + row.development.improvePct + row.development.declinePct).toBeLessThanOrEqual(100);
      expect(row.source.otcId).toBeGreaterThan(0);
      expect(row.salaryApy).toBeGreaterThan(0);
      expect(row.realContractEndSeason >= 2028 ? row.gameContract : "1YR").toBe(row.gameContract);
    }
  });

  it("retains actual FB identities and role-sensitive FLEX values", () => {
    for (const name of ["Kyle Juszczyk", "Patrick Ricard", "Reggie Gilliam"]) {
      const player = FOOTBALL_GM_PLAYER_POOL.find((p) => p.name === name)!;
      expect(player.position).toBe("FB");
      expect(player.family).toBe("TE");
      expect(player.eligibleSlots).toEqual(["FLEX"]);
      expect(footballGmActualRole(player)).toBe("FB");
      expect(footballGmRoleMultiplier(player, "FLEX")).toBe(0.98);
    }
    expect(footballGmActualRole(FOOTBALL_GM_PLAYER_POOL.find(p=>p.name === "Travis Kelce")!)).toBe("TE");
  });

  it("includes approved Barron and never assigns 2027+ void accounting years as a locked deal", () => {
    const barron = FOOTBALL_GM_PLAYER_POOL.find((p) => p.name === "Jahdae Barron");
    expect(barron?.team).toBe("DEN");
    expect(barron?.currentGrade).toBe(80);
    expect(barron?.gameContract).toBe("3YR");
    for (const name of ["Von Miller", "Kyle Juszczyk", "Dorance Armstrong"]) {
      expect(FOOTBALL_GM_PLAYER_POOL.find((p) => p.name === name)?.gameContract).toBe("1YR");
    }
  });
});
