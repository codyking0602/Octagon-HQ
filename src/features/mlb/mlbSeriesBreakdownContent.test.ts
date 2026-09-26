import { describe, expect, it } from "vitest";
import {
  MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS,
  resolveMlbSeriesBreakdownContent,
} from "./mlbSeriesBreakdownContent";

describe("MLB series breakdown content", () => {
  it("locks the approved compact full-page structure for the owner preview", () => {
    const preview = MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["al-wc-2"];

    expect(preview).toBeTruthy();
    expect(preview?.decisions).toHaveLength(3);
    expect(preview?.players).toHaveLength(2);
    expect(preview?.winPaths.nyy).toHaveLength(3);
    expect(preview?.winPaths.bos).toHaveLength(3);
    expect(preview?.series.length).toBeGreaterThan(100);
    expect(preview?.hqRead.length).toBeGreaterThan(100);
  });

  it("never leaks mock owner-preview analysis into live-field mode", () => {
    expect(resolveMlbSeriesBreakdownContent("al-wc-2", false)).toBeNull();
    expect(resolveMlbSeriesBreakdownContent("al-wc-2", true)).toBe(
      MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS["al-wc-2"],
    );
  });
});
