import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/styles/football-week-recap.css"), "utf8");

describe("football week recap styles", () => {
  it("uses Football blue for recap chrome and keeps red semantic-only", () => {
    expect(css).toContain("--football-week-blue: #2f7df6");
    expect(css).toMatch(/\.football-week-recap \.picks-event-recap__header[\s\S]*#10213d/);
    expect(css).toMatch(/football-week-recap__section-heading h3[\s\S]*var\(--football-week-blue/);
    expect(css).toContain("--football-week-red: #e45b5b");
    expect(css).toMatch(/\.football-week-recap__game-outcome \.is-missed,[\s\S]*var\(--football-week-red\)/);
  });
});
