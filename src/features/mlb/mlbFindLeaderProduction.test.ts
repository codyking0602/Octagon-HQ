import { describe, expect, it } from "vitest";
import {
  MLB_FIND_LEADER_PRODUCTION_BOARDS,
  MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS,
  MLB_FIND_LEADER_SECOND_PRODUCTION_CHALLENGE_KEY,
  MLB_FIND_LEADER_SECOND_PRODUCTION_DATE,
  mlbFindLeaderProductionBoards,
} from "./mlbFindLeaderProduction";

describe("MLB Find the Leader production runs", () => {
  it("preserves the original September 27 boards", () => {
    expect(mlbFindLeaderProductionBoards("mlb-2026-play-01", "2026-09-27"))
      .toBe(MLB_FIND_LEADER_PRODUCTION_BOARDS);
    expect(MLB_FIND_LEADER_PRODUCTION_BOARDS).toHaveLength(2);
  });

  it("locks two fresh October 13 boards", () => {
    expect(MLB_FIND_LEADER_SECOND_PRODUCTION_CHALLENGE_KEY).toBe("mlb-2026-play-13");
    expect(MLB_FIND_LEADER_SECOND_PRODUCTION_DATE).toBe("2026-10-13");
    expect(MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS).toHaveLength(2);
    expect(MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS.map((board) => board.id)).toEqual([
      "mlb-2026-play-13-career-hits",
      "mlb-2026-play-13-single-season-stolen-bases",
    ]);
  });

  it("keeps each board at ten unique candidates with one factual leader", () => {
    MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS.forEach((board) => {
      expect(board.candidates).toHaveLength(10);
      expect(new Set(board.candidates.map((candidate) => candidate.id)).size).toBe(10);
      const max = Math.max(...board.candidates.map((candidate) => candidate.value ?? 0));
      expect(board.candidates.filter((candidate) => candidate.value === max)).toHaveLength(1);
    });

    expect(MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS[0]!.candidates[0]).toMatchObject({
      name: "Pete Rose",
      value: 4256,
    });
    expect(MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS[1]!.candidates[0]).toMatchObject({
      name: "Rickey Henderson (1982)",
      value: 130,
    });
  });

  it("keeps the season year visible in every season-based candidate identity", () => {
    const seasonBoard = MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS[1]!;
    expect(seasonBoard.candidates.every((candidate) => /\(\d{4}\)/.test(candidate.name))).toBe(true);
  });

  it("resolves the new slot only on its exact scheduled date", () => {
    expect(mlbFindLeaderProductionBoards("mlb-2026-play-13", "2026-10-13"))
      .toBe(MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS);
    expect(mlbFindLeaderProductionBoards("mlb-2026-play-13", "2026-10-12")).toBeNull();
  });
});
