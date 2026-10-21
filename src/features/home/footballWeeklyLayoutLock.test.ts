import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("Football weekly editorial must not reshape approved UI next Tuesday", () => {
  it("prefers owner-uploaded image-only headers with published artwork fallback in the eight-second carousel", () => {
    const picks = source("../picks/FootballPicksPage.tsx");
    const home = source("./FootballHq.tsx");
    const modal = source("../picks/FootballMatchupBreakdowns.tsx");
    expect(picks).toContain("const weeklyHeroes = useMemo(() => matchupBreakdowns");
    expect(picks).toContain("pickEventPosters(event)");
    expect(picks).toContain("chooseFootballPicksHeroImages");
    expect(picks).toContain("usableFootballWeeklyHeaderArtwork");
    expect(picks).toContain("failedWeeklyHeaderSources");
    expect(picks).toContain("heroImages.map");
    const hero = picks.split('className="football-picks-hero has-poster has-weekly-art"')[1]?.split("</section>")[0];
    expect(hero).toContain('className={`football-picks-hero__image');
    expect(hero).not.toContain("football-picks-weekly-slide__team");
    expect(hero).not.toContain("football-picks-weekly-slide__footer");
    expect(hero).not.toContain("THE HQ · GAME OF THE WEEK");
    expect(hero).not.toContain("VS");
    expect(source("./footballWeeklyPublication.ts")).toContain("sportsReferenceUrl: footballTeamSportsReferenceUrl");
    expect(source("./footballWeeklyPublication.ts")).toContain("awayRecord");
    expect(source("./footballWeeklyPublication.ts")).toContain("awayRank");
    expect(source("../../styles/football-picks.css")).toContain(".football-picks-hero.has-weekly-art { aspect-ratio: 16 / 9;");
    expect(source("../../styles/football-picks.css")).toContain("@media(prefers-reduced-motion:reduce)");
    expect(picks).toContain("}, 8000)");
    expect(picks).not.toContain("football-picks-hero__empty"); // No noisy blank header when art is absent.
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

  it("keeps all future Top Games boards neutral charcoal without changing team-color pills", () => {
    const css = source("../../styles/home-football-hq.css");
    const board = css.split(".football-hq-games {")[1]?.split("}")[0];
    const matchup = css.split(".football-hq-game-row {")[1]?.split("}")[0];
    const schedule = css.split(".football-hq-games__schedule {")[1]?.split("}")[0];
    expect(board).toContain("background: linear-gradient(145deg, #202124, #17181a)");
    expect(board).toContain("border: 1px solid #404146");
    expect(matchup).toContain("background: linear-gradient(135deg, #191a1c, #121315)");
    expect(matchup).toContain("border: 1px solid #35363b");
    expect(schedule).toContain("border: 1px solid #3c3d42");
    expect(board).not.toContain("#18212b");
    expect(matchup).not.toContain("#161e27");
    expect(css).toContain("var(--team-accent, var(--team-color)) 30%");
    expect(css).toContain(".football-hq-game-row__team-pill[href]");
    expect(css).toContain("color: var(--home-football-blue, #8ebce6)");
  });

  it("keeps source credits and kickoff reminders out of the short featured analysis", () => {
    const editorial = source("../picks/footballWeekOct13Featured.ts");
    expect(editorial).not.toMatch(/Game graphic:|Matchup information:|Saturday's 6:30|Sunday Night Football at/);
    expect(editorial).toContain("bottomLine");
  });
});
