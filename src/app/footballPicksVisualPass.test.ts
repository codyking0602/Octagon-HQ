import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Football Picks visual pass", () => {
  it("keeps the matchup balanced and sweeps team-sourced color across the full page", () => {
    const page = readFileSync("src/features/picks/FootballPicksPage.tsx", "utf8");
    const styles = readFileSync("src/styles/football-picks.css", "utf8");

    expect(page).toContain('"--football-picks-sheen-art"');
    expect(page).toContain("setInterval");
    expect(page).toContain("8000");
    expect(styles).toContain(".football-picks-page.has-team-sheen::after");
    expect(styles).toContain("animation: football-picks-page-sheen 8s");
    expect(styles).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("never renders team initials and gives Ohio State a readable shared mark treatment", () => {
    const page = readFileSync("src/features/picks/FootballPicksPage.tsx", "utf8");
    const visualAssets = readFileSync("src/styles/football-visual-assets.css", "utf8");

    expect(page).not.toContain("function teamMark");
    expect(page).not.toContain("teamMark(");
    expect(page).toContain("football-pick-team-mark__placeholder");
    expect(visualAssets).toContain('img[alt*="Ohio State"]');
    expect(visualAssets).toContain('img[src*="/194.png"]');
    expect(visualAssets).toContain("background: #f4f4f0");
  });
});
