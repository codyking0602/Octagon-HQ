import { describe, expect, it } from "vitest";
import {
  wheelFootballPoolLabel,
  wheelFootballPoolTeams,
  wheelFootballTeam,
  wheelFootballTeamSportsReferenceUrl,
} from "./wheelFootballModel";
import { wheelFootballCfbPriorityForSchoolId } from "./wheelFootballCfbPriority";

describe("Wheel of Football team links and AP Top 25", () => {
  it("links NFL teams to the exact 2026 Pro Football Reference season page", () => {
    const cowboys = wheelFootballTeam("DAL");
    expect(cowboys).not.toBeNull();
    expect(wheelFootballTeamSportsReferenceUrl(cowboys!))
      .toBe("https://www.pro-football-reference.com/teams/dal/2026.htm");
  });

  it("links CFB teams to the exact 2026 Sports Reference school season page", () => {
    const usc = wheelFootballTeam("usc");
    expect(usc).not.toBeNull();
    expect(wheelFootballTeamSportsReferenceUrl(usc!))
      .toBe("https://www.sports-reference.com/cfb/schools/southern-california/2026.html");
  });

  it("ships the latest complete AP Top 25 fallback with the rank attached to each team", () => {
    const teams = wheelFootballPoolTeams("AP_TOP_25");
    expect(wheelFootballPoolLabel("AP_TOP_25")).toBe("AP TOP 25");
    expect(teams).toHaveLength(25);
    expect(teams.map((team) => team.apRank)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1),
    );
    expect(teams.find((team) => team.code === "boise-state")?.apRank).toBe(22);
  });

  it("has an audited playable priority for Boise State when it enters the AP wheel", () => {
    const boise = wheelFootballCfbPriorityForSchoolId("boise-state");
    expect(boise?.QB).toContain("Maddux Madsen");
    expect(boise?.["Head Coach"]).toEqual(["Spencer Danielson"]);
  });
});
