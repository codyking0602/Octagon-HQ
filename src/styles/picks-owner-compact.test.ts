import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const compactStyles = readFileSync(new URL("./picks-owner-compact.css", import.meta.url), "utf8");
const appEntry = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");

describe("compact Picks owner controls", () => {
  it("removes the redundant unlocked status without hiding locked state", () => {
    expect(compactStyles).toContain(".pick-bout-card .picks-status--upcoming");
    expect(compactStyles).toContain("display: none");
    expect(compactStyles).not.toContain(".picks-status--locked");
  });

  it("compresses only the upcoming pre-lock owner card controls", () => {
    expect(compactStyles).toContain('[aria-label$="pre-lock card controls"] .pick-control-bout');
    expect(compactStyles).toContain("grid-template-columns: minmax(0, 1fr) auto");
    expect(compactStyles).toContain(".pick-control-bout > p:not(.pick-control-replacement-history)");
    expect(compactStyles).toContain("min-height: 36px");
  });

  it("loads after the canonical Picks control styles so the narrow layer owns only presentation", () => {
    const canonicalIndex = appEntry.indexOf('import "./styles/picks-control-center.css";');
    const compactIndex = appEntry.indexOf('import "./styles/picks-owner-compact.css";');

    expect(canonicalIndex).toBeGreaterThan(-1);
    expect(compactIndex).toBeGreaterThan(canonicalIndex);
  });
});
