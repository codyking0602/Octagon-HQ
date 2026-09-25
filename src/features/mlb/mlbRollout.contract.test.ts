import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canViewMlbPlayoffs, MLB_PLAYOFFS_PUBLIC_ENABLED } from "./mlbPlayoffsConfig";

const appShell = readFileSync("src/app/AppShell.tsx", "utf8");
const bottomNav = readFileSync("src/components/BottomNavigation.tsx", "utf8");
const home = readFileSync("src/features/home/HomePage.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const migration = readFileSync("supabase/migrations/202612310175_mlb_playoffs_foundation.sql", "utf8");
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

  it("renders owner-only MLB with production-facing chrome", () => {
    expect(mlbPicks).not.toContain("OWNER PREVIEW");
    expect(mlbPicks).not.toContain("MOCK FIELD");
    expect(mlbPicks).not.toContain("SAVE PREVIEW BRACKET");
    expect(mlbHome).not.toContain('"OWNER PREVIEW"');
    expect(mlbSeries).not.toContain("mlb-preview-banner");
    expect(mlbSeries).not.toContain('"OWNER PREVIEW"');
    expect(mlbOwnerFixture).not.toContain("Preview matchup");
    expect(mlbPicks).toContain('className="mlb-league-bracket"');
    expect(mlbPicks).toContain('className="mlb-world-series-stage"');
    expect(mlbPicks).toContain('className="surface-card mlb-race-bracket"');
    expect(mlbPicks).toContain("mlb-round-series-card");
    expect(styles).toContain("scroll-snap-type: x proximity");
    expect(styles).toContain(".mlb-round-team.is-selected");
  });

  it("keeps MLB Play focused on the featured challenge", () => {
    expect(mlbPlay).toContain("Featured Challenge");
    expect(mlbPlay).toContain('to="/mlb/challenge"');
    expect(mlbPlay).not.toContain("MlbHomeHq");
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

  it("provides a gated visual series breakdown", () => {
    expect(router).toContain('path: "mlb/series/:seriesId"');
    expect(mlbSeries).toContain("KEYS TO THE SERIES");
    expect(mlbSeries).toContain("<MlbPlayerSpotlight");
  });

  it("keeps bracket scoring progressive and simple", () => {
    expect(migration).toContain("when 'wild_card' then 1");
    expect(migration).toContain("when 'division_series' then 2");
    expect(migration).toContain("when 'championship_series' then 4");
    expect(migration).toContain("when 'world_series' then 8");
  });
});
