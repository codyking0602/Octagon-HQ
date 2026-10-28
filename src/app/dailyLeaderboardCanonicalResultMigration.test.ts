import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202612310042_daily_leaderboard_canonical_result_state.sql",
  ),
  "utf8",
);

describe("Daily leaderboard canonical result migration", () => {
  it("extends the one spoiler-gated leaderboard owner with persisted public result state", () => {
    expect(migration).toContain("create or replace function public.get_daily_challenge_leaderboard");
    expect(migration).toContain("from private.daily_challenge_history history");
    expect(migration).toContain("left join private.daily_challenge_progress progress");
    expect(migration).toContain("'completed_at', ranked.completed_at");
    expect(migration).toContain("'progress_revision', ranked.progress_revision");
    expect(migration).toContain("'public_state', ranked.public_state");
  });

  it("keeps private submission and grading evidence out of the public leaderboard payload", () => {
    expect(migration).not.toContain("submission_state");
    expect(migration).not.toContain("submission_evidence");
    expect(migration).not.toContain("grading_evidence_snapshot");
    expect(migration).not.toContain("private_grading_evidence");
  });
});
