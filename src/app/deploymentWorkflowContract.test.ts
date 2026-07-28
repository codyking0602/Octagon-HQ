import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy-cloudflare-v2.yml", "utf8");
const brokerWorkflow = readFileSync(".github/workflows/deploy-supabase-from-pr.yml", "utf8");
const supabaseWorkflow = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");

function workflowJob(source: string, start: string, end?: string) {
  const startIndex = source.indexOf(`${start}:`);
  if (startIndex < 0) return "";
  const endIndex = end ? source.indexOf(`${end}:`, startIndex) : -1;
  return source.slice(startIndex, endIndex < 0 ? undefined : endIndex);
}

describe("feature deployment workflow contract", () => {
  it("keeps the label broker credential-free and delegates only a frozen SHA", () => {
    expect(brokerWorkflow).toContain("types: [labeled]");
    expect(brokerWorkflow).toContain('github.event.label.name == \'deploy-backend\'');
    expect(brokerWorkflow).toContain("uses: ./.github/workflows/deploy-supabase.yml");
    expect(brokerWorkflow).toContain("source_sha:");
    expect(brokerWorkflow).toContain("pr.head.sha");
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
    expect(supabaseWorkflow).toContain(
      "Remote migrations, exact deployed function revisions, live authentication contracts, scheduler health, and production CORS were verified",
    );
  });

  it("builds the PR frontend without administrative credentials", () => {
    const configJob = workflowJob(
      workflow,
      "resolve-public-config",
      "build-production-artifact",
    );
    const buildJob = workflowJob(
      workflow,
      "build-production-artifact",
      "deploy-v2",
    );
    expect(configJob).toContain("SUPABASE_ACCESS_TOKEN");
    expect(configJob).toContain("SUPABASE_PROJECT_ID");
    expect(configJob).toContain("public-config.env");
    expect(configJob).toContain("retention-days: 1");
    expect(buildJob).toContain("needs: resolve-public-config");
    expect(buildJob).toContain("download-artifact");
    expect(buildJob).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(buildJob).not.toContain("SUPABASE_PROJECT_ID");
    expect(buildJob).not.toContain("SUPABASE_DB_PASSWORD");
  });

  it("keeps the deploy job limited to a verified artifact and Worker credentials", () => {
    const deployJob = workflowJob(workflow, "deploy-v2", "verify-deployment");
    expect(deployJob).toContain("needs: build-production-artifact");
    expect(deployJob).toContain("CF_API_TOKEN");
    expect(deployJob).toContain("CF_ACCOUNT_ID");
    expect(deployJob).toContain("wrangler deploy --config wrangler.v2.jsonc");
    expect(deployJob).not.toContain("npm ci");
    expect(deployJob).not.toContain("npm run build");
    expect(deployJob).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(deployJob).not.toContain("SUPABASE_PROJECT_ID");
    expect(deployJob).not.toContain("SUPABASE_DB_PASSWORD");
  });

  it("verifies production separately after deployment", () => {
    const verifyJob = workflowJob(workflow, "verify-deployment");
    expect(verifyJob).toContain("needs: deploy-v2");
    expect(verifyJob).toContain("verify-v2-deployment.mjs");
    expect(verifyJob).not.toContain("SUPABASE_ACCESS_TOKEN");
    expect(verifyJob).not.toContain("SUPABASE_PROJECT_ID");
    expect(verifyJob).not.toContain("SUPABASE_DB_PASSWORD");
  });
});
