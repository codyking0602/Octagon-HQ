import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310199_compact_two_game_leaderboard_details.sql",
  "utf8",
);

describe("compact two-game leaderboard detail migration", () => {
  it("keeps the existing completion gate before exposing completed Wavelength round detail", () => {
    expect(migration).toContain("from private.daily_challenge_history history");
    expect(migration).toContain("history.profile_id = v_profile");
    expect(migration).toContain("return jsonb_build_object(\n      'unlocked', false");
    expect(migration).toContain("history.game_type = 'wavelength'");
    expect(migration).toContain("daily-two-game-average-v1");
  });

  it("exposes only the target and clue ids needed to reconstruct both Wavelength games", () => {
    expect(migration).toContain("'target'");
    expect(migration).toContain("'clue_ids'");
    expect(migration).toContain("progress.submission_state -> 'rounds'");
    expect(migration).toContain("setup.private_setup_evidence -> 'rounds'");
    expect(migration).not.toContain("'private_setup_evidence',");
    expect(migration).not.toContain("'submission_state',");
  });
});
