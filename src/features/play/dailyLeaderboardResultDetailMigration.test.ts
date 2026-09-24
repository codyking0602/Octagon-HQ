import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310174_daily_leaderboard_game_result_details.sql",
  "utf8",
);

describe("Daily leaderboard completed-game detail migration", () => {
  it("exposes only the sanitized replay fields for Millionaire and Sports Feud", () => {
    expect(migration).toContain("'result_detail', ranked.result_detail");
    expect(migration).toContain("'action_history'");
    expect(migration).toContain("'choice_id'");
    expect(migration).toContain("'lifeline'");
    expect(migration).toContain("'fast_money_results'");
    expect(migration).toContain("'submitted_text'");
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
