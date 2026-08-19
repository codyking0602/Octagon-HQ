import { beforeEach, describe, expect, it } from "vitest";
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

  it("tracks the answer separately so New Lineup can penalize repeated leaders", () => {
    const first = createReplayableFindLeaderRun("2026-07-29");
    const history = loadLineupHistory("find-leader", "casual");

    expect(history.entries[0]?.itemIds).toContain(`category:${first.board.definitionId}`);
    expect(history.entries[0]?.itemIds).toContain(`leader:${first.board.leaderId}`);
  });

  it("produces more than one casual category across replay seeds", () => {
    const categories = new Set(
      Array.from({ length: 20 }, (_, index) => (
        buildReplayableFindLeaderBoard(`category-proof-${index}`, "2026-07-29").definitionId
      )),
    );

    expect(categories.size).toBeGreaterThan(1);
  });
});
