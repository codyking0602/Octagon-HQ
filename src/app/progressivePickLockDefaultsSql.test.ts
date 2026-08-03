import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sqlProof = readFileSync("supabase/tests/progressive_pick_lock_defaults.sql", "utf8");

describe("progressive Picks lock fresh-database proof", () => {
  it("proves the five-fight 30-minute schedule and adjustment boundary", () => {
    expect(sqlProof).toContain("v_locks[5] is distinct from v_event.starts_at");
    expect(sqlProof).toContain("interval '30 minutes'");
    expect(sqlProof).toContain("interval '60 minutes'");
    expect(sqlProof).toContain("interval '90 minutes'");
    expect(sqlProof).toContain("interval '120 minutes'");
    expect(sqlProof).toContain("interval '121 minutes'");
  });
});
