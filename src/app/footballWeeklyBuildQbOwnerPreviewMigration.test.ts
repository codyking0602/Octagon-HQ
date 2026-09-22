import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310156_nfl_build_qb_owner_day1_preview.sql",
  "utf8",
);

describe("NFL Build a QB owner Day 1 preview migration", () => {
  it("is server-gated to Cody's controller profile", () => {
    expect(migration).toContain("public.is_pick_control_owner(v_profile)");
    expect(migration).toContain("profile.normalized_name='CODY'");
    expect(migration).toContain("grant execute on function public.get_my_football_weekly_build_qb_preview() to authenticated");
  });

  it("materializes the real next week without locking participants and returns Day 1 only", () => {
    expect(migration).toContain("private.materialize_football_weekly_auction_week(v_week_start)");
    expect(migration).toContain("board.day_index=1");
    expect(migration).not.toContain("perform private.maintain_football_weekly_auction");
    expect(migration).toContain("'previous_final',null");
  });
});
