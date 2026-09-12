import { describe, expect, it } from "vitest";
import homeChallengesCss from "./home-challenges.css?raw";
import homeFootballCss from "./home-football-hq.css?raw";
import homeSportCss from "./home-ufc-hq.css?raw";
import playLandingCss from "./play-landing-shared.css?raw";

describe("Home Football brand blue", () => {
  it("matches the canonical Football Play blue exactly", () => {
    expect(playLandingCss).toContain("--play-landing-accent: #1F4E79;");
    expect(homeSportCss).toContain("--home-football-blue: #1F4E79;");
    expect(homeSportCss).toContain("--home-sport-accent: var(--home-football-blue);");
    expect(homeChallengesCss).toContain("--challenge-accent: var(--home-football-blue, #1F4E79);");
    expect(homeChallengesCss).toContain("--challenge-accent-strong: var(--home-football-blue, #1F4E79);");
    expect(homeFootballCss).toContain("--football-hq-navy: var(--home-football-blue, #1F4E79);");
  });

  it("does not reintroduce the old light-blue Home Football accent", () => {
    expect(homeSportCss).not.toContain("#8ebce6");
    expect(homeChallengesCss).not.toContain("#8ebce6");
    expect(homeFootballCss).not.toContain("#8ebce6");
  });
});
