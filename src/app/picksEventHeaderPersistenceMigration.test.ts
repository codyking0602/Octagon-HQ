import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310012_pick_event_header_persistence.sql",
  "utf8",
);

describe("Picks event header persistence migration", () => {
  it("keeps event headers optional while persisting one complete native-size metadata set", () => {
    expect(migration).toContain("add column if not exists header_storage_path text");
    expect(migration).toContain("add column if not exists header_natural_width integer");
    expect(migration).toContain("add column if not exists header_natural_height integer");
    expect(migration).toContain("header_storage_path is null and header_natural_width is null and header_natural_height is null");
    expect(migration).toContain("header_natural_width between 1 and 30000");
    expect(migration).toContain("header_natural_height between 1 and 30000");
    expect(migration).not.toMatch(/header_storage_path\s+text\s+not null/i);
  });

  it("uses one public event-header bucket with owner-only writes", () => {
    expect(migration).toContain("'pick-event-headers'");
    expect(migration).toContain("public.is_pick_control_owner(auth.uid())");
    expect(migration).toContain("pick_event_headers_public_read");
    expect(migration).toContain("pick_event_headers_owner_insert");
    expect(migration).toContain("pick_event_headers_owner_update");
    expect(migration).toContain("pick_event_headers_owner_delete");
    expect(migration).not.toContain("create table public.pick_event_headers");
  });

  it("keeps metadata writes behind the existing Picks owner capability", () => {
    expect(migration).toContain("create or replace function public.set_pick_event_header");
    expect(migration).toContain("Fight Night Control owner access required");
    expect(migration).toContain("left(v_path, length(p_event_id) + 1) <> p_event_id || '/'");
    expect(migration).toContain("update public.pick_events");
    expect(migration).toContain("grant execute on function public.set_pick_event_header(text, text, integer, integer) to authenticated");
    expect(migration).not.toMatch(/grant\s+(insert|update|delete)\s+on\s+public\.pick_events\s+to\s+authenticated/i);
  });
});
