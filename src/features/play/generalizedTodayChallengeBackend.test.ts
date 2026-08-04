import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("generalized Today's Challenge backend migration", () => {
  const migration = readFileSync("supabase/migrations/202609050001_generalized_todays_challenge_backend.sql", "utf8");
  const roadmap = readFileSync("docs/play-games-roadmap.md", "utf8");

  it("creates one versioned multi-game daily owner with private setup and grading evidence", () => {
    expect(migration).toContain("create table if not exists private.daily_challenge_setups");
    expect(migration).toContain("create table if not exists public.daily_challenges");
    expect(migration).toContain("create table if not exists private.daily_challenge_attempts");
    expect(migration).toContain("schedule_version text not null");
    expect(migration).toContain("content_version text not null");
    expect(migration).toContain("scoring_version text not null");
    expect(migration).toContain("private_setup_evidence jsonb not null");
    expect(migration).toContain("private_grading_evidence jsonb not null");
    expect(migration).toContain("unique (schedule_version, central_day)");
    expect(migration).toContain("unique (game_type, setup_key, content_version, scoring_version)");
  });

  it("supports the approved future daily games while excluding Auction and Better Than", () => {
    for (const game of ["find_leader", "blind_resume", "wavelength", "blind_rank_5", "keep_4_cut_4"]) {
      expect(migration).toContain(`'${game}'`);
    }
    expect(migration).not.toContain("'auction'");
    expect(migration).not.toContain("'better_than'");
  });

  it("uses Central time and keeps Find the Leader as the current daily schedule", () => {
    expect(migration).toContain("America/Chicago");
    expect(migration).toContain("private.daily_challenge_central_day");
    expect(migration).toContain("p_schedule_version text default 'find-leader-v1'");
    expect(roadmap).toContain("initial production-compatible schedule version remains Find-the-Leader-only");
  });

  it("makes first official attempts immutable and isolates replays", () => {
    expect(migration).toContain("attempt_kind text not null check (attempt_kind in ('official_first','replay'))");
    expect(migration).toContain("daily_challenge_one_official_attempt");
    expect(migration).toContain("on conflict (daily_challenge_id, profile_id) where attempt_kind = 'official_first' do nothing");
    expect(migration).toContain("'attempt_kind','replay'");
  });

  it("projects guarded leaderboards with tied ranks and no completion-time tiebreaker", () => {
    expect(migration).toContain("rank() over(order by h.normalized_score desc)::int as score_rank");
    expect(migration).not.toContain("rank() over(order by h.normalized_score desc, h.completed_at");
    expect(migration).toContain("not exists (select 1 from public.daily_challenge_history h where h.profile_id=v_profile");
    expect(migration).toContain("'unlocked',false");
  });

  it("keeps signed-out users and cross-user writes outside official state", () => {
    expect(migration).toContain("if v_profile is null then raise exception 'sign in required'");
    expect(migration).toContain("if auth.role() <> 'service_role' then raise exception 'service role required to publish daily challenge setup'");
    expect(migration).toContain("revoke all on private.daily_challenge_setups from public, anon, authenticated");
    expect(migration).toContain("revoke all on private.daily_challenge_attempts from public, anon, authenticated");
    expect(migration).toContain("revoke all on function public.record_my_daily_challenge_attempt");
  });

  it("preserves Find the Leader compatibility without a competing leaderboard owner", () => {
    expect(migration).toContain("create or replace function public.list_my_find_leader_history()");
    expect(migration).toContain("from public.daily_challenge_history h");
    expect(migration).toContain("create or replace function public.get_find_leader_daily_leaderboard(p_day date)");
    expect(migration).toContain("select public.get_daily_challenge_leaderboard(p_day,'find-leader-v1')");
    expect(roadmap).toContain("Legacy Find the Leader history remains visible through compatibility projections");
  });

  it("documents PR 8 and PR 9 as intentionally deferred", () => {
    expect(roadmap).toContain("PR 8 owns frontend integration");
    expect(roadmap).toContain("PR 9 owns activating the twenty-day rotation");
  });
});
