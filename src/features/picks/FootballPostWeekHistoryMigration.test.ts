import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202612310087_football_picks_post_week_history.sql", "utf8");

describe("Football Picks post-week history migration", () => {
  it("keeps the existing shared history RPC and enriches canonical football game facts", () => {
    expect(migration).toContain("create or replace function public.get_my_pick_history");
    expect(migration).toContain("private.get_my_pick_history_core(p_season,p_sport)");
    expect(migration).toContain("'frozen_spread_home',bout.frozen_spread_home");
    expect(migration).toContain("'home_final_score',bout.home_final_score");
    expect(migration).toContain("'away_final_score',bout.away_final_score");
    expect(migration).not.toContain("create table");
  });

  it("routes completed football weeks through the existing transition owner while preserving UFC", () => {
    expect(migration).toContain("create or replace function public.transition_pick_event");
    expect(migration).toContain("when v_event.sport = 'football' then '/football/picks?event='");
    expect(migration).toContain("else '/picks?event='");
    expect(migration).toContain("'picks-recap-ready:' || v_event.event_id");
    expect(migration).not.toContain("cron.");
  });
});
