import { describe, expect, it } from "vitest";
import {
  DIVISION_RESUME_SHARE_MIN,
  categoryBoard,
  divisionOrder,
  divisionRankingReport,
  erasForBoard,
  qualifiedDivisionBoard,
  rankingCategoryOptions,
  rankingEras,
} from "./rankingControls";

function expectDescending(values: number[]) {
  values.slice(1).forEach((value, index) => {
    expect(values[index]).toBeGreaterThanOrEqual(value);
  });
}

describe("ranking control projections", () => {
  it("conserves every calculated men's score across fight-level division allocations", () => {
    expect(divisionRankingReport.passed).toBe(true);
    expect(divisionRankingReport.rows.length).toBeGreaterThan(0);
    expect(divisionRankingReport.conservation).toEqual([]);
    expect(divisionRankingReport.allocationOwner).toBe(
      "canonical fight-level division evidence",
    );
  });

  it("keeps only win-qualified division entries with at least ten percent resume share", () => {
    divisionOrder.forEach((division) => {
      qualifiedDivisionBoard(division).forEach((row) => {
        expect(row.rankEligible).toBe(true);
        expect(row.stats.ufcWins).toBeGreaterThan(0);
        expect(row.resumeSharePct).toBeGreaterThanOrEqual(DIVISION_RESUME_SHARE_MIN);
      });
    });
  });

  it("builds six category boards from calculated values", () => {
    expect(rankingCategoryOptions).toHaveLength(6);
    rankingCategoryOptions.forEach((category) => {
      const board = categoryBoard("men", category.value);
      expect(board).toHaveLength(65);
      expectDescending(board.map((fighter) => fighter[category.value]));
    });
  });

  it("preserves the eight pinned V1 eras and the applicable women's subset", () => {
    expect(rankingEras).toHaveLength(8);
    expect(rankingEras.map((era) => era.id)).toEqual([
      "tournament",
      "survival",
      "zuffa-rebuild",
      "tuf-boom",
      "golden-age",
      "superstar",
      "apex",
      "new-blood",
    ]);
    expect(erasForBoard("women").every((era) => era.startYear >= 2011)).toBe(true);
  });
});
