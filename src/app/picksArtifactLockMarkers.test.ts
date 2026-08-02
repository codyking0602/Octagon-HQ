import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const verifier = readFileSync("scripts/verify-production-artifact.mjs", "utf8");
const controlPage = readFileSync("src/features/picks-control/PicksControlPage.tsx", "utf8");
const controlRepository = readFileSync("src/features/picks-control/pickControlRepository.ts", "utf8");

describe("production artifact Picks lock contracts", () => {
  it("proves the current event-wide and per-fight lock owners", () => {
    for (const marker of [
      "EVENT-WIDE MASTER LOCK",
      "CHANGE FIGHT LOCK",
      "LOCK ALL PICKS & BEGIN RESULTS",
    ]) {
      expect(controlPage).toContain(marker);
      expect(verifier).toContain(marker);
    }
    expect(controlRepository).toContain('client.rpc("adjust_pick_bout_lock_time"');
    expect(verifier).toContain("adjust_pick_bout_lock_time");
  });

  it("does not require superseded all-fights-lock-together copy", () => {
    expect(verifier).not.toContain("ALL FIGHTS LOCK TOGETHER");
    expect(verifier).not.toContain('"CHANGE LOCK TIME"');
    expect(verifier).not.toContain('"LOCK PICKS & BEGIN RESULTS"');
  });
});
