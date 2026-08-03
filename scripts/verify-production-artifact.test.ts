import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { requiredApplicationMarkers } from "./verify-production-artifact.mjs";

const picksControlSource = readFileSync(
  "src/features/picks-control/PicksControlPage.tsx",
  "utf8",
);

describe("production artifact Picks control markers", () => {
  it("tracks the compiled per-fight lock UI instead of retired event-lock copy", () => {
    expect(requiredApplicationMarkers).toEqual(expect.arrayContaining([
      "EVENT-WIDE MASTER LOCK",
      "CHANGE FIGHT",
      "LOCK ALL PICKS & BEGIN RESULTS",
      "adjust_pick_event_lock_time",
      "adjust_pick_bout_lock_time",
    ]));
    expect(requiredApplicationMarkers).not.toEqual(expect.arrayContaining([
      "ALL FIGHTS LOCK TOGETHER",
      "CHANGE LOCK TIME",
      "LOCK PICKS & BEGIN RESULTS",
    ]));

    // The artifact keeps this stable fragment while the source supplies the
    // complete label from a conditional expression.
    expect(requiredApplicationMarkers).toContain("CHANGE FIGHT");
    expect(picksControlSource).toContain('"CHANGE FIGHT LOCK"');
    expect(requiredApplicationMarkers).not.toContain("CHANGE FIGHT LOCK");
  });
});
