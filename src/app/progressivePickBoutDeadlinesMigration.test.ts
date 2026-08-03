import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const progressiveMigration = readFileSync(
  "supabase/migrations/202608300001_progressive_pick_bout_deadlines.sql",
  "utf8",
);
const publicationMigration = readFileSync(
  "supabase/migrations/202609010001_stagger_initial_pick_bout_deadlines.sql",
  "utf8",
);
const deployedChronologicalMigration = readFileSync(
  "supabase/migrations/202609010002_restore_chronological_pick_bout_deadlines.sql",
  "utf8",
);
const deployedHeadlineFirstMigration = readFileSync(
  "supabase/migrations/202609010003_restore_headline_first_pick_bout_deadlines.sql",
  "utf8",
);
const finalMigration = readFileSync(
  "supabase/migrations/202609010004_restore_user_confirmed_chronological_pick_bout_deadlines.sql",
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

describe("user-confirmed chronological initial Picks bout deadlines", () => {
  it("keeps one publication owner and one replaceable deadline calculator", () => {
    expect(publicationMigration).toContain(
      "create or replace function public.publish_pick_event_draft(p_draft_id uuid)",
    );
    expect(publicationMigration).toContain(
      "private.apply_initial_pick_bout_deadlines(v_event.event_id, false)",
    );
    for (const migration of [
      deployedChronologicalMigration,
      deployedHeadlineFirstMigration,
      finalMigration,
    ]) {
      expect(
        migration.match(/create or replace function private\.apply_initial_pick_bout_deadlines/g),
      ).toHaveLength(1);
      expect(migration).not.toContain(
        "create or replace function public.publish_pick_event_draft",
      );
      expect(migration).not.toContain("adjust_pick_bout_lock_time");
    }
  });

  it("preserves both deployed recovery migrations before applying the final correction", () => {
    expect(deployedChronologicalMigration).toContain(
      "+ make_interval(mins => 30 * (bout.segment_sequence - 1))",
    );
    expect(deployedHeadlineFirstMigration).toContain(
      "- make_interval(mins => 30 * ordered.deadline_offset)",
    );
    expect(finalMigration).toContain("v_headline_first_pattern");
    expect(finalMigration).toContain(
      "row_number() over (order by bout.position, bout.bout_id) - 1",
    );
    expect(finalMigration).toContain(
      "or v_headline_first_pattern",
    );
  });

  it("uses each official segment opener and adds exact 30-minute chronological steps", () => {
    expect(finalMigration).toContain("case bout.card_segment");
    expect(finalMigration).toContain("when 'prelim' then v_event.prelims_starts_at");
    expect(finalMigration).toContain("else v_event.starts_at");
    expect(finalMigration).toContain(
      "+ make_interval(mins => 30 * (bout.segment_sequence - 1))",
    );
    const finalUpdate = finalMigration.split("update public.pick_bouts bout").at(-1) ?? "";
    expect(finalUpdate).toContain("bout.segment_sequence");
    expect(finalUpdate).not.toContain("bout.position");
  });

  it("repairs only known complete system schedules through that same calculator", () => {
    expect(finalMigration).toContain(
      "p_require_uniform_default boolean default false",
    );
    expect(finalMigration).toContain("v_uniform_default");
    expect(finalMigration).toContain("v_headline_first_pattern");
    expect(finalMigration).toContain("v_chronological_segment_pattern");
    expect(finalMigration).toContain("private.pick_bout_is_locked(v_event, bout)");
    expect(finalMigration).toContain("bout.card_segment not in ('prelim', 'main')");
    expect(finalMigration).toContain(
      "private.apply_initial_pick_bout_deadlines(v_event_id, true)",
    );
    expect(finalMigration).not.toContain("gamrot-vs-quillan");
  });

  it("keeps the established manual mutation and owner controls unchanged", () => {
    expect(progressiveMigration.match(/create or replace function public\.adjust_pick_bout_lock_time/g))
      .toHaveLength(1);
    expect(finalMigration).not.toContain("adjust_pick_bout_lock_time");
    expect(controlPage).toContain('"+10 MIN"');
    expect(controlPage).toContain('"+20 MIN"');
    expect(controlPage).toContain('"SET TIME"');
    expect(controlRepository.match(/adjust_pick_bout_lock_time/g)).toHaveLength(1);
    expect(integrationSql).toContain("+10 minute adjustment failed");
    expect(integrationSql).toContain("+20 minute adjustment failed");
    expect(integrationSql).toContain("custom-time adjustment failed");
  });

  it("proves final order, future publication, guarded live repair, and finality", () => {
    expect(integrationSql).toContain(
      "approved draft reorder did not own the published deadline order",
    );
    expect(integrationSql).toContain(
      "first chronological main-card fight missed the 7:00 PM anchor",
    );
    expect(integrationSql).toContain(
      "later main-card fights missed 30-minute increments",
    );
    expect(integrationSql).toContain(
      "main event did not receive the latest deadline",
    );
    expect(integrationSql).toContain(
      "future event creation did not apply the chronological stagger automatically",
    );
    expect(integrationSql).toContain(
      "Gamrot vs. Quillan reverse schedule repair did not apply",
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
