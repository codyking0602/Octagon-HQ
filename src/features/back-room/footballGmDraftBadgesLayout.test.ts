import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const css = readFileSync("src/styles/football-gm-mode.css", "utf8");
const draft = page.slice(page.indexOf('aria-label={`${selectedPosition} candidates`}'),page.indexOf('className="football-wheel-picker__message football-gm__position-prompt"'));

describe("NFL GM draft keeps original badge position with shortened lock wording", () => {
  it("keeps pills inside the name and age column, not a new full-width rail", () => {
    expect(draft).toContain('<span className="football-gm__picker-player-copy">');
    expect(draft).toContain('<span className="football-gm__candidate-tags">');
    expect(draft).not.toContain("football-gm__draft-choice");
    expect(css).not.toContain("NFL GM draft: full-width single-line scouting rail");
    expect(css).not.toContain(".football-gm__draft-choice");
  });
  it("consolidates only the salary lock wording without suppressing outlook or reprice", () => {
    expect(draft).toContain("<PlayerQualityPill player={player} />");
    expect(draft).toContain("<PlayerOutlookPill player={player} />");
    expect(draft).toContain('aria-label="Three-year contract, salary locked"');
    expect(draft).toContain("3YR · LOCKED");
    expect(draft).toContain("{player.gameContract}");
    expect(draft).toContain("{footballGmRepriceLabel(player.extensionRisk)}");
    expect(draft).toContain("<em>SELECT →</em>");
  });
});
