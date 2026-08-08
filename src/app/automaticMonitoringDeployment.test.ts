import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schedulerMigration = readFileSync("supabase/migrations/202608090001_automatic_pick_monitoring_scheduler.sql", "utf8");
const hardeningMigration = readFileSync("supabase/migrations/202608090002_harden_pick_monitoring_schedule_claims.sql", "utf8");
const runtimeVerificationMigration = readFileSync("supabase/migrations/202608090003_verify_pick_monitoring_scheduler_runtime.sql", "utf8");
const claimRepairMigration = readFileSync("supabase/migrations/202612310002_repair_pick_monitoring_schedule_claim.sql", "utf8");
const migration = `${schedulerMigration}\n${hardeningMigration}\n${runtimeVerificationMigration}\n${claimRepairMigration}`;
const runner = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
const sync = readFileSync("supabase/functions/sync-next-ufc-event/index.ts", "utf8");
const config = readFileSync("supabase/config.toml", "utf8");
const deploy = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
const verifier = readFileSync("scripts/verify-monitoring-function-deployment.mjs", "utf8");
const productionVerifier = readFileSync("scripts/verify-production-monitoring-scheduler.mjs", "utf8");
const browserVerifier = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

describe("automatic Picks monitoring deployment", () => {
  it("has one canonically named database scheduler that invokes the existing runner", () => {
    const scheduledJobNames = [...migration.matchAll(/cron\.schedule\(\s*'([^']+)'/g)].map((match) => match[1]);
    expect(new Set(scheduledJobNames)).toEqual(new Set(["octagon-hq-pick-monitoring"]));
    expect(migration).toContain("/functions/v1/run-pick-monitoring");
    expect(migration).not.toContain("THE_ODDS_API_KEY");
    expect(runner).toContain("buildManualMonitoringPayload");
  });

  it("keeps the production scheduler active through the trusted deployment owner", () => {
    expect(migration).toContain("active := false");
    expect(migration).toContain("set_pick_monitoring_scheduler_enabled");
    expect(deploy).toContain("Keep canonical automatic monitoring scheduler active");
    expect(deploy).toContain("PICK_MONITORING_SCHEDULER_ENABLED=true node scripts/configure-monitoring-scheduler.mjs");
    expect(deploy).toContain('echo "EXPECTED_MONITORING_SCHEDULER_ENABLED=true"');
    expect(deploy).not.toContain('enabled=false');
    expect(deploy).not.toContain('if [ "$SOURCE_PR_NUMBER" = "0" ]');
    expect(verifier).toContain("202608090002");
    expect(verifier).toContain("202608090003");
    expect(verifier).toContain("202612310002");
    expect(verifier).toContain("health?.command_configured !== true");
    expect(verifier).toContain("fakeSchedulerResponse.status !== 401");
    expect(verifier).not.toContain("THE_ODDS_API_KEY=");
  });

  it("checks the live production scheduler as active even when verification runs on a PR", () => {
    expect(productionVerifier).toContain(': true;');
    expect(productionVerifier).not.toContain('process.env.GITHUB_EVENT_NAME !== "pull_request"');
  });

  it("fails real automatic failures while allowing only clean supported-bookmaker partial coverage", () => {
    expect(productionVerifier).toContain('const healthyPartialCoverage = latestDecision.status === "partial"');
    expect(productionVerifier).toContain('latestDecision.provider_called === true');
    expect(productionVerifier).toContain('latestDecision.decision_reason === null');
    expect(productionVerifier).toContain('Number(latestDecision.complete_snapshot_count) > 0');
    expect(productionVerifier).toContain('Number(latestDecision.missing_snapshot_count) > 0');
    expect(productionVerifier).toContain('providerDiagnostics.length === 0');
    expect(productionVerifier).toContain('providerFindings.length === 0');
    expect(productionVerifier).toContain('Number(latestDecision.provider_requests_remaining) > 5');
    expect(productionVerifier).toContain('item?.finding_type === "provider_error" || item?.finding_type === "quota_warning"');
    expect(productionVerifier).toContain("Production Picks monitoring is unhealthy");
    expect(productionVerifier).toContain("monitoring-scheduler-proof.json");
    expect(productionVerifier).toContain("healthy partial provider check");
  });

  it("accepts the explicit live partial-coverage UI only after the backend health gate proves it", () => {
    expect(browserVerifier).toContain('const partialCoverage = syncHeadingText === "AUTO-SYNC HAS PARTIAL COVERAGE"');
    expect(browserVerifier).toContain('!await pendingChanges.count() && !partialCoverage');
    expect(browserVerifier).toContain("explicit partial-coverage state");
    expect(browserVerifier).toContain("MONITORING UNAVAILABLE");
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

  it("repairs the existing claim RPC without adding a second schedule owner", () => {
    expect(claimRepairMigration).toContain("drop function if exists public.claim_pick_monitoring_schedule(text, timestamptz, timestamptz)");
    expect(claimRepairMigration).toContain("drop function if exists public.claim_pick_monitoring_schedule(text, timestamptz)");
    expect(claimRepairMigration.match(/create function public\.claim_pick_monitoring_schedule/g)).toHaveLength(1);
    expect(claimRepairMigration).toContain("update public.pick_monitoring_schedule_state");
    expect(claimRepairMigration).toContain("on conflict (source_event_identity) do nothing");
    expect(claimRepairMigration).toContain("'-infinity'::timestamptz");
    expect(claimRepairMigration).toContain("to service_role");
    expect(claimRepairMigration).not.toMatch(/cron\.schedule|run-pick-monitoring|THE_ODDS_API_KEY/);
  });

  it("uses a short claim and completes scheduled evidence and cadence atomically", () => {
    expect(hardeningMigration).toContain("release_pick_monitoring_schedule");
    expect(hardeningMigration).toContain("record_scheduled_pick_monitoring_run");
    expect(hardeningMigration).toContain("v_run_id := public.record_pick_monitoring_run(p_payload)");
    expect(hardeningMigration).toContain("last_claimed_at = p_claimed_at");
    expect(hardeningMigration).toContain("finding.review_status = 'new'");
    expect(hardeningMigration).toContain("timeout_milliseconds := 60000");
    expect(runner).toContain('admin.rpc("claim_pick_monitoring_schedule"');
    expect(runner).toContain('admin.rpc("record_scheduled_pick_monitoring_run"');
    expect(runner).toContain('admin.rpc("release_pick_monitoring_schedule"');
  });

  it("records evidence and applies only approved live odds without publishing a card", () => {
    expect(migration).toContain("pick_monitoring_schedule_state");
    expect(runner).toContain('admin.rpc("record_pick_monitoring_run_and_apply_odds"');
    expect(`${migration}\n${runner}`).not.toMatch(/publish_pick_event_draft|stage_pick_event_draft|submit_pick|record_pick_result|delete from public\.pick_events/);
  });
});
