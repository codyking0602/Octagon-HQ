import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202612310084_temporarily_reopen_2026_football_futures.sql",
  ),
  "utf8",
);

describe("temporary 2026 football futures reopening migration", () => {
  it("reopens only the 2026 season through the canonical lock owner", () => {
    expect(migration).toContain("create or replace function public.football_futures_lock_at");
    expect(migration).toContain("when p_season = 2026");
    expect(migration).toContain("timestamp '2026-12-31 23:59' at time zone 'America/Chicago'");
  });

  it("preserves the normal lock calculation for every other season", () => {
    expect(migration).toContain("make_date(p_season, 9, 1)");
    expect(migration).toContain("time '23:59'");
    expect(migration).toContain("at time zone 'America/Chicago'");
  });
});
