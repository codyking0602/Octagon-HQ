import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  draftRoomModeDefinition,
  isCowboysTeamsDraftRoomMode,
} from "../play/draftRoomContract";
import { draftRoomModeArtwork } from "./draftRoomModeArtwork";

const page = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballDraftRoomPage.tsx"),
  "utf8",
);

describe("Cowboys Teams Since 2007 presentation", () => {
  it("locks the approved eight-round, four-season, $40 format", () => {
    const mode = draftRoomModeDefinition("cowboys-teams-2007");
    expect(mode.rounds).toBe(8);
    expect(mode.requiredSelectionsPerPlayer).toBe(4);
    expect(mode.startingBankroll).toBe(40);
    expect(mode.categories).toEqual([]);
    expect(mode.format).toBe("open-roster");
    expect(isCowboysTeamsDraftRoomMode("cowboys-teams-2007")).toBe(true);
  });

  it("uses the supplied Cowboys hero and team-season presentation", () => {
    expect(draftRoomModeArtwork("cowboys-teams-2007")).toEqual({
      src: "/assets/football/draft-room-cowboys-teams.webp",
      objectPosition: "50% 42%",
    });
    expect(page).toContain('isCowboysTeamsDraftRoomMode(state.mode_id)');
    expect(page).toContain('itemSummary={cowboysTeamSeasonSummary}');
    expect(page).toContain('ariaLabel="Cowboys team-season comparison"');
    expect(page).toContain('"CURRENT COWBOYS TEAM"');
    expect(page).toContain('"Bid on this Cowboys season. Win four seasons and build the stronger four-team group."');
  });
});
