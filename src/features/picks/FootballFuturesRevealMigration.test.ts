import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  fileURLToPath(
    new URL(
      "../../../supabase/migrations/202612310082_fix_locked_football_futures_reveal.sql",
      import.meta.url,
    ),
  ),
  "utf8",
);

describe("locked football futures reveal migration", () => {
  it("reveals every other same-season submission without the removed group-membership tables", () => {
    expect(migration).toContain("create or replace function public.get_football_futures");
    expect(migration).toContain("from public.football_futures_picks ffp");
    expect(migration).toContain("ffp.season = p_season");
    expect(migration).toContain("ffp.profile_id <> v_profile_id");
    expect(migration).not.toContain("pick_group_members");
  });
});
