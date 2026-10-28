import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310278_weekly_auction_reserved_test_profile_guard.sql",
  "utf8",
);

describe("Weekly Auction reserved test-profile guard", () => {
  it("blocks TEST, TEST2, and TEST PROFILE identities before the participant fast path", () => {
    expect(migration).toContain("('TEST','TEST2','TESTPROFILE')");
    const functionIndex = migration.indexOf(
      "create or replace function private.ensure_football_weekly_auction_participant",
    );
    const guardIndex = migration.indexOf(
      "football_weekly_auction_is_reserved_test_profile(p_profile_id)",
      functionIndex,
    );
    const fastPathIndex = migration.indexOf(
      "from private.football_weekly_auction_participants participant",
      guardIndex,
    );

    expect(guardIndex).toBeGreaterThan(-1);
    expect(fastPathIndex).toBeGreaterThan(-1);
    expect(guardIndex).toBeLessThan(fastPathIndex);
    expect(migration).toContain("then\n    return false;");
  });

  it("cleans safe unfinished test participation and excludes test profiles from field sizing", () => {
    expect(migration).toContain(
      "delete from private.football_weekly_auction_daily_entries",
    );
    expect(migration).toContain(
      "delete from private.football_weekly_auction_participants",
    );
    expect(migration).toContain("week.finalized_at is null");
    expect(migration).toContain(
      "not private.football_weekly_auction_is_reserved_test_profile(participant.profile_id)",
    );
  });

  it("never shrinks an NFL Team-Seasons day below a slot a real player already submitted", () => {
    expect(migration).toContain("v_committed_slot integer");
    expect(migration).toContain("select coalesce(max(bid.slot),0)::integer into v_committed_slot");
    expect(migration).toContain(
      "greatest(v_base,v_completion_floor,v_committed_slot)",
    );
  });
});
