import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202612310085_relock_2026_football_futures.sql",
  ),
  "utf8",
);

describe("2026 football futures relock migration", () => {
  it("restores the canonical Central lock schedule without a season override", () => {
    expect(migration).toContain("create or replace function public.football_futures_lock_at");
    expect(migration).not.toContain("when p_season = 2026");
    expect(migration).not.toContain("2026-12-31");
    expect(migration).toContain("make_date(p_season, 9, 1)");
    expect(migration).toContain("time '23:59'");
    expect(migration).toContain("at time zone 'America/Chicago'");
    expect(migration).toContain(
      "revoke all on function public.football_futures_lock_at(integer) from public;",
    );
    expect(migration).toContain("notify pgrst, 'reload schema';");
  });
});
