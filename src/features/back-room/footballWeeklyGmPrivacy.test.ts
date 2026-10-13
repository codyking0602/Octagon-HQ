import { describe, expect, it } from "vitest";
import migration from "../../../supabase/migrations/202612310302_weekly_gm_score_reveal_privacy.sql?raw";
import page from "./FootballWeeklyGmPage.tsx?raw";

describe("Weekly GM competitive score privacy", () => {
  it("keeps opponent total hidden until BOTH viewer franchises are complete at the DB boundary", () => {
    expect(migration).toContain("v_elite_unlocked and v_young_unlocked");
    expect(migration).toContain("case when ranked.profile_id=v_profile or v_elite_unlocked");
    expect(migration).toContain("case when ranked.profile_id=v_profile or v_young_unlocked");
    expect(page).toContain('"SCORE HIDDEN"');
  });
  it("unlocks individual opponents only after the matching QB was completed in that same week", () => {
    expect(migration).toContain("mine.week_start=attempt.week_start");
    expect(migration).toContain("mine.profile_id=v_viewer and mine.scenario=p_scenario");
    expect(migration).toContain("mine.completed_at is not null");
    expect(page).toContain("state.attempts[id]?.completed === true");
    expect(page).toContain("state?.attempts[scenario]?.completed");
    expect(page).toContain("· LOCKED");
  });
});
