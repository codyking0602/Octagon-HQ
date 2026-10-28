import { describe, expect, it } from "vitest";
import pageSource from "./FootballHigherLowerPage.tsx?raw";
import styleSource from "../../styles/football-higher-lower.css?raw";

describe("Football Higher or Lower presentation contracts", () => {
  it("shows both subjects and both final numbers in result review", () => {
    expect(pageSource).toContain("question.known.name");
    expect(pageSource).toContain("question.known.formattedValue");
    expect(pageSource).toContain("question.hidden.name");
    expect(pageSource).toContain("question.hidden.formattedValue");
    expect(pageSource).toContain("higher-lower-review__matchup");
    expect(styleSource).toContain(".higher-lower-review__matchup");
  });

  it("measures active play instead of charging background time", () => {
    expect(pageSource).toContain('document.addEventListener("visibilitychange"');
    expect(pageSource).toContain('window.addEventListener("pagehide"');
    expect(pageSource).toContain('window.addEventListener("pageshow"');
    expect(pageSource).toContain("activeElapsedMs.current");
    expect(pageSource).toContain("activePlayTimeMs()");
    expect(pageSource).not.toContain("performance.now() - (startedAt.current");
  });

  it("keeps season identity in context instead of baking years into player names", () => {
    expect(styleSource).toContain(".higher-lower-review__context");
    expect(pageSource).toContain("question.known.context");
    expect(pageSource).toContain("question.hidden.context");
  });

  it("adds team and school identity without player headshots", () => {
    expect(pageSource).toContain("footballHigherLowerBrandForSubject");
    expect(pageSource).toContain("higher-lower-card__logo");
    expect(styleSource).toContain("--hl-team-primary");
    expect(styleSource).toContain("--hl-team-secondary");
    expect(styleSource).toContain(".higher-lower-card__logo");
    expect(pageSource).not.toContain("headshot");
  });
});
