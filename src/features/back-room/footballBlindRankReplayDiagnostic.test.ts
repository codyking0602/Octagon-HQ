import { describe, expect, it } from "vitest";
import { buildFootballBlindRankBoard } from "./footballComparisonGeneration";
import { footballRankFivePacks } from "./footballRankFiveModel";

const RUNS_PER_PACK = 384;

describe("Football Blind Rank replay diagnostics", () => {
  it("prints per-pack signature uniqueness for the PR10 seed set", () => {
    const rows = footballRankFivePacks.map((pack) => {
      const signatures = new Set<string>();

      for (let index = 0; index < RUNS_PER_PACK; index += 1) {
        const board = buildFootballBlindRankBoard(
          pack.items,
          pack.id,
          `pr10-rank-${pack.id}-${index}`,
        );
        signatures.add([...board.items.map((item) => item.id)].sort().join("|"));
      }

      return {
        packId: pack.id,
        poolSize: pack.items.length,
        uniqueBoards: signatures.size,
        duplicateBoards: RUNS_PER_PACK - signatures.size,
        uniqueShare: signatures.size / RUNS_PER_PACK,
      };
    });

    console.info("BLIND_RANK_PER_PACK_REPLAY", JSON.stringify(rows));
    expect(rows).toHaveLength(footballRankFivePacks.length);
  });
});
