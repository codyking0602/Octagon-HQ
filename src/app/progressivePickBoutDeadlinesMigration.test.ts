import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608300001_progressive_pick_bout_deadlines.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/progressive_pick_bout_deadlines.sql",
  "utf8",
);
const freshDatabaseEntrypoint = readFileSync(
  "supabase/tests/pick_monitoring_truthful_decisions.sql",
  "utf8",
);

describe("progressive Picks bout deadlines", () => {
  it("extends the one publication owner with segment-owned default timing", () => {
    expect(migration).toContain("alter function public.publish_pick_event_draft(uuid)");
    expect(migration).toContain("publish_pick_event_draft_progressive_lock_core");
    expect(migration).toContain(
      "v_event := private.publish_pick_event_draft_progressive_lock_core(p_draft_id)",
    );
    expect(migration).toContain("when 'prelim' then event.prelims_starts_at");
    expect(migration).toContain("else event.starts_at");
    expect(migration).toContain(
      "make_interval(mins => 30 * (bout.segment_sequence - 1))",
    );
    expect(migration).not.toContain("bout.position - 1");
    expect(migration.match(/create function public\.publish_pick_event_draft/g)).toHaveLength(1);
  });

  it("repairs the existing stable-bout mutation without a replacement RPC", () => {
    const adjustment = migration.split(
      "create or replace function public.adjust_pick_bout_lock_time",
    )[1] ?? "";

    expect(migration.match(/create or replace function public\.adjust_pick_bout_lock_time/g))
      .toHaveLength(1);
    expect(adjustment).toContain("pick control owner required");
    expect(adjustment).toContain("v_event.status <> 'upcoming'");
    expect(adjustment).toContain("resulted bout cannot be reopened");
    expect(adjustment).toContain("private.pick_bout_is_locked(v_event, v_bout)");
    expect(adjustment).toContain("p_locks_at <= now()");
    expect(adjustment).not.toContain("p_locks_at > v_event.starts_at");
  });

  it("proves exact Fight Night and numbered-card timestamps on a fresh database", () => {
    expect(integrationSql).toContain(
      "Fight Night Main Card opener missed the official Main Card start",
    );
    expect(integrationSql).toContain(
      "Fight Night later bouts missed chronological 30-minute increments",
    );
    expect(integrationSql).toContain(
      "Numbered Prelim opener missed the official Prelims start",
    );
    expect(integrationSql).toContain(
      "Numbered Prelims missed chronological 30-minute increments",
    );
    expect(integrationSql).toContain(
      "Numbered Main Card opener did not reset to the Main Card anchor",
    );
    expect(integrationSql).toContain(
      "Numbered Main Card continued the Prelims schedule",
    );
    expect(integrationSql).toContain(
      "headline-first position was treated as chronological sequence",
    );
    expect(integrationSql).toContain("Early Prelims received a published bout");
  });

  it("keeps every no-reopen and master-lock safety boundary green", () => {
    expect(integrationSql).toContain(
      "manual future adjustment later than Main Card start was rejected",
    );
    expect(integrationSql).toContain("passed bout lock was reopened");
    expect(integrationSql).toContain("resulted bout was reopened");
    expect(integrationSql).toContain("locked event was reopened");
    expect(integrationSql).toContain("completed event was reopened");
    expect(integrationSql).toContain(
      "event-wide locked status did not override a later bout deadline",
    );
    expect(integrationSql).toContain(
      "event-wide deadline overwrote an explicitly adjusted bout",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });

  it("runs from the established Picks fresh-database entrypoint", () => {
    expect(freshDatabaseEntrypoint).toContain("\\ir per_fight_pick_locks.sql");
    expect(freshDatabaseEntrypoint.trimEnd()).toMatch(
      /\\ir progressive_pick_bout_deadlines\.sql$/,
    );
  });
});
