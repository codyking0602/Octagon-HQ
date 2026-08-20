import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  resolve(process.cwd(), "src/styles/daily-leaderboard-result-page.css"),
  "utf8",
);

describe("Daily leaderboard answer presentation", () => {
  it("promotes the answer sheet to a viewport-level result page instead of a nested scroller", () => {
    expect(css).toMatch(/\.today-hub-answer-sheet\s*\{[^}]*position:\s*fixed;/s);
    expect(css).toContain("inset: 0 0 calc(62px + var(--safe-bottom));");
    expect(css).toContain("max-height: none;");
    expect(css).toMatch(/\.today-hub-answer-sheet__body\s*\{[^}]*overflow:\s*visible;/s);
  });
});
