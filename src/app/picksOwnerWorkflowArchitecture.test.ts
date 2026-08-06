import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const center = readFileSync("src/features/picks-control/PicksControlCenterPage.tsx", "utf8");
const openDashboard = readFileSync("src/features/picks-control/OpenPicksDashboard.tsx", "utf8");
const resultsControl = readFileSync("src/features/picks-control/PicksControlPage.tsx", "utf8");
const repository = readFileSync("src/features/picks-control/pickControlRepository.ts", "utf8");
const playerPicks = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const monitoringPage = readFileSync("src/features/picks-monitoring/MonitoringInboxPage.tsx", "utf8");
const proposalBuilder = readFileSync("src/features/picks-monitoring/cardChangeApproval.ts", "utf8");
const ownerMigration = readFileSync(
  "supabase/migrations/202609140001_finish_picks_owner_workflow.sql",
  "utf8",
);
const safeReflowMigration = readFileSync(
  "supabase/migrations/202609140002_safe_pick_card_position_reflow.sql",
  "utf8",
);
const inclusionMigration = readFileSync(
  "supabase/migrations/202609140003_reflow_pick_bout_inclusion.sql",
  "utf8",
);
const sqlProof = readFileSync("supabase/tests/picks_owner_workflow.sql", "utf8");

describe("finished Picks owner workflow", () => {
  it("removes the redundant Manage Open Picks jump while keeping player access", () => {
    expect(center).not.toContain("MANAGE OPEN PICKS");
    expect(center).toContain("OPEN PLAYER PICKS");
    expect(center).toContain("bout.includedInPicks");
  });

  it("uses confirmation-only owner actions with factual automatic audit descriptions", () => {
    for (const ownerSurface of [openDashboard, resultsControl, monitoringPage]) {
      expect(ownerSurface).not.toMatch(/Why is |requires a reason|reason of at least/i);
    }
    expect(openDashboard).toContain("Owner confirmed fight removal from Picks");
    expect(openDashboard).toContain("Owner confirmed live fight order change");
    expect(resultsControl).toContain("Owner confirmed official result correction");
    expect(monitoringPage).toContain("Owner confirmed detected change");
  });

  it("keeps removed fights private and exposes one manual addition path", () => {
    expect(openDashboard).toContain(".filter((bout) => bout.includedInPicks)");
    expect(playerPicks).toContain(".filter((bout) => bout.includedInPicks !== false)");
    expect(openDashboard).toContain("ADD FIGHT");
    expect(repository).toContain("approve_pick_bout_addition");
    expect(repository.match(/approve_pick_bout_addition/g)).toHaveLength(1);
  });

  it("makes automation execution and quota evidence visible", () => {
    for (const label of [
      "NEXT SCHEDULER WAKE",
      "NEXT PROVIDER CALL",
      "LAST CARD CHECK",
      "LAST ODDS CALL",
      "MONTHLY REQUESTS LEFT",
      "FIGHT COVERAGE",
      "ODDS RESULT",
      "CARD RESULT",
      "LATEST RECEIPT",
      "SOURCE",
    ]) {
      expect(monitoringPage).toContain(label);
    }
  });

  it("makes detected additions approvable through the existing monitoring owner", () => {
    expect(proposalBuilder).toContain('action: "add_bout"');
    expect(proposalBuilder).toContain("expected_bout_ids: expectedOrder");
    expect(ownerMigration).toContain("v_proposal->>'action' = 'add_bout'");
    expect(ownerMigration).toContain("public.approve_pick_bout_addition");
    expect(ownerMigration).toContain("private.approve_pick_monitoring_finding_owner_core");
  });

  it("reuses one slot reflow owner for reorder, addition, and removal", () => {
    expect(ownerMigration.match(/create or replace function private\.reflow_active_pick_bout_slots/g))
      .toHaveLength(1);
    expect(safeReflowMigration.match(/private\.reflow_active_pick_bout_slots/g)).toHaveLength(2);
    expect(inclusionMigration.match(/private\.reflow_active_pick_bout_slots/g)).toHaveLength(1);
    expect(openDashboard).toContain("APPLY ORDER + LOCKS");
    expect(sqlProof.trimEnd()).toMatch(/rollback;$/);
    expect(sqlProof).toContain("reorder did not move position-owned lock slots");
    expect(sqlProof).toContain("fight addition did not recalculate all position-owned locks");
    expect(sqlProof).toContain("removal did not recalculate position-owned locks");
  });
});
