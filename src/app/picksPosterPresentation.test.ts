import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const assets = readFileSync("src/features/picks/picksEventAssets.ts", "utf8");
const styles = readFileSync("src/styles/picks-polish.css", "utf8");

describe("Picks event poster presentation", () => {
  it("shows persisted event headers at their stored native aspect ratio", () => {
    expect(page).toContain("pickEventPoster(activeEvent)");
    expect(page).toContain('"--picks-event-poster-aspect": eventPoster.aspectRatio');
    expect(assets).toContain('PICK_EVENT_HEADER_BUCKET = "pick-event-headers"');
    expect(assets).toContain("event.headerStoragePath");
    expect(assets).toContain("`${event.headerNaturalWidth} / ${event.headerNaturalHeight}`");
    expect(assets).not.toContain("posterByMainEvent");
    expect(styles).toContain("aspect-ratio: var(--picks-event-poster-aspect, 480 / 321);");
    expect(styles).toContain("background-size: cover, contain, cover;");
  });

  it("keeps the matchup visible while removing the redundant event name from poster cards", () => {
    expect(page).toContain('<h2 id="picks-event-title">{activeEvent.name}</h2>');
    expect(page).toContain("<strong>{activeEvent.subtitle}</strong>");
    expect(styles).toContain(".picks-event-hero.has-poster .picks-event-hero__copy h2 {");
    expect(styles).toContain("clip: rect(0 0 0 0);");
    expect(styles).toContain(".picks-event-hero.has-poster .picks-event-hero__copy > strong {");
  });

  it("provides one standard branded fallback when no persisted header exists", () => {
    expect(styles).toContain(".picks-event-hero:not(.has-poster) .picks-event-hero__poster::before {");
    expect(styles).toContain('content: "OCTAGON HQ PICKS";');
    expect(page).not.toContain('location.toLowerCase().includes("belgrade")');
    expect(assets).not.toContain("/events/");
  });
});
