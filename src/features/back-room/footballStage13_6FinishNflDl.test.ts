import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";

describe("Football Ledger Stage 13.6 NFL DL factual closeout", () => {
  it("closes every NFL DL factual gap with the Joe Greene duplicate reconciled", () => {
    const rows = footballLedgerAudit.rows.filter((row) => row.league === "NFL" && row.pool === "DL / EDGE");
    expect(rows).toHaveLength(321);
    expect(rows.every((row) => row.readiness === "Full")).toBe(true);
    expect(rows.filter((row) => row.readiness !== "Full")).toEqual([]);

    const joeGreeneRows = rows.filter((row) => row.subjectId === "joe-greene" || row.subjectId === "nfl-joe-greene");
    expect(joeGreeneRows).toHaveLength(1);
    expect(joeGreeneRows[0]).toMatchObject({
      subjectId: "joe-greene",
      name: "Joe Greene",
      readiness: "Full",
      missing: [],
    });
  });
});
