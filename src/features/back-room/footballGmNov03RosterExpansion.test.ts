import { describe, expect, it } from "vitest";
import expansion from "../../../data/curated/football/nfl/gm-nfl-roster-expansion-2026-11-03.json";
import verified from "../../../data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json";
import {
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_CURRENT_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  FOOTBALL_GM_TEAMS,
  footballGmPlayerById,
  footballGmCandidatesForTeam,
} from "./footballGmEngine";
import {
  FOOTBALL_GM_DEVELOPMENT_PROFILE_COUNT,
  footballGmDevelopmentProfile,
  footballGmDevelopmentOdds,
} from "./wheelFootballGmEconomy";

describe("Nov 3 owner-approved 43-person NFL GM roster expansion", () => {
  it("retains all 594 original IDs and seven roster slots while adding 43 identities", () => {
    expect(verified.players).toHaveLength(594);
    expect(expansion.players).toHaveLength(43);
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(637);
    expect(FOOTBALL_GM_CURRENT_PLAYER_POOL).toHaveLength(634);
    expect(FOOTBALL_GM_DEVELOPMENT_PROFILE_COUNT).toBe(637);
    expect(FOOTBALL_GM_TEAMS).toHaveLength(32);
    expect(FOOTBALL_GM_ROSTER_SLOTS).toEqual(["QB", "RB", "WR", "FLEX", "DL", "LB", "DB"]);
    expect(new Set(FOOTBALL_GM_PLAYER_POOL.map(player => player.id)).size).toBe(637);
    for (const row of verified.players) {
      const historical = FOOTBALL_GM_PLAYER_POOL.find(p =>
        p.team === row.team && p.family === row.family && p.name === row.player);
      expect(historical, row.player).toBeDefined();
      expect(historical?.salaryApy).toBe(row.salaryApy);
      expect(historical?.gameContract).toBe(row.gameContract);
    }
  });

  it("uses individually authored grades, real contract APYs, and specific development on all 43", () => {
    for (const row of expansion.players) {
      const player = footballGmPlayerById(row.development.id)!;
      expect(player?.name).toBe(row.player);
      expect(player?.team).toBe(row.team);
      expect(player?.currentGrade).toBe(row.grade);
      expect(player?.salaryApy).toBe(row.salaryApy);
      expect(player?.gameContract).toBe(row.realContractEndSeason >= 2028 ? "3YR" : "1YR");
      expect(player?.age).toBe(row.age);
      expect(player?.position).toBe(row.position);
      expect(player?.currentRosterEligible).toBe(true);
      expect(row.source.playerPage).toMatch(/^https:\/\/overthecap\.com\//);
      expect(row.gradeRationale.length).toBeGreaterThan(45);
      const profile = footballGmDevelopmentProfile(player.id);
      expect(profile).toEqual(row.development);
      const odds = footballGmDevelopmentOdds({
        playerId: player.id, step: 0, grade: player.currentGrade,
        originalGrade: player.currentGrade, age: player.age, position: player.marketPosition,
      })!;
      expect(odds.breakoutPct + odds.improvePct + odds.steadyPct + odds.declinePct).toBe(100);
      expect(row.development.maxAnnualGain).toBeGreaterThan(0);
      expect(row.development.maxAnnualLoss).toBeGreaterThan(0);
      expect(footballGmCandidatesForTeam({ team: row.team, roster: [] })
        .some(({ player: choice }) => choice.id === player.id), row.player).toBe(true);
    }
  });

  it("keeps real fullback labels and permits only the existing FLEX position", () => {
    expect(expansion.players.filter(p => p.position === "FB").map(p => p.player).sort())
      .toEqual(["Kyle Juszczyk", "Patrick Ricard", "Reggie Gilliam"]);
    for (const name of ["Kyle Juszczyk", "Patrick Ricard", "Reggie Gilliam"]) {
      const player = FOOTBALL_GM_CURRENT_PLAYER_POOL.find(p => p.name === name)!;
      expect(player.position).toBe("FB");
      expect(player.family).toBe("TE");
      expect(player.eligibleSlots).toEqual(["FLEX"]);
      expect(footballGmCandidatesForTeam({ team: player.team, roster: [] })
        .find(candidate => candidate.player.id === player.id)?.legalSlots).toEqual(["FLEX"]);
    }
  });

  it("includes Barron and six signed veterans but excludes retired or unsigned players", () => {
    expect(FOOTBALL_GM_CURRENT_PLAYER_POOL.find(p => p.name === "Jahdae Barron")).toMatchObject({
      team: "DEN", currentGrade: 80, position: "CB", gameContract: "3YR",
    });
    for (const name of ["Kenny Moore II", "Darren Waller", "DaQuan Jones", "Von Miller", "Kyle Van Noy", "Brandin Cooks"]) {
      expect(FOOTBALL_GM_CURRENT_PLAYER_POOL.some(p => p.name === name), name).toBe(true);
    }
    for (const name of ["Lavonte David", "Nick Chubb", "Bobby Wagner", "Tyreek Hill", "Joe Mixon", "Joey Bosa"]) {
      expect(FOOTBALL_GM_CURRENT_PLAYER_POOL.some(p => p.name === name), name).toBe(false);
    }
    expect(footballGmPlayerById("DAL|Secondary|calebdowns")?.currentGrade).toBe(81);
    expect(footballGmPlayerById("SEA|Secondary|nickemmanwori")?.currentGrade).toBe(86);
    expect(footballGmPlayerById("NYJ|Front Seven|tvondresweat")?.currentGrade).toBe(85);
  });
});
