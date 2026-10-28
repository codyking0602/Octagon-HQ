import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310151_daily_hit_number_tiebreak_and_ufc_title_adjustment.sql",
  "utf8",
);

describe("Daily Hit the Number tiebreak and UFC title adjustment migration", () => {
  it("uses exact Hit the Number distance after normalized score for leaderboard rank", () => {
    expect(migration).toContain("private.daily_challenge_hit_number_distance");
    expect(migration).toContain("history.normalized_score desc");
    expect(migration).toContain("winning_hit_number_distance");
    expect(migration).toContain("history.hit_number_distance = daily_winners.winning_hit_number_distance");
    expect(migration).toContain("('SHANE', 'hit_the_number', 98, '{\"distance\":710}'::jsonb)");
    expect(migration).toContain("('LIB', 'hit_the_number', 98, '{\"distance\":735}'::jsonb)");
  });

  it("keeps the public integer score while changing only winner resolution", () => {
    expect(migration).not.toContain("update private.daily_challenge_history");
    expect(migration).not.toContain("delete from private.daily_challenge_history");
    expect(migration).toContain("rank() over (");
    expect(migration).toContain("normalized_score desc");
  });

  it("applies a durable Cody-only UFC title delta without touching Shane's earned title", () => {
    expect(migration).toContain("private.daily_challenge_title_adjustments");
    expect(migration).toContain("where lower(profile.normalized_name) = 'cody'");
    expect(migration).toContain("'ufc'");
    expect(migration).toContain("-3");
    expect(migration).toContain("title_adjustment.profile_id = profile.id");
    expect(migration).toContain("title_adjustment.sport = p_sport");
  });
});
