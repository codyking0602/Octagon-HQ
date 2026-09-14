import { describe, expect, it } from "vitest";
import {
  draftRoomModeDefinition,
  isCowboysDraftRoomMode,
  isCowboysTeamsDraftRoomMode,
  isDraftRoomModeId,
} from "./draftRoomContract";

describe("Cowboys Teams Since 2007 mode contract", () => {
  it("is a separate canonical Draft Room mode from Cowboys players", () => {
    const mode = draftRoomModeDefinition("cowboys-teams-2007");
    expect(mode.displayName).toBe("Cowboys Teams Since 2007");
    expect(mode.rounds).toBe(8);
    expect(mode.requiredSelectionsPerPlayer).toBe(4);
    expect(mode.startingBankroll).toBe(40);
    expect(mode.categories).toEqual([]);
    expect(mode.format).toBe("open-roster");
    expect(isDraftRoomModeId("cowboys-teams-2007")).toBe(true);
    expect(isCowboysTeamsDraftRoomMode("cowboys-teams-2007")).toBe(true);
    expect(isCowboysDraftRoomMode("cowboys-teams-2007")).toBe(false);
  });
});
