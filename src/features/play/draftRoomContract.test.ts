import { describe, expect, it } from "vitest";
import {
  BUILD_QB_TRAITS,
  draftRoomModeDefinition,
  isDraftRoomModeId,
} from "./draftRoomContract";

describe("Draft Room contract", () => {
  it("locks the approved four-trait Build a QB economy", () => {
    const mode = draftRoomModeDefinition("build-qb");
    expect(mode.rounds).toBe(8);
    expect(mode.requiredSelectionsPerPlayer).toBe(4);
    expect(mode.startingBankroll).toBe(40);
    expect(mode.categories).toEqual(["Arm", "Accuracy", "Processing", "Mobility"]);
    expect(BUILD_QB_TRAITS).toEqual(mode.categories);
    expect(mode.description).toContain("four-part QB");
  });

  it("registers CFB as the same Draft Room economy and trait contract", () => {
    const nfl = draftRoomModeDefinition("build-qb");
    const cfb = draftRoomModeDefinition("build-qb-cfb");
    expect(cfb.rounds).toBe(nfl.rounds);
    expect(cfb.requiredSelectionsPerPlayer).toBe(nfl.requiredSelectionsPerPlayer);
    expect(cfb.startingBankroll).toBe(nfl.startingBankroll);
    expect(cfb.categories).toEqual(nfl.categories);
    expect(cfb.description).toContain("four-part QB");
  });

  it("removes Clutch from the canonical Build a QB trait contract", () => {
    expect(BUILD_QB_TRAITS).toEqual(["Arm", "Accuracy", "Processing", "Mobility"]);
    expect(BUILD_QB_TRAITS).not.toContain("Clutch" as never);
  });

  it("recognizes only canonical Draft Room mode ids", () => {
    expect(isDraftRoomModeId("build-qb")).toBe(true);
    expect(isDraftRoomModeId("build-qb-cfb")).toBe(true);
    expect(isDraftRoomModeId("ultimate-fighter")).toBe(false);
  });
});
