import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const isolation = readFileSync(
  "supabase/migrations/202612310234_weekly_auction_owner_lab_isolation.sql",
  "utf8",
);

describe("Weekly Auction owner lab isolation", () => {
  it("keeps owner shadow weeks out of live day resolution", () => {
    expect(isolation).toContain("participant.source='owner_lab'");
    expect(isolation).toContain("private.resolve_football_weekly_auction_day");
    expect(isolation).toContain("due_week.subject_key='nfl-best-team-seasons-since-2000'");
  });

  it("keeps owner shadow weeks out of live NFL Day 7 sweeping", () => {
    expect(isolation).toContain("owner explicitly presses RESOLVE DAY 7");
    expect(isolation).toContain("private.resolve_football_weekly_nfl_team_season_wildcard");
    expect(isolation).toContain("private.finalize_football_weekly_nfl_team_season_week");
    expect(isolation.match(/participant\.source='owner_lab'/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("keeps owner shadow weeks out of generic live finalization", () => {
    expect(isolation).toContain("week.subject_key<>'nfl-best-team-seasons-since-2000'");
    expect(isolation).toContain("private.finalize_football_weekly_auction_week");
    expect(isolation).toContain("Weekly Auction live maintenance must exclude owner lab weeks");
  });
});
