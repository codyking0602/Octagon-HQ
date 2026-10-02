import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runtime = readFileSync(
  "supabase/migrations/202612310225_nfl_team_season_weekly_runtime.sql",
  "utf8",
);
const lab = readFileSync(
  "supabase/migrations/202612310226_nfl_team_season_playthrough_lab.sql",
  "utf8",
);

describe("NFL team-season Weekly Auction runtime", () => {
  it("reuses the shared Weekly Auction architecture and the locked 200-season authority", () => {
    expect(runtime).toContain("'nfl-best-team-seasons-since-2000'");
    expect(runtime).toContain("private.football_weekly_auction_items");
    expect(runtime).toContain("private.football_weekly_auction_board");
    expect(runtime).toContain("private.football_weekly_auction_bids");
    expect(runtime).toContain("private.football_weekly_auction_awards");
    expect(runtime).toContain("private.nfl_best_team_seasons_v1_authority");
    expect(runtime).toContain("if v_count<>200 then");
    expect(runtime).not.toContain("create table if not exists private.nfl_team_season_bids");
  });

  it("locks six normal auction days, elastic future supply, and no normal seventh auction", () => {
    expect(runtime).toContain("day_index integer not null check (day_index between 1 and 6)");
    expect(runtime).toContain("when p_players=5 then 4");
    expect(runtime).toContain("when p_players=6 then 5");
    expect(runtime).toContain("when p_players=7 then 6");
    expect(runtime).toContain("else 7");
    expect(runtime).toContain("if p_day_index=7 then return 0; end if;");
    expect(runtime).toContain("if v_existing>0 then return; end if;");
    expect(runtime).toContain("hidden_shape<>'Natural'");
  });

  it("enforces the normal bankroll and collection caps server-side", () => {
    expect(runtime).toContain("p_day_index not between 1 and 6");
    expect(runtime).toContain("v_max_wins:=least(2,greatest(5-v_owned,0))");
    expect(runtime).toContain(")<5");
    expect(runtime).toContain(")<2");
    expect(runtime).toContain("football_weekly_auction_starting_bankroll");
    expect(runtime).toContain("v_top_commit>v_bankroll");
  });

  it("keeps active grades and future themes off the client", () => {
    const start = runtime.indexOf("create or replace function private.get_football_weekly_nfl_team_season_state");
    const end = runtime.indexOf("create or replace function private.get_my_football_weekly_nfl_team_season", start);
    const getter = runtime.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(getter).toContain("'theme',v_theme");
    expect(getter).toContain("'teams',v_cards");
    expect(getter).not.toContain("'grade'");
    expect(getter).not.toContain("'hidden_grade'");
    expect(getter).not.toContain("football_weekly_nfl_team_season_week_authority");
  });

  it("scores the best four only after the persisted Wildcard/autofill resolution", () => {
    expect(runtime).toContain("football_weekly_nfl_team_season_collection_rows");
    expect(runtime).toContain("item_reference=claim.replaced_item_reference");
    expect(runtime).toContain("where owned.scoring_order<=4");
    expect(runtime).toContain("avg(owned.hidden_grade)");
    expect(runtime).toContain("football_weekly_nfl_team_season_wildcard_resolutions");
    expect(runtime).toContain("completion contract failed before final scoring");
  });

  it("carries Reaping through the shared next-week starting-bankroll path", () => {
    expect(runtime).toContain("do $apply_shared_reaping_bankroll$");
    expect(runtime).toContain("get_my_football_weekly_auction_cfb");
    expect(runtime).toContain("get_my_football_weekly_build_qb");
    expect(runtime).toContain("get_my_football_weekly_superteam");
    expect(runtime).toContain("private.football_weekly_auction_starting_bankroll");
  });

  it("keeps the owner lab isolated while exercising production resolution functions", () => {
    expect(lab).toContain("date '1900-01-02'");
    expect(lab).toContain("five available profiles");
    expect(lab).toContain("submit_football_weekly_nfl_team_season_bids_for_profile");
    expect(lab).toContain("resolve_football_weekly_nfl_team_season_day");
    expect(lab).toContain("submit_football_weekly_nfl_team_season_wildcard");
    expect(lab).toContain("resolve_football_weekly_nfl_team_season_wildcard");
    expect(lab).toContain("finalize_football_weekly_nfl_team_season_week");
    expect(lab).toContain("delete from private.football_weekly_auction_bankroll_adjustments");
    expect(lab).toContain("public.get_my_football_weekly_nfl_team_season_lab");
  });
});
