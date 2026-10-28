import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const canonicalMigration = readFileSync(
  "supabase/migrations/202608200028_dynamic_rich_preview_data.sql",
  "utf8",
);
const repairMigration = readFileSync(
  "supabase/migrations/202612310015_fix_ranking_whats_new_btrim.sql",
  "utf8",
);

const functionStart = "create or replace function public.sync_ranking_whats_new(";
const grantEnd =
  "grant execute on function public.sync_ranking_whats_new(text, jsonb, jsonb)\n  to service_role;";

function canonicalWrapper(): string {
  const start = canonicalMigration.indexOf(functionStart);
  const grantStart = canonicalMigration.indexOf(grantEnd, start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(grantStart).toBeGreaterThanOrEqual(0);

  return canonicalMigration.slice(start, grantStart + grantEnd.length);
}

describe("What's New Rankings sync trim repair", () => {
  it("recreates only the contract-v3 wrapper with btrim qualification", () => {
    const expectedRepair = canonicalWrapper().replaceAll(
      "pg_catalog.trim(",
      "pg_catalog.btrim(",
    );

    expect(repairMigration.trimEnd()).toBe(expectedRepair);
    expect(repairMigration).not.toContain("pg_catalog.trim(");
    expect(repairMigration.match(/pg_catalog\.btrim\(/g)).toHaveLength(4);
    expect(repairMigration).toContain("'sync_contract_version', 3");
    expect(repairMigration).toContain("security definer");
    expect(repairMigration).toContain("set search_path = ''");
    expect(repairMigration).toContain(
      "revoke all on function public.sync_ranking_whats_new(text, jsonb, jsonb)\n  from public, anon, authenticated;",
    );
    expect(repairMigration).toContain(
      "grant execute on function public.sync_ranking_whats_new(text, jsonb, jsonb)\n  to service_role;",
    );
  });
});
