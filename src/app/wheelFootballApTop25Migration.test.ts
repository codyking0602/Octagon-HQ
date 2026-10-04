import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Wheel of Football AP Top 25 migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202612310251_wheel_football_ap_top25_and_reference_links.sql",
    "utf8",
  );

  it("adds the AP Top 25 as a real server-owned Wheel scope", () => {
    expect(migration).toContain("'AP_TOP_25'");
    expect(migration).toContain("private.wheel_football_ap_top25");
    expect(migration).toContain("v_match.pool_scope = 'AP_TOP_25'");
  });

  it("seeds the complete current AP poll including Boise State", () => {
    expect(migration).toContain("(1,'texas','2026-09-27'");
    expect(migration).toContain("(22,'boise-state','2026-09-27'");
    expect(migration).toContain("(25,'missouri','2026-09-27'");
    expect(migration).toContain("'boise-state','QB'");
    expect(migration).toContain("'Spencer Danielson'");
  });

  it("keeps automated poll refresh fail-closed and service-role only", () => {
    expect(migration).toContain("must contain each rank 1 through 25 exactly once");
    expect(migration).toContain("keeping the last complete poll");
    expect(migration).toContain("grant execute on function public.sync_wheel_football_ap_top25");
    expect(migration).toContain("to service_role");
  });
});
