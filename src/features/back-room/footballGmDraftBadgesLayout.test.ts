import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const css = readFileSync("src/styles/football-gm-mode.css", "utf8");

describe("NFL GM draft scouting badges stay on one line", () => {
  it("keeps the 3YR and salary lock information in one compact pill", () => {
    expect(page).toContain('className="football-gm__draft-choice"');
    expect(page).toContain('className="football-gm__candidate-tags football-gm__draft-choice-tags"');
    expect(page).toContain('player.gameContract === "3YR" ? (');
    expect(page).toContain('aria-label="Three-year contract, salary locked"');
    expect(page).toContain("3YR · LOCKED");
    // One-year players still display their actual tier of salary exposure.
    expect(page).toContain("{footballGmRepriceLabel(player.extensionRisk)}");
  });

  it("uses a separate full-width badge row at desktop and small-phone widths", () => {
    expect(css).toContain(".football-gm__draft-choice > .football-gm__draft-choice-tags");
    expect(css).toContain("grid-column: 1 / -1;");
    expect(css).toContain("flex-wrap: nowrap;");
    expect(css).toContain("white-space: nowrap;");
    expect(css).toContain("@media (max-width: 390px)");
    expect(css).toContain("grid-template-rows: auto auto auto;");
    expect(css).toContain("grid-row: 3;");
    // Do not collapse salary or selection to solve the wrap.
    expect(css).toContain(".football-gm__draft-choice > .football-gm__picker-action");
  });
});
