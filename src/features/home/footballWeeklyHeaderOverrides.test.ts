import { describe, expect, it } from "vitest";
import {
  resolveFootballWeeklyHeaderArtwork, usableFootballWeeklyHeaderArtwork,
  type FootballOwnerHeader,
} from "./footballWeeklyHeaderOverrides";

const game = {
  id: "weekly-2026-10-20-cfb",
  teams: [{ name: "Ole Miss" }, { name: "Texas" }],
  headerAssetPath: "/assets/football/weekly/2026-10-20/cfb/game-header.webp",
};
const owner: FootballOwnerHeader = {
  week_of: "2026-10-20", sport: "cfb", away_team: "Ole Miss", home_team: "Texas",
  asset_path: "/assets/football/weekly/2026-10-20/cfb/owner-header-a1b2c3d4.webp",
};

describe("owner-provided Football weekly art", () => {
  it("defaults to published SeatGeek when no owner image exists", () => {
    const art = resolveFootballWeeklyHeaderArtwork(game, []);
    expect(art).toEqual({ primary: game.headerAssetPath, fallback: null, ownerProvided: false });
    expect(usableFootballWeeklyHeaderArtwork(art, [])).toBe(game.headerAssetPath);
    expect(usableFootballWeeklyHeaderArtwork(art, [game.headerAssetPath])).toBeNull();
  });
  it("prioritizes the exact owner graphic and immediately falls back on load failure", () => {
    const art = resolveFootballWeeklyHeaderArtwork(game, [owner]);
    expect(art).toEqual({ primary: owner.asset_path, fallback: game.headerAssetPath, ownerProvided: true });
    expect(usableFootballWeeklyHeaderArtwork(art, [])).toBe(owner.asset_path);
    expect(usableFootballWeeklyHeaderArtwork(art, [owner.asset_path])).toBe(game.headerAssetPath);
    expect(usableFootballWeeklyHeaderArtwork(art, [owner.asset_path, game.headerAssetPath])).toBeNull();
  });
  it("never leaks a graphic to another week, game, or sport", () => {
    for (const other of [
      { ...game, id: "weekly-2026-10-27-cfb" },
      { ...game, id: "weekly-2026-10-20-nfl" },
      { ...game, teams: [{ name: "Texas Tech" }, { name: "Texas" }] },
      { ...game, teams: [{ name: "Texas" }, { name: "Ole Miss" }] },
      { ...game, id: "authored-2026-10-20-cfb" },
    ]) {
      expect(resolveFootballWeeklyHeaderArtwork(other, [owner]).ownerProvided).toBe(false);
    }
  });
  it("rejects untrusted paths, other weeks, and image URL injection", () => {
    for (const asset_path of [
      "https://example.org/picture.webp", "/assets/football/weekly/2026-10-27/cfb/owner-header-x.webp",
      "/assets/football/weekly/2026-10-20/nfl/owner-header-x.webp",
      "/assets/football/weekly/2026-10-20/cfb/../../other.webp",
      "/assets/football/weekly/2026-10-20/cfb/owner-header-x.png",
    ]) {
      expect(resolveFootballWeeklyHeaderArtwork(game, [{ ...owner, asset_path }]).primary).toBe(game.headerAssetPath);
    }
  });
});
