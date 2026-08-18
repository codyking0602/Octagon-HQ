import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310028_activate_60_day_daily_rotation.sql",
  "utf8",
);

function cycleEntries() {
  const match = migration.match(/v_cycle constant text\[\] := array\[([\s\S]*?)\]::text\[];/);
  if (!match) throw new Error("Could not read the play-rotation-v3 cycle from the migration.");
  return [...match[1]!.matchAll(/'([a-z0-9_]+)'/g)].map((entry) => entry[1]!);
}

describe("60-day Today’s Challenge rotation migration", () => {
  it("creates one forward schedule identity anchored on August 18 without rewriting history", () => {
    expect(migration).toContain("v_source_version constant text := 'play-rotation-v2'");
    expect(migration).toContain("v_version constant text := 'play-rotation-v3'");
    expect(migration).toContain("v_start constant date := date '2026-08-18'");
    expect(migration).toContain("v_activation_day := greatest(v_start, v_source.starts_on)");
    expect(migration).toContain("v_existing.anchor_day <> v_start");
    expect(migration).toContain("v_existing.starts_on <> v_activation_day");
    expect(migration).toContain("insert into private.daily_challenge_schedule_versions");
    expect(migration).not.toContain("delete from private.daily_challenges");
    expect(migration).not.toContain("update private.daily_challenge_schedule_versions");
    expect(migration).toContain("refusing to activate Daily rotation v3 across an already-materialized day");
  });

  it("locks the exact approved game counts and a clean cycle boundary", () => {
    const cycle = cycleEntries();
    expect(cycle).toHaveLength(60);
    expect(cycle.filter((game) => game === "find_leader")).toHaveLength(12);
    expect(cycle.filter((game) => game === "blind_resume")).toHaveLength(12);
    expect(cycle.filter((game) => game === "hit_the_number")).toHaveLength(12);
    expect(cycle.filter((game) => game === "wavelength")).toHaveLength(10);
    expect(cycle.filter((game) => game === "blind_rank_5")).toHaveLength(7);
    expect(cycle.filter((game) => game === "keep_4_cut_4")).toHaveLength(7);
    cycle.forEach((game, index) => {
      expect(game).not.toBe(cycle[(index + 1) % cycle.length]);
    });
  });

  it("extends the existing schedule constraint instead of adding a second schedule owner", () => {
    expect(migration).toContain("daily_challenge_schedule_versions_supported_games_check");
    expect(migration).toContain("'hit_the_number'");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("create or replace function private.daily_challenge_schedule_for_day");
    expect(migration).not.toContain("create or replace function private.daily_challenge_expected_game");
  });
});
