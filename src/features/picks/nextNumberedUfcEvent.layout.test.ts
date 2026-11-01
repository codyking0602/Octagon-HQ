import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/features/picks/nextNumberedUfcEvent.css", "utf8");

describe("numbered UFC Picks poster framing", () => {
  it("keeps both fighter heads and the entire matchup lettering within the visible crop", () => {
    // Reviewed UFC 334 poster is 1000x563. At a 2.35:1 banner ratio, cover
    // displays the first 426 source pixels, including the headline (~y=380).
    const sourceVisibleBottom = 1000 / 2.35;
    expect(sourceVisibleBottom).toBeGreaterThan(400);
    expect(css).toMatch(/\.ufc-next-event__art\{[^}]*aspect-ratio:2\.35 \/ 1;/);
    expect(css).toMatch(/\.ufc-next-event__poster\{[^}]*object-position:center top;/);
    expect(css).toContain("transparent 9%");
  });

  it("never restores the short mobile banner that clipped the fighters", () => {
    expect(css).toContain("@media(max-width:360px){.ufc-next-event__art{min-height:138px}");
    expect(css).not.toContain(".ufc-next-event__art{height:92px}");
    expect(css).not.toContain("object-position:center 19%");
  });
});
