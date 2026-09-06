import { describe, expect, it } from "vitest";
import {
  buildFootballBlindRankBoard,
  buildFootballKeepCutBoard,
  footballKeepCutBoardIsCompetitive,
} from "./footballComparisonGeneration";
import { footballGreatnessTierForItem } from "./footballGreatnessTier";
import type { FootballRankFiveItem } from "./footballRankFiveModel";

function item(id: string, rating: number): FootballRankFiveItem {
  return { id, name: id, subtitle: id, league: "NFL", rating };
}

describe("Football comparison board tier quality", () => {
  it("caps healthy Blind Rank tier clumps without using hidden rating separation", () => {
    const pool = [
      ...[100, 98, 96, 94].map((rating, index) => item(`elite-${index}`, rating)),
      ...[91, 89, 87, 85].map((rating, index) => item(`great-${index}`, rating)),
      ...[81, 78, 75, 73].map((rating, index) => item(`good-${index}`, rating)),
      ...[69, 66, 63, 60].map((rating, index) => item(`average-${index}`, rating)),
    ];

    for (let index = 0; index < 48; index += 1) {
      const board = buildFootballBlindRankBoard(pool, "tier-cap", `seed-${index}`);
      const counts = new Map<string, number>();
      for (const row of board.items) {
        const tier = footballGreatnessTierForItem(row);
        counts.set(tier, (counts.get(tier) ?? 0) + 1);
      }
      expect(Math.max(...counts.values())).toBeLessThanOrEqual(2);
    }
  });

  it("rejects an all-one-tier Keep/Cut texture when a healthy multi-tier pool exists", () => {
    const pool = [
      ...[100, 98, 96, 94, 92, 92, 91, 90].map((rating, index) => item(`elite-${index}`, rating)),
      ...[89, 87, 85, 83, 82, 81, 80, 79].map((rating, index) => item(`great-${index}`, rating)),
    ];
    expect(footballKeepCutBoardIsCompetitive(pool.slice(0, 8), pool)).toBe(false);
    expect(buildFootballKeepCutBoard(pool, "healthy-keep", "healthy-seed").items).toHaveLength(8);
  });

  it("relaxes inside the same generator for a genuinely single-tier sparse pool", () => {
    const sparsePool = [69, 68, 67, 66, 65, 64, 63, 62]
      .map((rating, index) => item(`sparse-average-${index}`, rating));

    expect(footballKeepCutBoardIsCompetitive(sparsePool, sparsePool)).toBe(true);
    const board = buildFootballKeepCutBoard(sparsePool, "sparse-proof", "sparse-seed");
    expect(board.items).toHaveLength(8);
    expect(new Set(board.items.map((row) => row.id)).size).toBe(8);
  });
});
