import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const baseMigration = readFileSync(
  "supabase/migrations/202609110001_pick_monitoring_card_change_approval.sql",
  "utf8",
);
const currentMigration = readFileSync(
  "supabase/migrations/202609130001_actionable_current_pick_monitoring_findings.sql",
  "utf8",
);
const proposalBuilder = readFileSync(
  "src/features/picks-monitoring/cardChangeApproval.ts",
  "utf8",
);
const runner = readFileSync(
  "src/features/picks-monitoring/manualMonitoringRunner.ts",
  "utf8",
);
const repository = readFileSync(
  "src/features/picks-monitoring/monitoringInboxRepository.ts",
  "utf8",
);
const page = readFileSync(
  "src/features/picks-monitoring/MonitoringInboxPage.tsx",
  "utf8",
);
const sqlProof = readFileSync(
  "supabase/tests/pick_monitoring_card_change_approval.sql",
  "utf8",
);

function currentDispatcher() {
  const start = currentMigration.indexOf(
    "create or replace function public.approve_pick_monitoring_finding",
  );
  expect(start).toBeGreaterThan(-1);
  return currentMigration.slice(start);
}

describe("owner-approved monitoring card changes", () => {
  it("dispatches through the existing canonical Picks mutation boundary", () => {
    const dispatcher = currentDispatcher();
    expect(dispatcher).toContain("public.adjust_pick_event_lock_time");
    expect(dispatcher).toContain("public.approve_pick_event_metadata_change");
    expect(dispatcher).toContain("public.approve_pick_bout_weight_class_change");
    expect(dispatcher).toContain("public.approve_pick_bout_inclusion");
    expect(dispatcher).toContain("public.approve_pick_fighter_replacement");
    expect(dispatcher).toContain("public.approve_pick_card_reorder");
    expect(dispatcher).not.toContain("update public.pick_events");
    expect(dispatcher).not.toContain("update public.pick_bouts");
    expect(dispatcher).not.toContain("insert into public.pick_card_change_actions");
  });

  it("extends the same audited mutation model for metadata and weight class", () => {
    expect(currentMigration).toContain(
      "create or replace function public.approve_pick_event_metadata_change",
    );
    expect(currentMigration).toContain(
      "create or replace function public.approve_pick_bout_weight_class_change",
    );
    expect(currentMigration).toContain("'update_event_metadata'");
    expect(currentMigration).toContain("'update_bout_weight_class'");
    expect(currentMigration).toContain("insert into public.pick_card_change_actions");
    expect(currentMigration).toContain("event metadata changed; reload Manage Open Picks");
    expect(currentMigration).toContain("weight class changed; reload Manage Open Picks");
  });

  it("keeps proposals durable, explicit, owner-only, and current-state guarded", () => {
    expect(baseMigration).toContain("public.is_pick_control_owner(auth.uid())");
    expect(currentMigration).toContain("v_finding.review_status <> 'new'");
    expect(currentMigration).toContain("v_finding.source_details->'approval_proposal'");
    expect(currentMigration).toContain("v_finding.event_id is distinct from v_run.event_id");
    expect(currentMigration).toContain("private.pick_monitoring_finding_identity");
    expect(currentMigration).toContain("newer monitoring evidence exists; refresh Manage Open Picks");
    expect(currentMigration).toContain("private.pick_monitoring_finding_is_current");
    expect(currentMigration).toContain("review_status = 'reviewed'");
    expect(currentMigration).toContain("reviewed_by = auth.uid()");
    expect(currentMigration).not.toContain(
      "grant execute on function public.approve_pick_monitoring_finding(uuid,text) to anon",
    );
  });

  it("builds deterministic proposals in the existing comparison owner", () => {
    expect(runner.match(/buildCardChangeFindings/g)).toHaveLength(2);
    expect(runner).not.toContain("sourceChanges(");
    expect(proposalBuilder).toContain('action: "replace_fighter"');
    expect(proposalBuilder).toContain('action: "remove_bout"');
    expect(proposalBuilder).toContain('action: "reorder_card"');
    expect(proposalBuilder).toContain('action: "adjust_event_lock"');
    expect(proposalBuilder).toContain('action: "update_event_metadata"');
    expect(proposalBuilder).toContain('action: "update_bout_weight_class"');
    expect(proposalBuilder).toContain("finding_identity");
    expect(proposalBuilder).toContain('input.kind !== "current"');
    expect(`${proposalBuilder}\n${runner}`).not.toMatch(
      /setInterval|cron|THE_ODDS_API_KEY|functions\.invoke/,
    );
  });

  it("keeps React on the repository boundary and makes every action truthful", () => {
    expect(repository.match(/approve_pick_monitoring_finding/g)).toHaveLength(1);
    expect(page).toContain("APPROVE CHANGE");
    expect(page).toContain("MARK REVIEWED");
    expect(page).toContain("ALREADY APPLIED AUTOMATICALLY");
    expect(page).toContain("Set {field} to");
    expect(page).toContain("REPICK REQUIRED FOR AFFECTED MEMBERS");
    expect(page).toContain(
      "The backend will reject it if the live card changed since this check.",
    );
    expect(page).toContain("everything else remains review-only");
    expect(page).not.toMatch(/getSupabaseClient|\.rpc\(|functions\.invoke|createClient/);
  });

  it("keeps rollback-only backend proof for every existing dispatch", () => {
    expect(sqlProof.trimEnd()).toMatch(/rollback;$/);
    expect(sqlProof).toContain("approved monitoring replacement was not applied");
    expect(sqlProof).toContain("approved monitoring removal was not applied");
    expect(sqlProof).toContain("approved monitoring reorder was not applied");
    expect(sqlProof).toContain("approved monitoring deadline was not applied");
    expect(sqlProof).toContain("stale monitoring proposal changed canonical state");
  });
});
