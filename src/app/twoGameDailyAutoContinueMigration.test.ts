import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310202_auto_continue_two_game_daily.sql",
  "utf8",
);

describe("two-game Daily auto-continue repair migration", () => {
  it("repairs only September 27 players stuck after a locked Game 1", () => {
    expect(migration).toContain("daily.central_day = date '2026-09-27'");
    expect(migration).toContain("daily-two-game-average-score-v1");
    expect(migration).toContain("progress.public_state ->> 'awaiting_next' = 'true'");
    expect(migration).toContain("jsonb_array_length(progress.public_state -> 'round_scores') = 1");
  });

  it("moves only the outer pointer to Game 2 and preserves saved Game 1 state", () => {
    expect(migration).toContain("'round_index', 1");
    expect(migration).toContain("'awaiting_next', false");
    expect(migration).toContain("'active_round', setup.public_setup -> 'rounds' -> 1 -> 'initial_state'");
    expect(migration).not.toMatch(/submission_state\s*=/);
    expect(migration).not.toMatch(/round_scores'\s*,/);
    expect(migration).not.toContain("delete from private.daily_challenge_progress");
  });

  it("bumps the progress revision so stale clients reload canonical Game 2", () => {
    expect(migration).toContain("revision = progress.revision + 1");
  });
});
