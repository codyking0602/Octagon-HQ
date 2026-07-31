import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const styles = readFileSync("src/styles/picks-polish.css", "utf8");

describe("Picks event poster presentation", () => {
  it("shows the complete Belgrade poster at its source aspect ratio", () => {
    expect(styles).toContain(".picks-event-hero.has-poster .picks-event-hero__poster {");
    expect(styles).toContain("aspect-ratio: 480 / 321;");
    expect(styles).toContain("background-size: cover, contain, cover;");
    expect(styles).toContain(".picks-event-hero.has-poster .picks-event-hero__poster::after {");
  });

  it("keeps the matchup visible while removing the redundant event name from the poster card", () => {
    expect(page).toContain('<h2 id="picks-event-title">{activeEvent.name}</h2>');
    expect(page).toContain("<strong>{activeEvent.subtitle}</strong>");
    expect(styles).toContain(".picks-event-hero.has-poster .picks-event-hero__copy h2 {");
    expect(styles).toContain("clip: rect(0 0 0 0);");
    expect(styles).toContain(".picks-event-hero.has-poster .picks-event-hero__copy > strong {");
  });
});
