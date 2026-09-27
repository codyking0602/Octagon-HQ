import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310200_two_game_find_leader_reveal_details.sql",
  "utf8",
);

describe("two-game Find the Leader leaderboard reveal migration", () => {
  it("keeps the completed-Daily leaderboard spoiler gate", () => {
    expect(migration).toContain("history.profile_id = v_profile");
    expect(migration).toContain("return jsonb_build_object(\n      'unlocked', false");
    expect(migration).toContain("history.game_type = 'find_leader'");
    expect(migration).toContain("daily-two-game-average-v1");
  });

  it("exposes only public setup and reveal rounds for completed Find the Leader games", () => {
    expect(migration).toContain("'setup_rounds'");
    expect(migration).toContain("setup.public_setup -> 'rounds'");
    expect(migration).toContain("'reveal_rounds'");
    expect(migration).toContain("setup.reveal_setup -> 'rounds'");
    expect(migration).not.toContain("'private_setup_evidence',");
    expect(migration).not.toContain("'private_grading_evidence',");
    expect(migration).not.toContain("'submission_state',");
  });
});
