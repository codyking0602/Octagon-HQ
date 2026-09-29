import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310209_bar_trivia_leaderboard_details.sql",
  "utf8",
);
const sqlProof = readFileSync(
  "supabase/tests/bar_trivia_daily_leaderboard_details.sql",
  "utf8",
);

describe("Bar Trivia Daily leaderboard backend contract", () => {
  it("adds a sanitized Bar Trivia result-detail branch without replacing the completion gate", () => {
    expect(migration).toContain("public.get_daily_challenge_leaderboard(date,text,text)");
    expect(migration).toContain("when history.game_type = 'bar_trivia' then");
    expect(migration).toContain("progress.public_state -> 'answers'");
    expect(migration).toContain("'question_id'");
    expect(migration).toContain("'choice'");
    expect(migration).toContain("'correct'");
    expect(migration).toContain("'points'");
    expect(migration).toContain("'double_round_bonus'");
    expect(migration).toContain("'streak_bonus'");
    expect(migration).toContain("'wager_delta'");
    expect(migration).not.toContain("'submission_state', progress.submission_state");
  });

  it("keeps a SQL proof for the canonical spoiler gate and anonymous denial", () => {
    expect(sqlProof).toContain("history.profile_id = v_profile");
    expect(sqlProof).toContain("security definer");
    expect(sqlProof).toContain("has_function_privilege");
    expect(sqlProof).toContain("'anon'");
  });
});
