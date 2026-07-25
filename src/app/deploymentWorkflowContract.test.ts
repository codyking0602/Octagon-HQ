import cloudflareWorkflow from "../../.github/workflows/deploy-cloudflare.yml?raw";
import brokerWorkflow from "../../.github/workflows/deploy-pr-head.yml?raw";
import supabaseWorkflow from "../../.github/workflows/deploy-supabase.yml?raw";
import { describe, expect, it } from "vitest";

function workflowJob(source: string, start: string, end?: string) {
  const afterStart = source.split(`  ${start}:`)[1];
  if (!afterStart) throw new Error(`Missing workflow job: ${start}`);
  return end ? afterStart.split(`  ${end}:`)[0] : afterStart;
}

describe("feature deployment workflow contract", () => {
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

  it("keeps Supabase deployment in its canonical exact-SHA owner", () => {
    expect(supabaseWorkflow).toContain("workflow_call:");
    expect(supabaseWorkflow).toContain("branches:\n      - main");
    expect(supabaseWorkflow).toContain("ref: ${{ env.SOURCE_SHA }}");
    expect(supabaseWorkflow).toContain("checked_out_sha=$(git rev-parse HEAD)");
    expect(supabaseWorkflow).toContain("pr.head.sha !== expectedSha");
    expect(supabaseWorkflow).toContain("supabase db push --linked");
    expect(supabaseWorkflow).toContain("Remote migrations, live function contract, and production CORS were verified");
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
    expect(buildJob).toContain("ref: ${{ env.SOURCE_SHA }}");
    expect(buildJob).toContain("npm ci --silent --ignore-scripts");
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
    expect(deployJob).toContain("/deployment.json?deployment=${SOURCE_SHA}");
    expect(deployJob).toContain("marker.sha !== expectedSha");
    expect(deployJob).not.toContain("npm run build");
    expect(deployJob).not.toContain("ref: ${{ env.SOURCE_SHA }}");
  });
});
