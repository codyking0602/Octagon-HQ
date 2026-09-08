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

  it("overrides shared season-hub decoration only inside the Football page", () => {
    expect(css).toMatch(/\.football-picks-page \.picks-season-hub__meta > em \{ color: #64a2ff; \}/);
    expect(css).toMatch(/\.football-picks-page \.picks-season-tabs button\.is-active \{ box-shadow: inset 0 -2px 0 #2f7df6; \}/);
    expect(css).toMatch(/\.football-picks-page \.picks-season-standing\.is-current-user[\s\S]*#2f7df6/);
    expect(css).toMatch(/\.football-picks-page \.picks-season-standing__name > em[\s\S]*rgba\(47, 125, 246, \.55\)/);
  });
});
