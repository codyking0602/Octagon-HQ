import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310196_cfb_superteam_sep29_ten_card_launch.sql",
  "utf8",
);

describe("CFB Superteam Sep. 29 ten-card launch", () => {
  it("opens only the Sep. 29 Day 1 board at ten cards", () => {
    expect(migration).toContain("p_week_start=date '2026-09-29' and p_day_index=1");
    expect(migration).toContain("return 10");
    expect(migration).toContain("Day 1 must expose ten launch cards");
  });

  it("keeps later days on the reusable elastic field logic", () => {
    expect(migration).toContain("participant.locked_at<v_day_start");
    expect(migration).toContain("private.football_weekly_superteam_cards_for_field(v_players)");
    expect(migration).toContain("private.football_weekly_superteam_cards_for_field(6)<>9");
  });

  it("makes the owner preview follow the real launch board size", () => {
    expect(migration).toContain("v_card_count:=private.football_weekly_auction_cards_for_day(v_week_start,1)");
    expect(migration).toContain("jsonb_array_length(v_cards)<>v_card_count");
    expect(migration).not.toContain("owner preview must expose the eight-card Day 1 base board");
  });

  it("refuses to retune the launch after real auction activity begins", () => {
    expect(migration).toContain("private.football_weekly_auction_daily_entries");
    expect(migration).toContain("private.football_weekly_auction_bids");
    expect(migration).toContain("private.football_weekly_auction_awards");
    expect(migration).toContain("must be applied before auction activity begins");
  });
});
