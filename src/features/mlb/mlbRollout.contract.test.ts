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
const championshipModel = readFileSync("src/features/mlb/mlbChampionship.ts", "utf8");
const championshipSummary = readFileSync("src/features/mlb/MlbChampionshipSummary.tsx", "utf8");
const styles = readFileSync("src/styles/mlb-playoffs.css", "utf8");
const mlbPicks = readFileSync("src/features/mlb/MlbPicksPage.tsx", "utf8");
const mlbPlay = readFileSync("src/features/mlb/MlbPlayoffsPage.tsx", "utf8");
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

  it("keeps MLB Play focused on the current playoff challenge", () => {
    expect(mlbPlay).toContain("MLB PLAYOFF CHALLENGE");
    expect(mlbPlay).toContain("Two boards. One final score.");
    expect(mlbPlay).toContain('to="/mlb/challenge"');
    expect(mlbPlay).not.toContain("MlbHomeHq");
    expect(mlbPlay).not.toMatch(/DEMO|OWNER DESIGN|DISPOSABLE/);
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

  it("provides a gated visual series breakdown", () => {
    expect(router).toContain('path: "mlb/series/:seriesId"');
    expect(mlbSeries).toContain("KEYS TO THE SERIES");
    expect(mlbSeries).toContain("<MlbPlayerSpotlight");
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
