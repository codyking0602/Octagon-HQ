import { describe, expect, it } from "vitest";
import { wheelFootballTeamSeasonReferenceUrl } from "./wheelFootballReferences";

describe("Wheel of Football current-season team references", () => {
  it("links NFL teams directly to their 2026 Pro Football Reference team page", () => {
    expect(wheelFootballTeamSeasonReferenceUrl("NFL", "DAL"))
      .toBe("https://www.pro-football-reference.com/teams/dal/2026.htm");
    expect(wheelFootballTeamSeasonReferenceUrl("NFL", "TEN"))
      .toBe("https://www.pro-football-reference.com/teams/oti/2026.htm");
  });

  it("links college teams directly to their 2026 Sports Reference season page", () => {
    expect(wheelFootballTeamSeasonReferenceUrl("CFB", "usc"))
      .toBe("https://www.sports-reference.com/cfb/schools/southern-california/2026-schedule.html");
    expect(wheelFootballTeamSeasonReferenceUrl("CFB", "boise-state"))
      .toBe("https://www.sports-reference.com/cfb/schools/boise-state/2026-schedule.html");
  });
});
