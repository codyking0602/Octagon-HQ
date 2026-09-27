import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const hub = readFileSync("src/features/play/TodayChallengeHub.tsx", "utf8");
const css = readFileSync("src/styles/daily-leaderboard-result-page.css", "utf8");

describe("Daily leaderboard result overlay contract", () => {
  it("portals the result viewer outside the pull-to-refresh stacking context", () => {
    expect(hub).toContain('import { createPortal } from "react-dom"');
    expect(hub).toContain("return createPortal(resultView, document.body)");
  });

  it("keeps the fullscreen result above the universal header and bottom navigation", () => {
    expect(css).toMatch(/\.today-hub-official-result\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?z-index:\s*100;/);
  });
});
