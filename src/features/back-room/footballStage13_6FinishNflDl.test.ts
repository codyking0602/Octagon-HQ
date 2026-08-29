import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";
import { getFootballSubject } from "./footballSubjectRegistry";

describe("Football Ledger Stage 13.6 NFL DL factual closeout", () => {
  it("keeps one canonical Joe Greene identity and closes every NFL DL factual gap", () => {
    const rows = footballLedgerAudit.rows.filter((row) => row.league === "NFL" && row.pool === "DL / EDGE");
    expect(rows).toHaveLength(321);
    expect(rows.every((row) => row.readiness === "Full")).toBe(true);
    expect(rows.flatMap((row) => row.missing)).toEqual([]);

    const joeGreeneRows = rows.filter((row) => row.name === "Joe Greene" || row.name === "Mean Joe Greene");
    expect(joeGreeneRows).toHaveLength(1);
    expect(joeGreeneRows[0]?.subjectId).toBe("nfl-joe-greene");
    expect(joeGreeneRows[0]?.tier).toBe("A");

    expect(getFootballSubject("joe-greene")?.id).toBe("nfl-joe-greene");
  });
});
