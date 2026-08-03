import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const priorMigration = readFileSync(
  "supabase/migrations/202608300001_progressive_pick_bout_deadlines.sql",
  "utf8",
);
const publicationMigration = readFileSync(
  "supabase/migrations/202609010001_stagger_initial_pick_bout_deadlines.sql",
  "utf8",
);
const deployedCompetingMigration002 = readFileSync(
  "supabase/migrations/202609010002_restore_chronological_pick_bout_deadlines.sql",
  "utf8",
);
const firstRecoveryMigration003 = readFileSync(
  "supabase/migrations/202609010003_restore_headline_first_pick_bout_deadlines.sql",
  "utf8",
);
const deployedCompetingMigration004 = readFileSync(
  "supabase/migrations/202609010004_restore_user_confirmed_chronological_pick_bout_deadlines.sql",
  "utf8",
);
const finalRecoveryMigration005 = readFileSync(
  "supabase/migrations/202609010005_restore_explicit_headline_first_pick_bout_deadlines.sql",
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

describe("headline-first initial Picks bout deadlines", () => {
  it("preserves the one canonical publication owner and calculator", () => {
    expect(publicationMigration).toContain(
      "create or replace function public.publish_pick_event_draft(p_draft_id uuid)",
    );
    expect(publicationMigration).toContain(
      "v_event := private.publish_pick_event_draft_progressive_lock_core(p_draft_id)",
    );
    expect(publicationMigration).toContain(
      "private.apply_initial_pick_bout_deadlines(v_event.event_id, false)",
    );
    expect(publicationMigration.match(/create or replace function public\.publish_pick_event_draft/g))
      .toHaveLength(1);
    expect(finalRecoveryMigration005.match(/create or replace function private\.apply_initial_pick_bout_deadlines/g))
      .toHaveLength(1);
    expect(finalRecoveryMigration005).not.toContain(
      "create or replace function public.publish_pick_event_draft",
    );
    expect(finalRecoveryMigration005).not.toContain("adjust_pick_bout_lock_time");
  });

  it("preserves every deployed competing migration before each correction", () => {
    expect(deployedCompetingMigration002).toContain(
      "+ make_interval(mins => 30 * (bout.segment_sequence - 1))",
    );
    expect(deployedCompetingMigration002).toContain("v_correct_segment_pattern");
    expect(deployedCompetingMigration004).toContain(
      "+ make_interval(mins => 30 * (bout.segment_sequence - 1))",
    );
    expect(deployedCompetingMigration004).toContain(
      "v_chronological_segment_pattern",
    );

    for (const recoveryMigration of [
      firstRecoveryMigration003,
      finalRecoveryMigration005,
    ]) {
      expect(recoveryMigration).toContain("v_chronological_segment_pattern");
      expect(recoveryMigration).toContain("case bout.card_segment");
      expect(recoveryMigration).toContain(
        "+ make_interval(mins => 30 * (bout.segment_sequence - 1))",
      );
      expect(recoveryMigration).toContain(
        "or v_chronological_segment_pattern",
      );
    }
  });

  it("gives position one the latest deadline and subtracts exact 30-minute steps", () => {
    expect(finalRecoveryMigration005).toContain(
      "row_number() over (order by bout.position, bout.bout_id) - 1",
    );
    expect(finalRecoveryMigration005).toContain("set locks_at = v_event.locks_at");
    expect(finalRecoveryMigration005).toContain(
      "- make_interval(mins => 30 * ordered.deadline_offset)",
    );
    expect(finalRecoveryMigration005).not.toContain(
      "set locks_at = v_event.starts_at",
    );
  });

  it("repairs only recognized system schedules through that same calculator", () => {
    expect(finalRecoveryMigration005).toContain(
      "p_require_uniform_default boolean default false",
    );
    expect(finalRecoveryMigration005).toContain("v_event.status <> 'upcoming'");
    expect(finalRecoveryMigration005).toContain("now() >= v_event.locks_at");
    expect(finalRecoveryMigration005).toContain(
      "private.pick_bout_is_locked(v_event, bout)",
    );
    expect(finalRecoveryMigration005).toContain("v_uniform_default");
    expect(finalRecoveryMigration005).toContain("v_headline_first_pattern");
    expect(finalRecoveryMigration005).toContain(
      "v_chronological_segment_pattern",
    );
    expect(finalRecoveryMigration005).toContain(
      "private.apply_initial_pick_bout_deadlines(v_event_id, true)",
    );
    expect(finalRecoveryMigration005).not.toContain("gamrot-vs-quillan");
  });

  it("keeps the established manual mutation and owner controls unchanged", () => {
    expect(priorMigration.match(/create or replace function public\.adjust_pick_bout_lock_time/g))
      .toHaveLength(1);
    expect(finalRecoveryMigration005).not.toContain("adjust_pick_bout_lock_time");
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
