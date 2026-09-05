import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/202612310083_restore_football_futures_rpc_contract.sql",
  ),
  "utf8",
);

describe("locked football futures reveal migration", () => {
  it("preserves the V2 reveal query and returns the canonical snake_case RPC contract", () => {
    expect(migration).toContain("create or replace function public.get_football_futures");
    expect(migration).toContain("from public.football_futures_picks ffp");
    expect(migration).toContain("ffp.season = p_season");
    expect(migration).toContain("ffp.profile_id <> v_profile_id");

    expect(migration).toContain("'lock_at', v_lock_at");
    expect(migration).toContain("'own_picks', v_my_pick");
    expect(migration).toContain("'group_picks', v_group_picks");
    expect(migration).toContain("'profile_id', p.id");
    expect(migration).toContain("'display_name', p.display_name");
    expect(migration).toContain("'updated_at', ffp.updated_at");

    expect(migration).not.toContain("'lockAt'");
    expect(migration).not.toContain("'myPick'");
    expect(migration).not.toContain("'groupPicks'");
    expect(migration).not.toContain("'profileId'");
    expect(migration).not.toContain("'displayName'");
    expect(migration).not.toContain("'updatedAt'");
    expect(migration).not.toContain("pick_group_members");
  });
});
