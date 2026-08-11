import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const styles = readFileSync("src/styles/picks-polish.css", "utf8");

describe("UFC 330 poster fill contract", () => {
  it("lets a correctly sized event poster occupy the full hero slot without a fade", () => {
    expect(styles).toContain("aspect-ratio: var(--picks-event-poster-aspect, 480 / 321)");
    expect(styles).toContain("background-size: cover, contain, cover");
    expect(styles).toContain(".picks-event-hero.has-poster .picks-event-hero__poster::after");
    expect(styles).toContain("display: none");
  });
});
