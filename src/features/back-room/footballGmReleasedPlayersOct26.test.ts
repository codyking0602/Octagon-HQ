import { describe, expect, it } from "vitest";
import nflWheel from "../../../data/generated/football/wheel-football-priorities.json";
import contracts from "../../../data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json";
import {
  FOOTBALL_GM_CURRENT_PLAYER_POOL,
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_TEAMS,
  footballGmPlayerById,
  footballGmCandidatesForTeam,
} from "./footballGmEngine";
import { NFL_GM_LONG_BY_ID, nflGmLongTeamCandidates } from "./footballGmLongCatalog";

const released = [
  { team: "CHI", slot: "Secondary", name: "Xavier Woods", family: "Secondary", id: "CHI|Secondary|xavierwoods" },
  { team: "IND", slot: "WR", name: "Darius Slayton", family: "WR", id: "IND|WR|dariusslayton" },
  { team: "NYG", slot: "RB", name: "Najee Harris", family: "RB", id: "NYG|RB|najeeharris" },
] as const;

describe("Oct 2026 NFL verified released-player eligibility, historical identities and GM economics", () => {
  it("preserves all 32 NFL teams, 626 published historical roles, and 623 currently curated Wheel slots", () => {
    expect(Object.keys(nflWheel.teams)).toHaveLength(32);
    for (const { team, slot, name } of released) {
      expect(nflWheel.teams[team][slot]).not.toContain(name);
      expect(nflWheel.teams[team].Flex).not.toContain(name);
    }
    const total = Object.values(nflWheel.teams).reduce((n, team) =>
      n + Object.entries(team).filter(([slot]) => slot !== "Flex")
        .reduce((subtotal, [, players]) => subtotal + players.length, 0), 0);
    expect(total).toBe(623);
    expect(nflWheel.teams.CHI.Secondary).toHaveLength(5);
    expect(nflWheel.teams.IND.WR).toHaveLength(3);
    expect(nflWheel.teams.NYG.RB).toHaveLength(1);
  });
  it("retains 594 original GM records and grades, but excludes exactly three departures from new drafts", () => {
    expect(FOOTBALL_GM_TEAMS).toHaveLength(32);
    expect(contracts.players).toHaveLength(594);
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
    expect(FOOTBALL_GM_CURRENT_PLAYER_POOL).toHaveLength(591);
    const savedIds = new Set(FOOTBALL_GM_PLAYER_POOL.map(player => player.id));
    expect(savedIds.size).toBe(594);
    for (const { team, name, family, id } of released) {
      const contract = contracts.players.find(x => x.team === team && x.player === name && x.family === family);
      expect(contract?.currentRosterEligible).toBe(false);
      const historical = footballGmPlayerById(id);
      expect(historical).toBeDefined();
      expect(historical?.team).toBe(team);
      expect(historical?.currentRosterEligible).toBe(false);
      expect(FOOTBALL_GM_CURRENT_PLAYER_POOL.some(player => player.id === id)).toBe(false);
      // Historical three-year GM and long-mode saves still resolve the exact original identity.
      expect(NFL_GM_LONG_BY_ID.get(id)?.team).toBe(team);
      expect(footballGmCandidatesForTeam({ team, roster: [] }).some(({ player }) => player.id === id)).toBe(false);
      expect(nflGmLongTeamCandidates(team, []).some(({ player }) => player.id === id)).toBe(false);
    }
  });
  it("retains each old salary and ability grade rather than cancelling a saved-season contract", () => {
    expect(footballGmPlayerById("CHI|Secondary|xavierwoods")).toEqual(
      expect.objectContaining({ currentGrade: 80, salaryApy: 1350000, gameContract: "1YR" }));
    expect(footballGmPlayerById("IND|WR|dariusslayton")).toEqual(
      expect.objectContaining({ currentGrade: 81, salaryApy: 1300000, gameContract: "1YR" }));
    expect(footballGmPlayerById("NYG|RB|najeeharris")).toEqual(
      expect.objectContaining({ currentGrade: 80, salaryApy: 1215000, gameContract: "1YR" }));
  });
});
