import { describe, expect, it } from "vitest";
import { footballTeamSchoolMetadata } from "../back-room/footballTeamSchoolMetadata";
import { footballTeamSportsReferenceUrl, sportsReferenceTeamIdentity } from "./footballTeamSportsReference";

describe("Top Games Sports Reference team-pill destinations", () => {
  it("opens the exact current CFB and NFL season pages", () => {
    expect(footballTeamSportsReferenceUrl("Notre Dame Fighting Irish", "CFB", 2026))
      .toBe("https://www.sports-reference.com/cfb/schools/notre-dame/2026.html");
    expect(footballTeamSportsReferenceUrl("BYU Cougars", "CFB", 2026))
      .toBe("https://www.sports-reference.com/cfb/schools/brigham-young/2026.html");
    expect(footballTeamSportsReferenceUrl("Green Bay Packers", "NFL", 2026))
      .toBe("https://www.pro-football-reference.com/teams/gnb/2026.htm");
    expect(footballTeamSportsReferenceUrl("Dallas Cowboys", "NFL", 2026))
      .toBe("https://www.pro-football-reference.com/teams/dal/2026.htm");
  });

  it("uses event season, including when the calendar moves into January or the next season", () => {
    expect(footballTeamSportsReferenceUrl("Notre Dame", "CFB", 2027))
      .toBe("https://www.sports-reference.com/cfb/schools/notre-dame/2027.html");
    expect(footballTeamSportsReferenceUrl("Packers", "NFL", 2027))
      .toBe("https://www.pro-football-reference.com/teams/gnb/2027.htm");
    expect(footballTeamSportsReferenceUrl("Green Bay Packers", "NFL", 2026))
      .toContain("/2026.htm");
  });

  it("resolves recognized alternate names without confusing longer school names", () => {
    expect(sportsReferenceTeamIdentity("Texas Tech Red Raiders", "CFB")?.name).toBe("Texas Tech");
    expect(sportsReferenceTeamIdentity("Michigan State Spartans", "CFB")?.name).toBe("Michigan State");
    expect(sportsReferenceTeamIdentity("Texas Longhorns", "CFB")?.name).toBe("Texas");
    expect(sportsReferenceTeamIdentity("Alabama Crimson Tide", "CFB")?.name).toBe("Alabama");
    expect(footballTeamSportsReferenceUrl("Ole Miss Rebels", "CFB", 2026))
      .toBe("https://www.sports-reference.com/cfb/schools/mississippi/2026.html");
    expect(footballTeamSportsReferenceUrl("Miami Hurricanes", "CFB", 2026))
      .toBe("https://www.sports-reference.com/cfb/schools/miami-fl/2026.html");
    expect(footballTeamSportsReferenceUrl("USC Trojans", "CFB", 2026))
      .toBe("https://www.sports-reference.com/cfb/schools/southern-california/2026.html");
    expect(footballTeamSportsReferenceUrl("Tennessee Titans", "NFL", 2026))
      .toBe("https://www.pro-football-reference.com/teams/oti/2026.htm");
  });

  it("covers every canonical NFL and CFB team in next week's auto-publishing pool", () => {
    const nfl = footballTeamSchoolMetadata.filter((team) => team.level === "NFL");
    expect(nfl).toHaveLength(32);
    for (const team of footballTeamSchoolMetadata) {
      const url = footballTeamSportsReferenceUrl(team.name, team.level, 2026);
      expect(url, `Missing ${team.level} Sports Reference mapping: ${team.name}`).toMatch(
        team.level === "NFL"
          ? /^https:\/\/www\.pro-football-reference\.com\/teams\/[a-z]{3}\/2026\.htm$/
          : /^https:\/\/www\.sports-reference\.com\/cfb\/schools\/[a-z0-9-]+\/2026\.html$/,
      );
    }
  });

  it("fails closed for unknown teams, wrong leagues and invalid seasons", () => {
    expect(footballTeamSportsReferenceUrl("Future School That Does Not Exist", "CFB", 2026)).toBeNull();
    expect(footballTeamSportsReferenceUrl("Notre Dame", "NFL", 2026)).toBeNull();
    expect(footballTeamSportsReferenceUrl("Packers", "CFB", 2026)).toBeNull();
    expect(footballTeamSportsReferenceUrl("Packers", "NFL", Number.NaN)).toBeNull();
    expect(footballTeamSportsReferenceUrl("Packers", "NFL", 0)).toBeNull();
  });
});
