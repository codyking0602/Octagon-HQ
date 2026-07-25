import cloudflareWorkflow from "../../.github/workflows/deploy-cloudflare.yml?raw";
import brokerWorkflow from "../../.github/workflows/deploy-pr-head.yml?raw";
import supabaseWorkflow from "../../.github/workflows/deploy-supabase.yml?raw";
import { describe, expect, it } from "vitest";

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

  it("keeps Cloudflare deployment and exact live verification in its canonical owner", () => {
    expect(cloudflareWorkflow).toContain("workflow_call:");
    expect(cloudflareWorkflow).toContain("branches:\n      - main");
    expect(cloudflareWorkflow).toContain("ref: ${{ env.SOURCE_SHA }}");
    expect(cloudflareWorkflow).toContain("npm ci --silent --ignore-scripts");
    expect(cloudflareWorkflow).toContain('"public/deployment.json"');
    expect(cloudflareWorkflow).toContain("/deployment.json?deployment=${SOURCE_SHA}");
    expect(cloudflareWorkflow).toContain("marker.sha !== expectedSha");
    expect(cloudflareWorkflow).toContain("npx wrangler deploy");
    expect(cloudflareWorkflow).toContain("All deployed production chunks were verified");
  });
});
