import { describe, expect, it } from "vitest";
import {
  LONGHORNS_PLAYER_SUMMARIES,
  longhornsPlayerSummary,
} from "./longhornsPlayerSummaries";

describe("Longhorns player summaries", () => {
  it("covers the complete approved 70-player Longhorns Since 2003 population", () => {
    expect(Object.keys(LONGHORNS_PLAYER_SUMMARIES)).toHaveLength(70);
    expect(longhornsPlayerSummary("Unknown Longhorn")).toBe("");
  });

  it("keeps the brief Texas-resume anchors factual and grade-free", () => {
    expect(longhornsPlayerSummary("Vince Young")).toBe("QB • 2005 National Champion • Maxwell Award");
    expect(longhornsPlayerSummary("Brian Orakpo")).toBe("EDGE • 2008 Nagurski + Lombardi + Hendricks winner");
    expect(longhornsPlayerSummary("Michael Dickson")).toBe("P • 2017 Ray Guy Award • Unanimous All-American");
    expect(longhornsPlayerSummary("Derrick Johnson")).toBe("LB • 2004 Butkus + Nagurski winner • Unanimous All-American");
    expect(longhornsPlayerSummary("Cedric Benson")).toBe("RB • 2004 Doak Walker winner • 5,540 career rushing yards");
    expect(longhornsPlayerSummary("Bo Scaife")).toBe("TE • 2004 first-team All-Big 12 • 75 career catches");

    for (const summary of Object.values(LONGHORNS_PLAYER_SUMMARIES)) {
      expect(summary).not.toMatch(/grade|icon|elite|star|strong|core/i);
    }
  });
});
