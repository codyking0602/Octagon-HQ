import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const deployWorkflow = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
const pinAuth = readFileSync("supabase/functions/pin-auth/index.ts", "utf8");

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
});
