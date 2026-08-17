import { describe, expect, it } from "vitest";
import {
  requiredApplicationMarkers,
  requiredShareArtwork,
} from "./verify-production-artifact.mjs";

describe("production artifact Picks control markers", () => {
  it("tracks the compiled compact progressive per-fight lock UI instead of retired lock copy", () => {
    expect(requiredApplicationMarkers).toEqual(expect.arrayContaining([
      "MASTER LOCK",
      "+10 MIN",
      "+20 MIN",
      "SET TIME",
      "DEADLINE FINAL",
      "LOCK ALL PICKS",
      "adjust_pick_event_lock_time",
      "adjust_pick_bout_lock_time",
    ]));
    expect(requiredApplicationMarkers).not.toEqual(expect.arrayContaining([
      "EVENT-WIDE MASTER LOCK",
      "ALL FIGHTS LOCK TOGETHER",
      "CHANGE LOCK TIME",
      "CHANGE FIGHT",
      "CHANGE FIGHT LOCK",
      "LOCK PICKS & BEGIN RESULTS",
      "LOCK ALL PICKS & BEGIN RESULTS",
    ]));
  });

  it("requires share artwork for every current Play game, including Hit the Number", () => {
    expect(requiredShareArtwork).toContain("hit-the-number.svg");
  });
});
