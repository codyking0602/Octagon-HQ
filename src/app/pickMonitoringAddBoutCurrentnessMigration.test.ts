import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310018_keep_add_bout_monitoring_findings_actionable.sql",
  "utf8",
);

describe("add-bout monitoring finding currentness", () => {
  it("keeps a proposed new bout actionable while its bout id is still unused", () => {
    const addBoutBranch = migration.indexOf("if v_action = 'add_bout' then");
    const legacyMissingBoutGuard = migration.indexOf(
      "if p_finding.bout_id is not null and v_bout.bout_id is null then",
    );

    expect(addBoutBranch).toBeGreaterThan(-1);
    expect(migration).toContain("return v_bout.bout_id is null;");
    expect(addBoutBranch).toBeLessThan(legacyMissingBoutGuard);
  });

  it("preserves existing-bout currentness checks for edit and removal proposals", () => {
    expect(migration).toContain("elsif v_action = 'update_bout_weight_class' then");
    expect(migration).toContain("elsif v_action = 'remove_bout' then");
    expect(migration).toContain("elsif v_action = 'replace_fighter' then");
    expect(migration.match(/if v_bout\.bout_id is null then return false; end if;/g)).toHaveLength(3);
  });

  it("changes only the canonical currentness helper and never mutates Picks state", () => {
    expect(migration).toContain(
      "create or replace function private.pick_monitoring_finding_is_current(",
    );
    expect(migration).not.toMatch(/(?:insert\s+into|update|delete\s+from)\s+public\.pick_(?:events|bouts)/i);
    expect(migration).not.toContain("create function public.approve_pick_monitoring_finding");
    expect(migration).toContain(
      "revoke all on function private.pick_monitoring_finding_is_current(",
    );
  });
});
