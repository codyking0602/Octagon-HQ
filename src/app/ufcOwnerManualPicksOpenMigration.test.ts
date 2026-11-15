import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612311531_ufc_owner_manual_picks_open.sql",
  "utf8",
);

describe("UFC owner-held manual Picks reopening", () => {
  it("creates an opt-in hold without changing any existing event by default", () => {
    expect(migration).toContain("manual_picks_open boolean not null default false");
    expect(migration).not.toContain("update public.pick_events\nset status = 'upcoming'");
    expect(migration).not.toContain("update public.pick_bouts");
    expect(migration).not.toContain("private.pick_bout_is_locked(");
  });

  it("prevents service-owned automatic locking while retaining explicit owner LOCK PICKS", () => {
    expect(migration).toContain("if v_event.sport = 'mma' and v_event.manual_picks_open then");
    expect(migration).toContain("if auth.role() = 'service_role' then");
    expect(migration).toContain("if v_target_status = 'locked' then");
    expect(migration).toContain("set manual_picks_open = false");
    expect(migration).toContain("private.transition_pick_event_ufc_recap_core");
    expect(migration).toContain("public.is_pick_control_owner(auth.uid())");
  });

  it("excludes manually held cards from the automatic finalization sweep", () => {
    expect(migration).toContain("and not event.manual_picks_open");
    expect(migration).toContain("pending.result_status = 'pending'");
    expect(migration).toContain("perform public.transition_pick_event(v_event.event_id, 'complete')");
  });
});
