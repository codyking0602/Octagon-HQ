import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles/football-visual-assets.css", "utf8");
const mobileStart = css.indexOf("@media (max-width: 430px)");
const mobileCss = mobileStart >= 0 ? css.slice(mobileStart) : "";

describe("Football Blind Rank mobile reveal spacing", () => {
  it("reserves a wider lane for canonical tier labels than numbered user ranks", () => {
    expect(css).toContain(".football-rank-five-results article {\n  grid-template-columns: 34px 52px minmax(0, 1fr) auto !important;");
    expect(css).toContain(".football-rank-five-results.is-canonical article {\n  grid-template-columns: 52px 52px minmax(0, 1fr) auto !important;");
  });

  it("drops the league badge on narrow phones and preserves the canonical label lane", () => {
    expect(mobileCss).toContain(".football-rank-five-results article {\n    grid-template-columns: 34px 52px minmax(0, 1fr) !important;");
    expect(mobileCss).toContain(".football-rank-five-results.is-canonical article {\n    grid-template-columns: 52px 52px minmax(0, 1fr) !important;");
    expect(mobileCss).toContain(".football-rank-five-results article em {\n    display: none;");
  });
});
