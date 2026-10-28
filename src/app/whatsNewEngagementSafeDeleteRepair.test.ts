import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310017_fix_engagement_whats_new_safe_deletes.sql",
  "utf8",
);

describe("What's New engagement safe-delete repair", () => {
  it("patches only the existing engagement sync owner with guarded WHERE clauses", () => {
    expect(migration).toContain(
      "'public.sync_engagement_whats_new(text,jsonb,jsonb,jsonb)'::pg_catalog.regprocedure",
    );
    expect(migration).toContain(
      "'delete from private.game_whats_new_snapshot where true;'",
    );
    expect(migration).toContain(
      "'delete from private.challenge_whats_new_snapshot where true;'",
    );
    expect(migration).toContain(
      "'delete from private.achievement_whats_new_snapshot where true;'",
    );
    expect(migration).toContain(
      "raise exception 'canonical engagement game snapshot delete statement not found'",
    );
    expect(migration).toContain(
      "raise exception 'canonical engagement challenge snapshot delete statement not found'",
    );
    expect(migration).toContain(
      "raise exception 'canonical engagement achievement snapshot delete statement not found'",
    );
    expect(migration).toContain(
      "revoke all on function public.sync_engagement_whats_new(text, jsonb, jsonb, jsonb)",
    );
    expect(migration).toContain(
      "grant execute on function public.sync_engagement_whats_new(text, jsonb, jsonb, jsonb)\n  to service_role;",
    );
    expect(migration).not.toContain("create or replace function public.sync_engagement_whats_new");
    expect(migration).not.toContain("insert into private.whats_new_items");
    expect(migration).not.toContain("publish_whats_new_item(");
  });
});
