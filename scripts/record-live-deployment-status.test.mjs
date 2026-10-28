import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  resolve(process.cwd(), ".github/workflows/record-live-deployment-status.yml"),
  "utf8",
);

describe("live deployment status recorder", () => {
  it("records exact deployment statuses without a downloadable action dependency and retries transient GitHub API failures", () => {
    expect(workflow).not.toContain("actions/github-script");
    expect(workflow).toContain('status_api="https://api.github.com/repos/$REPOSITORY/statuses/$DEPLOYMENT_SHA"');
    expect(workflow).toContain("--retry 5");
    expect(workflow).toContain("--retry-all-errors");
    expect(workflow).toContain("--retry-delay 2");
    expect(workflow).toContain('context_name="octagon/frontend-live"');
    expect(workflow).toContain('context_name="octagon/backend-live"');
  });

  it("confirms the exact recorded status before accepting an unavailable POST response", () => {
    expect(workflow).toContain('statuses=$(curl "${common_curl[@]}" "$status_api")');
    expect(workflow).toContain('status?.context === expected.context');
    expect(workflow).toContain('status?.state === expected.state');
    expect(workflow).toContain('status?.target_url === expected.targetUrl');
    expect(workflow).toContain('throw new Error(`GitHub did not record the exact ${expected.context} status.`)');
  });
});
