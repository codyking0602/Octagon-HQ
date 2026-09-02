import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const canonicalWrangler = readFileSync("wrangler.jsonc", "utf8");
const legacyWrangler = readFileSync("wrangler.legacy-redirect.jsonc", "utf8");
const legacyWorker = readFileSync("worker/legacyOctagonRedirect.ts", "utf8");
const canonicalWorkflow = readFileSync(".github/workflows/deploy-cloudflare.yml", "utf8");

describe("legacy Octagon workers.dev compatibility", () => {
  it("keeps The HQ as the only application Worker", () => {
    expect(canonicalWrangler).toContain('"name": "the"');
    expect(canonicalWrangler).not.toContain('"name": "octagon"');

    expect(legacyWrangler).toContain('"name": "octagon"');
    expect(legacyWrangler).toContain('"main": "./worker/legacyOctagonRedirect.ts"');
    expect(legacyWrangler).toContain('"workers_dev": true');
    expect(legacyWrangler).not.toContain('"assets"');
    expect(legacyWrangler).not.toContain('"browser"');
    expect(legacyWrangler).not.toContain('"services"');
  });

  it("allows the legacy Worker to redirect only to the canonical host", () => {
    expect(legacyWorker).toContain('const CANONICAL_HOSTNAME = "the.hq-app.workers.dev"');
    expect(legacyWorker).toContain("LEGACY_REDIRECT_STATUS = 308");
    expect(legacyWorker).not.toContain("ASSETS");
    expect(legacyWorker).not.toContain("SUPABASE");
  });

  it("keeps the canonical Cloudflare workflow as the only frontend deployment owner", () => {
    expect(existsSync(".github/workflows/deploy-cloudflare-legacy-redirect.yml")).toBe(false);
    expect(canonicalWorkflow).toContain('OCTAGON_LEGACY_URL: https://octagon.hq-app.workers.dev');
    expect(canonicalWorkflow).toContain('OCTAGON_PRODUCTION_URL: https://the.hq-app.workers.dev');
    expect(canonicalWorkflow).toContain('wrangler.legacy-redirect.jsonc');
    expect(canonicalWorkflow).toContain("if: env.SOURCE_PR_NUMBER == '0' && github.ref == 'refs/heads/main'");
    expect(canonicalWorkflow).toContain('"$status" = "308"');
    expect(canonicalWorkflow).toContain("Deploy redirect-only legacy Octagon Worker");
  });
});
