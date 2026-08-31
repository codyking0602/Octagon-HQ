import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const picksStyles = readFileSync("src/styles/football-picks.css", "utf8");
const shellStyles = readFileSync("src/styles/football-shell.css", "utf8");

describe("Football Picks presentation", () => {
  it("crossfades header artwork instead of snapping between images", () => {
    expect(picksStyles).toContain("transition: opacity 1.8s ease-in-out");
  });

  it("keeps Your Week and collapsed Scoring & Grading at the same compact height", () => {
    expect(picksStyles).toMatch(/\.football-picks-progress \{[^}]*min-height: 54px/);
    expect(picksStyles).toMatch(/\.football-picks-grading:not\(\[open\]\) \{[^}]*height: 54px;[^}]*min-height: 54px/);
    expect(picksStyles).toMatch(/\.football-picks-grading \{[^}]*gap: 0;[^}]*padding: 0/);
  });

  it("uses the canonical Football identity accent for the stronger full-page sheen", () => {
    expect(picksStyles).toContain("rgba(var(--football-accent-rgb, 191, 87, 0), .9)");
    expect(picksStyles).toContain("opacity: .82");
    expect(shellStyles).toMatch(/\.app-shell--football-team-cowboys \{[\s\S]*?--football-accent-rgb: 4, 30, 66;/);
    expect(shellStyles).toMatch(/\.app-shell--football-team-longhorns \{[\s\S]*?--football-accent-rgb: 191, 87, 0;/);
  });
});
