import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310137_fix_september_16_ufc_who_am_i_oliveira.sql",
  "utf8",
);

describe("September 16 UFC Who Am I Oliveira correction migration", () => {
  it("is tightly scoped to the published Charles Oliveira Daily Challenge", () => {
    expect(migration).toContain("v_target_day constant date := date '2026-09-16'");
    expect(migration).toContain("daily.schedule_version = 'play-rotation-v7'");
    expect(migration).toContain("daily.game_type = 'who_am_i'");
    expect(migration).toContain("ufc:charles-oliveira");
    expect(migration).toContain("I competed in 9 UFC divisions.");
  });

  it("preserves the published challenge and attempt while correcting only immutable setup evidence", () => {
    expect(migration).toContain("disable trigger daily_challenge_setups_immutable");
    expect(migration).toContain("I competed in 2 UFC divisions.");
    expect(migration).toContain("I hold the UFC record for submission wins.");
    expect(migration).toContain("enable trigger daily_challenge_setups_immutable");
    expect(migration).not.toContain("delete from private.daily_challenges");
    expect(migration).not.toContain("delete from private.daily_challenge_attempts");
    expect(migration).not.toContain("delete from private.daily_challenge_progress");
  });
});
