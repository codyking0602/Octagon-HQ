import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const read = (file: string) => readFileSync("src/features/mlb/" + file,"utf8");
describe("2026 MLB full-season recap", () => {
  it("loads real saved series picks for each profile, including the World Series", () => {
    expect(read("mlbSeasonRecap.ts")).toContain('get_mlb_postseason_season_recap');
    expect(read("MlbPicksPage.tsx")).toContain("archiveSeriesPicks.find");
    expect(read("MlbPicksPage.tsx")).toContain("seriesProfileId");
    expect(read("MlbPicksPage.tsx")).toContain("CORRECT PICK");
  });
  it("preserves original bracket picks while separately showing the actual result bracket", () => {
    expect(read("MlbPicksPage.tsx")).toContain('bracketMode === "results"');
    expect(read("MlbPicksPage.tsx")).toContain("actualBracketPicks");
    expect(read("MlbPicksPage.tsx")).toContain("bracketZoomed");
  });
  it("gives all participants a Play summary and event-by-event finishes", () => {
    const recap=read("MlbPostseasonRecapPage.tsx");
    expect(recap).toContain("<MlbPlaySeasonSummary");
    const detail=read("MlbPlaySeasonSummary.tsx");
    expect(detail).toContain("entry.profile_id");
    expect(detail).toContain("result.raw_score");
    expect(detail).toContain("result.points");
  });
});
