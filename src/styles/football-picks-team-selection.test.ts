import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/styles/football-picks-team-selection.css"), "utf8");
const main = readFileSync(resolve(process.cwd(), "src/main.tsx"), "utf8");

describe("Football Picks team-aware selection styling", () => {
  it("loads after the base Football Picks stylesheet", () => {
    const base = main.indexOf('import "./styles/football-picks.css";');
    const team = main.indexOf('import "./styles/football-picks-team-selection.css";');
    expect(base).toBeGreaterThanOrEqual(0);
    expect(team).toBeGreaterThan(base);
  });

  it("uses team identity colors for NFL and CFB selected states", () => {
    expect(css).toContain('[aria-label^="New England Patriots "]');
    expect(css).toContain('[aria-label^="Seattle Seahawks "]');
    expect(css).toContain('[aria-label^="San Francisco 49ers "]');
    expect(css).toContain('[aria-label^="Los Angeles Rams "]');
    expect(css).toContain('[aria-label^="Oklahoma Sooners "]');
    expect(css).toContain('[aria-label^="Michigan Wolverines "]');
    expect(css).toContain("--football-pick-team-color");
    expect(css).toContain("color-mix(in srgb, var(--football-pick-team-color) 34%, #111415)");
  });

  it("keeps logos protected while making the selected edge unmistakable", () => {
    expect(css).toContain(".football-pick-team:not(.is-selected) .football-pick-team-mark { opacity: .78; }");
    expect(css).toContain(".football-pick-team.is-selected .football-pick-team-mark");
    expect(css).toContain("inset 3px 0");
    expect(css).toContain("inset -3px 0");
  });
});
