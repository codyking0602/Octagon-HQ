import { describe, expect, it } from "vitest";
import { requiredApplicationMarkers } from "./verify-production-artifact.mjs";

describe("production artifact Picks control markers", () => {
  it("tracks the compiled progressive per-fight lock UI instead of retired lock copy", () => {
    expect(requiredApplicationMarkers).toEqual(expect.arrayContaining([
      "EVENT-WIDE MASTER LOCK",
      "CHANGE FIGHT",
      "+10 MIN",
      "+20 MIN",
      "SET TIME",
      "DEADLINE FINAL",
      "LOCK ALL PICKS & BEGIN RESULTS",
      "adjust_pick_event_lock_time",
      "adjust_pick_bout_lock_time",
    ]));
    expect(requiredApplicationMarkers).not.toEqual(expect.arrayContaining([
      "ALL FIGHTS LOCK TOGETHER",
      "CHANGE LOCK TIME",
      "CHANGE FIGHT LOCK",
      "LOCK PICKS & BEGIN RESULTS",
    ]));
  });
});
