import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608180001_pick_lock_time_control.sql",
  "utf8",
);

describe("event-wide Picks deadline control", () => {
  it("keeps one canonical event deadline rather than creating per-bout locks", () => {
    expect(sql).toContain("create or replace function public.adjust_pick_event_lock_time");
    expect(sql).toContain("update public.pick_events");
    expect(sql).toContain("set locks_at = p_locks_at");
    expect(sql).not.toContain("update public.pick_bouts\n  set locks_at");
  });

  it("reuses the Fight Night owner and existing private action ledger", () => {
    expect(sql).toContain("public.is_pick_control_owner(auth.uid())");
    expect(sql).toContain("'adjust_lock_time'");
    expect(sql).toContain("insert into public.pick_card_change_actions");
    expect(sql).toContain("p_expected_locks_at");
    expect(sql).toContain("Picks lock time changed; reload Fight Night Control");
  });

  it("allows an upcoming deadline to move only before the current deadline and never beyond the main-card start", () => {
    expect(sql).toContain("v_event.status <> 'upcoming'");
    expect(sql).toContain("now() >= v_event.starts_at");
    expect(sql).toContain("now() >= v_event.locks_at");
    expect(sql).toContain("Picks deadline has passed; it cannot be reopened");
    expect(sql).toContain("p_locks_at <= now()");
    expect(sql).toContain("p_locks_at > v_event.starts_at");
    expect(sql).toContain("Picks lock cannot follow the main-card start");
  });

  it("corrects the current Belgrade event to the sourced 3 PM EDT main card", () => {
    expect(sql).toContain("timestamptz '2026-08-01 19:00:00+00'");
    expect(sql).toContain("lower(subtitle) like '%medic%'");
    expect(sql).toContain("lower(subtitle) like '%rodriguez%'");
    expect(sql).toContain("update public.pick_event_drafts");
  });
});