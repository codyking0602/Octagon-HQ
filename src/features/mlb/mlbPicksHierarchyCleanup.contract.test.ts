import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const picks = readFileSync("src/features/mlb/MlbPicksPage.tsx", "utf8");
const summary = readFileSync("src/features/mlb/MlbChampionshipSummary.tsx", "utf8");
const css = readFileSync("src/styles/mlb-playoffs.css", "utf8");

describe("MLB Picks mobile hierarchy cleanup", () => {
  it("keeps current series cards focused on teams, line and schedule", () => {
    expect(picks).not.toContain("PICK SERIES WINNER");
    expect(picks).not.toContain("series.odds_source");
    expect(picks).not.toContain("football-pick-game__status");
    expect(picks).toContain("<small>SERIES ML</small>");
  });

  it("surfaces the completed-series winner instead of burying the result", () => {
    expect(picks).toContain("✓ SERIES WINNER");
    expect(picks).toContain("ELIMINATED");
    expect(picks).toContain("mlb-series-pick-card__result");
    expect(picks).toContain("<small>WINNER</small>");
    expect(picks).toContain('const footerLabel = completeSeries');
  });

  it("makes eliminated bracket teams visually unmistakable", () => {
    expect(css).toContain(".mlb-bracket-mini-team.is-out.is-eliminated");
    expect(css).toContain(".mlb-bracket-mini-team.is-eliminated::after");
    expect(css).toContain("filter: grayscale(1)");
    expect(css).toContain("rgba(226, 115, 115, .76)");
  });

  it("removes duplicate scoring math from the mobile standings hierarchy", () => {
    expect(summary).toContain("YOUR SCORE");
    expect(summary).toContain("OVERALL");
    expect(summary).not.toContain("championship.seriesMax");
    expect(summary).not.toContain("championship.bracketMax");
    expect(summary).not.toContain("championship.playMax");
    expect(picks).not.toContain("SERIES #{entry.series_rank}");
    expect(picks).not.toContain("S {formatChampionshipPoints(entry.series_points)}");
    expect(picks).toContain(">LEADERBOARD</button>");
    expect(picks).toContain(">BRACKET</button>");
  });
});
