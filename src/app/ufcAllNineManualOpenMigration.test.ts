import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612311533_ufc_all_nine_owner_manual_picks.sql",
  "utf8",
);

describe("UFC manual-open all nine fights", () => {
  it("uses a separate player selection rule, leaving official result and live-fight locks intact", () => {
    expect(migration).toContain("private.pick_bout_player_submission_open(");
    expect(migration).toContain("p_event.manual_picks_open");
    expect(migration).toContain("p_event.sport = 'mma'");
    expect(migration).toContain("p_event.status = 'upcoming'");
    expect(migration).toContain("and p_bout.included_in_picks");
    expect(migration).toContain("else not private.pick_bout_is_locked(p_event, p_bout, p_now)");
    expect(migration).not.toContain("create or replace function private.pick_bout_is_locked");
    expect(migration).not.toContain("update public.pick_bouts");
  });

  it("accepts picks and Underdog Lock edits for all eligible, manually reopened fights", () => {
    expect(migration.toLowerCase()).toContain("create or replace function public.save_my_event_pick(");
    expect(migration.toLowerCase()).toContain("create or replace function public.set_my_event_underdog_lock(");
    expect(migration.toLowerCase()).toContain("create or replace function public.clear_my_event_underdog_lock(");
    expect((migration.match(/if not private.pick_bout_player_submission_open\(v_event, v_bout\) then/g) ?? []).length).toBe(3);
    expect(migration).toContain("coalesce(p_bout.result_status, 'pending') <> 'cancelled'");
  });

  it("reports all nine eligible bouts open while withholding other members' pending selections", () => {
    expect(migration).toContain("'is_locked', not private.pick_bout_player_submission_open(event.event_row, bout)");
    expect(migration).toContain("private.pick_bout_player_submission_open(event.event_row, open_bout)");
    expect(migration).toContain("event.manual_picks_open\n        and private.pick_bout_player_submission_open(event, bout)");
    expect(migration).toContain("not private.pick_bout_player_submission_open(event, lock_bout)");
  });
});
