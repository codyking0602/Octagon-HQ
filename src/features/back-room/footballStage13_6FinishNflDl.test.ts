import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";

describe("Football Ledger Stage 13.6 NFL DL factual closeout", () => {
  it("requires every canonical NFL DL / EDGE subject to be factually ready", () => {
    const rows = footballLedgerAudit.rows.filter((row) => row.league === "NFL" && row.pool === "DL / EDGE");
    expect(rows).toHaveLength(322);
    expect(rows.every((row) => row.readiness === "Full")).toBe(true);
    expect(rows.flatMap((row) => row.missing)).toEqual([]);
  });
});
