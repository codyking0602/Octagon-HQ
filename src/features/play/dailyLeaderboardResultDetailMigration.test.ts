import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310179_who_am_i_leaderboard_result_details.sql",
  "utf8",
);

describe("Daily leaderboard completed-game detail migration", () => {
  it("exposes only the sanitized replay fields for Millionaire, Sports Feud, and Who Am I", () => {
    expect(migration).toContain("'result_detail', ranked.result_detail");
    expect(migration).toContain("'action_history'");
    expect(migration).toContain("'choice_id'");
    expect(migration).toContain("'lifeline'");
    expect(migration).toContain("'fast_money_results'");
    expect(migration).toContain("'submitted_text'");
    expect(migration).toContain("when history.game_type = 'who_am_i'");
    expect(migration).toContain("'natural_guesses'");
    expect(migration).toContain("'recovery_choices'");
    expect(migration).toContain("'recovery_guesses'");
    expect(migration).toContain("progress.submission_state #> '{final_submission,rounds}'");
    expect(migration).not.toContain("'submission_state', progress.submission_state");
  });

  it("keeps the leaderboard behind the completed-Daily authentication gate", () => {
    expect(migration).toContain("v_profile uuid := auth.uid()");
    expect(migration).toContain("history.profile_id = v_profile");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("grant execute on function public.get_daily_challenge_leaderboard(date, text, text)");
    expect(migration).toContain("to authenticated");
  });
});
