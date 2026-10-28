import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310001_backfill_rda_whats_new.sql",
  "utf8",
);

describe("Rafael dos Anjos What's New backfill", () => {
  it("publishes RDA exactly as a new fighter, not a ranking update", () => {
    expect(migration).toContain("'rankings:new-fighter:rafael-dos-anjos'");
    expect(migration).toContain("'new_fighter'");
    expect(migration).toContain("'fighters'");
    expect(migration).toContain("'Rafael dos Anjos joined the rankings'");
    expect(migration).toContain("'Now ranked #29 on the UFC Men''s GOAT board.'");
    expect(migration).toContain("'/fighters/rafael-dos-anjos'");
    expect(migration).toContain("'VIEW FIGHTER'");
    expect(migration).toContain("source_key like 'rankings:movement:%:rafael-dos-anjos'");
    expect(migration).not.toContain("'ranking_movement',");
    expect(migration).not.toContain("'major_ranking_update',");
  });

  it("is idempotent and collapses source-SHA keyed duplicate announcements", () => {
    expect(migration).toContain("source_key like 'rankings:new-fighter:%:rafael-dos-anjos'");
    expect(migration).toContain("source_key <> 'rankings:new-fighter:rafael-dos-anjos'");
    expect(migration).toContain("on conflict (source_key) do update");
    expect(migration).toContain("published_at = excluded.published_at");
  });
});
