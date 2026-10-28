import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200029_neutral_ranking_preview_copy.sql",
  "utf8",
);
const syncScript = readFileSync("scripts/sync-ranking-whats-new.mjs", "utf8");

describe("neutral ranking preview copy", () => {
  it("repairs existing items and keeps future major updates neutral", () => {
    expect(migration).toContain("update private.whats_new_items");
    expect(migration).toContain("where kind = 'major_ranking_update'");
    expect(migration).toContain("The UFC rankings had a major shakeup");
    expect(migration).toContain("across the UFC boards");
    expect(migration).toContain("private.sync_ranking_whats_new_v2_core");
    expect(migration).toContain("route = '/rankings?update=' || v_source_sha");
  });

  it("preserves the exact v3 synchronization contract", () => {
    expect(migration).toContain("'sync_contract_version', 3");
    expect(migration).toContain("'rich_preview_movement_count'");
    expect(migration).toContain("to service_role");
    expect(syncScript).toContain("const requiredContractVersion = 3");
  });
});
