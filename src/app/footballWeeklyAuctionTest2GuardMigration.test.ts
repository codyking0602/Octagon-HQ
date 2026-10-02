import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310223_weekly_auction_test2_guard.sql",
  "utf8",
);

describe("Football Weekly Auction TEST2 live-field guard", () => {
  it("removes the utility profile from unfinished live fields when it has no gameplay state", () => {
    expect(migration).toContain("delete from private.football_weekly_auction_participants");
    expect(migration).toContain("profile.normalized_name='TEST2'");
    expect(migration).toContain("week.finalized_at is null");
    expect(migration).toContain("football_weekly_auction_daily_entries");
    expect(migration).toContain("football_weekly_auction_bids");
    expect(migration).toContain("football_weekly_auction_awards");
  });

  it("rejects TEST2 before the existing-participant fast path can re-admit it", () => {
    const guardIndex = migration.indexOf("profile.normalized_name='TEST2'");
    const participantFastPathIndex = migration.indexOf(
      "from private.football_weekly_auction_participants participant",
      migration.indexOf("create or replace function"),
    );

    expect(guardIndex).toBeGreaterThan(-1);
    expect(participantFastPathIndex).toBeGreaterThan(-1);
    expect(guardIndex).toBeLessThan(participantFastPathIndex);
    expect(migration).toContain("then\n    return false;");
  });

  it("preserves the existing elastic join and capacity rules for real players", () => {
    expect(migration).toContain(
      "v_capacity:=private.football_weekly_superteam_join_capacity(p_week_start,p_at)",
    );
    expect(migration).toContain("if v_current>=v_capacity then return false");
    expect(migration).toContain("'elastic_join'");
    expect(migration).toContain("'day_1_join'");
  });
});
