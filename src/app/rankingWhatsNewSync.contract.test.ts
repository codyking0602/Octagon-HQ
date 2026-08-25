import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const syncScript = readFileSync("scripts/sync-ranking-whats-new.mjs", "utf8");

describe("ranking What's New sync contract", () => {
  it("publishes the canonical Fighters to Watch board note", () => {
    expect(syncScript).toContain("note: fighter.boardNote");
    expect(syncScript).not.toContain("fighter.scoutingNote");
  });
});
