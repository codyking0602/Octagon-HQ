import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/verify-live-rich-previews.yml", "utf8");
const verifier = readFileSync("scripts/verify-live-rich-previews.mjs", "utf8");

describe("live rich preview proof", () => {
  it("runs only after a successful production-main frontend deployment", () => {
    expect(workflow).toContain("workflow_run:");
    expect(workflow).toContain("Deploy Cloudflare Frontend");
    expect(workflow).toContain("workflow_run.conclusion == 'success'");
    expect(workflow).toContain("workflow_run.event == 'push'");
    expect(workflow).toContain("workflow_run.head_branch == 'main'");
    expect(workflow).toContain("ref: ${{ env.EXPECTED_SOURCE_SHA }}");
  });

  it("checks real crawler metadata and exact PNG dimensions", () => {
    expect(verifier).toContain("facebookexternalhit/1.1");
    expect(verifier).toContain('kind: "fighter"');
    expect(verifier).toContain('kind: "comparison"');
    expect(verifier).toContain('kind: "challenge"');
    expect(verifier).toContain("x-octagon-preview");
    expect(verifier).toContain("x-octagon-preview-image");
    expect(verifier).toContain("readUInt32BE(16)");
    expect(verifier).toContain("readUInt32BE(20)");
    expect(verifier).toContain("width !== 1200 || height !== 630");
  });
});
