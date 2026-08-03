import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const priorMigration = readFileSync(
  "supabase/migrations/202608300001_progressive_pick_bout_deadlines.sql",
  "utf8",
);
const migration = readFileSync(
  "supabase/migrations/202609010001_stagger_initial_pick_bout_deadlines.sql",
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
const controlPage = readFileSync(
  "src/features/picks-control/PicksControlPage.tsx",
  "utf8",
);
const controlRepository = readFileSync(
  "src/features/picks-control/pickControlRepository.ts",
  "utf8",
);

describe("staggered initial Picks bout deadlines", () => {
  it("replaces the deadline step inside the one canonical publication owner", () => {
    expect(migration).toContain(
      "create or replace function public.publish_pick_event_draft(p_draft_id uuid)",
    );
    expect(migration).toContain(
      "v_event := private.publish_pick_event_draft_progressive_lock_core(p_draft_id)",
    );
    expect(migration).toContain(
      "private.apply_initial_pick_bout_deadlines(v_event.event_id, false)",
    );
    expect(migration.match(/create or replace function public\.publish_pick_event_draft/g))
      .toHaveLength(1);
    expect(migration).not.toContain("publish_pick_event_draft_initial_deadline_core");
    expect(migration).not.toContain("alter function public.publish_pick_event_draft");
  });

  it("gives position one the latest deadline and subtracts exact 30-minute steps", () => {
    expect(migration).toContain(
      "row_number() over (order by bout.position, bout.bout_id) - 1",
    );
    expect(migration).toContain("v_event.locks_at");
    expect(migration).toContain(
      "- make_interval(mins => 30 * ordered.deadline_offset)",
    );
    expect(migration).not.toContain("event.starts_at");
    expect(migration).not.toContain("prelims_starts_at");
    expect(migration).not.toContain("segment_sequence");
  });

  it("repairs only untouched upcoming cards through that same calculator", () => {
    expect(migration).toContain("p_require_uniform_default boolean default false");
    expect(migration).toContain("v_event.status <> 'upcoming'");
    expect(migration).toContain("now() >= v_event.locks_at");
    expect(migration).toContain("private.pick_bout_is_locked(v_event, bout)");
    expect(migration).toContain("bout.locks_at is distinct from v_event.locks_at");
    expect(migration).toContain(
      "private.apply_initial_pick_bout_deadlines(v_event_id, true)",
    );
    expect(migration).not.toContain("gamrot-vs-quillan");
    expect(migration.match(/apply_initial_pick_bout_deadlines/g)?.length)
      .toBeGreaterThanOrEqual(4);
  });

  it("keeps the established manual mutation and owner controls unchanged", () => {
    expect(priorMigration.match(/create or replace function public\.adjust_pick_bout_lock_time/g))
      .toHaveLength(1);
    expect(migration).not.toContain("adjust_pick_bout_lock_time");
    expect(controlPage).toContain('"+10 MIN"');
    expect(controlPage).toContain('"+20 MIN"');
    expect(controlPage).toContain('"SET TIME"');
    expect(controlRepository.match(/adjust_pick_bout_lock_time/g)).toHaveLength(1);
    expect(integrationSql).toContain("+10 minute adjustment failed");
    expect(integrationSql).toContain("+20 minute adjustment failed");
    expect(integrationSql).toContain("custom-time adjustment failed");
  });

  it("proves final order, future publication, guarded repair, and finality", () => {
    expect(integrationSql).toContain(
      "approved draft reorder did not own the published deadline order",
    );
    expect(integrationSql).toContain(
      "main event did not receive the latest initial deadline",
    );
    expect(integrationSql).toContain(
      "preceding fights were not exactly 30 minutes earlier",
    );
    expect(integrationSql).toContain(
      "future event creation did not apply the stagger automatically",
    );
    expect(integrationSql).toContain(
      "Gamrot vs. Quillan canonical repair did not apply",
    );
    expect(integrationSql).toContain(
      "manual deadline was overwritten by initial deadline repair",
    );
    expect(integrationSql).toContain(
      "finalized deadline was reopened or overwritten",
    );
    expect(integrationSql).toContain("passed bout lock was reopened");
    expect(integrationSql).toContain("resulted bout was reopened");
    expect(integrationSql).toContain("locked event was reopened");
    expect(integrationSql).toContain("completed event was reopened");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });

  it("continues to run from the established Picks fresh-database entrypoint", () => {
    expect(freshDatabaseEntrypoint.trimEnd()).toMatch(
      /\\ir progressive_pick_bout_deadlines\.sql$/,
    );
  });
});
