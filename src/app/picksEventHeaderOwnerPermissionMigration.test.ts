import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310014_pick_event_header_owner_permission.sql",
  "utf8",
);

describe("Picks event header owner permission migration", () => {
  it("lets authenticated storage policies call the canonical Picks owner helper without exposing it to anon", () => {
    expect(migration).toContain(
      "revoke all on function public.is_pick_control_owner(uuid) from public, anon",
    );
    expect(migration).toContain(
      "grant execute on function public.is_pick_control_owner(uuid) to authenticated",
    );
    expect(migration).not.toMatch(/grant\s+execute\s+on\s+function\s+public\.is_pick_control_owner\(uuid\)\s+to\s+anon/i);
    expect(migration).not.toContain("create or replace function public.is_pick_control_owner");
  });
});
