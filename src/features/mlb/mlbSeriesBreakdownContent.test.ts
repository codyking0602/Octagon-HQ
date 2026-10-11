import { describe, expect, it } from "vitest";
import {
  MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS,
  resolveMlbSeriesBreakdownContent,
} from "./mlbSeriesBreakdownContent";

describe("MLB series breakdown content", () => {
  it("locks one compact Division Series feature: White Sox-Guardians", () => {
    const feature = MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["al-ds-2"];

    expect(feature).toBeTruthy();
    expect(feature?.series).toContain("season series 7-6");
    expect(feature?.series).toContain("58-57");
    expect(feature?.decisions).toHaveLength(3);
    expect(feature?.decisions.map((decision) => decision.title)).toEqual([
      "The margins",
      "Chicago's pressure",
      "Cleveland's run prevention",
    ]);
    expect(feature?.hqRead).toContain("total run differential was one");
  });

  it("publishes a complete 2026 NLCS Dodgers-Brewers feature", () => {
    const feature = MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["nl-cs"];
    expect(feature).toBeTruthy();
    expect(feature?.series).toContain("103 games");
    expect(feature?.series).toContain("2026 head-to-head series 4-3");
    expect(feature?.decisions.map((decision) => decision.title)).toEqual([
      "Home-field advantage",
      "The rematch",
      "Game 1 pitching",
    ]);
    expect(feature?.hqRead).toContain("Brewers earned the home field");
  });

  it("preserves the archived Division Series feature and publishes NLCS", () => {
    expect(resolveMlbSeriesBreakdownContent("al-ds-2", false)).toBe(
      MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["al-ds-2"],
    );
    expect(resolveMlbSeriesBreakdownContent("al-ds-2", true)).toBe(
      MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["al-ds-2"],
    );
    expect(resolveMlbSeriesBreakdownContent("nl-cs", false)).toBe(MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["nl-cs"]);
    expect(resolveMlbSeriesBreakdownContent("al-ds-1", false)).toBeNull();
    expect(resolveMlbSeriesBreakdownContent("nl-ds-1", false)).toBeNull();
    expect(resolveMlbSeriesBreakdownContent("nl-ds-2", false)).toBeNull();
  });
});
