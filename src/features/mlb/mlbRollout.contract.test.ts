import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canViewMlbPlayoffs, MLB_PLAYOFFS_PUBLIC_ENABLED } from "./mlbPlayoffsConfig";

const appShell = readFileSync("src/app/AppShell.tsx", "utf8");
const bottomNav = readFileSync("src/components/BottomNavigation.tsx", "utf8");
const home = readFileSync("src/features/home/HomePage.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const migration = readFileSync("supabase/migrations/202612310175_mlb_playoffs_foundation.sql", "utf8");
const picksParityMigration = readFileSync("supabase/migrations/202612310181_mlb_picks_football_parity.sql", "utf8");
const championshipMigration = readFileSync("supabase/migrations/202612310182_mlb_postseason_championship.sql", "utf8");
const playLeaderboardMigration = readFileSync("supabase/migrations/202612310183_mlb_play_challenge_leaderboard.sql", "utf8");
const playScheduleMigration = readFileSync("supabase/migrations/202612310184_mlb_play_challenge_schedule.sql", "utf8");
const millionaireReadyMigration = readFileSync("supabase/migrations/202612310187_mlb_oct3_millionaire_ready.sql", "utf8");
const whoAmIReadyMigration = readFileSync("supabase/migrations/202612310188_mlb_oct6_who_am_i_ready.sql", "utf8");
const blindResumeReadyMigration = readFileSync("supabase/migrations/202612310189_mlb_oct9_blind_resume_ready.sql", "utf8");
const backHalfRotationMigration = readFileSync("supabase/migrations/202612310190_mlb_back_half_rotation_and_sports_feud_ready.sql", "utf8");
const oct15Oct18ReadyMigration = readFileSync("supabase/migrations/202612310191_mlb_oct15_hit_number_oct18_millionaire_ready.sql", "utf8");
const challengeSchedule = readFileSync("src/features/mlb/mlbChallengeSchedule.ts", "utf8");
const mlbRepository = readFileSync("src/features/mlb/mlbPlayoffsRepository.ts", "utf8");
const championshipModel = readFileSync("src/features/mlb/mlbChampionship.ts", "utf8");
const championshipSummary = readFileSync("src/features/mlb/MlbChampionshipSummary.tsx", "utf8");
const styles = readFileSync("src/styles/mlb-playoffs.css", "utf8");
const mlbPicks = readFileSync("src/features/mlb/MlbPicksPage.tsx", "utf8");
const mlbPlay = readFileSync("src/features/mlb/MlbPlayoffsPage.tsx", "utf8");
const mlbChallengePage = readFileSync("src/features/mlb/MlbFeaturedChallengePage.tsx", "utf8");
const mlbHome = readFileSync("src/features/mlb/MlbHomeHq.tsx", "utf8");
const mlbSeries = readFileSync("src/features/mlb/MlbSeriesBreakdownPage.tsx", "utf8");
const mlbOwnerFixture = readFileSync("src/features/mlb/mlbOwnerPreview.ts", "utf8");

describe("MLB Playoffs rollout gate", () => {
  it("stays owner-only until the explicit public release", () => {
    expect(MLB_PLAYOFFS_PUBLIC_ENABLED).toBe(false);
    expect(canViewMlbPlayoffs(null)).toBe(false);
    expect(canViewMlbPlayoffs({ canControlPicks: false })).toBe(false);
    expect(canViewMlbPlayoffs({ canControlPicks: true })).toBe(true);
  });

  it("uses the same capability at every visible entry point", () => {
    expect(appShell).toContain("canViewMlbPlayoffs(identity.profile)");
    expect(bottomNav).toContain("canViewMlbPlayoffs(identity?.profile)");
    expect(home).toContain("canViewMlbPlayoffs(identity.profile)");
    expect(router.match(/<MlbGate/g) ?? []).toHaveLength(4);
  });

  it("does not add a fifth permanent bottom navigation tab", () => {
    expect(bottomNav).toContain('{ to: "/", label: "Home"');
    expect(bottomNav).toContain('{ to: "/picks", label: "Picks"');
    expect(bottomNav).toContain('{ to: "/play", label: "Play"');
    expect(bottomNav).toContain('{ to: "/rankings", label: "Rankings"');
    expect(bottomNav).not.toContain('label: "MLB"');
  });

  it("starts production data private and refuses to invent a field", () => {
    expect(migration).toContain("public_enabled,");
    expect(migration).toContain("field_ready,");
    expect(migration).toContain("'wild_card',");
    expect(migration).toContain("'\{\"teams\":[],\"nodes\":[]\}'::jsonb".replace(/\\\{/g, "{").replace(/\\\}/g, "}"));
    expect(migration).toContain("if not v_season.field_ready then");
    expect(migration).toContain("mlb_playoffs_field_not_ready");
  });

  it("keeps critical team identity readable on phone layouts", () => {
    expect(styles).toContain("overflow-wrap: anywhere;");
    const teamRule = styles.match(/\.mlb-team-choice span \{[\s\S]*?\}/)?.[0] ?? "";
    expect(teamRule).not.toContain("text-overflow: ellipsis");
    expect(teamRule).not.toContain("white-space: nowrap");
  });

  it("keeps owner preview data out of the official field", () => {
    expect(mlbPicks).toContain("identity.profile?.canControlPicks === true");
    expect(home).toContain("previewMode={identity.profile?.canControlPicks === true}");
  });

  it("uses MLB team identity colors for selected series picks", () => {
    expect(mlbPicks).toContain("--football-pick-team-color");
    expect(mlbPicks).toContain("mlbTeamColor(");
    expect(mlbPicks).toContain('aria-label={`${team.name} ${team.side === "away" ? "away" : "home"}`}');
  });

  it("renders owner-only MLB with production-facing chrome", () => {
    expect(mlbPicks).not.toContain("OWNER PREVIEW");
    expect(mlbPicks).not.toContain("MOCK FIELD");
    expect(mlbPicks).not.toContain("SAVE PREVIEW BRACKET");
    expect(mlbHome).not.toContain('"OWNER PREVIEW"');
    expect(mlbSeries).not.toContain("mlb-preview-banner");
    expect(mlbSeries).not.toContain('"OWNER PREVIEW"');
    expect(mlbOwnerFixture).not.toContain("Preview matchup");
    expect(mlbPicks).toContain('className="mlb-full-bracket__canvas"');
    expect(mlbPicks).toContain('className="mlb-bracket-focus"');
    expect(mlbPicks).toContain("SWIPE BRACKETS");
    expect(mlbPicks).toContain("nextBracketGuideNode");
    expect(mlbPicks).not.toContain('id="mlb-bracket-race"');
    expect(mlbPicks).toContain("football-pick-game mlb-series-pick-card");
    expect(mlbPicks).toContain("PICKS &amp; STANDINGS");
    expect(mlbPicks).toContain("MLB CHAMPIONSHIP");
    expect(mlbPicks).toContain("COMPLETED SERIES");
    expect(mlbPicks).toContain("SCORING &amp; GRADING");
    expect(styles).toContain('[data-focus-zone="al-wc"]');
    expect(styles).toContain(".mlb-bracket-mini-team.is-picked");
    expect(styles).toContain("--football-picks-accent: var(--mlb-green-strong)");
  });

  it("matches the established Football Picks hierarchy below the bracket", () => {
    const group = mlbPicks.indexOf('className="surface-card football-group-hub');
    const slate = mlbPicks.indexOf('className="football-picks-slate football-picks-slate--current');
    const grading = mlbPicks.indexOf('className="surface-card football-picks-grading');
    expect(group).toBeGreaterThan(-1);
    expect(slate).toBeGreaterThan(group);
    expect(grading).toBeGreaterThan(slate);
    expect(mlbPicks).toContain("STANDINGS &amp; ROUNDS");
    expect(mlbPicks).toContain("SERIES ML");
    expect(mlbPicks).toContain("SERIES PICKS · 43 PTS");
    expect(mlbOwnerFixture).toContain('display_name: "Troy"');
    expect(mlbOwnerFixture).toContain('display_name: "Tyler"');
  });

  it("keeps other members' open series picks private outside owner control", () => {
    expect(picksParityMigration).toContain("profile.id = v_profile_id");
    expect(picksParityMigration).toContain("or v_is_owner");
    expect(picksParityMigration).toContain("now() >= series_row.starts_at");
    expect(picksParityMigration).toContain("'round_pick_entries', v_round_pick_entries");
    expect(picksParityMigration).toContain("team_a_moneyline");
    expect(picksParityMigration).toContain("team_b_moneyline");
  });

  it("keeps the finished MLB bracket compact and readable on phones", () => {
    expect(styles).toContain("aspect-ratio: 700 / 326");
    expect(styles).toContain("width: 26px");
    expect(styles).toContain("height: 26px");
    expect(styles).toContain("min-height: 21px");
    expect(styles).toContain("--bracket-zoom: 1.72");
  });

  it("gives MLB Play the Daily challenge carousel, result drilldown, and Play-only standings", () => {
    expect(mlbPlay).toContain("MLB PLAYOFF CHALLENGE");
    expect(mlbPlay).toContain("CHALLENGE LEADERBOARD");
    expect(mlbPlay).toContain("SWIPE FOR CHALLENGE LEADERBOARD");
    expect(mlbPlay).toContain("PLAY STANDINGS");
    expect(mlbPlay).toContain("Postseason challenge race");
    expect(mlbPlay).toContain("entry.play_points");
    expect(mlbPlay).toContain("entry.play_rank");
    expect(mlbPlay).toContain("navigate(challenge.route)");
    expect(mlbPlay).not.toContain("SERIES PICKS STANDING");
    expect(mlbPlay).not.toContain("BRACKET");
    expect(mlbPlay).not.toContain("MlbHomeHq");
    expect(mlbPlay).not.toMatch(/DEMO|OWNER DESIGN|DISPOSABLE/);
    expect(mlbPlay).toContain('entry.gameType === "blind_resume"');
    expect(mlbPlay).toContain("STATS SHOWN");
    expect(mlbPlay).toContain("WINNER");
    expect(mlbPlay).toContain('entry.gameType === "sports_feud"');
    expect(mlbPlay).toContain("FAST MONEY");
    expect(mlbPlay).toContain('entry.gameType === "hit_the_number"');
    expect(mlbPlay).toContain("average of both Hit the Number games");
    expect(styles).toContain('.today-hub[data-sport="mlb"]');
    expect(styles).toContain(".mlb-play-standings");
  });

  it("routes the October 9 Blind Resume slot through the production runner", () => {
    expect(mlbChallengePage).toContain("MlbBlindResumeProductionChallenge");
    expect(mlbChallengePage).toContain("MLB_BLIND_RESUME_PRODUCTION_CHALLENGE_KEY");
    expect(mlbChallengePage).toContain('challenge.game_type === "blind_resume"');
  });

  it("routes the two approved Sports Feud dates through the shared MLB production runner", () => {
    expect(mlbChallengePage).toContain("MlbSportsFeudChallenge");
    expect(mlbChallengePage).toContain("mlbSportsFeudProductionConfig");
    expect(mlbChallengePage).toContain('challenge.game_type === "sports_feud"');
  });

  it("routes the October 15 Hit the Number and both Millionaire dates through production runners", () => {
    expect(mlbChallengePage).toContain("MlbHitTheNumberChallenge");
    expect(mlbChallengePage).toContain("MLB_HIT_NUMBER_PRODUCTION_CONFIG");
    expect(mlbChallengePage).toContain('challenge.game_type === "hit_the_number"');
    expect(mlbChallengePage).toContain("mlbMillionaireProductionRun");
    expect(mlbChallengePage).toContain('challenge.game_type === "millionaire"');
  });

  it("automatically schedules MLB Play in Central time and protects future results", () => {
    expect(playScheduleMigration).toContain("America/Chicago");
    expect(playScheduleMigration).toContain("date '2026-09-29'");
    expect(playScheduleMigration).toContain("date '2026-10-01'");
    expect(playScheduleMigration).toContain("date '2026-10-27'");
    expect(playScheduleMigration).toContain("content_ready = slot in (1, 2, 10)");
    expect(millionaireReadyMigration).toContain("challenge_key = 'mlb-2026-play-03'");
    expect(millionaireReadyMigration).toContain("scheduled_date = date '2026-10-03'");
    expect(millionaireReadyMigration).toContain("game_type = 'millionaire'");
    expect(millionaireReadyMigration).toContain("content_ready = true");
    expect(whoAmIReadyMigration).toContain("challenge_key = 'mlb-2026-play-04'");
    expect(whoAmIReadyMigration).toContain("scheduled_date = date '2026-10-06'");
    expect(whoAmIReadyMigration).toContain("game_type = 'who_am_i'");
    expect(whoAmIReadyMigration).toContain("content_ready = true");
    expect(blindResumeReadyMigration).toContain("challenge_key = 'mlb-2026-play-05'");
    expect(blindResumeReadyMigration).toContain("scheduled_date = date '2026-10-09'");
    expect(blindResumeReadyMigration).toContain("game_type = 'blind_resume'");
    expect(blindResumeReadyMigration).toContain("content_ready = true");
    expect(backHalfRotationMigration).toContain("'mlb-2026-play-06'");
    expect(backHalfRotationMigration).toContain("date '2026-10-12'");
    expect(backHalfRotationMigration).toContain("'sports_feud'");
    expect(backHalfRotationMigration).toContain("'mlb-2026-play-09'");
    expect(backHalfRotationMigration).toContain("date '2026-10-23'");
    expect(backHalfRotationMigration).toContain("'wavelength'");
    expect(backHalfRotationMigration).toContain("'mlb-2026-play-10'");
    expect(backHalfRotationMigration).toContain("date '2026-10-27'");
    expect(backHalfRotationMigration).toContain("true)");
    expect(oct15Oct18ReadyMigration).toContain("challenge_key = 'mlb-2026-play-07'");
    expect(oct15Oct18ReadyMigration).toContain("scheduled_date = date '2026-10-15'");
    expect(oct15Oct18ReadyMigration).toContain("game_type = 'hit_the_number'");
    expect(oct15Oct18ReadyMigration).toContain("challenge_key = 'mlb-2026-play-08'");
    expect(oct15Oct18ReadyMigration).toContain("scheduled_date = date '2026-10-18'");
    expect(oct15Oct18ReadyMigration).toContain("game_type = 'millionaire'");
    expect(oct15Oct18ReadyMigration).toContain("set content_ready = true");
    expect(playScheduleMigration).toContain("get_mlb_postseason_active_challenge");
    expect(playScheduleMigration).toContain("mlb_play_challenge_not_active");
    expect(playScheduleMigration).toContain("mlb_play_challenge_not_ready");
    expect(playScheduleMigration).toContain("mlb_play_challenge_game_type_mismatch");
    expect(challengeSchedule).toContain('"2026-09-29"');
    expect(challengeSchedule).toContain('"2026-10-01"');
    expect(challengeSchedule).toContain('"2026-10-27"');
    expect(mlbRepository).toContain('rpc("get_mlb_postseason_active_challenge"');
    expect(mlbRepository).toContain("resolveMlbFeaturedChallenge()");
  });

  it("uses a distinct muted green MLB identity without changing Football geometry", () => {
    expect(styles).toContain("--mlb-green: #2f855f");
    expect(styles).toContain("--home-sport-accent: var(--mlb-green)");
    expect(styles).toContain("--home-football-blue: var(--mlb-green)");
    expect(styles).toContain('.home-challenge-card[data-sport="mlb"]');
    expect(styles).not.toContain(".mlb-player-spotlight {");
  });

  it("reuses the Football Home module geometry in the same order", () => {
    const picks = mlbHome.indexOf('className="surface-card home-event-card home-event-card--compact"');
    const bracket = mlbHome.indexOf('className="home-weekly-games-row"');
    const challenge = mlbHome.indexOf('className="home-challenge-card"');
    const player = mlbHome.indexOf("<MlbPlayerSpotlight");
    const series = mlbHome.indexOf('className="football-hq-games mlb-hq-games"');
    expect(picks).toBeGreaterThan(-1);
    expect(bracket).toBeGreaterThan(picks);
    expect(challenge).toBeGreaterThan(bracket);
    expect(player).toBeGreaterThan(challenge);
    expect(series).toBeGreaterThan(player);
    expect(mlbHome).toContain('className="home-event-card__standing"');
    expect(mlbHome).toContain('className="football-hq-game-row"');
    expect(mlbHome).toContain("OPEN BREAKDOWN →");
  });

  it("surfaces the same MLB Championship race on Home", () => {
    expect(mlbHome).toContain("useMlbChampionship");
    expect(mlbHome).toContain("MLB_OWNER_PREVIEW_CHAMPIONSHIP");
    expect(mlbHome).toContain('className="mlb-home-championship-trigger"');
    expect(mlbHome).toContain("<MlbChampionshipSummary");
    expect(mlbHome).toContain("SERIES PICKS STANDING");
    expect(mlbHome).toContain("ownChampionship.series_rank");
    expect(mlbHome).toContain("ownChampionship.bracket_rank");
    expect(mlbHome).toContain("MLB PLAYOFF CHALLENGE");
    expect(mlbHome).not.toContain("ownChampionship.play_rank");
    expect(mlbHome).toContain("championship.seriesMax");
    expect(mlbHome).toContain("championship.bracketMax");
    expect(styles).toContain(".mlb-home-championship-trigger");
    expect(styles).toContain(".mlb-home-championship-summary");
  });

  it("provides a gated full-page series breakdown", () => {
    expect(router).toContain('path: "mlb/series/:seriesId"');
    expect(mlbSeries).toContain("resolveMlbSeriesBreakdownContent");
    expect(mlbSeries).toContain("3 THINGS THAT DECIDE IT");
    expect(mlbSeries).toContain("PLAYERS TO WATCH");
    expect(mlbSeries).toContain("THE HQ READ");
  });

  it("uses one calibrated 100-point MLB Championship", () => {
    expect(championshipMigration).toContain("43 points from round-by-round series picks");
    expect(championshipMigration).toContain("32 points from the one-time bracket");
    expect(championshipMigration).toContain("25 points from ten featured Play challenges");
    expect(championshipMigration).toContain("when 'wild_card' then 2");
    expect(championshipMigration).toContain("when 'division_series' then 4");
    expect(championshipMigration).toContain("when 'championship_series' then 5");
    expect(championshipMigration).toContain("when 'world_series' then 9");
    expect(championshipMigration).toContain("when 'wild_card' then 1");
    expect(championshipMigration).toContain("when 'division_series' then 2");
    expect(championshipMigration).toContain("when 'championship_series' then 5");
    expect(championshipMigration).toContain("when 'world_series' then 10");
    expect(championshipModel).toContain("seriesMax: 43");
    expect(championshipModel).toContain("bracketMax: 32");
    expect(championshipModel).toContain("playMax: 25");
    expect(championshipSummary).toContain("MLB CHAMPIONSHIP");
    expect(mlbPicks).toContain("100-POINT CHAMPIONSHIP");
  });
});
