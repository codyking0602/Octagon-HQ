import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { nbaSpotlightWeekLabel } from "./nbaWeeklySpotlight";

const css = readFileSync("src/styles/nba-owner-home.css", "utf8");
const football = readFileSync("src/styles/home-football-hq.css", "utf8");
const component = readFileSync("src/features/nba/NbaOwnerHomeHq.tsx", "utf8");
const current = JSON.parse(readFileSync("public/nba-weekly/active.json", "utf8")) as {
  player: { summary: string; highlightUrl: string };
  team: { summary: string; highlightUrl?: string };
};

function rules(selector: string) {
  // A selector may appear in a base declaration and multiple mobile overrides.
  // Examine all of its blocks, not whichever declaration happens to be last.
  const blocks = css.split(selector + " {").slice(1).map(part => part.slice(0, part.indexOf("}")));
  expect(blocks.length, `Missing CSS block ${selector}`).toBeGreaterThan(0);
  return blocks.join("\n");
}

describe("Basketball HQ locked Football mobile sizing", () => {
  it("matches Football's compact picks, Daily, and player spotlight geometry", () => {
    expect(football).toContain(".football-hq--compact-preview .football-player-spotlight {");
    expect(football).toContain("min-height: 156px;");
    expect(rules(".nba-hq-owner__picks")).toContain("height: 76px;");
    expect(rules(".nba-hq-owner__daily")).toContain("height: 63px;");
    expect(rules(".nba-hq-owner__player")).toContain("height: 156px;");
    expect(rules(".nba-hq-owner__team")).toContain("height: 133px;");
    expect(rules(".nba-hq-owner__watch")).toContain("min-height: 32px;");
    expect(css).toContain("@media (max-width: 350px)");
  });
  it("keeps full content accessible while visually restricting summaries to two lines", () => {
    expect(css).toContain("-webkit-line-clamp: 2;");
    expect(component).toContain("title={weekly.player.summary}");
    expect(component).toContain("title={weekly.team.summary}");
    expect(current.player.summary.length).toBeLessThanOrEqual(78);
    expect(current.team.summary.length).toBeLessThanOrEqual(78);
  });
  it("avoids raw dates, owner testing clutter, fabricated rankings, and team videos", () => {
    expect(nbaSpotlightWeekLabel("2026-10-20", "2026-10-23")).toBe("OPENING WEEK");
    expect(nbaSpotlightWeekLabel("2026-11-02", "2026-11-08")).toBe("NOV 2–8");
    expect(nbaSpotlightWeekLabel("2026-10-26", "2026-11-01")).toBe("OCT 26–NOV 1");
    expect(component).not.toContain("PLAYER SPOTLIGHT · {weekly.weekStart}");
    expect(component).toContain("OWNER PREVIEW");
    expect(component).toContain("Practice · Unranked");
    expect(component).toContain('className="nba-hq-owner__daily-result"');
    expect(component).toContain("RANK UNAVAILABLE");
    expect(component).toContain("SCORING PENDING");
    expect(component).not.toContain("weekly.team.highlightUrl");
    expect(current.team.highlightUrl).toBeUndefined();
    expect(current.player.highlightUrl).toBe("https://www.youtube.com/watch?v=e8g1Fa8iYYM");
  });
});
