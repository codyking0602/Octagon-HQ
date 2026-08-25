import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles/football-find-leader.css", "utf8");
const mobileStart = css.indexOf("@media (max-width: 640px)");
const mobileCss = mobileStart >= 0 ? css.slice(mobileStart) : "";

describe("Football Find the Leader mobile compression", () => {
  it("keeps the full candidate tile as the eliminate control instead of rendering a separate active action strip", () => {
    expect(css).toContain(".football-find-card:not(.is-safe) > em {\n  display: none;");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
  });

  it("compresses the mobile hero, progress rail, and five-row board", () => {
    expect(mobileCss).toContain("font-size: clamp(17px, 4.8vw, 21px);");
    expect(mobileCss).toContain(".football-find-hero__copy > p:not(.eyebrow) {\n    display: none;");
    expect(mobileCss).toContain("min-height: 27px;");
    expect(mobileCss).toContain("height: 72px;");
    expect(mobileCss).toContain("width: 52px;\n    height: 52px;");
  });

  it("keeps the compact question responsive instead of allowing long copy to clip horizontally", () => {
    expect(css).toContain("overflow-wrap: anywhere;");
    expect(css).toContain("text-wrap: balance;");
    expect(mobileCss).toContain("max-width: 100%;");
  });
});
