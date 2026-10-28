import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310276_football_gm_forfeit.sql",
  "utf8",
);

describe("The GM forfeit migration", () => {
  it("adds an authenticated active-match forfeit RPC and preserves roster state", () => {
    expect(migration).toContain("create or replace function public.forfeit_football_gm");
    expect(migration).toContain("forfeited_by_profile_id");
    expect(migration).toContain("forfeited_at");
    expect(migration).toContain("set phase = 'complete'");
    expect(migration).toContain("pending_team_code = null");
    expect(migration).toContain("grant execute on function public.forfeit_football_gm(text) to authenticated");
    expect(migration).toContain("forfeited. You win the matchup.");
  });

  it("refuses unopened or already-ended GM matches", () => {
    expect(migration).toContain("raise exception 'match has not started'");
    expect(migration).toContain("raise exception 'match has already ended'");
  });

  it("keeps notification failure from rolling back the completed forfeit", () => {
    expect(migration).toContain("exception when others then");
    expect(migration).toContain("'game_challenge_result_ready'");
  });
});
