import { describe, expect, it } from "vitest";
import {
  buildFindLeaderBoard,
  findLeaderCompetitionAudit,
  findLeaderQuestions,
} from "./findLeaderEngine";

const SUPPLEMENTAL_CATEGORY_IDS = new Set([
  "ufc-main-events-all-time",
  "ufc-bonus-awards-all-time",
  "first-round-ufc-finishes-all-time",
  "ufc-knockdowns-landed-all-time",
]);

describe("Find the Leader competitive lineups", () => {
  it("keeps real contenders while avoiding a mechanical next-nine leaderboard", () => {
    const rows = findLeaderCompetitionAudit().filter((row) => row.boardValid);
    const diversified = rows.filter((row) => row.outsideClosestNineCount > 0);

    expect(rows.length).toBeGreaterThanOrEqual(39);
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

  it("applies the same competitive-leader and plausible-decoy protection to supplemental facts", () => {
    const rows = findLeaderCompetitionAudit()
      .filter((row) => SUPPLEMENTAL_CATEGORY_IDS.has(row.definitionId));

    expect(rows).toHaveLength(SUPPLEMENTAL_CATEGORY_IDS.size);
    rows.forEach((row) => {
      expect(row.boardValid, row.definitionId).toBe(true);
      expect(row.nonRecordLeaderAvailable, row.definitionId).toBe(true);
      expect(row.leaderIsGlobalMax, row.definitionId).toBe(false);
      expect(row.nearContenderCount, row.definitionId).toBeGreaterThanOrEqual(4);
    });
  });

  it("preserves deterministic unique-leader boards across the full playable bank", () => {
    const playable = findLeaderQuestions
      .map((definition) => ({
        definition,
        board: buildFindLeaderBoard(definition, `competitive-proof|${definition.id}`, "2026-08-19"),
      }))
      .filter((row) => row.board);

    expect(playable.length).toBeGreaterThanOrEqual(39);
    playable.forEach(({ definition, board }) => {
      const rebuilt = buildFindLeaderBoard(definition, `competitive-proof|${definition.id}`, "2026-08-19");
      expect(rebuilt).toEqual(board);
      expect(board!.candidates).toHaveLength(10);
      expect(new Set(board!.candidates.map((fighter) => fighter.id)).size).toBe(10);
      expect(board!.candidates.filter((fighter) => fighter.value === board!.leaderValue)).toHaveLength(1);
    });
  });
});
