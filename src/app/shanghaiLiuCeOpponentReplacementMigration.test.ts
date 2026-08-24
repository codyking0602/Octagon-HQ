import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202612310057_fix_shanghai_liu_ce_opponent.sql",
  "utf8",
);

describe("Shanghai Liu Ce opponent correction", () => {
  it("routes Junior Tafa to Levi Rodrigues Jr. through the canonical replacement RPC", () => {
    expect(sql).toContain("public.approve_pick_fighter_replacement");
    expect(sql).toContain("ufc-fight-night-umar-nurmagomedov-vs-song-yadong-2026-08-29");
    expect(sql).toContain("main-liu-ce-junior-tafa");
    expect(sql).toContain("'blue'");
    expect(sql).toContain("'liu-ce'");
    expect(sql).toContain("'junior-tafa'");
    expect(sql).toContain("'levi-rodrigues-jr'");
    expect(sql).toContain("'Levi Rodrigues Jr.'");
    expect(sql).not.toMatch(/update\s+public\.pick_bouts/i);
  });

  it("is replay-safe and a no-op when the production event is absent on a fresh database", () => {
    expect(sql).toContain("if found then");
    expect(sql).toContain("v_blue_fighter_slug = 'junior-tafa'");
    expect(sql).toContain("v_blue_fighter_slug <> 'levi-rodrigues-jr'");
    expect(sql).toContain("Unexpected Shanghai Liu Ce opponent");
    expect(sql).not.toContain("Shanghai Liu Ce bout not found");
  });
});
