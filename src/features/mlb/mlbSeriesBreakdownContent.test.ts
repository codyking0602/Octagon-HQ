import { describe, expect, it } from "vitest";
import {
  MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS,
  resolveMlbSeriesBreakdownContent,
} from "./mlbSeriesBreakdownContent";

describe("MLB series breakdown content", () => {
  it("locks one compact Wild Card feature: Yankees-Red Sox", () => {
    const feature = MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["al-wc-2"];

    expect(feature).toBeTruthy();
    expect(feature?.eyebrow).toContain("AL WILD CARD");
    expect(feature?.decisions).toHaveLength(3);
    expect(feature?.players).toHaveLength(2);
    expect(feature?.players.map((player) => player.name)).toEqual(["Ben Rice", "Roman Anthony"]);
    expect(feature?.winPaths.nyy).toHaveLength(3);
    expect(feature?.winPaths.bos).toHaveLength(3);
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
