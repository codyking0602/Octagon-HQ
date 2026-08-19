import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const main = readFileSync("src/main.tsx", "utf8");
const page = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const assets = readFileSync("src/features/picks/picksEventAssets.ts", "utf8");
const picksStyles = readFileSync("src/styles/picks-polish.css", "utf8");
const groupStyles = readFileSync("src/styles/picks-group-progress.css", "utf8");
const seasonStyles = readFileSync("src/styles/picks-season-hub.css", "utf8");

describe("Picks event UI standard", () => {
  it("loads one final player-facing style owner after every Picks sub-style", () => {
    expect(main.indexOf('import "./styles/picks-group-progress.css";')).toBeLessThan(
      main.indexOf('import "./styles/picks-polish.css";'),
    );
    expect(main.indexOf('import "./styles/picks-season-hub.css";')).toBeLessThan(
      main.indexOf('import "./styles/picks-polish.css";'),
    );
    expect(seasonStyles).not.toContain(".picks-card-odds {");
    expect(seasonStyles).not.toContain(".pick-bout-card,");
  });

  it("standardizes the complete event hero and its no-header fallback", () => {
    expect(assets).toContain('PICK_EVENT_HEADER_BUCKET = "pick-event-headers"');
    expect(assets).toContain("event.headerStoragePath");
    expect(assets).not.toContain("posterByMainEvent");
    expect(page).toContain("pickEventPoster(activeEvent)");
    expect(page).not.toContain('location.toLowerCase().includes("belgrade")');
    expect(picksStyles).toContain("--picks-event-poster-aspect");
    expect(picksStyles).toContain(".picks-event-hero:not(.has-poster) .picks-event-hero__poster::before {");
    expect(picksStyles).toContain('content: "OCTAGON HQ PICKS";');
    expect(picksStyles).toContain(".picks-event-hero__facts span {");
    expect(picksStyles).toContain(".picks-event-hero .picks-progress {");
  });

  it("keeps fallback event copy compact while hiding redundant poster matchup copy", () => {
    expect(picksStyles).toContain(".picks-event-hero__copy > strong {");
    expect(picksStyles).toContain("white-space: nowrap;");
    expect(picksStyles).toContain("text-overflow: ellipsis;");
    expect(picksStyles).toContain("font-size: clamp(15px, 4.5vw, 20px);");
    expect(picksStyles).toContain(
      ".picks-event-hero.has-poster .picks-event-hero__copy > strong {\n  display: none;\n}",
    );
    expect(picksStyles).toContain(".picks-event-hero.has-poster .picks-event-hero__copy h2 {");
    expect(picksStyles).toContain("clip: rect(0 0 0 0);");
  });

  it("uses one disclosure header standard for Group Picks and scoring rules", () => {
    expect(picksStyles).toContain("--picks-disclosure-height: 46px;");
    expect(picksStyles).toContain("--picks-disclosure-color: var(--text-muted);");
    expect(picksStyles).toContain(".picks-group-progress summary,");
    expect(picksStyles).toContain(".picks-scoring-guide summary {");
    expect(groupStyles).toContain(".picks-group-progress {\n  display: block;");
    expect(groupStyles).toContain("min-height: var(--picks-disclosure-height, 46px);");
  });

  it("makes Group Picks member rows visibly interactive", () => {
    expect(groupStyles).toContain(".picks-group-progress__member > button::after {");
    expect(groupStyles).toContain('.picks-group-progress__member > button[aria-expanded="true"]::after {');
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
