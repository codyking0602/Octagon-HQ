import { describe, expect, it } from "vitest";

import { getFootballFactualRecord } from "./footballFactualStatsCore";
import { footballLedgerAudit } from "./footballLedgerAudit";
import { getFootballSubject } from "./footballSubjectRegistry";

const KAREEM_HUNT_CFB_ID = "cfbfast-r-player-552745-kareem-hunt";

describe("Football Ledger current normalized source coverage", () => {
  it("has no materially incomplete A-C player whose full career is inside the normalized source window", () => {
    if (footballLedgerAudit.inSourceWindowFactGaps.length) {
      console.log("CURRENT_SOURCE_GAPS", JSON.stringify(footballLedgerAudit.inSourceWindowFactGaps.map((row) => ({
        ...row,
        subject: getFootballSubject(row.subjectId),
        facts: getFootballFactualRecord(row.subjectId)?.facts ?? [],
      })), null, 2));
    }
    expect(footballLedgerAudit.inSourceWindowFactGaps).toEqual([]);
  });

  it("keeps Kareem Hunt's canonical CFB identity tied to sourced rushing production", () => {
    const subject = getFootballSubject(KAREEM_HUNT_CFB_ID);
    const facts = getFootballFactualRecord(KAREEM_HUNT_CFB_ID)?.facts ?? [];
    expect(subject?.league).toBe("CFB");
    expect(subject?.position).toBe("RB");
    expect(facts.some((fact) => fact.metricId === "cfb-career-rushing-yards")).toBe(true);
    expect(facts.some((fact) => fact.metricId === "cfb-career-rushing-touchdowns")).toBe(true);
  });
});