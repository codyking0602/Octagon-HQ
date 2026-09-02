import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const canonicalWrangler = readFileSync("wrangler.jsonc", "utf8");
const legacyWrangler = readFileSync("wrangler.legacy-redirect.jsonc", "utf8");
const legacyWorker = readFileSync("worker/legacyOctagonRedirect.ts", "utf8");
const legacyWorkflow = readFileSync(
  ".github/workflows/deploy-cloudflare-legacy-redirect.yml",
  "utf8",
);

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

  it("keeps GitHub Actions as the only deployment owner for the compatibility endpoint", () => {
    expect(legacyWorkflow).toContain('LEGACY_ORIGIN: https://octagon.hq-app.workers.dev');
    expect(legacyWorkflow).toContain('CANONICAL_ORIGIN: https://the.hq-app.workers.dev');
    expect(legacyWorkflow).toContain('--config "$GITHUB_WORKSPACE/wrangler.legacy-redirect.jsonc"');
    expect(legacyWorkflow).toContain('status" = "308"');
    expect(legacyWorkflow).not.toContain("npm run build");
    expect(legacyWorkflow).not.toContain("dist/");
  });
});
