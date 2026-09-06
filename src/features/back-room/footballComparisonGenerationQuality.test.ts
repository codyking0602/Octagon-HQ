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
      ...Array.from({ length: 4 }, (_, index) => item(`elite-${index}`, 95)),
      ...Array.from({ length: 4 }, (_, index) => item(`great-${index}`, 85)),
      ...Array.from({ length: 4 }, (_, index) => item(`good-${index}`, 75)),
      ...Array.from({ length: 4 }, (_, index) => item(`average-${index}`, 65)),
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
    const sameTierBoard = Array.from({ length: 8 }, (_, index) => item(`same-tier-${index}`, 95));
    const healthyPool = [
      ...sameTierBoard,
      ...Array.from({ length: 8 }, (_, index) => item(`other-tier-${index}`, 65)),
    ];

    expect(footballKeepCutBoardIsCompetitive(sameTierBoard, healthyPool)).toBe(false);
    expect(buildFootballKeepCutBoard(healthyPool, "healthy-keep", "healthy-seed").items).toHaveLength(8);
  });

  it("relaxes inside the same generator for a genuinely single-tier sparse pool", () => {
    const sparsePool = Array.from({ length: 8 }, (_, index) => item(`sparse-average-${index}`, 65));

    expect(footballKeepCutBoardIsCompetitive(sparsePool, sparsePool)).toBe(true);
    const board = buildFootballKeepCutBoard(sparsePool, "sparse-proof", "sparse-seed");
    expect(board.items).toHaveLength(8);
    expect(new Set(board.items.map((row) => row.id)).size).toBe(8);
  });
});
