import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const home = readFileSync("src/features/home/HomePage.tsx", "utf8");
const standings = readFileSync("src/features/home/OwnerChampionshipHome.tsx", "utf8");
const recap = readFileSync("src/features/mlb/MlbPostseasonRecapPage.tsx", "utf8");
const picks = readFileSync("src/features/mlb/MlbPicksPage.tsx", "utf8");
const routes = readFileSync("src/app/router.tsx", "utf8");
describe("2026 MLB Championship recap", () => {
  it("folds the season into Championship standings instead of a separate Home archive", () => {
    expect(home).not.toContain("<MlbSeasonArchive");
    expect(standings).toContain('id="mlb-2026-standings"');
    expect(standings).toContain('to="/championship/mlb"');
    expect(routes).toContain('path: "championship/mlb"');
    expect(recap).toContain("<MlbSeasonArchive");
  });
  it("reuses the existing bracket and read-only complete round series picks", () => {
    expect(recap).toContain("<MlbPicksPage archiveMode");
    expect(picks).toContain("archiveMode = false");
    expect(picks).toContain("!archiveMode && !hub.bracketLocked");
    expect(picks).toContain("hub.series.filter(item => item.round === round)");
    expect(picks).toContain("YOUR PICK CORRECT");
    expect(picks).toContain("NO PICK RECORDED");
  });
  it("includes official Play score and rank from Championship data", () => {
    expect(recap).toContain("own.play_points");
    expect(recap).toContain("own.play_rank");
  });
});
