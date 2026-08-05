import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const liveProof = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

describe("live Picks monitoring proof", () => {
  it("verifies the compact owner workflow instead of the retired ledger", () => {
    expect(liveProof).toContain('name: "Review only what changed"');
    expect(liveProof).toContain('name: "CHECK NOW"');
    expect(liveProof).toContain('"MONITORING UNAVAILABLE"');
    expect(liveProof).not.toContain("Check now or refresh the ledger");
    expect(liveProof).not.toContain('"INBOX UNAVAILABLE"');
  });
});
