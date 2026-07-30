import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy-cloudflare.yml", "utf8");

describe("Cloudflare production artifact handoff", () => {
  it("preserves and verifies the hidden assets ignore file before Wrangler deploys", () => {
    expect(workflow).toContain("include-hidden-files: true");
    expect(workflow).toContain("test -f dist/.assetsignore");
    expect(workflow).toContain('grep -Fxq "_worker.js" dist/.assetsignore');
  });
});
