import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const component = readFileSync("src/features/picks/GroupPickProgress.tsx", "utf8");
const provider = readFileSync("src/features/picks/PicksProvider.tsx", "utf8");
const model = readFileSync("src/features/picks/groupProgressModel.ts", "utf8");
const repository = readFileSync("src/features/picks/picksGroupProgressRepository.ts", "utf8");
const migration = readFileSync("supabase/migrations/202608210001_group_pick_progress.sql", "utf8");
const lockMigration = readFileSync("supabase/migrations/202608230001_group_pick_lock_projection.sql", "utf8");

describe("Group Picks production wiring", () => {
  it("renders the collapsed progress surface through the canonical Picks owner", () => {
    expect(page).toContain("<GroupPickProgress event={activeEvent} locked={locked} mySelections={picks.selections} />");
    expect(component).toContain("const picks = usePicks()");
    expect(component).not.toContain("getSupabaseClient");
    expect(component).not.toContain("supabase.rpc");
    expect(provider).toContain("loadPickGroupProgress");
    expect(repository).toContain('supabase.rpc("get_event_pick_progress"');
  });

  it("keeps the feature non-blocking when progress data is unavailable", () => {
    expect(provider).toContain("groupProgressError");
    expect(provider).toContain(".catch((progressError: unknown)");
    expect(component).toContain('error ? "UNAVAILABLE" : "NO PICKS YET"');
  });

  it("returns member counts without pre-lock fighter selections", () => {
    expect(migration).toContain("create or replace function public.get_event_pick_progress");
    expect(migration).toContain("count(pick.bout_id)");
    expect(migration).not.toContain("picked_fighter_slug text");
    expect(migration).toContain("grant execute on function public.get_event_pick_progress(text) to authenticated");
  });

  it("reveals the exact Underdog Lock target only after the canonical lock", () => {
    expect(lockMigration).toContain("underdog_lock_bout_id text");
    expect(lockMigration).toContain("underdog_lock_fighter_slug text");
    expect(lockMigration).toContain("case when now() >= event.locks_at then max(lock.bout_id) else null end");
    expect(lockMigration).toContain("case when now() >= event.locks_at then max(lock.fighter_slug) else null end");
    expect(model).toContain("underdogLockBoutId: string | null");
    expect(model).toContain("underdogLockFighterSlug: string | null");
    expect(repository).toContain("underdog_lock_bout_id: z.string().nullable().optional().default(null)");
    expect(repository).toContain("underdog_lock_fighter_slug: z.string().nullable().optional().default(null)");
  });

  it("reveals actual choices only after the canonical event lock", () => {
    expect(migration).toContain("or now() < event.locks_at");
    expect(migration).toContain("then '[]'::jsonb");
    expect(migration).toContain("'picked_fighter_slug', pick.fighter_slug");
  });
});
