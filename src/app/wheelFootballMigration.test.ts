import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310228_wheel_football_v1.sql",
  "utf8",
);

describe("Wheel of Football v1 migration contract", () => {
  it("keeps alternating turn state separate from the normal one-shot challenge result fields", () => {
    expect(migration).toContain("create table if not exists private.wheel_football_matches");
    expect(migration).toContain("create table if not exists private.wheel_football_picks");
    expect(migration).toContain("turn_count integer not null default 0 check (turn_count between 0 and 14)");
    expect(migration).toContain("phase text not null default 'spin'");
    expect(migration).toContain("current_turn_profile_id");
    expect(migration).toContain("v_first_turn := case when random() < 0.5");
  });

  it("locks the approved v1 rules: current NFL, seven slots, no re-spin or grades", () => {
    expect(migration).toContain("'football-wheel-v1'");
    expect(migration).toContain("'currentOnly', true");
    for (const slot of ["QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach"]) {
      expect(migration).toContain(`'${slot}'`);
    }
    expect(migration).toContain("creator_last_team_code");
    expect(migration).toContain("recipient_last_team_code");
    expect(migration).toContain("and (v_last_team is null or team.code <> v_last_team)");
    expect(migration).not.toMatch(/re-?spin/i);
    expect(migration).not.toMatch(/grade|score/i);
  });

  it("server-owns spins, slot eligibility, turn changes, completion, and turn notifications", () => {
    expect(migration).toContain("create or replace function private.spin_wheel_football");
    expect(migration).toContain("create or replace function private.pick_wheel_football");
    expect(migration).toContain("That player is not eligible for that Superteam slot");
    expect(migration).toContain("v_next_turn_count := v_match.turn_count + 1");
    expect(migration).toContain("if v_next_turn_count = 14 then");
    expect(migration).toContain("'Your turn in Wheel of Football'");
    expect(migration).toContain("'Wheel of Football is complete'");
  });

  it("keeps private state inaccessible directly and exposes authenticated RPC wrappers only", () => {
    expect(migration).toContain("alter table private.wheel_football_matches enable row level security");
    expect(migration).toContain("revoke all on private.wheel_football_matches from public, anon, authenticated");
    expect(migration).toContain("create or replace function public.get_my_wheel_football_match");
    expect(migration).toContain("create or replace function public.create_wheel_football_challenge");
    expect(migration).toContain("create or replace function public.open_wheel_football_challenge");
    expect(migration).toContain("create or replace function public.spin_wheel_football");
    expect(migration).toContain("create or replace function public.pick_wheel_football");
    expect(migration).toContain("security invoker");
  });
});
