import priorities from "../../../data/generated/football/wheel-football-priorities.json";
import contracts from "../../../data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json";
import { describe, expect, it } from "vitest";

describe("NFL Wheel Flex parent integrity - October 26 current rosters", () => {
  it("keeps all 32 clubs, 623 current non-Flex entries and 594 original GM identities", () => {
    const teams = Object.values(priorities.teams);
    expect(teams).toHaveLength(32);
    const nonFlex = teams.reduce((count, team) => count +
      Object.entries(team).filter(([slot]) => slot !== "Flex")
        .reduce((sum, [, names]) => sum + names.length, 0), 0);
    expect(nonFlex).toBe(623);
    expect(contracts.players).toHaveLength(594);
    const gmKeys = contracts.players.map((p) => `${p.team}|${p.family}|${p.normalizedName}`);
    expect(new Set(gmKeys).size).toBe(594);
  });

  it("every NFL Flex athlete has an RB, WR or TE parent on the same club", () => {
    for (const [teamCode, team] of Object.entries(priorities.teams)) {
      const parents = new Set([...team.RB, ...team.WR, ...team.TE]);
      expect(team.Flex, teamCode).toHaveLength(4);
      for (const name of team.Flex) {
        expect(parents.has(name), `${teamCode} Flex orphan: ${name}`).toBe(true);
      }
    }
  });

  it("replaces only invalid Flex-only Waller/Gesicki with existing current roster parents", () => {
    // Current official Panthers and Bengals TE rosters establish positions,
    // but neither Flex-only player has a curated GM/grade-authority parent.
    expect(priorities.teams.CAR.Flex).toEqual([
      "Chuba Hubbard", "Tetairoa McMillan", "Jalen Coker", "Xavier Legette"
    ]);
    expect(priorities.teams.CIN.Flex).toEqual([
      "Chase Brown", "Ja'Marr Chase", "Tee Higgins", "Drew Sample"
    ]);
    expect(priorities.teams.CAR.TE).not.toContain("Darren Waller");
    expect(priorities.teams.CIN.TE).not.toContain("Mike Gesicki");
  });
});
