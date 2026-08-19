import { describe, expect, it } from "vitest";
import {
  buildFindLeaderBoard,
  findLeaderCompetitionAudit,
  findLeaderQuestions,
} from "./findLeaderEngine";

describe("Find the Leader competitive lineups", () => {
  it("keeps real contenders while avoiding a mechanical next-nine leaderboard", () => {
    const rows = findLeaderCompetitionAudit().filter((row) => row.boardValid);
    const diversified = rows.filter((row) => row.outsideClosestNineCount > 0);

    expect(rows.length).toBeGreaterThanOrEqual(35);
    rows.forEach((row) => {
      expect(row.nearContenderCount, row.definitionId).toBeGreaterThanOrEqual(4);
    });
    expect(diversified.length).toBeGreaterThan(rows.length / 2);
  });

  it("keeps the category record holder off the board whenever another valid leader exists", () => {
    const rows = findLeaderCompetitionAudit()
      .filter((row) => row.boardValid && row.nonRecordLeaderAvailable);

    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row.leaderIsGlobalMax, row.definitionId).toBe(false);
    });
  });

  it("preserves deterministic unique-leader boards across the full playable bank", () => {
    const playable = findLeaderQuestions
      .map((definition) => ({
        definition,
        board: buildFindLeaderBoard(definition, `competitive-proof|${definition.id}`, "2026-08-19"),
      }))
      .filter((row) => row.board);

    expect(playable.length).toBeGreaterThanOrEqual(35);
    playable.forEach(({ definition, board }) => {
      const rebuilt = buildFindLeaderBoard(definition, `competitive-proof|${definition.id}`, "2026-08-19");
      expect(rebuilt).toEqual(board);
      expect(board!.candidates).toHaveLength(10);
      expect(new Set(board!.candidates.map((fighter) => fighter.id)).size).toBe(10);
      expect(board!.candidates.filter((fighter) => fighter.value === board!.leaderValue)).toHaveLength(1);
    });
  });
});
