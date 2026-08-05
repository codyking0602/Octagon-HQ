import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gameCss = readFileSync("src/styles/today-challenge.css", "utf8");
const hubCss = readFileSync("src/styles/today-challenge-hub.css", "utf8");

describe("Today’s Challenge 390×844 presentation contract", () => {
  it("keeps the official game and hub containers shrinkable without horizontal overflow", () => {
    expect(gameCss).toContain(".official-daily-page");
    expect(gameCss).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
    expect(hubCss).toContain("min-width: 0");
    expect(hubCss).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(`${gameCss}\n${hubCss}`).not.toMatch(/min-width:\s*(?:4\d\d|[5-9]\d\d|\d{4,})px/);
  });

  it("defines the phone layout used by all five deterministic official fixtures", () => {
    expect(gameCss).toMatch(/@media\s*\(max-width:\s*520px\)/);
    expect(hubCss).toMatch(/@media\s*\(max-width:\s*520px\)/);
    for (const selector of [
      ".official-daily-find",
      ".official-daily-resume",
      ".official-daily-wavelength",
      ".official-daily-rank",
      ".official-daily-keep",
    ]) {
      expect(gameCss).toContain(selector);
    }
    expect(hubCss).toContain(".today-hub-card__body");
    expect(hubCss).toContain("flex-direction: column");
  });

  it("replaces the legacy Find-the-Leader-only hub presentation without removing casual Play", () => {
    expect(hubCss).toContain(".today-challenge-hub-page__legacy > .play-page > .play-daily");
    expect(hubCss).toContain(".today-challenge-hub-page__legacy > .play-page > .find-history");
    expect(hubCss).toContain("display: none");
    expect(hubCss).toContain(".today-challenge-hub-page__legacy > .play-page");
    expect(hubCss).toContain("display: contents");
  });
});
