import { describe, expect, it } from "vitest";
import footballPicksCss from "./football-picks.css?raw";
import homeChallengesCss from "./home-challenges.css?raw";
import homeFootballCss from "./home-football-hq.css?raw";
import homeSportCss from "./home-ufc-hq.css?raw";
import playLandingCss from "./play-landing-shared.css?raw";
import sportContextCss from "./sport-context.css?raw";
import tokensCss from "./tokens.css?raw";

describe("Football electric-blue brand", () => {
  it("owns the light-up blue once and carries it through Home, Picks, Play, and navigation", () => {
    expect(tokensCss).toContain("--football-electric-blue: #2f7df6;");
    expect(tokensCss).toContain("--football-electric-blue-rgb: 47, 125, 246;");
    expect(tokensCss).toContain("--hq-context-accent: var(--football-electric-blue);");

    expect(sportContextCss).toContain("--football-action: var(--hq-context-accent);");
    expect(playLandingCss).toContain("--play-landing-accent: var(--football-electric-blue, #2f7df6);");
    expect(footballPicksCss).toContain("--football-picks-accent: var(--football-electric-blue, #2f7df6);");

    expect(homeSportCss).toContain("--home-sport-accent: var(--football-electric-blue, #2f7df6);");
    expect(homeChallengesCss).toContain("--challenge-accent: var(--football-electric-blue, #2f7df6);");
    expect(homeFootballCss).toContain("--football-hq-blue: var(--football-electric-blue, #2f7df6);");
  });

  it("does not reintroduce the retired Home dark/light blue owners", () => {
    for (const retired of ["--home-football-blue", "#8ebce6", "#5f93bd", "#a9cfee"]) {
      expect(homeSportCss.toLowerCase()).not.toContain(retired.toLowerCase());
      expect(homeChallengesCss.toLowerCase()).not.toContain(retired.toLowerCase());
      expect(homeFootballCss.toLowerCase()).not.toContain(retired.toLowerCase());
    }
  });
});
