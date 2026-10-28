import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310139_football_weekly_auction_subject_catalog.sql",
  "utf8",
);

describe("Football Weekly Auction subject catalog", () => {
  it("adds a generic private catalog without changing the live CFB lifecycle", () => {
    expect(migration).toContain("create table private.football_weekly_auction_subjects");
    expect(migration).toContain("create table private.football_weekly_auction_items");
    expect(migration).toContain("item_kind in ('team-season','player-season','player-career')");
    expect(migration).toContain("identity_group text not null");
    expect(migration).toContain("hidden_grade between 86.0 and 100.0");
    expect(migration).toContain("hidden_grade * 2 = trunc(hidden_grade * 2)");
    expect(migration).not.toContain("delete from private.football_weekly_auction_board");
    expect(migration).not.toContain("update private.football_weekly_auction_board");
    expect(migration).not.toContain("delete from private.football_weekly_auction_bids");
    expect(migration).not.toContain("delete from private.football_weekly_auction_awards");
  });

  it("mirrors the complete 233-card CFB pool into the generic catalog", () => {
    expect(migration).toContain("from private.draft_room_cfb_best_teams_pool pool");
    expect(migration).toContain("'cfb-best-teams-since-2000'");
    expect(migration).toContain("v_cfb_pool_count <> 233 or v_cfb_catalog_count <> 233");
    expect(migration).toContain("item.hidden_grade <> pool.hidden_grade");
    expect(migration).toContain("item.board_bucket <> pool.conference_bucket");
  });

  it("binds existing auction weeks to the CFB subject without regenerating boards", () => {
    expect(migration).toContain("add column if not exists subject_key text");
    expect(migration).toContain("set subject_key = 'cfb-best-teams-since-2000'");
    expect(migration).toContain("alter column subject_key set not null");
    expect(migration).toContain("football_weekly_auction_weeks_subject_key_fkey");
    expect(migration).toContain("v_live_board_missing");
  });

  it("keeps grades and catalog rows server-owned", () => {
    expect(migration).toContain(
      "revoke all on private.football_weekly_auction_subjects from public, anon, authenticated",
    );
    expect(migration).toContain(
      "revoke all on private.football_weekly_auction_items from public, anon, authenticated",
    );
  });
});
