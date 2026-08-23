import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608230001_football_team_preference.sql"),
  "utf8",
);

describe("Football team preference migration", () => {
  it("extends the existing profile_preferences owner with only Cowboys or Longhorns", () => {
    expect(migration).toContain("alter table public.profile_preferences");
    expect(migration).toContain("add column if not exists football_team text");
    expect(migration).toContain("football_team in ('cowboys', 'longhorns')");
    expect(migration).toContain("create or replace function public.set_my_football_team");
  });

  it("persists the authenticated profile through the existing one-row preference record", () => {
    expect(migration).toContain("v_profile_id uuid := auth.uid()");
    expect(migration).toContain("insert into public.profile_preferences (profile_id, football_team, updated_at)");
    expect(migration).toContain("on conflict (profile_id) do update");
    expect(migration).toContain("grant execute on function public.set_my_football_team(text) to authenticated");
  });
});
