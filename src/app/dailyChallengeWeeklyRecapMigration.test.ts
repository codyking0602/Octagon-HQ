import fs from "node:fs";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  "supabase/migrations/202612310160_daily_challenge_weekly_recap.sql",
  "utf8",
);

describe("Daily Challenge weekly championship recap migration", () => {
  it("keeps the recap automatic, player-scoped, sport-scoped, and one-time", () => {
    expect(migration).toContain("private.daily_challenge_week_start");
    expect(migration).toContain("stats.played > 0");
    expect(migration).toContain("private.daily_challenge_weekly_recap_views");
    expect(migration).toContain("get_my_daily_challenge_weekly_recap");
    expect(migration).toContain("acknowledge_my_daily_challenge_weekly_recap");
    expect(migration).toContain("private.daily_challenge_hit_number_distance");
    expect(migration).toContain("private.football_daily_transition_adjustments");
    expect(migration).toContain("private.maintain_football_weekly_auction(now())");
    expect(migration).toContain("auction_week.subject_key = 'cfb-best-teams-since-2000'");
    expect(migration).toContain("date '2026-09-15'");
  });
});
