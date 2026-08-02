import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608250001_truthful_pick_monitoring_decisions.sql",
  "utf8",
);
const runner = readFileSync(
  "supabase/functions/run-pick-monitoring/index.ts",
  "utf8",
);
const repository = readFileSync(
  "src/features/picks-monitoring/monitoringInboxRepository.ts",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/pick_monitoring_truthful_decisions.sql",
  "utf8",
);
const ownerIdentitySql = readFileSync(
  "supabase/tests/picks_owner_identity_projection.sql",
  "utf8",
);
const backendWorkflow = readFileSync(
  ".github/workflows/verify-supabase-backend.yml",
  "utf8",
);

describe("truthful automatic Picks monitoring decisions", () => {
  it("extends the existing ledger without adding a second inbox owner", () => {
    expect(migration).toContain("add column if not exists decision_reason text");
    expect(migration).toContain("add column if not exists provider_called boolean");
    expect(migration).toContain("'latest_scheduled_decision'");
    expect(migration).not.toContain("get_latest_pick_monitoring_scheduler_decision");
    expect(repository.match(/get_pick_monitoring_inbox/g)).toHaveLength(1);
    expect(repository).not.toContain("get_latest_pick_monitoring_scheduler_decision");
  });

  it("keeps decision-only rows out of provider cadence and provider-run history", () => {
    const scheduleProjection = migration.split(
      "create or replace function public.get_pick_monitoring_schedule_state",
    )[1]?.split("create or replace function public.get_pick_monitoring_event_state")[0] ?? "";
    const inboxProjection = migration.split(
      "create or replace function public.get_pick_monitoring_inbox",
    )[1] ?? "";

    expect(scheduleProjection).toContain("and run.provider_called");
    expect(scheduleProjection).toContain("and run.decision_reason is null");
    expect(inboxProjection.match(/decision_reason is null/g)?.length).toBeGreaterThanOrEqual(2);
    expect(migration).toContain("status <> 'skipped' or provider_called = false");
  });

  it("uses one event boundary and the shared current-over-staged ownership rule", () => {
    const inboxProjection = migration.split(
      "create or replace function public.get_pick_monitoring_inbox",
    )[1] ?? "";
    const currentPosition = inboxProjection.indexOf("'kind', 'current'");
    const stagedPosition = inboxProjection.indexOf("'kind', 'staged'");

    expect(migration.match(/least\([^)]*starts_at[^)]*locks_at[^)]*\) > now\(\)/g)?.length)
      .toBeGreaterThanOrEqual(4);
    expect(currentPosition).toBeGreaterThanOrEqual(0);
    expect(stagedPosition).toBeGreaterThan(currentPosition);
  });

  it("fails closed when a scheduled decision cannot be persisted", () => {
    expect(runner).toContain("MONITORING_DECISION_RECORD_FAILED");
    expect(runner).toContain("p_provider_called");
    expect(runner).toContain('reason: "notification_dispatch_failed"');
    expect(runner).toContain('reason: "schedule_state_failed"');
    expect(runner).toContain('reason: "monitoring_record_failed"');
  });

  it("runs rollback-only SQL proof for event selection, cadence, ownership, and inbox separation", () => {
    expect(integrationSql).toContain("boundary-past event remained monitorable");
    expect(integrationSql).toContain("decision-only row corrupted provider cadence or quota state");
    expect(integrationSql).toContain("owner inbox mixed scheduler decisions with provider runs");
    expect(integrationSql).toContain("non-owner loaded Monitoring Inbox");
    expect(integrationSql).toMatch(/rollback;\s*-- This file is the canonical Picks fresh-database suite entrypoint/);
    expect(integrationSql.trimEnd()).toMatch(/\\ir picks_owner_identity_projection\.sql$/);
    const staleSuiteInclude = `${String.fromCharCode(92)}ir picks_stale_draft_rollover.sql`;
    expect(ownerIdentitySql).toContain("rollback;");
    expect(ownerIdentitySql.trimEnd().endsWith(staleSuiteInclude)).toBe(true);
    expect(backendWorkflow).toContain("supabase/tests/pick_monitoring_truthful_decisions.sql");
    expect(backendWorkflow).toContain(
      "Truthful Picks monitoring SQL tests executed successfully against the same fresh local database.",
    );
  });
});
