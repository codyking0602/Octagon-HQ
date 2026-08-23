import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
const edge = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
const verifier = readFileSync("scripts/verify-monitoring-function-deployment.mjs", "utf8");
const schedulerConfigurator = readFileSync("scripts/configure-monitoring-scheduler.mjs", "utf8");
const canonicalVerifier = readFileSync("scripts/verify-sync-function-deployment.mjs", "utf8");

describe("manual monitoring deployment contract", () => {
  it("requires the provider secret name without accepting or printing its value", () => {
    expect(workflow).toContain('grep -Fxq "THE_ODDS_API_KEY"');
    expect(verifier).toContain('secret?.name === "THE_ODDS_API_KEY"');
    expect(workflow).not.toContain("VITE_THE_ODDS_API_KEY");
    expect(workflow).not.toContain("secrets.THE_ODDS_API_KEY");
    expect(schedulerConfigurator).not.toContain("THE_ODDS_API_KEY");
  });
  it("embeds and independently verifies the exact monitoring function SHA", () => {
    expect(workflow).toContain("> supabase/functions/run-pick-monitoring/deployment.ts");
    expect(workflow).toContain('require_remote_migration "202608080001"');
    expect(workflow).toContain('require_remote_migration "202608090001"');
    expect(workflow).toContain('grep -F "run-pick-monitoring"');
    expect(workflow).toContain("verify-monitoring-function-deployment.mjs");
    expect(edge).toContain('input.mode === "deployment-info"');
    expect(edge).toContain('"X-Octagon-Backend-Sha": DEPLOYED_SOURCE_SHA');
    expect(verifier).toContain("info.deployment_sha !== expectedSha");
    expect(verifier).toContain("deniedResponse.status !== 401");
    expect(verifier).toContain("fakeSchedulerResponse.status !== 401");
    expect(verifier).toContain("access-control-allow-origin");
    expect(verifier).toContain('cli(["functions", "list"');
    expect(verifier).toContain('const requiredRemoteMigrationVersions = ["202608080001", "202608090001", "202608090002", "202608090003", "202609120001", "202612310002", "202612310047", "202612310048"]');
    expect(verifier).toContain('if (process.env.GITHUB_EVENT_NAME !== "pull_request") requiredRemoteMigrationVersions.push("202612310050", "202612310051")');
  });
  it("configures the one scheduler only through the existing trusted backend deploy", () => {
    expect(workflow).toContain("configure-monitoring-scheduler.mjs");
    expect(workflow).toContain("PICK_MONITORING_SCHEDULER_ENABLED=true");
    expect(workflow).toContain('echo "EXPECTED_MONITORING_SCHEDULER_ENABLED=true"');
    expect(workflow).not.toContain('if [ "$SOURCE_PR_NUMBER" = "0" ]');
    expect(schedulerConfigurator).toContain("set_pick_monitoring_scheduler_enabled");
    expect(schedulerConfigurator).toContain('health?.job_name !== "octagon-hq-pick-monitoring"');
    expect(schedulerConfigurator).toContain('health?.schedule !== "*/5 * * * *"');
  });
  it("extends the existing canonical backend verifier instead of adding a parallel workflow", () => {
    expect(canonicalVerifier).toContain('existsSync("supabase/functions/run-pick-monitoring/index.ts")');
    expect(canonicalVerifier).toContain('await import("./verify-monitoring-function-deployment.mjs")');
  });
});
