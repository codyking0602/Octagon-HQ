import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("CFB Wheel runtime migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202612310246_wheel_football_cfb_runtime.sql",
    "utf8",
  );

  it("adds only the locked current CFB pool modes", () => {
    expect(migration).toContain("'CFB', 'SEC', 'BIG_TEN', 'BIG_12', 'ACC'");
    expect(migration).toContain("team.conference = 'Big Ten'");
    expect(migration).toContain("team.conference = 'Big 12'");
    expect(migration).toContain("team.conference in ('SEC', 'Big Ten', 'Big 12', 'ACC', 'Independent')");
    expect(migration).not.toContain("SEC_VS_ACC");
  });

  it("keeps full NFL spins isolated from the added college schools", () => {
    expect(migration).toContain(
      "(v_match.pool_scope = 'NFL' and team.conference in ('AFC', 'NFC'))",
    );
  });

  it("seeds all seven locked CFB grade families into the private authority", () => {
    for (const path of [
      "wheel-cfb-qb-grades-2026-10-03.json",
      "wheel-cfb-rb-grades-2026-10-03.json",
      "wheel-cfb-wr-grades-2026-10-03.json",
      "wheel-cfb-te-grades-2026-10-03.json",
      "wheel-cfb-front-seven-grades-2026-10-03.json",
      "wheel-cfb-secondary-grades-2026-10-03.json",
      "wheel-cfb-head-coach-grades-2026-10-03.json",
    ]) {
      expect(migration).toContain(path);
    }
  });

  it("reuses the approved 2.5x result curve and frozen private snapshots", () => {
    expect(migration).toContain("private.wheel_football_final_grade_v2");
    expect(migration).toContain("'wheel-football-locked-grades-v3'");
    expect(migration).toContain("private.wheel_football_grade_authority");
    expect(migration).not.toContain("creator_roster_grade");
    expect(migration).not.toContain("recipient_roster_grade");
  });
});
