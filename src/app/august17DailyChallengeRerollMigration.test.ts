import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310024_reroll_august_17_daily_challenge.sql",
  "utf8",
);

describe("August 17 Daily Challenge reroll migration", () => {
  it("is hard-limited to the intended Central day and active schedule", () => {
    expect(migration).toContain("v_target_day constant date := date '2026-08-17'");
    expect(migration).toContain("v_source_version constant text := 'play-rotation-v1'");
    expect(migration).toContain("v_replacement_version constant text := 'play-rotation-v2'");
    expect(migration).toContain("private.daily_challenge_central_day(now())");
    expect(migration).toContain("private.daily_challenge_schedule_for_day(v_target_day)");
    expect(migration).toContain("if v_central_today <> v_target_day then");
    expect(migration).toContain("if v_active_version is distinct from v_source_version then");
  });

  it("preserves the canonical rotation and runtime instead of hand-authoring a setup", () => {
    expect(migration).toContain("private.daily_challenge_expected_game(v_source_version, v_target_day)");
    expect(migration).toContain("source.time_zone");
    expect(migration).toContain("source.anchor_day");
    expect(migration).toContain("source.game_cycle");
    expect(migration).not.toContain("insert into private.daily_challenge_setups");
    expect(migration).not.toContain("setup_key");
    expect(migration).not.toContain("public_setup");
  });

  it("removes only the superseded day state before the fresh materialization", () => {
    expect(migration).toContain("where daily.schedule_version = v_source_version");
    expect(migration).toContain("and daily.central_day = v_target_day");
    expect(migration).toContain("disable trigger daily_challenge_attempts_immutable");
    expect(migration).toContain("disable trigger daily_challenges_immutable");
    expect(migration).toContain("where progress.daily_challenge_id = v_existing_daily_id");
    expect(migration).toContain("where attempt.daily_challenge_id = v_existing_daily_id");
    expect(migration).toContain("where daily.id = v_existing_daily_id");
    expect(migration).toContain("enable trigger daily_challenge_attempts_immutable");
    expect(migration).toContain("enable trigger daily_challenges_immutable");
  });
});
