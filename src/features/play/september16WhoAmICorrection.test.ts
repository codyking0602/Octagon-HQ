import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310137_fix_september_16_charles_oliveira_who_am_i.sql",
  "utf8",
);

describe("September 16 Charles Oliveira Daily correction", () => {
  it("targets only the live Charles Oliveira Who Am I setup and corrects both bad facts", () => {
    expect(migration).toContain("v_target_day constant date := date '2026-09-16'");
    expect(migration).toContain("who-am-i-daily-v1:official-daily-runtime-v1:play-rotation-v7:2026-09-16:UFC");
    expect(migration).toContain("ufc:charles-oliveira");
    expect(migration).toContain("I competed in 9 UFC divisions.");
    expect(migration).toContain("I competed in 2 UFC divisions.");
    expect(migration).toContain("I won 3 UFC title fights.");
    expect(migration).toContain("I won 2 UFC title fights.");
  });

  it("preserves the published Daily identity and completed attempts", () => {
    expect(migration).toContain("disable trigger daily_challenge_setups_immutable");
    expect(migration).toContain("enable trigger daily_challenge_setups_immutable");
    expect(migration).not.toContain("delete from private.daily_challenges");
    expect(migration).not.toContain("delete from private.daily_challenge_attempts");
    expect(migration).not.toContain("delete from private.daily_challenge_progress");
  });

  it("is replay-safe outside the historical Central day", () => {
    expect(migration).toContain("private.daily_challenge_central_day(now())");
    expect(migration).toContain("if v_central_today is distinct from v_target_day then");
    expect(migration).toContain("if v_setup_id is null then");
  });
});
