import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve(process.cwd(),
  "supabase/migrations/202612310290_member_daily_play_full_stats.sql"), "utf8");
const api = readFileSync(resolve(process.cwd(),
  "src/features/play/todayChallengeRepository.ts"), "utf8");
const memberPage = readFileSync(resolve(process.cwd(),
  "src/features/members/MemberProfilePage.tsx"), "utf8");

describe("member official Daily stats privacy", () => {
  it("allows authenticated reads of completed scores without exposing raw attempts or game drafts", () => {
    expect(sql).toMatch(/security definer/i);
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("v_viewer uuid := auth.uid()");
    expect(sql).toContain("if v_viewer is null");
    expect(sql).toContain("from private.daily_challenge_history source");
    expect(sql).toContain("schedule.sport = p_sport");
    expect(sql).toContain("source.profile_id = v_member");
    expect(sql).toContain("limit 365");
    expect(sql).toContain("revoke all on function public.list_member_daily_challenge_history(text, text) from public, anon");
    expect(sql).toContain("grant execute on function public.list_member_daily_challenge_history(text, text) to authenticated");
    expect(sql).not.toMatch(/submission_evidence|private_setup_evidence|grading_evidence_snapshot|submission_state|service_role/);
  });

  it("does not show today's opponent result until the viewer has finished the matching official game", () => {
    expect(sql).toContain("source.central_day < (now() at time zone 'America/Chicago')::date");
    expect(sql).toContain("viewer_result.profile_id = v_viewer");
    expect(sql).toContain("viewer_result.schedule_version = source.schedule_version");
    expect(sql).toContain("source.profile_id = v_viewer");
  });

  it("requests official histories by normalized member name and offers both sports on member pages", () => {
    expect(api).toContain('"list_member_daily_challenge_history"');
    expect(api).toContain("p_member_name: memberName, p_sport: sport");
    expect(api).not.toContain('.from("daily_challenge_history")');
    expect(memberPage).toContain('"/play-stats/football"');
    expect(memberPage).toContain('"/play-stats/ufc"');
  });
});
