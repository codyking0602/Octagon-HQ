import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const verifier = readFileSync("scripts/verify-live-auction-release.mjs", "utf8");

describe("Auction live release verifier contract", () => {
  it("uses the canonical participant role for a sent Auction", () => {
    expect(verifier).toContain('stateB.action_required_by !== "recipient"');
    expect(verifier).not.toContain('stateB.action_required_by !== "current_user"');
  });
});
