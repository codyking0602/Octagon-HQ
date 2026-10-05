import { describe, expect, it } from "vitest";
import { WHEEL_FOOTBALL_GM_CAP, WHEEL_FOOTBALL_GM_ROSTER_SLOTS } from "./wheelFootballGmEconomy";
import {
  wheelFootballGmCandidatesForTeam,
  wheelFootballGmEligibleTeamCodes,
  wheelFootballGmOpenSlots,
  wheelFootballGmPlayerById,
  wheelFootballGmPlayers,
  wheelFootballGmPlayersForTeam,
  wheelFootballGmRosterSpend,
} from "./wheelFootballGmRuntime";

describe("Wheel Football GM playtest runtime", () => {
  it("loads the complete calibrated NFL contract population", () => {
    expect(wheelFootballGmPlayers).toHaveLength(594);
    expect(new Set(wheelFootballGmPlayers.map((player) => player.team)).size).toBe(32);
    expect(wheelFootballGmPlayers.every((player) => player.currentGrade >= 70)).toBe(true);
  });

  it("keeps roster construction to the seven locked GM slots", () => {
    expect(WHEEL_FOOTBALL_GM_ROSTER_SLOTS).toEqual(["QB", "RB", "WR", "FLEX", "DL", "LB", "DB"]);
    expect(wheelFootballGmOpenSlots([])).toEqual(WHEEL_FOOTBALL_GM_ROSTER_SLOTS);
  });

  it("uses the calibrated year-two price for one-year contracts", () => {
    const puka = wheelFootballGmPlayers.find((player) => player.player === "Puka Nacua");
    expect(puka).toBeTruthy();
    expect(puka!.gameContract).toBe("1YR");
    expect(puka!.salaryWindow[0]).toBe(1_021_245);
    expect(puka!.salaryWindow[1]).toBe(41_000_000);
    expect(puka!.salaryWindow[2]).toBe(41_000_000);
  });

  it("removes teams and players that cannot fit the remaining cap", () => {
    const teamCodes = [...new Set(wheelFootballGmPlayers.map((player) => player.team))];
    const none = wheelFootballGmEligibleTeamCodes({
      teamCodes,
      openSlots: ["QB"],
      year: 1,
      remainingCap: 0,
      usedPlayerKeys: new Set(),
    });
    expect(none).toEqual([]);

    const affordable = wheelFootballGmEligibleTeamCodes({
      teamCodes,
      openSlots: ["QB"],
      year: 1,
      remainingCap: WHEEL_FOOTBALL_GM_CAP,
      usedPlayerKeys: new Set(),
    });
    expect(affordable.length).toBeGreaterThan(20);
  });

  it("prevents the same player identity from being used twice across multi-role rows", () => {
    const hunter = wheelFootballGmPlayers.find((player) => player.player === "Travis Hunter" && player.family === "WR");
    expect(hunter).toBeTruthy();
    const used = new Set([hunter!.playerKey]);
    const candidates = wheelFootballGmCandidatesForTeam({
      teamCode: hunter!.team,
      slot: "DB",
      openSlots: ["DB"],
      year: 1,
      remainingCap: WHEEL_FOOTBALL_GM_CAP,
      usedPlayerKeys: used,
    });
    expect(candidates.some((player) => player.player === "Travis Hunter")).toBe(false);
  });

  it("can price a completed roster deterministically", () => {
    const picks = WHEEL_FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
      const player = wheelFootballGmPlayers.find((candidate) => candidate.gmEligibleSlots.includes(slot))!;
      return { slot, playerId: player.id, acquiredYear: 1 as const };
    });
    expect(wheelFootballGmRosterSpend(picks, 1)).toBeGreaterThan(0);
    expect(picks.every((pick) => wheelFootballGmPlayerById.has(pick.playerId))).toBe(true);
  });

  it("keeps team contract rows available for the existing Wheel clubs", () => {
    expect(wheelFootballGmPlayersForTeam("DAL").length).toBeGreaterThan(10);
    expect(wheelFootballGmPlayersForTeam("KC").length).toBeGreaterThan(10);
  });
});
