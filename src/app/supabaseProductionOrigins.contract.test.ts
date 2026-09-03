import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const deployWorkflow = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
const pinAuth = readFileSync("supabase/functions/pin-auth/index.ts", "utf8");
const syncDeploymentVerifier = readFileSync("scripts/verify-sync-function-deployment.mjs", "utf8");
const monitoringDeploymentVerifier = readFileSync("scripts/verify-monitoring-function-deployment.mjs", "utf8");

const canonicalOrigin = "https://the.hq-app.workers.dev";
const compatibilityOrigin = "https://octagon.hq-app.workers.dev";

describe("Supabase production origin ownership", () => {
  it("publishes The HQ as the canonical production origin", () => {
    expect(deployWorkflow).toContain(
      `OCTAGON_PRODUCTION_ORIGIN: ${canonicalOrigin}`,
    );
    expect(deployWorkflow).toContain(
      'OCTAGON_APP_ORIGIN="$OCTAGON_PRODUCTION_ORIGIN"',
    );
  });

  it("keeps the prior Octagon HQ URL as the one compatibility origin in the existing PIN/CORS owner", () => {
    expect(pinAuth).toContain(
      `const legacyProductionOrigin = "${compatibilityOrigin}";`,
    );
    expect(pinAuth).toContain(
      "requestOrigin === canonicalOrigin || requestOrigin === legacyProductionOrigin",
    );
    expect(pinAuth).toContain(
      'const canonicalOrigin = Deno.env.get("OCTAGON_APP_ORIGIN") ?? legacyProductionOrigin;',
    );
  });

  it("verifies UFC Picks backend functions against the canonical The HQ origin instead of the PIN compatibility origin", () => {
    for (const verifier of [syncDeploymentVerifier, monitoringDeploymentVerifier]) {
      expect(verifier).toContain(
        `const productionOrigin = "${canonicalOrigin}";`,
      );
      expect(verifier).not.toContain(
        "process.env.OCTAGON_PRODUCTION_ORIGIN",
      );
    }
  });
});
