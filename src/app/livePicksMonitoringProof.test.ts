import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const liveProof = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

describe("live Picks owner PIN proof", () => {
  it("keeps PIN authentication focused on owner access while monitoring has dedicated verification", () => {
    expect(liveProof).toContain('name: "Automatic monitoring and card review"');
    expect(liveProof).toContain("This workflow proves live PIN authentication and owner access.");
    expect(liveProof).toContain("do not make PIN authentication");
    expect(liveProof).not.toContain('name: "CHECK NOW"');
    expect(liveProof).not.toContain('name: "REFRESH STATUS"');
    expect(liveProof).not.toContain('"MONITORING UNAVAILABLE"');
    expect(liveProof).not.toContain("Check now or refresh the ledger");
    expect(liveProof).not.toContain('"INBOX UNAVAILABLE"');
  });
});