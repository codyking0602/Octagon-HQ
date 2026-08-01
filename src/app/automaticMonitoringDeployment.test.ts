import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schedulerMigration = readFileSync("supabase/migrations/202608090001_automatic_pick_monitoring_scheduler.sql", "utf8");
const hardeningMigration = readFileSync("supabase/migrations/202608090002_harden_pick_monitoring_schedule_claims.sql", "utf8");
const runtimeVerificationMigration = readFileSync("supabase/migrations/202608090003_verify_pick_monitoring_scheduler_runtime.sql", "utf8");
const migration = `${schedulerMigration}\n${hardeningMigration}\n${runtimeVerificationMigration}`;
const runner = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
const sync = readFileSync("supabase/functions/sync-next-ufc-event/index.ts", "utf8");
const config = readFileSync("supabase/config.toml", "utf8");
const deploy = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
const verifier = readFileSync("scripts/verify-monitoring-function-deployment.mjs", "utf8");
const productionVerifier = readFileSync("scripts/verify-production-monitoring-scheduler.mjs", "utf8");

describe("automatic Picks monitoring deployment", () => {
  it("has one canonically named database scheduler that invokes the existing runner", () => {
    const scheduledJobNames = [...migration.matchAll(/cron\.schedule\(\s*'([^']+)'/g)].map((match) => match[1]);
    expect(new Set(scheduledJobNames)).toEqual(new Set(["octagon-hq-pick-monitoring"]));
    expect(migration).toContain("/functions/v1/run-pick-monitoring");
    expect(migration).not.toContain("THE_ODDS_API_KEY");
    expect(runner).toContain("buildManualMonitoringPayload");
  });

  it("keeps PR deployment quota-safe and activates only through the trusted deploy owner", () => {
    expect(migration).toContain("active := false");
    expect(migration).toContain("set_pick_monitoring_scheduler_enabled");
    expect(deploy).toContain("configure-monitoring-scheduler.mjs");
    expect(deploy).toContain("PICK_MONITORING_SCHEDULER_ENABLED");
    expect(verifier).toContain("202608090002");
    expect(verifier).toContain("202608090003");
    expect(verifier).toContain("health?.command_configured !== true");
    expect(verifier).toContain("fakeSchedulerResponse.status !== 401");
    expect(verifier).not.toContain("THE_ODDS_API_KEY=");
  });

  it("checks the live production scheduler as active even when verification runs on a PR", () => {
    expect(productionVerifier).toContain(': true;');
    expect(productionVerifier).not.toContain('process.env.GITHUB_EVENT_NAME !== "pull_request"');
  });

  it("proves the runtime job command without exposing it or its credential", () => {
    expect(runtimeVerificationMigration).toContain("cron.job_run_details");
    expect(runtimeVerificationMigration).toContain("'command_configured'");
    expect(runtimeVerificationMigration).toContain("/functions/v1/run-pick-monitoring");
    expect(runtimeVerificationMigration).toContain("timeout_milliseconds := 60000");
    expect(runtimeVerificationMigration).not.toContain("'command', v_job.command");
  });

  it("uses server authorization for scheduled and manual requests", () => {
    expect(config).toContain("[functions.run-pick-monitoring]\nverify_jwt = false");
    expect(config).toContain("[functions.sync-next-ufc-event]\nverify_jwt = false");
    expect(runner).toContain("authorize_pick_monitoring_scheduler");
    expect(sync).toContain("monitoring-preview");
    expect(sync).toContain("get_pick_monitoring_event_state");
  });

  it("uses a short claim and completes scheduled evidence and cadence atomically", () => {
    expect(hardeningMigration).toContain("claim_pick_monitoring_schedule");
    expect(hardeningMigration).toContain("release_pick_monitoring_schedule");
    expect(hardeningMigration).toContain("record_scheduled_pick_monitoring_run");
    expect(hardeningMigration).toContain("v_run_id := public.record_pick_monitoring_run(p_payload)");
    expect(hardeningMigration).toContain("last_claimed_at = p_claimed_at");
    expect(hardeningMigration).toContain("finding.review_status = 'new'");
    expect(hardeningMigration).toContain("timeout_milliseconds := 60000");
    expect(runner).toContain('admin.rpc("record_scheduled_pick_monitoring_run"');
    expect(runner).toContain('admin.rpc("release_pick_monitoring_schedule"');
  });

  it("records evidence and applies only approved live odds without publishing a card", () => {
    expect(migration).toContain("pick_monitoring_schedule_state");
    expect(runner).toContain('admin.rpc("record_pick_monitoring_run_and_apply_odds"');
    expect(`${migration}\n${runner}`).not.toMatch(/publish_pick_event_draft|stage_pick_event_draft|submit_pick|record_pick_result|delete from public\.pick_events/);
  });
});
