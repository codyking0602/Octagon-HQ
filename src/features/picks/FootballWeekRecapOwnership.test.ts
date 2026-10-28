import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = () => readFileSync("supabase/migrations/202612310087_football_pick_week_recaps.sql", "utf8");

describe("Football week recap backend ownership", () => {
  it("extends the shared Picks history owner with canonical football facts", () => {
    const sql = migration();

    expect(sql).toContain("v_history := private.get_my_pick_history_core(p_season,p_sport)");
    expect(sql).toContain("'frozen_spread_home',bout.frozen_spread_home");
    expect(sql).toContain("'home_final_score',bout.home_final_score");
    expect(sql).toContain("'away_final_score',bout.away_final_score");
    expect(sql).toContain("'home_team_slug',bout.home_team_slug");
    expect(sql).toContain("'away_team_slug',bout.away_team_slug");
    expect(sql).not.toContain("create function public.get_my_football_pick_history");
  });

  it("keeps one completion owner while routing each sport to its canonical recap", () => {
    const sql = migration();

    expect(sql).toContain("create or replace function public.transition_pick_event");
    expect(sql).toContain("then '/football/picks?event=' || v_event.event_id || '&view=recap'");
    expect(sql).toContain("else '/picks?event=' || v_event.event_id || '&view=recap'");
    expect(sql).not.toContain("cron.");
    expect(sql).not.toContain("transition_football_pick_event");
  });
});