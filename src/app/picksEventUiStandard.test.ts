import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const picksStyles = readFileSync("src/styles/picks-polish.css", "utf8");
const groupStyles = readFileSync("src/styles/picks-group-progress.css", "utf8");

describe("Picks event UI standard", () => {
  it("keeps every event matchup on one compact line", () => {
    expect(picksStyles).toContain(".picks-event-hero__copy > strong {");
    expect(picksStyles).toContain("white-space: nowrap;");
    expect(picksStyles).toContain("text-overflow: ellipsis;");
    expect(picksStyles).toContain("font-size: clamp(17px, 4.75vw, 23px);");
  });

  it("uses one disclosure header standard for Group Picks and scoring rules", () => {
    expect(picksStyles).toContain("--picks-disclosure-height: 46px;");
    expect(picksStyles).toContain("--picks-disclosure-color: var(--text-muted);");
    expect(picksStyles).toContain("min-height: var(--picks-disclosure-height);");
    expect(groupStyles).toContain("min-height: var(--picks-disclosure-height, 46px);");
    expect(picksStyles).toContain("border-radius: 14px;");
    expect(groupStyles).toContain("border-radius: 14px;");
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
    expect(picksStyles).toContain("min-height: 40px;");
    expect(picksStyles).toContain("font-size: 10px;");
  });
});
