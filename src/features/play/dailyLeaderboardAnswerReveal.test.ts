import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310041_daily_leaderboard_answer_reveal.sql",
  "utf8",
);
const repository = readFileSync(
  "src/features/play/todayChallengeRepository.ts",
  "utf8",
);

describe("Daily leaderboard answer reveal contract", () => {
  it("keeps every answer spoiler-locked until the requesting member finishes the same Daily", () => {
    const completionGuard = migration.indexOf("if not exists (");
    const publicResultProjection = migration.indexOf("'public_result', ranked.public_result");

    expect(completionGuard).toBeGreaterThan(-1);
    expect(publicResultProjection).toBeGreaterThan(completionGuard);
    expect(migration).toContain("history.profile_id = v_profile");
    expect(migration).toContain("history.central_day = p_day");
    expect(migration).toContain("history.schedule_version = p_schedule_version");
    expect(migration).toContain("'unlocked', false");
    expect(migration).toContain("'entries', '[]'::jsonb");
  });

  it("reveals only the stored public result through the existing canonical leaderboard RPC", () => {
    expect(migration).toContain("create or replace function public.get_daily_challenge_leaderboard(");
    expect(migration).toContain("history.public_result");
    expect(migration).toContain("'profile_id', ranked.profile_id");
    expect(migration).not.toContain("submission_evidence");
    expect(migration).not.toContain("grading_evidence_snapshot");
    expect(migration).not.toContain("private_grading_evidence");
    expect(migration).toContain("revoke all on function public.get_daily_challenge_leaderboard(date, text)");
    expect(migration).toContain("grant execute on function public.get_daily_challenge_leaderboard(date, text)");
    expect(repository).toContain('"get_daily_challenge_leaderboard"');
    expect(repository).toContain("publicResult: entry.public_result");
  });
});
