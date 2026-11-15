import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612311534_ufc_manual_open_hide_outcomes.sql",
  "utf8",
);

describe("UFC Picks outcomes remain hidden during manual-open window", () => {
  it("returns pending without winner identity or recorded timestamp during an owner-held window", () => {
    expect(migration).toContain("'winner_fighter_slug', case");
    expect(migration).toContain("'result_status', case");
    expect(migration).toContain("'result_recorded_at', case");
    expect((migration.match(/when event.sport = 'mma' and event.manual_picks_open/g) ?? []).length).toBe(3);
    expect(migration).toContain("then 'pending'");
    expect(migration).toContain("then null");
    expect(migration).toContain("else bout.winner_fighter_slug");
    expect(migration).toContain("else bout.result_status");
    expect(migration).toContain("else bout.result_recorded_at");
    expect(migration).toContain("bout.result_status <> 'cancelled'");
  });

  it("does not leak finished fight points or win/loss counts through the season summary", () => {
    expect(migration.toLowerCase()).toContain("create or replace function public.get_my_pick_summary(");
    expect(migration).toContain("and not (event.sport = 'mma' and event.manual_picks_open)");
  });

  it("prevents direct table reads from exposing official result rows while Picks remain open", () => {
    expect(migration).toContain("alter policy pick_bouts_public_read on public.pick_bouts");
    expect(migration).toContain("not exists (");
    expect(migration).toContain("and event.manual_picks_open");
  });

  it("keeps official results, owner control, monitoring, and player submissions untouched", () => {
    expect(migration).not.toContain("update public.pick_bouts");
    expect(migration).not.toContain("update public.pick_events");
    expect(migration).not.toContain("create or replace function private.pick_bout_is_locked");
    expect(migration).not.toContain("create or replace function public.save_my_event_pick");
    expect(migration).not.toContain("create or replace function public.record_official_pick_bout_result");
    expect(migration).not.toContain("create or replace function public.finalize_ready_ufc_pick_events");
  });
});
