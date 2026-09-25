import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310183_mlb_play_challenge_leaderboard.sql",
  "utf8",
);

describe("MLB Play challenge leaderboard backend", () => {
  it("locks one official result per member and challenge", () => {
    expect(migration).toContain("on conflict (season, challenge_key, profile_id) do nothing");
    expect(migration).toContain("p_raw_score < 0 or p_raw_score > 100");
    expect(migration).toContain("record_mlb_postseason_challenge_result");
  });

  it("keeps other members' challenge details locked until the caller finishes", () => {
    expect(migration).toContain("v_unlocked := v_own is not null");
    expect(migration).toContain("if v_unlocked then");
    expect(migration).toContain("'result_detail', ranked.result_detail");
    expect(migration).toContain("'unlocked', v_unlocked");
  });

  it("returns the profile identity needed for clickable result rows", () => {
    expect(migration).toContain("profile.display_name");
    expect(migration).toContain("profile.initials");
    expect(migration).toContain("preference.avatar_photo_data");
    expect(migration).toContain("'is_current_user', ranked.profile_id = v_profile_id");
  });
});
