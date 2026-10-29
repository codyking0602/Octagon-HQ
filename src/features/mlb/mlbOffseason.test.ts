import { describe, expect, it } from "vitest";
import { canViewMlbCloseoutBanner, MLB_CLOSEOUT_BANNER_EXPIRES_AT } from "./mlbOffseason";
import { entrySport, sportsForDisplay } from "../../app/sportPriority";
import { nextSport, SPORT_ORDER } from "../../app/SportProvider";

describe("MLB 2026 offseason", () => {
  it("keeps MLB out of Home, Picks and Play choices, including custom priority orders", () => {
    expect(SPORT_ORDER).not.toContain("mlb");
    expect(sportsForDisplay(["mlb", "football", "ufc", "nba"], true, true)).toEqual(["football", "ufc", "nba"]);
    expect(nextSport("nba", true, true, ["mlb", "nba", "football"])).toBe("football");
    expect(entrySport("mlb", "football")).toBe("football");
    expect(entrySport("all", "mlb")).toBe("football");
  });
  it("shows the closeout banner only to Cody and Shane", () => {
    for (const name of ["CODY", "CODY KING", "SHANE", "SHANE KING"])
      expect(canViewMlbCloseoutBanner({ displayName: name }, MLB_CLOSEOUT_BANNER_EXPIRES_AT - 1)).toBe(true);
    for (const name of ["TROY", "ASHLEY", "SHANE JR", ""])
      expect(canViewMlbCloseoutBanner({ displayName: name }, MLB_CLOSEOUT_BANNER_EXPIRES_AT - 1)).toBe(false);
    expect(canViewMlbCloseoutBanner(null, MLB_CLOSEOUT_BANNER_EXPIRES_AT - 1)).toBe(false);
  });
  it("expires at the original production deadline and does not reset for any profile", () => {
    expect(canViewMlbCloseoutBanner({ displayName: "CODY" }, MLB_CLOSEOUT_BANNER_EXPIRES_AT - 1)).toBe(true);
    expect(canViewMlbCloseoutBanner({ displayName: "SHANE" }, MLB_CLOSEOUT_BANNER_EXPIRES_AT)).toBe(false);
    expect(canViewMlbCloseoutBanner({ displayName: "CODY" }, MLB_CLOSEOUT_BANNER_EXPIRES_AT + 86400000)).toBe(false);
  });
});
