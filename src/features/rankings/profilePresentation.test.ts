import { describe, expect, it } from "vitest";
import { categoryBoard } from "./rankingControls";
import { getFighter } from "./rankingModel";
import { profileCategoryRows } from "./profilePresentation";

describe("profile category board reuse", () => {
  it("keeps repeated men and women profile rows aligned with the canonical category boards", () => {
    for (const slug of ["jon-jones", "matt-hughes", "amanda-nunes", "rose-namajunas"]) {
      const fighter = getFighter(slug)!;
      const gender = fighter.board === "women" ? "women" : "men";

      for (const row of profileCategoryRows(fighter)) {
        const board = categoryBoard(gender, row.key);
        expect(row.rank).toBe(board.findIndex((candidate) => candidate.slug === fighter.slug) + 1);
        expect(row.boardSize).toBe(board.length);
      }
    }
  });
});
