import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310268_sports_feud_attempt_audit.sql",
  "utf8",
);

describe("Sports Feud attempt audit migration", () => {
  it("exposes sanitized raw main-board attempts in Daily leaderboard details", () => {
    expect(migration).toContain("'main_board_attempts'");
    expect(migration).toContain("'submitted_text'");
    expect(migration).toContain("'normalized_text'");
    expect(migration).toContain("'status'");
    expect(migration).toContain("'entity_id'");
    expect(migration).toContain("'match_kind'");
    expect(migration).toContain("engine_state,mainBoards");
  });
});
