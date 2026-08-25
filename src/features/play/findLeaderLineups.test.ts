import { beforeEach, describe, expect, it } from "vitest";
import { findLeaderQuestions } from "./findLeaderEngine";
import {
  buildReplayableFindLeaderBoard,
  createReplayableFindLeaderRun,
  resolveSeededFindLeaderBoard,
} from "./findLeaderLineups";
import { loadLineupHistory } from "./lineupModel";

beforeEach(() => {
  window.localStorage.clear();
});

function fighterSignature(ids: readonly string[]) {
  return [...ids].sort().join("|");
}

describe("Find the Leader lineup modes", () => {
  it("builds one deterministic valid board from a replay seed", () => {
    const first = buildReplayableFindLeaderBoard("casual-proof", "2026-07-29");
    const second = buildReplayableFindLeaderBoard("casual-proof", "2026-07-29");

    expect(second).toEqual(first);
    expect(first.candidates).toHaveLength(10);
    expect(new Set(first.candidates.map((fighter) => fighter.id)).size).toBe(10);
    expect(first.candidates.some((fighter) => fighter.id === first.leaderId)).toBe(true);
  });

  it("can rebuild the exact category and lineup for a shared challenge", () => {
    const board = buildReplayableFindLeaderBoard("shared-proof", "2026-07-29");
    const rebuilt = resolveSeededFindLeaderBoard(
      board.definitionId,
      "shared-proof",
      "2026-07-29",
    );

    expect(rebuilt).toEqual(board);
  });

  it("deprioritizes the immediately previous casual board", () => {
    const first = createReplayableFindLeaderRun("2026-07-29");
    const second = createReplayableFindLeaderRun("2026-07-29");
    const firstIds = fighterSignature(first.board.candidates.map((fighter) => fighter.id));
    const secondIds = fighterSignature(second.board.candidates.map((fighter) => fighter.id));

    expect(first.identity.type).toBe("replayable");
    expect(second.identity.type).toBe("replayable");
    expect(`${second.board.definitionId}:${secondIds}`).not.toBe(`${first.board.definitionId}:${firstIds}`);
  });

  it("tracks question, metric, family, and all ten fighters for semantic replay pressure", () => {
    const first = createReplayableFindLeaderRun("2026-07-29");
    const definition = findLeaderQuestions.find((row) => row.id === first.board.definitionId)!;
    const history = loadLineupHistory("find-leader", "casual");
    const itemIds = history.entries[0]?.itemIds ?? [];

    expect(itemIds).toHaveLength(13);
    expect(itemIds).toContain(`question:${definition.id}`);
    expect(itemIds).toContain(`metric:${definition.metric}`);
    expect(itemIds).toContain(`family:${definition.family}`);
    first.board.candidates.forEach((fighter) => expect(itemIds).toContain(fighter.id));
  });

  it("produces more than one casual category across replay seeds", () => {
    const categories = new Set(
      Array.from({ length: 20 }, (_, index) => (
        buildReplayableFindLeaderBoard(`category-proof-${index}`, "2026-07-29").definitionId
      )),
    );

    expect(categories.size).toBeGreaterThan(1);
  });

  it("gives the deeper supplemental family a real path through casual category rotation", () => {
    const boards = Array.from({ length: 160 }, (_, index) => (
      buildReplayableFindLeaderBoard(`supplemental-family-proof-${index}`, "2026-08-19")
    ));
    const supplemental = boards.filter((board) => board.family === "supplemental");

    expect(supplemental.length).toBeGreaterThan(0);
    supplemental.forEach((board) => {
      expect(board.candidates).toHaveLength(10);
      expect(new Set(board.candidates.map((fighter) => fighter.id)).size).toBe(10);
      expect(board.candidates.some((fighter) => fighter.id === board.leaderId)).toBe(true);
    });
  });
});
