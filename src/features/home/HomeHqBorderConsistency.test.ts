import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const home = readFileSync("src/features/home/HomePage.tsx", "utf8");
const chooser = readFileSync("src/styles/home-sport-chooser.css", "utf8");
const borders = readFileSync("src/styles/home-hq-border-consistency.css", "utf8");
const basketball = readFileSync("src/features/nba/NbaOwnerHomeHq.tsx", "utf8");

describe("Home sports share card treatments", () => {
  it("uses consistent sport-accent outlines without touching team matchups", () => {
    expect(home).toContain('import "../../styles/home-hq-border-consistency.css";');
    for (const card of [".home-event-card", ".home-challenge-card", ".home-weekly-games-row", ".football-hq-games", ".ufc-contender-series", ".nba-hq-owner__picks", ".nba-hq-owner__daily", ".nba-hq-owner__player", ".nba-hq-owner__team"]) {
      expect(borders).toContain(card);
    }
    expect(borders).not.toContain(".football-hq-game-row__team-pill");
    expect(borders).toContain("rgba(var(--home-sport-accent-rgb), .42)");
    expect(borders).toContain("rgba(var(--home-sport-accent-rgb), .38)");
  });
  it("keeps Your HQ and its selector neutral even when Basketball is active", () => {
    expect(chooser).not.toContain('data-home-sport="nba"');
    expect(chooser).toContain("border: 1px solid #363d46;");
  });
  it("renders the full weekly Basketball HQ in All Sports without duplicate standings", () => {
    expect(home.match(/<NbaOwnerHomeHq profileId={profileId} allowOwnerDailyPreview={nbaHqOwnerPreview} hideChampionship \/>/g)).toHaveLength(2);
    expect(home).not.toContain("<NbaHomeHq");
    expect(basketball).toContain("hideChampionship = false");
    expect(basketball).toContain("{!hideChampionship ? (");
    expect(basketball).toContain("weekly.player.gamesPlayed");
  });
});
