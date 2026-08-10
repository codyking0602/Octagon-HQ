import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/202608160001_post_lock_result_corrections.sql", "utf8");
const integrationSql = readFileSync("supabase/tests/post_lock_result_corrections.sql", "utf8");
const repository = readFileSync("src/features/picks-control/pickControlRepository.ts", "utf8");
const controlPage = readFileSync("src/features/picks-control/PicksControlPage.tsx", "utf8");

describe("post-lock official result corrections", () => {
  it("keeps card changes separate and adds one private immutable result-correction ledger", () => {
    expect(sql).toContain("create table if not exists private.pick_result_corrections");
    expect(sql).toContain("create trigger pick_result_corrections_immutable");
    expect(sql).toContain("raise exception 'pick result correction audit is immutable'");
    expect(sql).not.toContain("alter table public.pick_card_change_actions");
  });

  it("separates pending initial result entry from atomic final correction", () => {
    expect(sql).toContain("create function public.correct_official_pick_bout_result");
    expect(sql).toContain("official result already recorded; use correction workflow");
    expect(sql).toContain("correction requires an already-finalized official result");
    expect(sql).toContain("corrected result must be final");
    expect(sql).toContain("corrected result must differ from the current result");
  });

  it("uses expected-current result, winner, and timestamp stale guards", () => {
    expect(sql).toContain("p_expected_result_status text");
    expect(sql).toContain("p_expected_winner_fighter_slug text");
    expect(sql).toContain("p_expected_result_recorded_at timestamptz");
    expect(sql).toContain("STALE_STATE: result status changed");
    expect(sql).toContain("STALE_STATE: result winner changed");
    expect(sql).toContain("STALE_STATE: result timestamp changed");
    expect(repository).toContain("expectedResultStatus: bout.resultStatus");
    expect(repository).toContain("expectedWinnerFighterSlug: bout.winnerFighterSlug");
    expect(repository).toContain("expectedResultRecordedAt: bout.resultRecordedAt");
  });

  it("supports completed-event correction without creating a lifecycle transition", () => {
    expect(sql).toContain("if v_event.status not in ('locked', 'complete')");
    expect(sql).toContain("update public.pick_bouts");
    expect(sql).toContain("insert into private.pick_result_corrections");
    expect(sql).not.toContain("perform public.transition_pick_event");
  });

  it("extends the existing owner projection for explicit completed-event access", () => {
    expect(sql).toContain("create function public.get_pick_control_event(p_event_id text default null)");
    expect(sql).toContain("'recent_completed_events'");
    expect(sql).toContain("'can_correct_result'");
    expect(sql).toContain("'has_correction_history'");
    expect(repository).toContain('client.rpc("get_pick_control_event", { p_event_id: eventId })');
  });

  it("keeps the owner UI explicit about correction scope and automatic recalculation", () => {
    expect(controlPage).toContain("CORRECT RESULT");
    expect(controlPage).toContain("Enter RED, BLUE, DRAW, NO CONTEST, or CANCELLED");
    expect(controlPage).not.toContain("or PENDING");
    expect(controlPage).toContain("Scoring, standings, season totals, and recaps will recalculate automatically");
    expect(controlPage).toContain("The recap stays published");
    expect(controlPage).toContain("Result corrections");
    expect(controlPage).not.toContain("Recap published automatically");
    expect(controlPage).not.toContain("REOPEN EVENT");
  });

  it("keeps rollback-only database proof for privacy, preservation, scoring, recaps, and immutable audit", () => {
    expect(integrationSql).toContain("non-owner corrected an official result");
    expect(integrationSql).toContain("result correction changed submitted picks");
    expect(integrationSql).toContain("result correction changed the frozen Underdog Lock");
    expect(integrationSql).toContain("locked result correction did not recalculate scoring and lock bonus");
    expect(integrationSql).toContain("completed recap and season totals did not recalculate");
    expect(integrationSql).toContain("pick result correction audit is immutable");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
