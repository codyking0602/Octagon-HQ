import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608040001_fight_night_results_control.sql",
  "utf8",
);
const integrationSql = readFileSync("supabase/tests/pick_results_control.sql", "utf8");

describe("Fight Night results control migration", () => {
  it("uses a private durable owner allowlist instead of a browser display-name check", () => {
    expect(sql).toContain("create table if not exists public.pick_control_owners");
    expect(sql).toContain("revoke all on table public.pick_control_owners from public, anon, authenticated");
    expect(sql).toContain("where profile.display_name = 'CODY'");
    expect(sql).toContain("public.is_pick_control_owner(auth.uid())");
  });

  it("keeps the canonical result and transition functions as the mutation owners", () => {
    expect(sql).toContain("create or replace function public.record_official_pick_bout_result");
    expect(sql).toContain("create or replace function public.transition_pick_event");
    expect(sql).toContain("event must be locked before recording results");
    expect(sql).toContain("all bout results must be resolved before completion");
    expect(sql).toContain("completed event results are immutable");
    expect(sql).toContain("to authenticated, service_role");
  });

  it("exposes one owner-only operational projection without member picks", () => {
    expect(sql).toContain("create or replace function public.get_pick_control_event()");
    expect(sql).toContain("'can_lock'");
    expect(sql).toContain("'can_complete'");
    expect(sql).not.toMatch(/get_pick_control_event[\s\S]+profile_event_picks/);
    expect(sql).toContain("grant execute on function public.get_pick_control_event() to authenticated");
  });

  it("preserves group reveal timing and adds only a safe control-entry flag", () => {
    expect(sql).toContain("'can_control',public.is_pick_control_owner(auth.uid())");
    expect(sql).toContain("'group_picks',public.resolved_bout_group_picks");
    expect(sql).toContain("notify pgrst, 'reload schema'");
  });

  it("keeps rollback-only owner, mutation, and completion coverage", () => {
    expect(integrationSql).toContain("non-owner recorded an official result");
    expect(integrationSql).toContain("owner could not lock the event");
    expect(integrationSql).toContain("owner could not clear the result");
    expect(integrationSql).toContain("event completed with a pending bout");
    expect(integrationSql).toContain("completed result was changed");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
