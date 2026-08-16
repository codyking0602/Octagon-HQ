import backendWorkflow from "../../.github/workflows/verify-supabase-backend.yml?raw";
import { describe, expect, it } from "vitest";

function workflowJob(source: string, start: string, end?: string) {
  const afterStart = source.split(`  ${start}:`)[1];
  if (!afterStart) throw new Error(`Missing workflow job: ${start}`);
  return end ? afterStart.split(`  ${end}:`)[0] : afterStart;
}

describe("Supabase backend verification workflow contract", () => {
  it("runs the three expensive proof lanes independently behind one aggregate gate", () => {
    const localSql = workflowJob(backendWorkflow, "local_sql", "live_backend");
    const liveBackend = workflowJob(backendWorkflow, "live_backend", "live_webkit");
    const liveWebkit = workflowJob(backendWorkflow, "live_webkit", "verify");
    const verify = workflowJob(backendWorkflow, "verify");

    expect(localSql).not.toContain("needs:");
    expect(liveBackend).not.toContain("needs:");
    expect(liveWebkit).not.toContain("needs:");
    expect(verify).toContain("- local_sql");
    expect(verify).toContain("- live_backend");
    expect(verify).toContain("- live_webkit");
    expect(verify).toContain("needs.local_sql.result");
    expect(verify).toContain("needs.live_backend.result");
    expect(verify).toContain("needs.live_webkit.result");
  });

  it("keeps every heavy proof in its single canonical lane", () => {
    const localSql = workflowJob(backendWorkflow, "local_sql", "live_backend");
    const liveBackend = workflowJob(backendWorkflow, "live_backend", "live_webkit");
    const liveWebkit = workflowJob(backendWorkflow, "live_webkit", "verify");

    expect(localSql).toContain("supabase db start");
    expect(localSql).toContain("auction_private_lifecycle.sql");
    expect(localSql).toContain("pick_monitoring_truthful_decisions.sql");
    expect(localSql).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(localSql).not.toContain("playwright");

    expect(liveBackend).toContain("supabase db push --linked --dry-run");
    expect(liveBackend).toContain("Verify deployed migrations");
    expect(liveBackend).toContain("verify-production-monitoring-scheduler.mjs");
    expect(liveBackend).toContain("verify-sync-function-deployment.mjs");
    expect(liveBackend).toContain("verify-event-setup-preview-live.mjs");
    expect(liveBackend).toContain("verify-picks-scoring-live.mjs");
    expect(liveBackend).not.toContain("supabase db start");
    expect(liveBackend).not.toContain("playwright install");

    expect(liveWebkit).toContain("verify-live-frontend-delivery.mjs");
    expect(liveWebkit).toContain("playwright install --with-deps webkit");
    expect(liveWebkit).toContain("verify-whats-new-live.mjs");
    expect(liveWebkit).toContain("verify-pin-auth-live.mjs");
    expect(liveWebkit).toContain("Verify temporary proof user and owner grant cleanup");
    expect(liveWebkit).toContain("Upload production WebKit proof");
    expect(liveWebkit).not.toContain("SUPABASE_DB_PASSWORD");
    expect(liveWebkit).not.toContain("supabase db start");
  });

  it("prepulls only the fresh-database bootstrap images in parallel from dynamic CLI versions", () => {
    const localSql = workflowJob(backendWorkflow, "local_sql", "live_backend");
    const liveBackend = workflowJob(backendWorkflow, "live_backend", "live_webkit");
    const liveWebkit = workflowJob(backendWorkflow, "live_webkit", "verify");

    expect(localSql).toContain("service_table=$(supabase services)");
    expect(localSql).toContain("supabase/postgres");
    expect(localSql).toContain("supabase/gotrue");
    expect(localSql).toContain("supabase/realtime");
    expect(localSql).toContain("supabase/storage-api");
    expect(localSql).toContain('echo "ghcr.io/${service}:${version}"');
    expect(localSql).toContain("xargs -r -n 1 -P 4 docker pull");
    expect(localSql).not.toMatch(/ghcr\.io\/supabase\/postgres:[0-9]/);
    expect(localSql).not.toMatch(/ghcr\.io\/supabase\/gotrue:v[0-9]/);
    expect(localSql).not.toMatch(/ghcr\.io\/supabase\/realtime:v[0-9]/);
    expect(localSql).not.toMatch(/ghcr\.io\/supabase\/storage-api:v[0-9]/);
    expect(liveBackend).not.toContain("xargs -r -n 1 -P 4 docker pull");
    expect(liveWebkit).not.toContain("xargs -r -n 1 -P 4 docker pull");
  });

  it("checks the exact requested source SHA in every lane", () => {
    const localSql = workflowJob(backendWorkflow, "local_sql", "live_backend");
    const liveBackend = workflowJob(backendWorkflow, "live_backend", "live_webkit");
    const liveWebkit = workflowJob(backendWorkflow, "live_webkit", "verify");

    for (const lane of [localSql, liveBackend, liveWebkit]) {
      expect(lane).toContain("SOURCE_SHA: ${{ github.event.pull_request.head.sha || github.sha }}");
      expect(lane).toContain("ref: ${{ env.SOURCE_SHA }}");
      expect(lane).toContain("checked_out_sha=$(git rev-parse HEAD)");
      expect(lane).toContain('if [ "$checked_out_sha" != "$SOURCE_SHA" ]');
    }
  });
});
