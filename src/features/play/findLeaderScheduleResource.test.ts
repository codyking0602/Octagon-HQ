import { describe, expect, it } from "vitest";
import { dailyFindLeaderBoard } from "./findLeaderEngine";

describe("Find the Leader Daily schedule resource bounds", () => {
  it("materializes a distant future Daily board without replaying expensive board builds for every prior slot", () => {
    const board = dailyFindLeaderBoard("2040-08-27");

    expect(board).not.toBeNull();
    expect(board?.candidates).toHaveLength(10);
    expect(new Set(board?.candidates.map((fighter) => fighter.id)).size).toBe(10);
    expect(board?.candidates.some((fighter) => fighter.id === board.leaderId)).toBe(true);
  });
});
