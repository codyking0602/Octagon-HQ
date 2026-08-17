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
    expect(workflow).toContain('"https://api.github.com/repos/$REPOSITORY/statuses/$DEPLOYMENT_SHA"');
    expect(workflow).toContain("--retry 5");
    expect(workflow).toContain("--retry-all-errors");
    expect(workflow).toContain("--retry-delay 2");
    expect(workflow).toContain('context_name="octagon/frontend-live"');
    expect(workflow).toContain('context_name="octagon/backend-live"');
  });
});
