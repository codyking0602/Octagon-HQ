import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/styles/football-picks.css"), "utf8");

describe("Football Picks finishing polish styles", () => {
  it("keeps the between-slate state compact", () => {
    expect(css).toContain(".football-picks-state { padding: 15px 18px;");
    expect(css).toContain("font-size: clamp(1.15rem, 5vw, 1.55rem)");
    expect(css).toContain(".football-picks-state > p:last-child");
  });

  it("uses the canonical Football powder blue across Picks and its season hub", () => {
    expect(css).toContain("--football-picks-accent: var(--football-brand-blue, #8EBCE6);");
    expect(css).toContain(".football-picks-page .picks-season-hub__meta > em { color: var(--football-picks-accent); }");
    expect(css).toContain(".football-picks-page .picks-season-tabs button.is-active { box-shadow: inset 0 -2px 0 var(--football-picks-accent); }");
    expect(css).toMatch(/\.football-picks-page \.picks-season-standing\.is-current-user[\s\S]*var\(--football-picks-accent\)/);
    expect(css).not.toContain("#d06b2b");
    expect(css).not.toContain("#2f7df6");
  });
});
