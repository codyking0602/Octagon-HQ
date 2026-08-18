import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const setupPage = readFileSync("src/features/picks-setup/PicksSetupPage.tsx", "utf8");
const liveProof = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

describe("Event Setup live verification contract", () => {
  it("targets the canonical UFC.com source field instead of the retired MMA Mania field", () => {
    const sourceLabel = "UFC.COM EVENT URL (OPTIONAL)";

    expect(setupPage).toContain(`aria-label="${sourceLabel}"`);
    expect(liveProof).toContain(`getByLabel("${sourceLabel}")`);
    expect(liveProof).not.toContain("MMA MANIA CARD URL");
  });
});
