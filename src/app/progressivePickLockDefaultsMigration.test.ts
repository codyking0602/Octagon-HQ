import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608290001_progressive_pick_lock_defaults.sql",
  "utf8",
);

function occurrences(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

describe("progressive Picks lock defaults", () => {
  it("keeps publication as the single canonical initializer and assigns 30-minute reverse-card slots", () => {
    expect(occurrences(migration, /create or replace function public\.publish_pick_event_draft/g)).toBe(1);
    expect(migration).toContain("interval '30 minutes'");
    expect(migration).toContain("count(*) over() as included_count");
    expect(migration).toContain("bout.included_count - bout.sequence_number");
    expect(migration).toContain("v_draft.starts_at");
    expect(migration).not.toContain("pg_cron");
  });

  it("allows owner adjustments through the estimated card window without reopening closed fights", () => {
    expect(migration).toContain("v_estimated_card_end := v_event.starts_at");
    expect(migration).toContain("greatest(v_bout_count - 1, 0) * interval '30 minutes'");
    expect(migration).toContain("p_locks_at > v_estimated_card_end");
    expect(migration).toContain("private.pick_bout_is_locked(v_event, v_bout)");
    expect(migration).toContain("locked bout cannot be reopened");
  });

  it("backfills only an untouched upcoming card and preserves deliberate per-fight changes", () => {
    expect(migration).toContain("event.status = 'upcoming'");
    expect(migration).toContain("bout.locks_at is distinct from event.locks_at");
    expect(migration).toContain("not exists (");
    expect(migration).toContain("row_number() over(partition by bout.event_id order by bout.position)");
    expect(migration).toContain("notify pgrst, 'reload schema'");
  });
});
