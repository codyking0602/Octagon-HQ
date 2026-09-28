import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync("src/features/mlb/MlbHomeHq.tsx", "utf8");
const spotlight = readFileSync("src/features/mlb/MlbPlayerSpotlight.tsx", "utf8");
const breakdown = readFileSync("src/features/mlb/MlbSeriesBreakdownPage.tsx", "utf8");
const css = readFileSync("src/styles/mlb-playoffs.css", "utf8");
const config = readFileSync("src/features/mlb/mlbPlayoffsConfig.ts", "utf8");

describe("MLB spotlight series polish", () => {
  it("uses the proven white-logo treatment for the Yankees on the home card", () => {
    expect(home).toContain('asset?.abbreviation === "NYY" ? " is-white-logo" : ""');
  });

  it("keeps Pete Crow-Armstrong's name visually plain while linking his profile", () => {
    expect(spotlight).toContain('className="mlb-player-spotlight__name-link"');
    expect(css).toContain(".football-player-spotlight__copy h3 > a.mlb-player-spotlight__name-link");
    expect(css).toContain("background: transparent");
  });

  it("matches the compact HQ breakdown structure without the removed long-form sections", () => {
    expect(breakdown).toContain("THE HQ'S MLB SPOTLIGHT SERIES");
    expect(breakdown).toContain("THE SERIES");
    expect(breakdown).toContain("3 THINGS THAT MATTER");
    expect(breakdown).toContain("THE HQ READ");
    expect(breakdown).not.toContain("PLAYERS TO WATCH");
    expect(breakdown).not.toContain("HOW {");
  });

  it("keeps MLB owner-only during review", () => {
    expect(config).toContain("MLB_PLAYOFFS_PUBLIC_ENABLED = false");
  });
});
