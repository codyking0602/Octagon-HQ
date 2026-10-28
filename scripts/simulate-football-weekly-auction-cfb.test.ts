import { describe, expect, it } from "vitest";
import {
  WEEKLY_AUCTION_ELITE_GRADE,
  WEEKLY_AUCTION_MAX_ELITES,
  WEEKLY_AUCTION_MIN_ELITES,
  generateWeeklyAuctionBoard,
  loadWeeklyAuctionPool,
  validateWeeklyAuctionBoard,
} from "./simulate-football-weekly-auction-cfb.mjs";

describe("Football Weekly Auction CFB board generator", () => {
  it("loads the locked 233-team calibrated universe", () => {
    const pool = loadWeeklyAuctionPool();
    expect(pool).toHaveLength(233);
    expect(pool.filter((entry) => entry.origin === "approved_anchor")).toHaveLength(132);
    expect(pool.filter((entry) => entry.origin === "audited_expansion")).toHaveLength(101);
  });

  it("generates seven hidden daily boards with 21 unique schools", () => {
    const pool = loadWeeklyAuctionPool();

    for (let seed = 1; seed <= 250; seed += 1) {
      const board = generateWeeklyAuctionBoard(pool, seed);
      expect(validateWeeklyAuctionBoard(board)).toEqual([]);

      const teams = board.days.flatMap((day) => day.teams);
      expect(board.days).toHaveLength(7);
      expect(teams).toHaveLength(21);
      expect(new Set(teams.map((team) => team.school)).size).toBe(21);
      expect(new Set(teams.map((team) => team.season_reference)).size).toBe(21);

      const eliteCount = teams.filter((team) => team.hidden_grade >= WEEKLY_AUCTION_ELITE_GRADE).length;
      expect(eliteCount).toBeGreaterThanOrEqual(WEEKLY_AUCTION_MIN_ELITES);
      expect(eliteCount).toBeLessThanOrEqual(WEEKLY_AUCTION_MAX_ELITES);
    }
  });

  it("keeps the locked weekly conference-theme mix while randomizing order", () => {
    const pool = loadWeeklyAuctionPool();
    const orders = new Set<string>();

    for (let seed = 1; seed <= 100; seed += 1) {
      const board = generateWeeklyAuctionBoard(pool, seed);
      const counts = board.days.reduce<Record<string, number>>((acc, day) => {
        acc[day.theme] = (acc[day.theme] ?? 0) + 1;
        return acc;
      }, {});

      expect(counts).toEqual({
        SEC: 2,
        "Big Ten": 2,
        "Big 12": 1,
        ACC: 1,
        Wildcard: 1,
      });
      orders.add(board.days.map((day) => day.theme).join("|"));
    }

    expect(orders.size).toBeGreaterThan(50);
  });

  it("never exposes a fixed hidden-shape sequence", () => {
    const pool = loadWeeklyAuctionPool();
    const sequences = new Set<string>();

    for (let seed = 1; seed <= 200; seed += 1) {
      const board = generateWeeklyAuctionBoard(pool, seed);
      sequences.add(board.days.map((day) => day.shape).join("|"));

      let run = 1;
      for (let index = 1; index < board.days.length; index += 1) {
        if (board.days[index].shape === board.days[index - 1].shape) run += 1;
        else run = 1;
        expect(run).toBeLessThanOrEqual(2);
      }
    }

    expect(sequences.size).toBeGreaterThan(150);
  });
});
