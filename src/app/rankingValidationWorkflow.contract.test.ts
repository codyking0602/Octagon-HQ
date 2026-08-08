import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  ".github/workflows/validate-ranking-engine.yml",
  "utf8",
);

describe("ranking validation workflow", () => {
  it("validates and reports the exact final pull-request head", () => {
    expect(workflow).toContain("pull_request:");
    expect(workflow).toContain("- main");

    const exactHeadExpression =
      "${{ github.event.pull_request.head.sha || github.sha }}";

    expect(workflow).toContain(`ref: ${exactHeadExpression}`);
    expect(workflow).toContain(`COMMIT_SHA: ${exactHeadExpression}`);
    expect(workflow).toContain("ranking-engine/validate");
    expect(workflow).not.toContain('- "agent/**"');
  });
});
