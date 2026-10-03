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

  it("ships a visual player spotlight with four season stats", () => {
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.name).toBe("Fernando Tatis Jr.");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.team).toBe("San Diego Padres");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.photoUrl).toContain("665487");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.stats).toEqual([
      { label: "AVG", value: ".289" },
      { label: "HR", value: "25" },
      { label: "SB", value: "38" },
      { label: "OPS", value: ".828" },
    ]);
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.profileUrl).toContain("baseball-reference.com/players/t/tatisfe02.shtml");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.highlightUrl).toContain("mlb.com/video/");
  });
});
