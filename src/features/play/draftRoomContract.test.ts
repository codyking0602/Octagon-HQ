import { describe, expect, it } from "vitest";
import {
  BUILD_QB_TRAITS,
  TRIO_POSITIONS,
  draftRoomModeDefinition,
  isDraftRoomModeId,
  isCowboysDraftRoomMode,
  isCowboysTeamsDraftRoomMode,
  isCfbBestTeamsDraftRoomMode,
  isCfbDraftRoomMode,
  isLonghornsDraftRoomMode,
  isLonghornsTeamsDraftRoomMode,
  isNflDivisionsDraftRoomMode,
  isTrioDraftRoomMode,
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

  it("locks the Stage 13 Trio economy without changing Build a QB", () => {
    for (const modeId of ["trio-nfl", "trio-cfb"] as const) {
      const mode = draftRoomModeDefinition(modeId);
      expect(mode.rounds).toBe(6);
      expect(mode.requiredSelectionsPerPlayer).toBe(3);
      expect(mode.startingBankroll).toBe(30);
      expect(mode.categories).toEqual([]);
      expect(mode.format).toBe("trio");
      expect(isTrioDraftRoomMode(modeId)).toBe(true);
    }
    expect(TRIO_POSITIONS).toEqual(["QB", "RB", "WR"]);
    expect(draftRoomModeDefinition("build-qb").startingBankroll).toBe(40);
    expect(draftRoomModeDefinition("build-qb").rounds).toBe(8);
  });

  it("locks Longhorns Since 2003 to eight open-roster auctions and four wins per side", () => {
    const mode = draftRoomModeDefinition("longhorns-2005");
    expect(mode.displayName).toBe("Longhorns Since 2003");
    expect(mode.description).toContain("from 2003 forward");
    expect(mode.rounds).toBe(8);
    expect(mode.requiredSelectionsPerPlayer).toBe(4);
    expect(mode.startingBankroll).toBe(40);
    expect(mode.categories).toEqual([]);
    expect(mode.format).toBe("open-roster");
    expect(isLonghornsDraftRoomMode("longhorns-2005")).toBe(true);
    expect(isTrioDraftRoomMode("longhorns-2005")).toBe(false);
  });

  it("locks Longhorns Teams Since 2003 to eight team-season auctions and four wins per side", () => {
    const mode = draftRoomModeDefinition("longhorns-teams-2005");
    expect(mode.displayName).toBe("Longhorns Teams Since 2003");
    expect(mode.description).toContain("from 2003 forward");
    expect(mode.rounds).toBe(8);
    expect(mode.requiredSelectionsPerPlayer).toBe(4);
    expect(mode.startingBankroll).toBe(40);
    expect(mode.categories).toEqual([]);
    expect(mode.format).toBe("open-roster");
    expect(isLonghornsTeamsDraftRoomMode("longhorns-teams-2005")).toBe(true);
    expect(isLonghornsDraftRoomMode("longhorns-teams-2005")).toBe(false);
  });

  it("locks Cowboys Since 2007 to eight open-roster auctions and four wins per side", () => {
    const mode = draftRoomModeDefinition("cowboys-2007");
    expect(mode.rounds).toBe(8);
    expect(mode.requiredSelectionsPerPlayer).toBe(4);
    expect(mode.startingBankroll).toBe(40);
    expect(mode.categories).toEqual([]);
    expect(mode.format).toBe("open-roster");
    expect(isCowboysDraftRoomMode("cowboys-2007")).toBe(true);
    expect(isCowboysTeamsDraftRoomMode("cowboys-2007")).toBe(false);
    expect(isLonghornsDraftRoomMode("cowboys-2007")).toBe(false);
    expect(isLonghornsTeamsDraftRoomMode("cowboys-2007")).toBe(false);
    expect(isTrioDraftRoomMode("cowboys-2007")).toBe(false);
  });

  it("locks Cowboys Teams Since 2007 to eight team-season auctions and four wins per side", () => {
    const mode = draftRoomModeDefinition("cowboys-teams-2007");
    expect(mode.displayName).toBe("Cowboys Teams Since 2007");
    expect(mode.description).toContain("completed Dallas Cowboys seasons");
    expect(mode.rounds).toBe(8);
    expect(mode.requiredSelectionsPerPlayer).toBe(4);
    expect(mode.startingBankroll).toBe(40);
    expect(mode.categories).toEqual([]);
    expect(mode.format).toBe("open-roster");
    expect(isCowboysTeamsDraftRoomMode("cowboys-teams-2007")).toBe(true);
    expect(isCowboysDraftRoomMode("cowboys-teams-2007")).toBe(false);
    expect(isTrioDraftRoomMode("cowboys-teams-2007")).toBe(false);
  });

  it("locks NFL Divisions to the approved eight-auction randomized division format", () => {
    const mode = draftRoomModeDefinition("nfl-divisions");
    expect(mode.displayName).toBe("NFL Divisions");
    expect(mode.rounds).toBe(8);
    expect(mode.requiredSelectionsPerPlayer).toBe(4);
    expect(mode.startingBankroll).toBe(40);
    expect(mode.categories).toEqual([]);
    expect(mode.format).toBe("open-roster");
    expect(isNflDivisionsDraftRoomMode("nfl-divisions")).toBe(true);
    expect(isCfbDraftRoomMode("nfl-divisions")).toBe(false);
    expect(isTrioDraftRoomMode("nfl-divisions")).toBe(false);
  });

  it("locks Best CFB Teams to the approved eight-auction conference format", () => {
    const mode = draftRoomModeDefinition("cfb-best-teams");
    expect(mode.displayName).toBe("Best CFB Teams");
    expect(mode.rounds).toBe(8);
    expect(mode.requiredSelectionsPerPlayer).toBe(4);
    expect(mode.startingBankroll).toBe(40);
    expect(mode.categories).toEqual([]);
    expect(mode.format).toBe("open-roster");
    expect(isCfbBestTeamsDraftRoomMode("cfb-best-teams")).toBe(true);
    expect(isCfbDraftRoomMode("cfb-best-teams")).toBe(true);
    expect(isTrioDraftRoomMode("cfb-best-teams")).toBe(false);
  });

  it("recognizes only canonical Draft Room mode ids", () => {
    expect(isDraftRoomModeId("build-qb")).toBe(true);
    expect(isDraftRoomModeId("build-qb-cfb")).toBe(true);
    expect(isDraftRoomModeId("trio-nfl")).toBe(true);
    expect(isDraftRoomModeId("trio-cfb")).toBe(true);
    expect(isDraftRoomModeId("longhorns-2005")).toBe(true);
    expect(isDraftRoomModeId("longhorns-teams-2005")).toBe(true);
    expect(isDraftRoomModeId("cowboys-2007")).toBe(true);
    expect(isDraftRoomModeId("cowboys-teams-2007")).toBe(true);
    expect(isDraftRoomModeId("nfl-divisions")).toBe(true);
    expect(isDraftRoomModeId("cfb-best-teams")).toBe(true);
    expect(isDraftRoomModeId("ultimate-fighter")).toBe(false);
  });
});
