import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202612310083_restore_football_futures_response_contract.sql",
  ),
  "utf8",
);

describe("football futures response contract migration", () => {
  it("returns the snake_case shape consumed by the canonical picks repository", () => {
    expect(migration).toContain("'lock_at', v_lock_at");
    expect(migration).toContain("'own_picks', v_own_picks");
    expect(migration).toContain("'group_picks', v_group_picks");
    expect(migration).toContain("'profile_id', p.id");
    expect(migration).toContain("'display_name', p.display_name");
    expect(migration).not.toContain("'lockAt'");
    expect(migration).not.toContain("'myPick'");
    expect(migration).not.toContain("'groupPicks'");
  });

  it("keeps the V2 same-season reveal path without legacy membership tables", () => {
    expect(migration).toContain("from public.football_futures_picks ffp");
    expect(migration).toContain("ffp.season = p_season");
    expect(migration).toContain("ffp.profile_id <> v_profile_id");
    expect(migration).not.toContain("pick_group_members");
  });
});
