import { describe, expect, it } from "vitest";
import {
  NFL_TEAM_SEASON_THEME_WEEKLY_CAPS,
  generateNflTeamSeasonThemedWeek,
  loadNflTeamSeasonAuctionPool,
  revealNflTeamSeasonAuctionDay,
  validateNflTeamSeasonThemedWeek,
} from "./simulate-football-weekly-auction-nfl-team-seasons.mjs";

describe("Football Weekly Auction NFL team-season themed generator", () => {
  it("loads the locked 200-team auction authority", () => {
    const pool = loadNflTeamSeasonAuctionPool();
    expect(pool).toHaveLength(200);
    expect(new Set(pool.map((item) => item.item_reference)).size).toBe(200);
  });

  it("builds six four-card normal days without repeating a team-season", () => {
    const pool = loadNflTeamSeasonAuctionPool();

    for (let seed = 1; seed <= 500; seed += 1) {
      const board = generateNflTeamSeasonThemedWeek(pool, seed);
      expect(validateNflTeamSeasonThemedWeek(board)).toEqual([]);
      expect(board.days).toHaveLength(6);

      const teams = board.days.flatMap((day) => day.teams);
      expect(teams).toHaveLength(24);
      expect(new Set(teams.map((team) => team.item_reference)).size).toBe(24);
      expect(teams.every((team) => Number.isInteger(team.season_year))).toBe(true);

      const familyCounts = board.days.reduce<Record<string, number>>((counts, day) => {
        counts[day.family] = (counts[day.family] ?? 0) + 1;
        return counts;
      }, {});
      for (const [family, count] of Object.entries(familyCounts)) {
        expect(count).toBeLessThanOrEqual(
          NFL_TEAM_SEASON_THEME_WEEKLY_CAPS[
            family as keyof typeof NFL_TEAM_SEASON_THEME_WEEKLY_CAPS
          ],
        );
      }
    }
  });

  it("keeps the theme schedule varied instead of exposing a fixed weekly sequence", () => {
    const pool = loadNflTeamSeasonAuctionPool();
    const familySequences = new Set<string>();
    const publicThemes = new Set<string>();

    for (let seed = 1; seed <= 400; seed += 1) {
      const board = generateNflTeamSeasonThemedWeek(pool, seed);
      familySequences.add(board.days.map((day) => day.family).join("|"));
      for (const day of board.days) publicThemes.add(day.theme);
    }

    expect(familySequences.size).toBeGreaterThan(250);
    expect(publicThemes.size).toBeGreaterThan(45);
  });

  it("uses theme eligibility without a hidden grade-shape field", () => {
    const pool = loadNflTeamSeasonAuctionPool();
    let minimumSeen = Number.POSITIVE_INFINITY;
    let maximumSeen = Number.NEGATIVE_INFINITY;

    for (let seed = 1; seed <= 250; seed += 1) {
      const board = generateNflTeamSeasonThemedWeek(pool, seed);
      for (const day of board.days) {
        expect(day).not.toHaveProperty("shape");
        for (const team of day.teams) {
          minimumSeen = Math.min(minimumSeen, team.hidden_grade);
          maximumSeen = Math.max(maximumSeen, team.hidden_grade);
        }
      }
    }

    expect(minimumSeen).toBeLessThanOrEqual(79);
    expect(maximumSeen).toBeGreaterThanOrEqual(98);
  });

  it("reveals only the current day's public cards and keeps future themes plus grades server-owned", () => {
    const pool = loadNflTeamSeasonAuctionPool();
    const board = generateNflTeamSeasonThemedWeek(pool, 20261002);
    const revealed = revealNflTeamSeasonAuctionDay(board, 3);

    expect(revealed.day_number).toBe(3);
    expect(revealed.teams).toHaveLength(4);
    expect(revealed).not.toHaveProperty("days");

    for (const team of revealed.teams) {
      expect(team).toHaveProperty("season_year");
      expect(team).toHaveProperty("display_label");
      expect(team).not.toHaveProperty("hidden_grade");
      expect(team).not.toHaveProperty("provisional_grade");
    }

    const serialized = JSON.stringify(revealed);
    for (const futureDay of board.days.filter((day) => day.day_number !== 3)) {
      expect(serialized).not.toContain(futureDay.theme);
    }
  });
});
