import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const liveProof = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

describe("live Picks monitoring proof", () => {
  it("verifies the visible compact owner workflow instead of hidden or retired controls", () => {
    expect(liveProof).toContain('name: "Review only what changed"');
    expect(liveProof).toContain('name: "REFRESH STATUS"');
    expect(liveProof).toContain('"MONITORING UNAVAILABLE"');
    expect(liveProof).not.toContain("Check now or refresh the ledger");
    expect(liveProof).not.toContain('name: "CHECK NOW"');
    expect(liveProof).not.toContain('"INBOX UNAVAILABLE"');
  });
});
