import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/styles/football-draft-room.css"), "utf8");
const entry = readFileSync(resolve(process.cwd(), "src/main.tsx"), "utf8");

describe("Football Draft Room skin", () => {
  it("loads after the shared Auction owner and uses the canonical Football powder blue", () => {
    expect(entry.indexOf('import "./styles/football-draft-room.css";'))
      .toBeGreaterThan(entry.indexOf('import "./styles/auction.css";'));
    expect(css).toContain("--football-draft-room-accent: var(--football-brand-blue, #8EBCE6);");
    expect(css).toContain(".football-room-page.auction-page .auction-current__status");
    expect(css).toContain(".football-room-page.auction-page .auction-bid fieldset button.is-selected");
  });

  it("is a color-only sport skin and does not fork Auction layout ownership", () => {
    expect(css).not.toMatch(/\bdisplay\s*:/);
    expect(css).not.toMatch(/\bgrid-template/);
    expect(css).not.toMatch(/\bpadding\s*:/);
    expect(css).not.toMatch(/\bmargin\s*:/);
    expect(css).not.toMatch(/\b(min-|max-)?width\s*:/);
    expect(css).not.toMatch(/\b(min-|max-)?height\s*:/);
    expect(css).not.toMatch(/\bgap\s*:/);
    expect(css).not.toContain("--ufc-red-strong");
    expect(css).not.toContain("rgba(240, 23, 23");
  });
});
