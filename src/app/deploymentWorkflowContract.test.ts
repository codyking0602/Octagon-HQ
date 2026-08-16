import cloudflareWorkflow from "../../.github/workflows/deploy-cloudflare.yml?raw";
import brokerWorkflow from "../../.github/workflows/deploy-pr-head.yml?raw";
import supabaseWorkflow from "../../.github/workflows/deploy-supabase.yml?raw";
import generalizedBackendWorkflow from "../../.github/workflows/verify-generalized-daily-backend.yml?raw";
import { describe, expect, it } from "vitest";

function workflowJob(source: string, start: string, end?: string) {
  const afterStart = source.split(`  ${start}:`)[1];
  if (!afterStart) throw new Error(`Missing workflow job: ${start}`);
  return end ? afterStart.split(`  ${end}:`)[0] : afterStart;
}

describe("feature deployment workflow contract", () => {
  it("deploys Worker-only frontend changes through the canonical owner", () => {
    expect(cloudflareWorkflow).toContain('- "worker/**"');
  });

  it("keeps one label broker with no PR checkout or deployment implementation", () => {
    expect(brokerWorkflow).toContain("pull_request_target:");
    expect(brokerWorkflow).toContain("- labeled");
    expect(brokerWorkflow).toContain("pr.head.repo?.full_name !== repository");
    expect(brokerWorkflow).toContain("pr.head.sha !== expectedSha");
    expect(brokerWorkflow).toContain("uses: ./.github/workflows/deploy-supabase.yml");
    expect(brokerWorkflow).toContain("uses: ./.github/workflows/deploy-cloudflare.yml");
    expect(brokerWorkflow).toContain("removeLabel");
    expect(brokerWorkflow).not.toContain("actions/checkout");
    expect(brokerWorkflow).not.toContain("supabase db push");
    expect(brokerWorkflow).not.toContain("wrangler deploy");
  });

  it("requires the latest exact-head Validate V2 gate before a labeled PR can deploy", () => {
    expect(brokerWorkflow).toContain("checks: read");
    expect(brokerWorkflow).toContain("github.rest.checks.listForRef");
    expect(brokerWorkflow).toContain('.filter((check) => check.name === "validate")');
    expect(brokerWorkflow).toContain('latestValidation.status !== "completed"');
    expect(brokerWorkflow).toContain('latestValidation.conclusion !== "success"');
    expect(brokerWorkflow).toContain(
      "must pass the Validate V2 'validate' gate before ${triggerLabel} can deploy it",
    );
    expect(brokerWorkflow).toContain("Validate V2 exact-head gate: green.");
  });

  it("keeps Supabase deployment in its canonical exact-SHA owner while skipping unchanged backend work", () => {
    const pushTrigger = supabaseWorkflow.match(/  push:\n([\s\S]*?)\npermissions:/)?.[1] ?? "";
    const scopeJob = workflowJob(supabaseWorkflow, "release-scope", "backend-unchanged");
    const unchangedJob = workflowJob(supabaseWorkflow, "backend-unchanged", "deploy");
    const deployJob = workflowJob(supabaseWorkflow, "deploy");

    expect(supabaseWorkflow).toContain("workflow_call:");
    expect(pushTrigger).toContain("    branches:\n      - main");
    expect(pushTrigger).not.toContain("paths:");
    expect(scopeJob).toContain("node scripts/backend-release-scope.mjs");
    expect(scopeJob).toContain("BACKEND_RELEASE_BEFORE_SHA: ${{ github.event.before || '' }}");
    expect(scopeJob).toContain("BACKEND_RELEASE_SOURCE_SHA: ${{ inputs.source_sha || github.sha }}");
    expect(unchangedJob).toContain("needs: release-scope");
    expect(unchangedJob).toContain("needs.release-scope.outputs.should_deploy != 'true'");
    expect(unchangedJob).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(unchangedJob).not.toContain("supabase ");
    expect(deployJob).toContain("needs: release-scope");
    expect(deployJob).toContain("needs.release-scope.outputs.should_deploy == 'true'");
    expect(deployJob).toContain("ref: ${{ env.SOURCE_SHA }}");
    expect(deployJob).toContain("checked_out_sha=$(git rev-parse HEAD)");
    expect(deployJob).toContain("pr.head.sha !== expectedSha");
    expect(deployJob).toContain("supabase db push --linked");
    expect(deployJob).toContain(
      "Remote migrations, exact deployed function revisions, live authentication contracts, scheduler health, push configuration, and production CORS were verified",
    );
  });

  it("runs the post-deploy Supabase proof only after a real backend deployment", () => {
    const classifyJob = workflowJob(
      generalizedBackendWorkflow,
      "classify-backend-deployment",
      "exact-deployment-proof",
    );
    const exactProofJob = workflowJob(generalizedBackendWorkflow, "exact-deployment-proof");

    expect(generalizedBackendWorkflow).toContain("actions: read");
    expect(classifyJob).toContain("github.rest.actions.listJobsForWorkflowRun");
    expect(classifyJob).toContain('job.name === "deploy"');
    expect(classifyJob).toContain('job.conclusion === "success"');
    expect(exactProofJob).toContain("needs: classify-backend-deployment");
    expect(exactProofJob).toContain("needs.classify-backend-deployment.outputs.deployed == 'true'");
  });

  it("builds the PR frontend without administrative credentials", () => {
    const configJob = workflowJob(
      cloudflareWorkflow,
      "resolve-public-config",
      "build-production-artifact",
    );
    const buildJob = workflowJob(
      cloudflareWorkflow,
      "build-production-artifact",
      "deploy-production-artifact",
    );

    expect(configJob).not.toContain("actions/checkout");
    expect(configJob).toContain("octagon-public-config.env");
    expect(configJob).toContain("actions/upload-artifact@v4");
    expect(configJob).not.toContain("$GITHUB_OUTPUT");
    expect(buildJob).toContain("ref: ${{ env.SOURCE_SHA }}");
    expect(buildJob).toContain("name: octagon-public-config-${{ github.run_id }}");
    expect(buildJob).toContain('. "$config_file"');
    expect(buildJob).toContain("npm ci --silent --no-audit --no-fund");
    expect(buildJob).toContain('"public/deployment.json"');
    expect(buildJob).toContain("actions/upload-artifact@v4");
    expect(buildJob).not.toContain("CLOUDFLARE_API_TOKEN");
    expect(buildJob).not.toContain("CLOUDFLARE_ACCOUNT_ID");
    expect(buildJob).not.toContain("SUPABASE_ACCESS_TOKEN");
  });

  it("deploys only the verified artifact with trusted configuration and tooling", () => {
    const deployJob = workflowJob(cloudflareWorkflow, "deploy-production-artifact");

    expect(deployJob).toContain("ref: ${{ env.TRUSTED_WORKFLOW_SHA }}");
    expect(deployJob).toContain("TRUSTED_WORKFLOW_SHA: ${{ github.workflow_sha }}");
    expect(deployJob).toContain("actions/download-artifact@v4");
    expect(deployJob).toContain("Install trusted Wrangler outside the application artifact");
    expect(deployJob).toContain('"$WRANGLER_BIN" deploy --config "$GITHUB_WORKSPACE/wrangler.jsonc"');
    expect(deployJob).toContain("dist/deployment.json");
    expect(deployJob).toContain("marker.sha !== expectedSha");
    expect(deployJob).toContain("node scripts/verify-live-frontend-delivery.mjs");
    expect(deployJob).toContain("Download verified public browser configuration");
    expect(deployJob).not.toContain("npm run build");
    expect(deployJob).not.toContain("ref: ${{ env.SOURCE_SHA }}");
  });
});
