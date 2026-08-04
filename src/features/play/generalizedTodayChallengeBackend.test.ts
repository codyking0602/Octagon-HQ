import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("generalized Today's Challenge backend contract", () => {
  const migration = readFileSync(
    "supabase/migrations/202609050001_generalized_todays_challenge_backend.sql",
    "utf8",
  );
  const sqlTest = readFileSync(
    "supabase/tests/generalized_todays_challenge_backend.sql",
    "utf8",
  );
  const backendWorkflow = readFileSync(
    ".github/workflows/verify-generalized-daily-backend.yml",
    "utf8",
  );
  const roadmap = readFileSync("docs/play-games-roadmap.md", "utf8");
  const submissionRpc = migration.slice(
    migration.indexOf("create or replace function public.submit_my_daily_challenge_attempt"),
    migration.indexOf("-- Existing Find the Leader rows"),
  );

  it("keeps schedule, setup, daily identity, attempts, and the canonical history projection private", () => {
    expect(migration).toContain("private.daily_challenge_schedule_versions");
    expect(migration).toContain("private.daily_challenge_setups");
    expect(migration).toContain("private.daily_challenges");
    expect(migration).toContain("private.daily_challenge_attempts");
    expect(migration).toContain("create or replace view private.daily_challenge_history");
    expect(migration).not.toContain("create table if not exists public.daily_challenges");
    expect(migration).not.toContain("create or replace view public.daily_challenge_history");
  });

  it("supports exactly the five approved future daily games and leaves the live schedule on Find the Leader", () => {
    for (const game of ["find_leader", "blind_resume", "wavelength", "blind_rank_5", "keep_4_cut_4"]) {
      expect(migration).toContain(`'${game}'`);
    }
    expect(migration).not.toContain("'better_than'");
    expect(migration).not.toContain("'auction'");
    expect(migration).toContain("array['find_leader']::text[]");
    expect(migration).toContain("America/Chicago");
    expect(roadmap).toContain("initial production-compatible schedule version remains Find-the-Leader-only");
  });

  it("pins all official identity and evidence instead of mutating conflicting publications", () => {
    expect(migration).toContain("unique (schedule_version, central_day)");
    expect(migration).toContain("unique (game_type, setup_key, content_version, scoring_version)");
    expect(migration).toContain("official daily challenge records are immutable");
    expect(migration).toContain("setup identity already exists with different immutable evidence");
    expect(migration).toContain("daily identity already exists with different immutable evidence");
    expect(migration).not.toContain("do update set public_setup");
    expect(migration).not.toContain("set game_type = excluded.game_type");
  });

  it("grades all five games behind the database boundary without accepting client scores, grading evidence, or timestamps", () => {
    expect(migration).toContain("private.grade_daily_challenge");
    expect(migration).toContain("play-official-score-v1");
    expect(migration).toContain("correct_picks");
    expect(migration).toContain("correct_comparisons");
    expect(submissionRpc).toContain("p_submission jsonb");
    expect(submissionRpc).not.toContain("p_native_score");
    expect(submissionRpc).not.toContain("p_completed_at");
    expect(submissionRpc).not.toContain("p_private_grading_evidence");
    expect(migration).not.toContain("record_my_daily_challenge_attempt");
  });

  it("keeps one immutable official first attempt and appends isolated replays", () => {
    expect(migration).toContain("daily_challenge_one_official_attempt");
    expect(migration).toContain("where attempt_kind = 'official_first'");
    expect(migration).toContain("'replay'");
    expect(migration).not.toContain("on conflict (daily_challenge_id, profile_id, attempt_kind) do update");
    expect(sqlTest).toContain("replay replaced the immutable official result");
  });

  it("reveals only the minimum current-state projection and guards history and leaderboards", () => {
    expect(migration).toContain("create or replace function public.get_today_challenge_public()");
    expect(migration).toContain("when v_attempt.id is null then null");
    expect(migration).toContain("rank() over (order by history.normalized_score desc)");
    expect(migration).not.toContain("history.normalized_score desc, history.completed_at");
    expect(migration).toContain("'unlocked', false");
    expect(sqlTest).toContain("pre-completion projection exposed private/reveal evidence");
    expect(sqlTest).toContain("authenticated role has direct private daily evidence access");
  });

  it("uses one generalized compatibility projection without changing current Find the Leader UI ownership", () => {
    expect(migration).toContain("create or replace function public.list_my_find_leader_history()");
    expect(migration).toContain("create or replace function public.get_find_leader_daily_leaderboard(p_day date)");
    expect(migration).toContain("from private.daily_challenge_history");
    expect(migration).toContain("legacy-find-leader-content-v1");
    expect(roadmap).toContain("PR 8 owns frontend integration");
    expect(roadmap).toContain("PR 9 owns activating the twenty-day rotation");
  });

  it("requires real fresh, legacy, authorization, DST, concurrency, and exact deployment proofs", () => {
    expect(sqlTest).toContain("daylight-saving transitions");
    expect(sqlTest).toContain("future eligible games did not fit the generalized server grader");
    expect(backendWorkflow).toContain("generalized_todays_challenge_backend.sql");
    expect(backendWorkflow).toContain("generalized_todays_challenge_legacy_seed.sql");
    expect(backendWorkflow).toContain("verify-generalized-daily-concurrency.sh");
    expect(backendWorkflow).toContain("202609050001");
    expect(backendWorkflow).toContain("202609050002");
    expect(backendWorkflow).toContain("Deploy Supabase Backend");
  });
});
