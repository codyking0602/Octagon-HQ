import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const picksStyles = readFileSync("src/styles/football-picks.css", "utf8");

describe("Football Picks presentation", () => {
  it("crossfades header artwork instead of snapping between images", () => {
    expect(picksStyles).toContain("transition: opacity 1.8s ease-in-out");
  });

  it("keeps Your Week and collapsed Scoring & Grading at the same compact height", () => {
    expect(picksStyles).toMatch(/\.football-picks-progress \{[^}]*min-height: 54px/);
    expect(picksStyles).toMatch(/\.football-picks-grading:not\(\[open\]\) \{[^}]*height: 54px;[^}]*min-height: 54px/);
    expect(picksStyles).toMatch(/\.football-picks-grading \{[^}]*gap: 0;[^}]*padding: 0/);
  });

  it("mirrors the UFC Picks artwork-driven atmosphere with a slower sheen cadence", () => {
    expect(picksStyles).toContain("var(--picks-event-poster)");
    expect(picksStyles).toContain("linear-gradient(112deg");
    expect(picksStyles).toContain("animation: football-picks-page-sheen 13s ease-in-out infinite");
    expect(picksStyles).toContain("36%, 100% { opacity: 0");
  });

  it("keeps the weekly ATS instruction on one line", () => {
    expect(picksStyles).toMatch(/\.football-picks-slate > header h2 \{[^}]*white-space: nowrap/);
    expect(picksStyles).toMatch(/\.football-picks-slate > header h2 \{[^}]*font-size: clamp\(\.68rem, 3vw, 1\.15rem\)/);
  });
});
