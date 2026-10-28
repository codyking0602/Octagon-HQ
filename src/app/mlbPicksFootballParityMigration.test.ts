import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310181_mlb_picks_football_parity.sql",
  "utf8",
);

describe("MLB Picks Football-parity projection", () => {
  it("adds optional series moneyline fields without making them required", () => {
    expect(migration).toContain("add column if not exists team_a_moneyline integer");
    expect(migration).toContain("add column if not exists team_b_moneyline integer");
    expect(migration).toContain("add column if not exists odds_source text");
    expect(migration).toContain("add column if not exists odds_updated_at timestamptz");
  });

  it("returns group progress while protecting picks until lock", () => {
    expect(migration).toContain("'round_pick_entries', v_round_pick_entries");
    expect(migration).toContain("profile.id = v_profile_id");
    expect(migration).toContain("or v_is_owner");
    expect(migration).toContain("now() >= series_row.starts_at");
    expect(migration).toContain("series_row.status in ('active', 'complete')");
  });

  it("keeps the existing private season gate", () => {
    expect(migration).toContain("if not v_season.public_enabled and not v_is_owner then");
    expect(migration).toContain("mlb_playoffs_not_available");
  });
});
