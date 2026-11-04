import { describe, expect, it } from "vitest";
import additions from "../../../data/curated/football/gm-nfl-roster-additions-2026-11-03.json";
import { contractsArtifact } from "./wheelFootballNflCurrentAuthority";
import {
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_CURRENT_PLAYER_POOL,
  footballGmCandidatesForTeam,
  footballGmPlayerById,
} from "./footballGmEngine";
import { footballGmDevelopmentProfile, FOOTBALL_GM_DEVELOPMENT_PROFILE_COUNT } from "./wheelFootballGmEconomy";
import { footballGmActualRole, footballGmRoleMultiplier } from "./footballGmPositionalValue";

describe("owner-reviewed 43 NFL GM roster additions", () => {
  it("preserves the 594 historical players and appends 43 fully bound identities", () => {
    expect(contractsArtifact.players).toHaveLength(594);
    expect(additions.players).toHaveLength(43);
    expect(additions.developmentProfiles).toHaveLength(43);
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(637);
    expect(FOOTBALL_GM_CURRENT_PLAYER_POOL).toHaveLength(637);
    expect(FOOTBALL_GM_DEVELOPMENT_PROFILE_COUNT).toBe(637);
    expect(FOOTBALL_GM_PLAYER_POOL.slice(0, 594).map(player => player.name))
      .toEqual(contractsArtifact.players.map(contract => contract.player));
    expect(new Set(FOOTBALL_GM_PLAYER_POOL.map(player => player.id)).size).toBe(637);
  });

  it("binds each approved grade, OTC salary, team, playing term and development profile", () => {
    for (const row of additions.players) {
      const id = `${row.team}|${row.family}|${row.normalizedName}`;
      const actual = footballGmPlayerById(id);
      expect(actual, id).not.toBeNull();
      expect(actual!.name).toBe(row.player);
      expect(actual!.team).toBe(row.team);
      expect(actual!.position).toBe(row.position);
      expect(actual!.currentGrade).toBe(row.hqGrade);
      expect(actual!.salaryApy).toBe(row.salaryApy);
      expect(actual!.gameContract).toBe(row.realContractEndSeason >= 2028 ? "3YR" : "1YR");
      expect(actual!.currentRosterEligible).toBe(true);
      expect(row.dateOfBirth).toHaveLength(10);
      expect(row.source.provider).toBe("OverTheCap");
      expect(row.source.playerPage.startsWith("https://overthecap.com/player/")).toBe(true);
      expect(row.salaryApy).toBeGreaterThan(0);

      const profile = footballGmDevelopmentProfile(id);
      expect(profile?.name).toBe(row.player);
      expect(profile?.gradeAtCalibration).toBe(row.hqGrade);
      expect(profile?.calibration).toBe("individual-review");
      expect(profile!.breakoutPct + profile!.improvePct + profile!.declinePct)
        .toBeLessThanOrEqual(100);
      expect(profile!.maxAnnualGain).toBeGreaterThan(0);
      expect(profile!.maxAnnualLoss).toBeGreaterThan(0);
      expect(profile!.marketVariancePct).toBeGreaterThan(0);
    }
  });

  it("keeps fullbacks labeled FB and eligible only in the familiar FLEX draft slot", () => {
    const fullbacks = additions.players.filter(row => row.position === "FB");
    expect(fullbacks.map(row => row.player).sort())
      .toEqual(["Kyle Juszczyk", "Patrick Ricard", "Reggie Gilliam"]);
    for (const contract of fullbacks) {
      const player = footballGmPlayerById(
        `${contract.team}|${contract.family}|${contract.normalizedName}`
      )!;
      expect(player.family).toBe("TE");
      expect(player.eligibleSlots).toEqual(["FLEX"]);
      expect(footballGmActualRole(player)).toBe("FB");
      expect(footballGmRoleMultiplier(player, "FLEX")).toBe(0.95);
      const options = footballGmCandidatesForTeam({ team: player.team, roster: [] });
      expect(options.find(candidate => candidate.player.id === player.id)?.legalSlots)
        .toContain("FLEX");
    }
  });

  it("includes Jahdae Barron as a Broncos DB without disturbing existing Broncos", () => {
    const barron = FOOTBALL_GM_CURRENT_PLAYER_POOL.find(
      player => player.name === "Jahdae Barron"
    );
    expect(barron).toMatchObject({
      team: "DEN", family: "Secondary", position: "CB",
      currentGrade: 80, eligibleSlots: ["DB"],
      age: 25, gameContract: "3YR",
    });
    expect(footballGmCandidatesForTeam({ team: "DEN", roster: [] })
      .some(candidate => candidate.player.id === barron?.id)).toBe(true);
  });
});
