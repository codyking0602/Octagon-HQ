import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/202608130001_approved_pick_fighter_replacements.sql", "utf8");
const integration = readFileSync("supabase/tests/approved_pick_fighter_replacements.sql", "utf8");

describe("approved pre-lock fighter replacements", () => {
  it("uses one owner-authorized atomic RPC with reason, identity, stale-state, and lock guards", () => {
    expect(sql).toContain("approve_pick_fighter_replacement");
    expect(sql).toContain("public.is_pick_control_owner(auth.uid())");
    expect(sql).toContain("replacement reason required");
    expect(sql).toContain("matchup changed; reload Fight Night Control");
    expect(sql).toContain("event.status <> 'upcoming' or now() >= v_event.locks_at or now() >= v_event.starts_at");
    expect(sql).toContain("replacement fighter must be different from both current fighters");
    expect(sql).toContain("replacement fighter is already booked on this event");
    expect(sql).toContain("booked_bout.bout_id <> v_bout_id");
  });

  it("audits before mutation, invalidates every affected pick, lock, and odds without touching other bouts", () => {
    expect(sql.indexOf("v_before :=")).toBeLessThan(sql.indexOf("delete from public.profile_event_picks"));
    expect(sql).toContain("'invalidated_picks', v_affected_picks");
    expect(sql).toContain("delete from public.profile_event_picks\n  where event_id = v_event_id and bout_id = v_bout_id");
    expect(sql).toContain("frozen_at is null");
    expect(sql).toContain("red_american_odds = null");
    expect(sql).toContain("action_type, reason, before_state, after_state");
    expect(sql).not.toContain("update public.fighters");
  });

  it("keeps evidence private and projects only viewer-specific repick state", () => {
    expect(sql).toContain("repick_required");
    expect(sql).toContain("evidence->>'profile_id'=auth.uid()::text");
    expect(sql).toContain("public.resolved_bout_group_picks");
    expect(sql).toContain("has_replacement_history");
  });

  it("includes rollback-only integration coverage for safety and repeat replacements", () => {
    expect(integration).toContain("non-owner replacement was accepted");
    expect(integration).toContain("unaffected pick changed");
    expect(integration).toContain("old pick silently survived replacement");
    expect(integration).toContain("second replacement did not append independent audit evidence");
    expect(integration).toContain("duplicate event fighter replacement was accepted");
    expect(integration).toContain("replacement fighter is already booked on this event");
    expect(integration.trimEnd()).toMatch(/rollback;$/);
  });
});
