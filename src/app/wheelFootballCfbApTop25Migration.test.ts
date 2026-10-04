import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("CFB Wheel AP Top 25 runtime migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202612310251_wheel_football_cfb_ap_top25.sql",
    "utf8",
  );

  it("adds the Top 25 pool without changing the locked 68-school national pool", () => {
    expect(migration).toContain("'TOP_25'");
    expect(migration).toContain("private.wheel_football_cfb_ap_top25");
    expect(migration).toContain("v_match.pool_scope = 'TOP_25'");
    expect(migration).toContain("when 'TOP_25' then 'AP Top 25'");
  });

  it("seeds all 25 verified AP teams and covers ranked Boise State with locked grades", () => {
    expect((migration.match(/'2026-09-27'/g) ?? []).length).toBeGreaterThanOrEqual(25);
    expect(migration).toContain("(22, 'boise-state'");
    expect(migration).toContain("'Maddux Madsen', 88.0");
    expect(migration).toContain("'Dylan Riley', 93.0");
    expect(migration).toContain("'Spencer Danielson', 88.0");
  });
});
