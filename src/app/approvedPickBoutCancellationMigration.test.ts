import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608120001_approved_pick_bout_cancellations.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/approved_pick_bout_cancellations.sql",
  "utf8",
);

describe("approved pre-lock bout cancellations", () => {
  it("reuses canonical bout result state and a private append-only action ledger", () => {
    expect(sql).toContain("create table if not exists public.pick_card_change_actions");
    expect(sql).toContain("action_type in ('cancel_bout', 'restore_bout')");
    expect(sql).toContain("before_state jsonb not null");
    expect(sql).toContain("after_state jsonb not null");
    expect(sql).toContain("revoke all on table public.pick_card_change_actions from public, anon, authenticated");
    expect(sql).toContain("set result_status = case when p_cancelled then 'cancelled' else 'pending' end");
  });

  it("uses the existing Fight Night owner boundary and closes at the canonical lock", () => {
    expect(sql).toContain("create or replace function public.approve_pick_bout_cancellation");
    expect(sql).toContain("public.is_pick_control_owner(auth.uid())");
    expect(sql).toContain("v_event.status <> 'upcoming' or now() >= v_event.locks_at");
    expect(sql).toContain("raise exception 'pre-lock card changes are closed'");
    expect(sql).toContain("cancellation reason required");
  });

  it("preserves picks, clears only the invalid mutable bonus choice, and blocks new cancelled-bout choices", () => {
    const cancellationBody = sql.split("create or replace function public.approve_pick_bout_cancellation")[1]
      ?.split("-- A cancelled bout remains visible")[0] ?? "";
    expect(cancellationBody).not.toContain("delete from public.profile_event_picks");
    expect(cancellationBody).toContain("delete from public.profile_event_underdog_locks");
    expect(cancellationBody).toContain("frozen_at is null");
    expect(sql.match(/raise exception 'fight is cancelled'/g)).toHaveLength(2);
  });

  it("keeps cancelled picks private before lock and exposes owner-only cancel/restore capabilities", () => {
    expect(sql).toContain("bout.result_status = 'cancelled'");
    expect(sql).toContain("event.status = 'upcoming'");
    expect(sql).toContain("now() < event.locks_at");
    expect(sql).toContain("'can_cancel'");
    expect(sql).toContain("'can_restore'");
    expect(sql).toContain("notify pgrst, 'reload schema'");
  });

  it("keeps rollback coverage for authorization, preservation, privacy, restoration, and the lock boundary", () => {
    expect(integrationSql).toContain("non-owner cancelled a live bout");
    expect(integrationSql).toContain("approved cancellation did not preserve original picks");
    expect(integrationSql).toContain("pre-lock cancellation exposed private group picks");
    expect(integrationSql).toContain("owner could not restore the pre-lock cancellation");
    expect(integrationSql).toContain("post-lock cancellation changed through the pre-lock owner");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
