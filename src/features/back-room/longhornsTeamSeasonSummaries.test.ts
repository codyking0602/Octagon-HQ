import { describe, expect, it } from "vitest";
import {
  LONGHORNS_TEAM_SEASON_SUMMARIES,
  longhornsTeamSeasonSummary,
} from "./longhornsTeamSeasonSummaries";

describe("Longhorns team-season summaries", () => {
  it("covers every completed 2003-2025 Texas season and excludes 2026", () => {
    expect(Object.keys(LONGHORNS_TEAM_SEASON_SUMMARIES)).toHaveLength(23);
    expect(Object.keys(LONGHORNS_TEAM_SEASON_SUMMARIES)).toEqual(
      Array.from({ length: 23 }, (_, index) => `${2003 + index} Texas`),
    );
    expect(longhornsTeamSeasonSummary("2026 Texas")).toBe("");
  });

  it("keeps the approved high-signal postseason wording", () => {
    expect(longhornsTeamSeasonSummary("2003 Texas")).toBe("10–3 • Holiday Bowl Appearance");
    expect(longhornsTeamSeasonSummary("2004 Texas")).toBe("11–1 • Rose Bowl Champion");
    expect(longhornsTeamSeasonSummary("2005 Texas")).toBe("13–0 • National Champion");
    expect(longhornsTeamSeasonSummary("2008 Texas")).toBe("12–1 • BCS Bowl Champion");
    expect(longhornsTeamSeasonSummary("2018 Texas")).toBe("10–4 • New Year’s Six Bowl Champion");
    expect(longhornsTeamSeasonSummary("2023 Texas")).toBe("12–2 • Big 12 Champion • CFP Semifinalist");
    expect(longhornsTeamSeasonSummary("2025 Texas")).toBe("10–3 • Citrus Bowl Champion");
  });
});
