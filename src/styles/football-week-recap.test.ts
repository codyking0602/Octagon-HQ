import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/styles/football-week-recap.css"), "utf8");

describe("football week recap styles", () => {
  it("uses Football blue for recap actions and current-user chrome while keeping red semantic-only", () => {
    expect(css).toContain("--football-week-blue: #2f7df6");
    expect(css).toMatch(/\.football-week-recap \.picks-event-recap__header[\s\S]*#10213d/);
    expect(css).toMatch(/\.football-week-recap \.picks-event-recap__header > button:last-child[\s\S]*rgba\(47, 125, 246, \.58\)/);
    expect(css).toMatch(/\.football-week-archive-card > button[\s\S]*rgba\(47, 125, 246, \.5\)/);
    expect(css).toMatch(/article\.is-current-user[\s\S]*rgba\(47, 125, 246, \.62\)/);
    expect(css).toContain("--football-week-red: #e45b5b");
    expect(css).toMatch(/\.football-week-recap__game-outcome \.is-missed,[\s\S]*var\(--football-week-red\)/);
  });

  it("carries the week artwork and lets mobile matchup names wrap instead of truncating", () => {
    expect(css).toMatch(/\.football-week-recap__poster img[\s\S]*object-fit: contain/);
    expect(css).toMatch(/\.football-week-recap__matchup > strong[\s\S]*white-space: normal/);
    expect(css).toMatch(/@media \(max-width: 560px\)[\s\S]*grid-template-columns: 27px minmax\(0, 1fr\) 12px/);
    expect(css).toMatch(/@media \(max-width: 560px\)[\s\S]*\.football-week-recap__game-outcome[\s\S]*grid-column: 2/);
  });
});
