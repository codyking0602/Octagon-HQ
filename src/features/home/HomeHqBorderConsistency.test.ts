import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const home = readFileSync("src/features/home/HomePage.tsx", "utf8");
const chooser = readFileSync("src/styles/home-sport-chooser.css", "utf8");
const borders = readFileSync("src/styles/home-hq-border-consistency.css", "utf8");
const basketball = readFileSync("src/features/nba/NbaOwnerHomeHq.tsx", "utf8");

describe("Home sports share a restrained outline hierarchy", () => {
  it("uses only muted color on HQ shells and the SAME graphite borders on inner cards", () => {
    expect(home).toContain('import "../../styles/home-hq-border-consistency.css";');
    expect(borders).toContain("rgb(var(--home-sport-accent-rgb)) 20%, #42474e");
    for (const card of [
      ".home-event-card", ".home-challenge-card:not([data-special-daily])",
      ".home-weekly-games-row", ".football-hq-games", ".ufc-contender-series",
      ".football-player-spotlight:not(.football-player-spotlight--memorial)",
      ".nba-hq-owner__picks", ".nba-hq-owner__daily",
      ".nba-hq-owner__player", ".nba-hq-owner__team",
      ".football-hq-compact-picks__action", ".nba-hq-owner__picks-grid a",
    ]) expect(borders).toContain(card);
    expect(borders).toContain("border-color: #42474e;");
    expect(borders).not.toContain("rgba(var(--home-sport-accent-rgb), .38)");
    expect(borders).not.toContain(".football-hq-game-row__team-pill");
  });

  it("removes red borders from UFC Contender Series individual name cards", () => {
    expect(borders).toContain(".ufc-contender-series__lead,");
    expect(borders).toContain(".ufc-contender-series__pair > a");
    expect(borders).toContain("border-color: #383e45;");
    expect(borders).not.toContain("border-color: rgba(229, 9, 20");
  });

  it("retains special-event Football Daily borders and memorial spotlights", () => {
    expect(borders).toContain(".home-challenge-card:not([data-special-daily])");
    expect(borders).toContain(".football-player-spotlight:not(.football-player-spotlight--memorial)");
    expect(readFileSync("src/styles/football-special-daily.css", "utf8"))
      .toContain('.home-challenge-card[data-special-daily="red-river"]');
  });

  it("keeps Your HQ and its selector neutral even when Basketball is active", () => {
    expect(chooser).not.toContain('data-home-sport="nba"');
    expect(chooser).toContain("border: 1px solid #363d46;");
  });

  it("keeps full weekly Basketball HQ on All Sports without duplicate standings", () => {
    expect(home.match(/<NbaOwnerHomeHq profileId={profileId} allowOwnerDailyPreview={nbaHqOwnerPreview} hideChampionship \/>/g)).toHaveLength(2);
    expect(home).not.toContain("<NbaHomeHq");
    expect(basketball).toContain("hideChampionship = false");
    expect(basketball).toContain("{!hideChampionship ? (");
    expect(basketball).toContain("weekly.player.gamesPlayed");
  });
});
