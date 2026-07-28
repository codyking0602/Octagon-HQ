import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608090001_automatic_pick_monitoring_scheduler.sql", "utf8");
const projectionMigration = readFileSync("supabase/migrations/202608090002_pick_monitoring_event_projection.sql", "utf8");
const runner = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
const sync = readFileSync("supabase/functions/sync-next-ufc-event/index.ts", "utf8");
const config = readFileSync("supabase/config.toml", "utf8");
const deploy = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
const verifier = readFileSync("scripts/verify-monitoring-function-deployment.mjs", "utf8");

describe("automatic Picks monitoring deployment", () => {
  it("has exactly one database scheduler that invokes the canonical runner", () => {
    expect(migration.match(/cron\.schedule\(/g)).toHaveLength(1);
    expect(migration).toContain("octagon-hq-pick-monitoring");
    expect(migration).toContain("/functions/v1/run-pick-monitoring");
    expect(migration).not.toContain("THE_ODDS_API_KEY");
    expect(runner).toContain("buildManualMonitoringPayload");
  });

  it("keeps PR deployment quota-safe and activates only through the trusted deploy owner", () => {
    expect(migration).toContain("active := false");
    expect(migration).toContain("set_pick_monitoring_scheduler_enabled");
    expect(deploy).toContain("configure-monitoring-scheduler.mjs");
    expect(deploy).toContain("PICK_MONITORING_SCHEDULER_ENABLED");
    expect(verifier).toContain("fakeSchedulerResponse.status !== 401");
    expect(verifier).not.toContain("THE_ODDS_API_KEY=");
  });

  it("uses server authorization for scheduled and manual requests", () => {
    expect(config).toContain("[functions.run-pick-monitoring]\nverify_jwt = false");
    expect(config).toContain("[functions.sync-next-ufc-event]\nverify_jwt = false");
    expect(runner).toContain("authorize_pick_monitoring_scheduler");
    expect(sync).toContain("monitoring-preview");
    expect(sync).toContain("get_pick_monitoring_event_state");
  });

  it("preserves the existing staged source comparison contract", () => {
    for (const field of [
      "source", "source_event_key", "source_url", "venue", "location",
      "starts_at", "locks_at", "season", "weight_class", "included",
    ]) {
      expect(projectionMigration).toContain(`'${field}'`);
    }
    expect(projectionMigration).toContain("from public.pick_event_drafts draft");
    expect(projectionMigration).toContain("from public.pick_event_draft_bouts bout");
    expect(projectionMigration).not.toContain("stage_pick_event_draft");
  });

  it("records evidence only and never mutates Picks or publishes a card", () => {
    expect(migration).toContain("pick_monitoring_schedule_state");
    expect(runner).toContain('admin.rpc("record_pick_monitoring_run"');
    expect(`${migration}\n${projectionMigration}\n${runner}`).not.toMatch(/publish_pick_event_draft|stage_pick_event_draft|submit_pick|record_pick_result|delete from public\.pick_events|update public\.pick_events/);
  });
});
