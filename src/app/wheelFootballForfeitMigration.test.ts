import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310239_wheel_football_forfeit.sql",
  "utf8",
);

describe("Wheel of Football forfeit migration", () => {
  it("adds an explicit authenticated forfeit RPC and preserves prior picks", () => {
    expect(migration).toContain("create or replace function public.forfeit_wheel_football");
    expect(migration).toContain("forfeited_by_profile_id");
    expect(migration).toContain("set phase = 'complete'");
    expect(migration).toContain("pending_team_code = null");
    expect(migration).toContain("grant execute on function public.forfeit_wheel_football(text) to authenticated");
    expect(migration).toContain("forfeited. You win the matchup.");
  });

  it("refuses unopened or already-ended matches", () => {
    expect(migration).toContain("raise exception 'match has not started'");
    expect(migration).toContain("raise exception 'match has already ended'");
  });
});
