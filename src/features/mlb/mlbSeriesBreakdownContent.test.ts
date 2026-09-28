import { describe, expect, it } from "vitest";
import {
  MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS,
  resolveMlbSeriesBreakdownContent,
} from "./mlbSeriesBreakdownContent";

describe("MLB series breakdown content", () => {
  it("locks one compact Wild Card feature: Yankees-Red Sox", () => {
    const feature = MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["al-wc-2"];

    expect(feature).toBeTruthy();
    expect(feature?.series).toContain("season series 7-6");
    expect(feature?.decisions).toHaveLength(3);
    expect(feature?.decisions.map((decision) => decision.title)).toEqual([
      "New York's power",
      "Boston at the top of the order",
      "The late innings",
    ]);
    expect(feature?.decisions[0].body.some((part) => part.href?.includes("ricebe01.shtml"))).toBe(true);
    expect(feature?.decisions[1].body.some((part) => part.href?.includes("anthoro01.shtml"))).toBe(true);
    expect(feature?.hqRead).toContain("high-leverage moments");
  });

  it("publishes only the selected featured matchup once the real field is loaded", () => {
    expect(resolveMlbSeriesBreakdownContent("al-wc-2", false)).toBe(
      MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["al-wc-2"],
    );
    expect(resolveMlbSeriesBreakdownContent("al-wc-2", true)).toBe(
      MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["al-wc-2"],
    );
    expect(resolveMlbSeriesBreakdownContent("al-wc-1", false)).toBeNull();
    expect(resolveMlbSeriesBreakdownContent("nl-wc-1", false)).toBeNull();
    expect(resolveMlbSeriesBreakdownContent("nl-wc-2", false)).toBeNull();
  });
});
