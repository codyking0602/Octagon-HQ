import { describe, expect, it } from "vitest";
import { canAccessNbaGames, canPreviewNbaWhoAmI } from "./NbaWhoAmIOwnerGate";
import { NBA_OFFICIAL_GAMES_RELEASE_READY } from "./nbaDailySchedule";

describe("NBA game route launch safety", () => {
  const owner = { displayName: "CODY", canControlPicks: true };
  const member = { displayName: "TROY", canControlPicks: false };

  it("keeps the nine game pages accessible to the owner before launch", () => {
    expect(canPreviewNbaWhoAmI(owner)).toBe(true);
    expect(canAccessNbaGames(owner, "2026-10-23")).toBe(true);
  });

  it("denies other users before the release is verified, even after November 1", () => {
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(false);
    expect(canAccessNbaGames(member, "2026-10-31")).toBe(false);
    expect(canAccessNbaGames(member, "2026-11-01")).toBe(false);
    expect(canAccessNbaGames(null, "2026-11-01")).toBe(false);
  });

  it("does not confuse public Futures access with nine gated game routes", () => {
    expect(canPreviewNbaWhoAmI(member)).toBe(false);
    expect(canPreviewNbaWhoAmI(null)).toBe(false);
  });
});
