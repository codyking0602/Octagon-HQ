import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310013_pick_event_header_runtime.sql",
  "utf8",
);

describe("Picks event header runtime migration", () => {
  it("extends the existing current-event RPC instead of creating a second header query", () => {
    expect(migration).toContain("create or replace function public.get_current_pick_event()");
    expect(migration).toContain("private.get_current_pick_event_spotlight_core()");
    expect(migration).toContain("event.header_storage_path");
    expect(migration).toContain("event.header_natural_width");
    expect(migration).toContain("event.header_natural_height");
    expect(migration).toContain("'header_storage_path', v_header_storage_path");
    expect(migration).toContain("'header_natural_width', v_header_natural_width");
    expect(migration).toContain("'header_natural_height', v_header_natural_height");
    expect(migration).not.toMatch(/create or replace function public\.get_pick_event_header/i);
  });

  it("preserves the existing filtered Spotlight projection and public read grants", () => {
    expect(migration).toContain("private.pick_event_spotlight_is_valid");
    expect(migration).toContain("'{spotlights}'");
    expect(migration).toContain("grant execute on function public.get_current_pick_event() to anon, authenticated");
  });
});
