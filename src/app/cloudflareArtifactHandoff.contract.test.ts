import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy-cloudflare.yml", "utf8");

describe("Cloudflare production artifact handoff", () => {
  it("preserves and verifies the hidden assets ignore file before Wrangler deploys", () => {
    expect(workflow).toContain("include-hidden-files: true");
    expect(workflow).toContain("test -f dist/.assetsignore");
    expect(workflow).toContain('grep -Fxq "_worker.js" dist/.assetsignore');
  });

  it("uses the canonical live-shell verifier instead of racing every lazy chunk", () => {
    expect(workflow).toContain("scripts/verify-live-frontend-delivery.mjs");
    expect(workflow).toContain("node scripts/verify-live-frontend-delivery.mjs");
    expect(workflow).toContain("FRONTEND_DELIVERY_ATTEMPTS: 36");
    expect(workflow).not.toContain("for local_asset in dist/assets/*.js");
    expect(workflow).not.toContain("still resolves to the SPA fallback");
  });
});
