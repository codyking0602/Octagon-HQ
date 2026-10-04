import { describe, expect, it } from "vitest";
import {
  wheelFootballPoolTeams,
  wheelFootballSportsReferenceUrl,
  wheelFootballTeam,
} from "./wheelFootballModel";
import { wheelFootballCfbPriorityForSchoolId } from "./wheelFootballCfbPriority";

describe("Wheel of Football AP Top 25", () => {
  it("keeps National at 68 schools while AP Top 25 is exactly 25 ranked teams", () => {
    const national = wheelFootballPoolTeams("CFB");
    const ranked = wheelFootballPoolTeams("AP_TOP_25");

    expect(national).toHaveLength(68);
    expect(national.some((team) => team.code === "boise-state")).toBe(false);
    expect(ranked).toHaveLength(25);
    expect(ranked.map((team) => team.apRank)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1),
    );
    expect(ranked.find((team) => team.code === "boise-state")?.apRank).toBe(22);
  });

  it("supports the current AP-only Boise State entrant with audited Wheel options", () => {
    const priority = wheelFootballCfbPriorityForSchoolId("boise-state");
    expect(wheelFootballTeam("boise-state")?.espnId).toBe("68");
    expect(priority?.QB).toContain("Maddux Madsen");
    expect(priority?.["Head Coach"]).toEqual(["Spencer Danielson"]);
  });
});

describe("Wheel of Football 2026 Sports Reference team links", () => {
  it("uses the exact 2026 Dallas Cowboys Pro Football Reference season", () => {
    const team = wheelFootballTeam("DAL");
    expect(team && wheelFootballSportsReferenceUrl(team))
      .toBe("https://www.pro-football-reference.com/teams/dal/2026.htm");
  });

  it("uses Sports Reference's 2026 USC school-season slug", () => {
    const team = wheelFootballTeam("usc");
    expect(team && wheelFootballSportsReferenceUrl(team))
      .toBe("https://www.football-reference.com/cfb/schools/southern-california/2026.html");
  });
});
