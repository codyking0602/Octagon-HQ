import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";

describe("Football Ledger Stage 13.6 NFL QB factual closeout", () => {
  it("requires every canonical NFL QB to be factually ready", () => {
    const rows = footballLedgerAudit.rows.filter((row) => row.league === "NFL" && row.pool === "QB");
    expect(rows).toHaveLength(133);
    expect(rows.every((row) => row.readiness === "Full")).toBe(true);
    expect(rows.flatMap((row) => row.missing)).toEqual([]);
  });
});
