import { describe, expect, it } from "vitest";
import homeChallengesCss from "./home-challenges.css?raw";
import homeFootballCss from "./home-football-hq.css?raw";
import homeSportCss from "./home-ufc-hq.css?raw";
import playLandingCss from "./play-landing-shared.css?raw";
import sportContextCss from "./sport-context.css?raw";
import tokensCss from "./tokens.css?raw";

describe("Football powder-blue brand", () => {
  it("uses one canonical light-blue token across Home, Play, and Football navigation", () => {
    expect(tokensCss).toContain("--football-brand-blue: #8EBCE6;");
    expect(tokensCss).toContain("--football-brand-blue-rgb: 142, 188, 230;");
    expect(tokensCss).toContain("--hq-context-accent: var(--football-brand-blue);");
    expect(homeSportCss).toContain("--home-football-blue: var(--football-brand-blue, #8EBCE6);");
    expect(homeFootballCss).toContain("--football-hq-navy: var(--home-football-blue, var(--football-brand-blue, #8EBCE6));");
    expect(homeChallengesCss).toContain("--challenge-accent: var(--home-football-blue, var(--football-brand-blue, #8EBCE6));");
    expect(playLandingCss).toContain("--play-landing-accent: var(--football-brand-blue, #8EBCE6);");
    expect(sportContextCss).toContain("color: var(--hq-context-accent-strong);");
    expect(sportContextCss).toContain("background: var(--hq-context-accent);");
  });

  it("does not restore the retired dark Home-only Football accent", () => {
    expect(homeSportCss).not.toContain("--home-football-blue: #1F4E79;");
    expect(homeChallengesCss).not.toContain("#1F4E79");
    expect(playLandingCss).not.toContain("#1F4E79");
  });
});
