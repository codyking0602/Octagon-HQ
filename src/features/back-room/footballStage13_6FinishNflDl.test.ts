import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";

describe("Football Ledger Stage 13.6 NFL DL factual closeout", () => {
  it("closes every distinct NFL DL factual gap while isolating the known Joe Greene recognition duplicate", () => {
    const rows = footballLedgerAudit.rows.filter((row) => row.league === "NFL" && row.pool === "DL / EDGE");
    expect(rows).toHaveLength(322);

    const partialRows = rows.filter((row) => row.readiness !== "Full");
    expect(partialRows).toHaveLength(1);
    expect(partialRows[0]?.subjectId).toBe("joe-greene");
    expect(partialRows[0]?.name).toBe("Mean Joe Greene");
    expect(partialRows[0]?.missing).toEqual(["DL/EDGE disruption facts"]);

    expect(rows.filter((row) => row.readiness === "Full")).toHaveLength(321);
  });
});
