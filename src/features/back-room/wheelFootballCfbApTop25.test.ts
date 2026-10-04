import { describe, expect, it } from "vitest";
import authorityJson from "../../../data/curated/football/cfb/ap-top-25-2026-current.json";
import { WHEEL_FOOTBALL_CFB_AP_TOP25 } from "./wheelFootballCfbApTop25";

describe("CFB Wheel AP Top 25 authority", () => {
  it("keeps one verified, ordered set of exactly 25 schools", () => {
    expect(authorityJson.poll).toBe("AP Top 25");
    expect(authorityJson.pollDate).toBe("2026-09-27");
    expect(WHEEL_FOOTBALL_CFB_AP_TOP25).toHaveLength(25);
    expect(WHEEL_FOOTBALL_CFB_AP_TOP25.map((entry) => entry.rank))
      .toEqual(Array.from({ length: 25 }, (_, index) => index + 1));
    expect(new Set(WHEEL_FOOTBALL_CFB_AP_TOP25.map((entry) => entry.teamCode)).size).toBe(25);
  });

  it("matches the September 27 AP poll anchors, including the ranked Boise State supplement", () => {
    expect(WHEEL_FOOTBALL_CFB_AP_TOP25[0]).toMatchObject({ rank: 1, teamCode: "texas" });
    expect(WHEEL_FOOTBALL_CFB_AP_TOP25.find((entry) => entry.teamCode === "usc")?.rank).toBe(18);
    expect(WHEEL_FOOTBALL_CFB_AP_TOP25.find((entry) => entry.teamCode === "boise-state")?.rank).toBe(22);
    expect(WHEEL_FOOTBALL_CFB_AP_TOP25[24]).toMatchObject({ rank: 25, teamCode: "missouri" });
  });
});
