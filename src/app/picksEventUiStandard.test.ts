import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../features/picks/PicksPage.tsx", import.meta.url), "utf8");
const groupStyles = readFileSync(new URL("../styles/picks-group.css", import.meta.url), "utf8");
const picksStyles = readFileSync(new URL("../styles/picks-polish.css", import.meta.url), "utf8");

describe("Picks event UI standard", () => {
  it("loads one final player-facing style owner after every Picks sub-style", () => {
    const polishIndex = main.indexOf('import "./styles/picks-polish.css"');
    expect(polishIndex).toBeGreaterThan(main.indexOf('import "./styles/picks.css"'));
    expect(polishIndex).toBeGreaterThan(main.indexOf('import "./styles/picks-group.css"'));
    expect(polishIndex).toBeGreaterThan(main.indexOf('import "./styles/picks-season.css"'));
    expect(polishIndex).toBeGreaterThan(main.indexOf('import "./styles/picks-control.css"'));
  });

  it("standardizes the complete event hero and its no-header fallback", () => {
    expect(page).toContain('className={`surface-card picks-event-hero${eventPoster ? " has-poster" : ""}`}');
    expect(page).toContain('className="picks-event-hero__poster"');
    expect(page).toContain('className="picks-event-hero__content"');
    expect(picksStyles).toContain(".picks-event-hero.has-poster .picks-event-hero__poster {");
    expect(picksStyles).toContain("aspect-ratio: var(--picks-event-poster-aspect, 480 / 321);");
    expect(picksStyles).toContain("background-size: cover, contain, cover;");
    expect(picksStyles).toContain(".picks-event-hero:not(.has-poster) .picks-event-hero__poster::before {");
    expect(picksStyles).toContain('content: "OCTAGON HQ PICKS";');
  });

  it("keeps every event matchup on one compact line", () => {
    expect(page).toContain('className="pick-bout-card__choices"');
    expect(page).toContain('className="pick-bout-card__versus"');
    expect(picksStyles).toContain("grid-template-columns: minmax(0, 1fr) 36px minmax(0, 1fr);");
  });

  it("uses one disclosure header standard for Group Picks and scoring rules", () => {
    expect(picksStyles).toContain("--picks-disclosure-height: 46px;");
    expect(picksStyles).toContain("--picks-disclosure-padding: 16px;");
    expect(picksStyles).toContain(".picks-group-progress summary,");
    expect(picksStyles).toContain(".picks-group-progress--static,");
    expect(picksStyles).toContain(".picks-scoring-guide summary {");
  });

  it("makes Group Picks member rows visibly interactive", () => {
    expect(groupStyles).toContain(".picks-group-progress__member > button::after");
    expect(groupStyles).toContain('content: "›";');
    expect(groupStyles).toContain("cursor: pointer;");
  });

  it("uses odds provenance as the fight-card separator without duplicate progress", () => {
    expect(page).not.toContain('className="picks-sticky-progress"');
    expect(picksStyles).not.toContain(".picks-sticky-progress {");
    expect(picksStyles).toContain(".picks-card-odds {");
    expect(picksStyles).toContain('content: "ODDS · ";');
    expect(picksStyles).toContain("min-height: 40px;");
    expect(picksStyles).toContain("font-size: 10px;");
  });

  it("locks the fight-card, selection, lock, spotlight, and season-summary geometry", () => {
    expect(picksStyles).toContain("--picks-surface-radius: 18px;");
    expect(picksStyles).toContain("--picks-choice-min-height: 124px;");
    expect(picksStyles).toContain("--picks-thumb-size: 66px;");
    expect(picksStyles).toContain("--picks-main-thumb-size: 82px;");
    expect(picksStyles).toContain(".pick-choice.is-selected {");
    expect(picksStyles).toContain(".pick-lock-action.is-selected,");
    expect(picksStyles).toContain(".main-event-spotlight-trigger {");
    expect(picksStyles).toContain(".picks-season-hub__summary {");
  });
});
