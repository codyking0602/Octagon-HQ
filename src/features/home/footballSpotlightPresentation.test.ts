import { describe, expect, it } from "vitest";
import { footballSpotlightForDisplay } from "./footballSpotlightPresentation";
import { FOOTBALL_PLAYER_SPOTLIGHT_PAIRS } from "./footballPlayerSpotlightSchedule";

describe("Football Spotlight weekly display contract", () => {
  it("keeps game result and measurements separate from the four stat cells", () => {
    const pair = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS.find((entry) => entry.id === "2026-10-13-sellers-maye");
    expect(pair).toBeDefined();
    const sellers = footballSpotlightForDisplay(pair!.spotlights.cfb);
    expect(sellers.stats).toHaveLength(4);
    expect(sellers.stats.map((stat) => stat.label)).toContain("RUSH TD");
    expect(sellers.stats.some((stat) => stat.value === "0" && stat.label === "INT")).toBe(false);
    expect(sellers.result).toBe("AT #16 FLORIDA · W 38–19");
    expect(sellers.measurements).toContain("240 LB");
  });
  it("normalizes older published weekly content without guessing unknown rushing stats", () => {
    const pair = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS.find((entry) => entry.id === "2026-10-13-sellers-maye")!;
    const oldPublished = {
      ...pair.spotlights.cfb,
      stats: [{ value: "279", label: "PASS YDS" }, { value: "4", label: "PASS TD" }, { value: "65.7%", label: "CMP" }, { value: "0", label: "INT" }],
      result: "AT #16 FLORIDA · W 38–19 · 5 TOTAL TD",
    };
    const display = footballSpotlightForDisplay(oldPublished);
    expect(display.result).toBe("AT #16 FLORIDA · W 38–19");
    expect(display.stats[3]).toEqual({ value: "1", label: "RUSH TD" });
    const withoutEvidence = footballSpotlightForDisplay({ ...oldPublished, result: "AT #16 FLORIDA · W 38–19" });
    expect(withoutEvidence.stats[3]).toEqual({ value: "0", label: "INT" });
  });
});
