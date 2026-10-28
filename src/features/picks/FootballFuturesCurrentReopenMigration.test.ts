import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202612310128_reopen_2026_football_futures.sql",
  ),
  "utf8",
);

describe("current 2026 football futures reopening migration", () => {
  it("keeps 2026 open beyond the display-only September 17 deadline", () => {
    expect(migration).toContain("create or replace function public.football_futures_lock_at");
    expect(migration).toContain("when p_season = 2026");
    expect(migration).toContain("timestamp '2099-12-31 23:59' at time zone 'America/Chicago'");
    expect(migration).not.toContain("timestamp '2026-09-17");
  });

  it("preserves the canonical schedule for every other season", () => {
    expect(migration).toContain("make_date(p_season, 9, 1)");
    expect(migration).toContain("time '23:59'");
    expect(migration).toContain("at time zone 'America/Chicago'");
    expect(migration).toContain(
      "revoke all on function public.football_futures_lock_at(integer) from public;",
    );
    expect(migration).toContain("notify pgrst, 'reload schema';");
  });
});
