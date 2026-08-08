import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runner = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
const productionVerifier = readFileSync("scripts/verify-production-monitoring-scheduler.mjs", "utf8");
const sourceContextMigration = readFileSync(
  "supabase/migrations/202609120001_repair_pick_monitoring_source_context.sql",
  "utf8",
);

function blockAfter(marker: string, length = 900) {
  const start = runner.indexOf(marker);
  expect(start).toBeGreaterThanOrEqual(0);
  return runner.slice(start, start + length);
}

describe("automatic Picks monitoring lifecycle", () => {
  it("claims due scheduled work before the one configured odds-provider request", () => {
    const claimAt = runner.indexOf('admin.rpc("claim_pick_monitoring_schedule"');
    const providerAt = runner.indexOf("buildTheOddsApiRequestUrl(providerKey)");
    expect(claimAt).toBeGreaterThanOrEqual(0);
    expect(providerAt).toBeGreaterThan(claimAt);
    expect(runner.match(/buildTheOddsApiRequestUrl\(providerKey\)/g)).toHaveLength(1);
    expect(runner.match(/claim_pick_monitoring_schedule/g)).toHaveLength(1);
  });

  it("returns not-due and already-claimed decisions before any provider request", () => {
    expect(runner.indexOf('reason: decision.reason')).toBeLessThan(
      runner.indexOf("buildTheOddsApiRequestUrl(providerKey)"),
    );
    expect(runner.indexOf('reason: "already_claimed"')).toBeLessThan(
      runner.indexOf("buildTheOddsApiRequestUrl(providerKey)"),
    );
  });

  it("uses the exact published source context for both manual and scheduled checks", () => {
    expect(sourceContextMigration).toContain("draft.state = 'published'");
    expect(sourceContextMigration).toContain("'{source_url}'");
    expect(runner).toContain('admin.rpc("get_pick_monitoring_event_state")');
    expect(runner).not.toContain('owner.rpc("get_current_pick_event")');
    expect(runner).toContain('mode: "monitoring-preview"');
    expect(runner).toContain('source_url: sourceUrl');
  });

  it("does not claim the odds provider was called when source preview fails first", () => {
    const sourceFailure = blockAfter('reason: "source_preview_failed"');
    expect(sourceFailure).toContain("providerCalled: false");
    expect(runner.indexOf('reason: "source_preview_failed"')).toBeLessThan(
      runner.indexOf("buildTheOddsApiRequestUrl(providerKey)"),
    );
  });

  it("proves a recent production wake while separating provider-limited partial coverage from system failure", () => {
    expect(productionVerifier).toContain('safeHealth.last_run_status !== "succeeded"');
    expect(productionVerifier).toContain("pick_monitoring_runs");
    expect(productionVerifier).toContain('trigger_kind: "eq.scheduled"');
    expect(productionVerifier).toContain('latestDecision.status === "skipped"');
    expect(productionVerifier).toContain("preProviderFailureReasons.has(latestDecision.decision_reason)");
    expect(productionVerifier).toContain('const healthyPartialCoverage = latestDecision.status === "partial"');
    expect(productionVerifier).toContain('Number(latestDecision.provider_event_count) > 0');
    expect(productionVerifier).toContain('Number(latestDecision.complete_snapshot_count) > 0');
    expect(productionVerifier).toContain('Number(latestDecision.missing_snapshot_count) > 0');
    expect(productionVerifier).toContain('providerDiagnostics.length === 0');
    expect(productionVerifier).toContain('providerFindings.length === 0');
    expect(productionVerifier).toContain('Number(latestDecision.provider_requests_remaining) > 5');
    expect(productionVerifier).toContain("Production Picks monitoring is unhealthy");
    expect(productionVerifier).not.toContain("run-pick-monitoring`, {");
  });

  it("keeps outcomes, odds application, and card review on their existing owners", () => {
    expect(runner).toContain('admin.rpc("record_scheduled_pick_monitoring_run"');
    expect(runner).toContain('admin.rpc("record_pick_monitoring_run_and_apply_odds"');
    expect(runner).toContain("buildManualMonitoringPayload");
    expect(runner).not.toMatch(/stage_pick_event_draft|publish_pick_event_draft|record_pick_result|setInterval/);
    expect(sourceContextMigration.match(/create function public\.get_pick_monitoring_event_state/g)).toHaveLength(1);
  });
});
