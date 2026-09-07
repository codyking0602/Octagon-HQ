import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const polishStyles = readFileSync(resolve(process.cwd(), "src/styles/football-replayable-polish.css"), "utf8");
const visualStyles = readFileSync(resolve(process.cwd(), "src/styles/football-visual-assets.css"), "utf8");
const appEntry = readFileSync(resolve(process.cwd(), "src/main.tsx"), "utf8");

const replayableGameScopes = [
  ".football-hit-number-page",
  ".football-find-leader-page",
  ".football-rank-five-page",
  ".football-wavelength-page",
  ".football-keep-cut-page",
];

describe("Football HQ replayable presentation polish", () => {
  it("covers exactly the five PR3 replayable game screens without touching Blind Resume", () => {
    for (const selector of replayableGameScopes) {
      expect(polishStyles).toContain(selector);
    }
    expect(polishStyles).not.toContain("football-blind-resume");
  });

  it("keeps the five game layouts phone-first and preserves compact two-column decision boards", () => {
    expect(polishStyles).toContain("@media (max-width: 640px)");
    expect(polishStyles).toContain(".football-find-grid");
    expect(polishStyles).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(polishStyles).toContain(".football-hit-number-lock");
    expect(polishStyles).toContain("position: sticky");
  });

  it("keeps the Keep Cut phone media lane wide enough for its canonical visual", () => {
    expect(visualStyles).toContain(
      ".app-shell--football-room .football-keep-cut-page .football-keep-cut-current {\n  grid-template-columns: 74px minmax(0, 1fr) minmax(110px, auto) !important;",
    );
    expect(visualStyles).toContain(
      ".app-shell--football-room .football-keep-cut-page .football-keep-cut-current > .football-subject-visual {\n  min-width: 74px;",
    );
    expect(visualStyles).toContain(
      "@media (max-width: 700px) {\n  .app-shell--football-room .football-keep-cut-page .football-keep-cut-current {\n    grid-template-columns: 74px minmax(0, 1fr) !important;",
    );
  });

  it("loads after the canonical Football visual system as a presentation-only final layer", () => {
    const shellIndex = appEntry.indexOf('import "./styles/football-shell.css";');
    const assetsIndex = appEntry.indexOf('import "./styles/football-visual-assets.css";');
    const polishIndex = appEntry.indexOf('import "./styles/football-replayable-polish.css";');

    expect(shellIndex).toBeGreaterThan(-1);
    expect(assetsIndex).toBeGreaterThan(shellIndex);
    expect(polishIndex).toBeGreaterThan(assetsIndex);
  });
});
