import { describe, expect, it } from "vitest";
import {
  MLB_OWNER_PLAYER_SPOTLIGHT,
  MLB_TEAM_ASSETS,
  mlbTeamAssetByAbbreviation,
  mlbTeamAssetByName,
} from "./mlbTeamAssets";

describe("MLB team visual assets", () => {
  it("covers all 30 MLB clubs with usable logo URLs", () => {
    expect(MLB_TEAM_ASSETS).toHaveLength(30);
    expect(new Set(MLB_TEAM_ASSETS.map((team) => team.abbreviation)).size).toBe(30);
    expect(MLB_TEAM_ASSETS.every((team) => team.logoUrl.startsWith("https://a.espncdn.com/i/teamlogos/mlb/500/"))).toBe(true);
  });

  it("resolves canonical preview identities", () => {
    expect(mlbTeamAssetByAbbreviation("NYY")?.name).toBe("New York Yankees");
    expect(mlbTeamAssetByName("Boston Red Sox")?.abbreviation).toBe("BOS");
    expect(mlbTeamAssetByName("Los Angeles Dodgers")?.abbreviation).toBe("LAD");
  });

  it("ships the verified Gavin Williams ALDS Game 5 spotlight", () => {
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.name).toBe("Gavin Williams");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.team).toBe("Cleveland Guardians");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.teamColor).toBe("#E50022");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.photoUrl).toContain("/people/668909/headshot/");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.stats).toEqual([
      { label: "K", value: "12" },
      { label: "IP", value: "6.0" },
      { label: "H", value: "1" },
      { label: "R", value: "0" },
    ]);
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.meta).toContain("2026 ALDS GAME 5");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.profileUrl).toContain("baseball-reference.com/players/w/williga01.shtml");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.highlightUrl).toBe("https://youtube.com/shorts/2hCQQ8GjrXE?is=Zh0UXfg_FOz1WGrO");
  });
});
