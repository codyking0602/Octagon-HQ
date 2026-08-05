import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gameCss = readFileSync("src/styles/today-challenge.css", "utf8");
const hubCss = readFileSync("src/styles/today-challenge-hub.css", "utf8");
const hubPage = readFileSync("src/features/play/TodayChallengeHubPage.tsx", "utf8");

describe("Today’s Challenge 390×844 presentation contract", () => {
  it("keeps the official game and hub containers shrinkable without horizontal overflow", () => {
    expect(gameCss).toContain(".official-daily-page");
    expect(gameCss).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
    expect(hubCss).toContain("min-width: 0");
    expect(hubCss).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(`${gameCss}\n${hubCss}`).not.toMatch(/^\s*min-width:\s*(?:4\d\d|[5-9]\d\d|\d{4,})px/m);
  });

  it("keeps the swipe frame content-sized instead of forcing an empty 320px card", () => {
    expect(hubCss).toContain(".today-hub-card,\n.today-hub-leaderboard {\n  min-height: 0;");
    expect(hubCss).toContain("max-height: 132px");
    expect(hubCss).toContain("min-height: 96px");
    expect(hubCss).not.toMatch(/\.today-hub-card,\s*\n\.today-hub-leaderboard\s*\{[^}]*min-height:\s*(?:3\d{2}|[4-9]\d{2})px/s);
  });

  it("defines the phone layout used by all five deterministic official fixtures", () => {
    expect(gameCss).toMatch(/@media\s*\(max-width:\s*390px\)/);
    expect(hubCss).toMatch(/@media\s*\(max-width:\s*520px\)/);
    for (const selector of [
      ".official-daily-find-grid",
      ".official-resume-actions",
      ".official-wavelength-control",
      ".official-rank-board",
      ".official-keep-board",
    ]) {
      expect(gameCss).toContain(selector);
    }
    expect(hubCss).toContain(".today-hub-card__body");
    expect(hubCss).toContain("flex-direction: column");
  });

  it("replaces the legacy Find-the-Leader-only hub without removing casual games or challenges", () => {
    expect(hubPage).toContain("<TodayChallengeHub />");
    expect(hubPage).toContain("<ChallengeCenter />");
    expect(hubPage).toContain("playGames.map");
    expect(hubPage).toContain('"find-leader": "/play/find-leader?mode=replayable"');
    expect(hubPage).toContain('wavelength: "/play/wavelength"');
    expect(hubPage).toContain('"blind-resume": "/play/blind-resume"');
    expect(hubPage).toContain('"blind-rank": "/play/blind-rank"');
    expect(hubPage).toContain('"keep-cut": "/play/keep-cut"');
  });
});
