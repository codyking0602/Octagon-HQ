import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const component = readFileSync("src/features/picks/GroupPickProgress.tsx", "utf8");
const provider = readFileSync("src/features/picks/PicksProvider.tsx", "utf8");
const repository = readFileSync("src/features/picks/picksGroupProgressRepository.ts", "utf8");
const migration = readFileSync("supabase/migrations/202608210001_group_pick_progress.sql", "utf8");

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

  it("reveals actual choices only after the canonical event lock", () => {
    expect(migration).toContain("or now() < event.locks_at");
    expect(migration).toContain("then '[]'::jsonb");
    expect(migration).toContain("'picked_fighter_slug', pick.fighter_slug");
  });
});
