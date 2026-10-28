import { describe, expect, it } from "vitest";
import { FOOTBALL_GM_PLAYER_POOL, FOOTBALL_GM_ROSTER_SLOTS, type FootballGmRosterEntry } from "./footballGmEngine";
import {
  footballGmMatchDevelopmentSeed,
  footballGmMatchUsesSeededDevelopment,
  footballGmSharedThreeYears,
} from "./footballGmSharedPostseason";
import { FOOTBALL_GM_DEVELOPMENT_SEED_TAG } from "./wheelFootballGmEconomy";

const roster = (): FootballGmRosterEntry[] => {
  const held = new Set<string>();
  return FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
    const player = [...FOOTBALL_GM_PLAYER_POOL]
      .filter((row) => row.eligibleSlots.includes(slot) && !held.has(row.id))
      .sort((a, b) => a.salaryWindow[1] - b.salaryWindow[1])[0]!;
    held.add(player.id);
    return { slot, playerId: player.id, acquired: "draft" as const };
  });
};

describe("seeded development in head-to-head GM", () => {
  it("preserves existing started v10 matches and recognizes new v11 matches", () => {
    const historical = [{ run_state: { version: "football-gm-v10-shared-real-seasons" }, year1_result: null }];
    const modern = [{ run_state: { version: "football-gm-v11-seeded-development" }, year1_result: null }];
    expect(footballGmMatchUsesSeededDevelopment(historical)).toBe(false);
    expect(footballGmMatchUsesSeededDevelopment(modern)).toBe(true);
    expect(footballGmMatchUsesSeededDevelopment([{
      run_state: { roster: [{ playerId: "active" }] },
      year1_result: { finish: "Wild Card" },
    }])).toBe(false);
  });

  it("uses stable distinct player-specific GM seeds in one shared league", () => {
    const matchSeed = "head-to-head-match-2026";
    const a = footballGmMatchDevelopmentSeed(matchSeed, "profile-A", true);
    const b = footballGmMatchDevelopmentSeed(matchSeed, "profile-B", true);
    expect(a).not.toBe(b);
    expect(a.endsWith(FOOTBALL_GM_DEVELOPMENT_SEED_TAG)).toBe(true);
    expect(b.endsWith(FOOTBALL_GM_DEVELOPMENT_SEED_TAG)).toBe(true);
    expect(footballGmMatchDevelopmentSeed(matchSeed, "profile-A", false)).not.toContain(FOOTBALL_GM_DEVELOPMENT_SEED_TAG);

    const core = roster();
    let foundDifferentDevelopment = false;
    for (let i = 0; i < 10; i += 1) {
      const seed = `${matchSeed}-${i}`;
      const sides = [
        { key: "left", yearOneRoster: core, finalRoster: core, developmentSeed: footballGmMatchDevelopmentSeed(seed, "left", true) },
        { key: "right", yearOneRoster: core, finalRoster: core, developmentSeed: footballGmMatchDevelopmentSeed(seed, "right", true) },
      ] as const;
      const result = footballGmSharedThreeYears(seed, sides);
      expect(footballGmSharedThreeYears(seed, sides)).toEqual(result);
      expect(result.left![0]!.teamGrade).toBe(result.right![0]!.teamGrade);
      if (result.left![1]!.rawTeamGrade !== result.right![1]!.rawTeamGrade) foundDifferentDevelopment = true;
    }
    expect(foundDifferentDevelopment).toBe(true);
  });
});
