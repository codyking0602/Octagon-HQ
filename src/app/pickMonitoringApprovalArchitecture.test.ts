import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202609090001_pick_monitoring_card_change_approval.sql",
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
const freshDatabaseEntrypoint = readFileSync(
  "supabase/tests/pick_monitoring_truthful_decisions.sql",
  "utf8",
);

describe("owner-approved monitoring card changes", () => {
  it("dispatches supported proposals only through existing canonical Picks mutations", () => {
    expect(migration.match(/create or replace function public\.approve_pick_monitoring_finding/g))
      .toHaveLength(1);
    expect(migration.match(/public\.adjust_pick_event_lock_time/g)).toHaveLength(1);
    expect(migration.match(/public\.approve_pick_bout_inclusion/g)).toHaveLength(1);
    expect(migration.match(/public\.approve_pick_fighter_replacement/g)).toHaveLength(1);
    expect(migration.match(/public\.approve_pick_card_reorder/g)).toHaveLength(1);
    expect(migration).not.toContain("update public.pick_events");
    expect(migration).not.toContain("update public.pick_bouts");
    expect(migration).not.toContain("insert into public.pick_card_change_actions");
  });

  it("keeps proposals durable, explicit, owner-only, and stale guarded", () => {
    expect(migration).toContain("public.is_pick_control_owner(auth.uid())");
    expect(migration).toContain("v_finding.review_status <> 'new'");
    expect(migration).toContain("v_finding.source_details->'approval_proposal'");
    expect(migration).toContain("v_finding.event_id is distinct from v_run.event_id");
    expect(migration).toContain("review_status = 'reviewed'");
    expect(migration).toContain("reviewed_by = auth.uid()");
    expect(migration).toContain("monitoring finding is review-only");
    expect(migration).not.toContain("grant execute on function public.approve_pick_monitoring_finding(uuid, text)\n  to anon");
  });

  it("builds proposals in the existing comparison owner without another runner or provider", () => {
    expect(runner.match(/buildCardChangeFindings/g)).toHaveLength(2);
    expect(runner).not.toContain("sourceChanges(");
    expect(proposalBuilder).toContain('action: "replace_fighter"');
    expect(proposalBuilder).toContain('action: "remove_bout"');
    expect(proposalBuilder).toContain('action: "reorder_card"');
    expect(proposalBuilder).toContain('action: "adjust_event_lock"');
    expect(proposalBuilder).toContain('input.kind !== "current"');
    expect(`${proposalBuilder}\n${runner}`).not.toMatch(/setInterval|cron|THE_ODDS_API_KEY|functions\.invoke/);
  });

  it("keeps React on the repository boundary and makes approval unmistakable", () => {
    expect(repository.match(/approve_pick_monitoring_finding/g)).toHaveLength(1);
    expect(page).toContain("APPROVE REPLACEMENT");
    expect(page).toContain("REPICK REQUIRED FOR AFFECTED MEMBERS");
    expect(page).toContain("The backend will reject it if the live card changed since this check.");
    expect(page).toContain("everything else remains review-only");
    expect(page).not.toMatch(/getSupabaseClient|\.rpc\(|functions\.invoke|createClient/);
  });

  it("runs rollback-only backend proof from the canonical fresh-database entrypoint", () => {
    expect(sqlProof.trimEnd()).toMatch(/rollback;$/);
    expect(sqlProof).toContain("approved monitoring replacement was not applied");
    expect(sqlProof).toContain("approved monitoring removal was not applied");
    expect(sqlProof).toContain("approved monitoring reorder was not applied");
    expect(sqlProof).toContain("approved monitoring deadline was not applied");
    expect(sqlProof).toContain("stale monitoring proposal changed canonical state");
    expect(freshDatabaseEntrypoint.trimEnd()).toMatch(
      /\\ir pick_monitoring_card_change_approval\.sql$/,
    );
  });
});
