import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310251_wheel_football_ap_top25.sql",
  "utf8",
);

describe("Wheel of Football AP Top 25 migration", () => {
  it("adds a first-class AP Top 25 pool and server-owned ranked authority", () => {
    expect(migration).toContain("'AP_TOP_25'");
    expect(migration).toContain("private.wheel_football_ap_top25");
    expect(migration).toContain("public.get_wheel_football_ap_top25");
    expect(migration).toContain("ranked.team_code = team.code");
  });

  it("seeds all 25 current AP schools including Boise State", () => {
    expect(migration).toContain("(1, 'texas', '2026-09-27')");
    expect(migration).toContain("(22, 'boise-state', '2026-09-27')");
    expect(migration).toContain("(25, 'missouri', '2026-09-27')");
    expect(migration).toContain("('boise-state', 'Pac-12', null)");
  });

  it("fails closed when a future poll is unsupported or incompletely graded", () => {
    expect(migration).toContain("'unsupported-team'");
    expect(migration).toContain("'incomplete-grading'");
    expect(migration).toContain("'stale-poll'");
    expect(migration).toContain("grant execute on function public.sync_wheel_football_ap_top25(date,jsonb) to service_role");
    expect(migration).not.toContain("grant execute on function public.sync_wheel_football_ap_top25(date,jsonb) to authenticated");
  });
});
