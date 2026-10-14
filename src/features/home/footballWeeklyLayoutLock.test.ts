import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("Football weekly editorial must not reshape approved UI next Tuesday", () => {
  it("renders featured art in an eight-second Picks carousel, never twice in Home or breakdowns", () => {
    const picks = source("../picks/FootballPicksPage.tsx");
    const home = source("./FootballHq.tsx");
    const modal = source("../picks/FootballMatchupBreakdowns.tsx");
    expect(picks).toContain("matchupBreakdowns.filter((game) => Boolean(game.headerAssetPath))");
    expect(picks).toContain("}, 8000)");
    expect(picks).toContain("football-picks-hero__empty");
    expect(home).not.toContain("football-hq-game-row__art");
    expect(modal).not.toContain("football-matchup-breakdown-weekly-art");
    expect(source("./HomePage.tsx")).not.toContain("home-ufc-poster");
  });
  it("retains readable player measurements and team names on mobile", () => {
    const css = source("../../styles/home-football-hq.css");
    expect(css).toContain(".football-player-spotlight__meta > span");
    expect(css).toContain("-webkit-line-clamp:unset");
    expect(css).toContain("grid-template-columns:minmax(0, 1fr); gap:8px");
    expect(source("../../styles/home-challenges.css")).toContain("white-space: normal");
  });
  it("keeps the approved Home team pills independently linked to the actual season reference", () => {
    const home = source("./FootballHq.tsx");
    const css = source("../../styles/home-football-hq.css");
    const resolver = source("./footballTeamSportsReference.ts");
    expect(home).toContain('className="football-hq-game-row__team-pill"');
    expect(home).toContain('className="football-hq-game-row__breakdown-hit"');
    expect(home).toContain("footballTeamSportsReferenceUrl(team.name, level, season)");
    expect(home).toContain("season={event.season}");
    expect(home).toContain('rel="noopener noreferrer"');
    expect(css).toContain(".football-hq-game-row__team-pill[href]");
    expect(css).toContain("z-index: 2;");
    expect(resolver).toContain("footballTeamSchoolMetadata");
    // The weekly publisher must never need bespoke URL entries per chosen matchup.
    expect(source("./footballWeeklyPublication.ts")).toContain("publishedFootballMatchup");
  });

  it("keeps source credits and kickoff reminders out of the short featured analysis", () => {
    const editorial = source("../picks/footballWeekOct13Featured.ts");
    expect(editorial).not.toMatch(/Game graphic:|Matchup information:|Saturday's 6:30|Sunday Night Football at/);
    expect(editorial).toContain("bottomLine");
  });
});
