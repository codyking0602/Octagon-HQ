import { describe, expect, it } from "vitest";
import { footballTeamSchoolMetadata } from "../back-room/footballTeamSchoolMetadata";
import { footballNflMatchupTeamLogoUrl } from "./footballNflMatchupTeamLogo";

describe("canonical NFL matchup logo coverage", () => {
  it("resolves a distinct valid team mark for every NFL franchise without weekly manual URLs", () => {
    const franchises = footballTeamSchoolMetadata.filter((team) => team.level === "NFL");
    expect(franchises).toHaveLength(32);
    const logos = franchises.map((team) => footballNflMatchupTeamLogoUrl(team.name));
    expect(new Set(logos).size).toBe(32);
    expect(logos.every((logo) => /^https:\/\/a\.espncdn\.com\/i\/teamlogos\/nfl\/500\/[a-z0-9]+\.png$/.test(logo ?? ""))).toBe(true);
  });

  it("supports full names, canonical abbreviations, and team nicknames without CFB false matches", () => {
    expect(footballNflMatchupTeamLogoUrl("Chicago Bears")).toBe("https://a.espncdn.com/i/teamlogos/nfl/500/chi.png");
    expect(footballNflMatchupTeamLogoUrl("Seattle Seahawks")).toBe("https://a.espncdn.com/i/teamlogos/nfl/500/sea.png");
    expect(footballNflMatchupTeamLogoUrl("CHI")).toBe("https://a.espncdn.com/i/teamlogos/nfl/500/chi.png");
    expect(footballNflMatchupTeamLogoUrl("Seahawks")).toBe("https://a.espncdn.com/i/teamlogos/nfl/500/sea.png");
    expect(footballNflMatchupTeamLogoUrl("Washington Commanders")).toBe("https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png");
    expect(footballNflMatchupTeamLogoUrl("Miami")).toBeNull();
    expect(footballNflMatchupTeamLogoUrl("Unknown Team")).toBeNull();
  });
});
