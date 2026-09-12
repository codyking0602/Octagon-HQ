import { describe, expect, it } from "vitest";
import {
  BUILD_QB_TRAITS,
  draftRoomModeDefinition,
  isDraftRoomModeId,
} from "./draftRoomContract";

describe("Draft Room contract", () => {
  it("locks the Stage 12 Build a QB economy and five traits", () => {
    const mode = draftRoomModeDefinition("build-qb");
    expect(mode.rounds).toBe(10);
    expect(mode.requiredSelectionsPerPlayer).toBe(5);
    expect(mode.startingBankroll).toBe(50);
    expect(mode.categories).toEqual(["Arm", "Accuracy", "Processing", "Mobility", "Clutch"]);
    expect(BUILD_QB_TRAITS).toEqual(mode.categories);
  });

  it("recognizes only canonical Draft Room mode ids", () => {
    expect(isDraftRoomModeId("build-qb")).toBe(true);
    expect(isDraftRoomModeId("ultimate-fighter")).toBe(false);
  });
});
