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

  it("reuses locked frontend and trusted Wrangler setup without crossing the deployment credential boundary", () => {
    expect(workflow).toContain("Set up Node and npm cache");
    expect(workflow).toContain("node-version: 22");
    expect(workflow).toContain("cache: npm");
    expect(workflow).toContain("cache-dependency-path: package-lock.json");
    expect(workflow).toContain("npm ci --silent --no-audit --no-fund");
    expect(workflow).toContain("WRANGLER_VERSION: 4.123.0");
    expect(workflow).toContain("uses: actions/cache@v4");
    expect(workflow).toContain("path: ${{ runner.temp }}/octagon-wrangler");
    expect(workflow).toContain("if: steps.wrangler-cache.outputs.cache-hit != 'true'");
    expect(workflow).toContain('"wrangler@$WRANGLER_VERSION"');
    expect(workflow).toContain('test -x "$wrangler_bin"');
    expect(workflow).toContain('"$WRANGLER_BIN" deploy --config "$GITHUB_WORKSPACE/wrangler.jsonc"');
  });
});
