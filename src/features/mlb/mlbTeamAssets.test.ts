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

  it("ships the approved Junior Caminero World Series spotlight with the supplied YouTube Short", () => {
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.name).toBe("Junior Caminero");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.team).toBe("Tampa Bay Rays");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.teamColor).toBe("#092C5C");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.photoUrl).toContain("/people/691406/headshot/");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.stats).toEqual([
      { label: "HR", value: "42" },
      { label: "RBI", value: "101" },
      { label: "AVG", value: ".276" },
      { label: "OPS", value: ".884" },
    ]);
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.meta).toContain("WORLD SERIES WEEK");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.profileUrl).toBe("https://www.mlb.com/player/junior-caminero-691406");
    expect(MLB_OWNER_PLAYER_SPOTLIGHT.highlightUrl).toBe("https://youtube.com/shorts/RkF6yhjVT3A?is=vDeytklWLWBCVU6b");
  });
});
