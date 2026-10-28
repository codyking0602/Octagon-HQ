import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310016_fix_whats_new_safe_deletes.sql",
  "utf8",
);

describe("What's New safe-delete repair", () => {
  it("patches only the existing private sync owners with guarded WHERE clauses", () => {
    expect(migration).toContain(
      "'private.sync_ranking_whats_new_v2_core(text,jsonb,jsonb)'::pg_catalog.regprocedure",
    );
    expect(migration).toContain(
      "'private.sync_ranking_whats_new_core(text,jsonb,jsonb)'::pg_catalog.regprocedure",
    );

    expect(migration).toContain(
      "'delete from private.ranking_whats_new_snapshot where true;'",
    );
    expect(migration).toContain(
      "'delete from private.fighters_to_watch_whats_new_snapshot where true;'",
    );

    expect(migration).toContain(
      "raise exception 'canonical v2 What''s New delete statement not found'",
    );
    expect(migration).toContain(
      "raise exception 'canonical ranking snapshot delete statement not found'",
    );
    expect(migration).toContain(
      "raise exception 'canonical watchlist snapshot delete statement not found'",
    );

    expect(migration).toContain(
      "revoke all on function private.sync_ranking_whats_new_v2_core(text, jsonb, jsonb)",
    );
    expect(migration).toContain(
      "revoke all on function private.sync_ranking_whats_new_core(text, jsonb, jsonb)",
    );

    expect(migration).not.toContain(
      "create or replace function public.sync_ranking_whats_new",
    );
    expect(migration).not.toContain("insert into private.whats_new_items");
    expect(migration).not.toContain("publish_whats_new_item(");
  });
});
