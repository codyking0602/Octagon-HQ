import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const setupPage = readFileSync("src/features/picks-setup/PicksSetupPage.tsx", "utf8");
const liveProof = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");
const backendWorkflow = readFileSync(".github/workflows/verify-supabase-backend.yml", "utf8");

describe("Event Setup live verification contract", () => {
  it("targets the canonical UFC.com source field instead of the retired MMA Mania field", () => {
    const sourceLabel = "UFC.COM EVENT URL (OPTIONAL)";

    expect(setupPage).toContain(`aria-label="${sourceLabel}"`);
    expect(liveProof).toContain(`getByLabel("${sourceLabel}")`);
    expect(liveProof).not.toContain("MMA MANIA CARD URL");
  });

  it("keeps backend deployment identity in the canonical live Supabase verification lane", () => {
    expect(backendWorkflow).toContain("Verify exact deployed UFC sync source");
    expect(backendWorkflow).toContain("node scripts/verify-sync-function-deployment.mjs");
    expect(liveProof).not.toContain("WebKit Event Setup backend SHA mismatch");
  });
});
