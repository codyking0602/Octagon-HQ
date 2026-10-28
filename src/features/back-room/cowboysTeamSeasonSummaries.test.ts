import { describe, expect, it } from "vitest";
import {
  COWBOYS_TEAM_SEASON_SUMMARIES,
  cowboysTeamSeasonSummary,
} from "./cowboysTeamSeasonSummaries";

describe("Cowboys team-season summaries", () => {
  it("covers every completed Cowboys season from 2007 through 2025", () => {
    expect(Object.keys(COWBOYS_TEAM_SEASON_SUMMARIES)).toHaveLength(19);
    expect(cowboysTeamSeasonSummary("2007 Cowboys")).toContain("13-3");
    expect(cowboysTeamSeasonSummary("2014 Cowboys")).toContain("Won Wild Card");
    expect(cowboysTeamSeasonSummary("2022 Cowboys")).toContain("Divisional Round");
    expect(cowboysTeamSeasonSummary("2025 Cowboys")).toContain("7-9-1");
    expect(cowboysTeamSeasonSummary("2026 Cowboys")).toBe("");
  });

  it("keeps season summaries factual and grade-free", () => {
    for (const summary of Object.values(COWBOYS_TEAM_SEASON_SUMMARIES)) {
      expect(summary).not.toMatch(/\b(?:grade|rating|elite|tier)\b/i);
    }
  });
});
