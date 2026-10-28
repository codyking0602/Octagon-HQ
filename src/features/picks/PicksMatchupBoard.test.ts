import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const picksPolish = readFileSync("src/styles/picks-polish.css", "utf8");

describe("Picks matchup game board styling", () => {
  it("keeps distinct red and blue corner selection treatments with a central VS board", () => {
    expect(picksPolish).toContain(".pick-bout-card__choices > .pick-choice:first-child.is-selected");
    expect(picksPolish).toContain(".pick-bout-card__choices > .pick-choice:last-child.is-selected");
    expect(picksPolish).toContain(".pick-bout-card__versus");
    expect(picksPolish).toContain("--picks-main-thumb-size: 82px");
  });

  it("keeps lower-card fights compact without shrinking the premium main event", () => {
    expect(picksPolish).toContain(".pick-bout-card:not(.is-main-event) {");
    expect(picksPolish).toContain(".pick-bout-card:not(.is-main-event) .pick-choice {");
    expect(picksPolish).toContain("min-height: 104px");
    expect(picksPolish).toContain("-webkit-line-clamp: 1");
    expect(picksPolish).toContain(".pick-bout-card:not(.is-main-event) .pick-choice > em {");
    expect(picksPolish).toContain("margin-top: 0");
    expect(picksPolish).toContain(".pick-bout-card.is-main-event .pick-choice {");
    expect(picksPolish).toContain("min-height: 158px");
  });

  it("keeps selection motion brief and disables it for reduced-motion users", () => {
    expect(picksPolish).toContain("animation: picks-choice-confirm .22s ease-out");
    expect(picksPolish).toContain("@media (prefers-reduced-motion: reduce)");
    expect(picksPolish).toContain("animation: none");
  });
});