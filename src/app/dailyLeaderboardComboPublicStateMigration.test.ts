import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310043_daily_leaderboard_combo_public_state.sql",
  "utf8",
);
const runtime = readFileSync(
  "supabase/functions/daily-challenge-runtime/index.ts",
  "utf8",
);

describe("Daily leaderboard combo public state", () => {
  it("projects persisted Daily Double progress into the canonical completed runtime shape", () => {
    expect(runtime).toContain("...activePublicState");
    expect(runtime).toContain("combo_blind_rank_result: requiredRecord(");
    expect(runtime).toContain("context.publicState.blind_rank_5");

    expect(migration).toContain("progress.public_state -> 'keep_4_cut_4'");
    expect(migration).toContain("'combo_blind_rank_result'");
    expect(migration).toContain("progress.public_state -> 'blind_rank_5'");
  });

  it("leaves ordinary Daily public state on the existing leaderboard path", () => {
    expect(migration).toContain("history.game_type = 'keep_4_cut_4'");
    expect(migration).toContain("else coalesce(progress.public_state, '{}'::jsonb)");
    expect(migration).toContain("create or replace function public.get_daily_challenge_leaderboard");
  });
});
