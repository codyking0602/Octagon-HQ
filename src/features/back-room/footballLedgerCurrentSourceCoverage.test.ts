import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";

describe("Football Ledger current normalized source coverage", () => {
  it("has no materially incomplete A-C player whose full career is inside the normalized source window", () => {
    expect(footballLedgerAudit.inSourceWindowFactGaps).toEqual([]);
  });
});
