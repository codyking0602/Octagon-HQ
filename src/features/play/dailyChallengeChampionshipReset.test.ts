import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Daily Challenge championship era reset", () => {
  const migration = readFileSync(
    "supabase/migrations/202612310022_reset_daily_challenge_championship_era.sql",
    "utf8",
  );
  const sqlTest = readFileSync(
    "supabase/tests/daily_challenge_weekly_standings.sql",
    "utf8",
  );

  it("keeps the canonical standings RPC and starts titles with the Aug 10 championship week", () => {
    expect(migration).toContain("create or replace function public.get_daily_challenge_standings()");
    expect(migration).toContain("private.daily_challenge_central_day(now())");
    expect(migration).toContain("v_championship_start date := date '2026-08-10'");
    expect(migration).toContain("week_start >= v_championship_start");
    expect(migration).toContain("week_start < v_week_start");
    expect(migration).toContain("from private.daily_challenge_history");
  });

  it("proves pre-era history and the active launch week award zero titles without changing title rules", () => {
    expect(sqlTest).toContain("championship reset did not zero historical titles");
    expect(sqlTest).toContain("week_start >= v_championship_start");
    expect(sqlTest).toContain("week_start < v_projection_week_start");
    expect(sqlTest).toContain("order by wins desc, average_score desc, played desc");
    expect(sqlTest).toContain("weekly title wins/tiebreak/co-champion contract failed");
    expect(sqlTest).toContain(
      "\\ir ../migrations/202612310022_reset_daily_challenge_championship_era.sql",
    );
  });
});
