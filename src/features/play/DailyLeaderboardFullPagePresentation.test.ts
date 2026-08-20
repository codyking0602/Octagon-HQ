import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  resolve(process.cwd(), "src/styles/daily-leaderboard-result-page.css"),
  "utf8",
);

describe("Daily leaderboard result presentation", () => {
  it("gives the canonical Daily result its own viewport-level scroll surface", () => {
    expect(css).toMatch(/\.today-hub-official-result\s*\{[^}]*position:\s*fixed;/s);
    expect(css).toMatch(/\.today-hub-official-result\s*\{[^}]*inset:\s*0;/s);
    expect(css).toMatch(/\.today-hub-official-result\s*\{[^}]*overflow-y:\s*auto;/s);
    expect(css).toContain(".today-hub-official-result__body");
    expect(css).not.toContain("today-hub-answer-sheet");
  });
});
