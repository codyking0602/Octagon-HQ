import { describe, expect, it } from "vitest";

import { getFootballFact } from "./footballFactualStats";
import { footballLedgerAudit } from "./footballLedgerAudit";

const REMAINING_HISTORICAL_WR = [
  "nfl-harold-carmichael",
  "nfl-james-lofton",
  "nfl-john-stallworth",
  "nfl-lance-alworth",
  "nfl-lynn-swann",
  "nfl-paul-warfield",
  "nfl-sterling-sharpe",
  "nfl-steve-largent",
] as const;

describe("Football Ledger Stage 13.6 NFL WR pool closeout", () => {
  it("closes every remaining NFL WR factual-readiness gap through the canonical PFR owner", () => {
    expect(getFootballFact("nfl-harold-carmichael", "nfl-career-receiving-yards")?.fact.value).toBe(8985);
    expect(getFootballFact("nfl-james-lofton", "nfl-career-receptions")?.fact.value).toBe(764);
    expect(getFootballFact("nfl-sterling-sharpe", "nfl-career-receiving-touchdowns")?.fact.value).toBe(65);
    expect(getFootballFact("nfl-steve-largent", "nfl-career-receiving-yards")?.fact.value).toBe(13089);

    for (const subjectId of REMAINING_HISTORICAL_WR) {
      const row = footballLedgerAudit.rows.find((candidate) => candidate.subjectId === subjectId);
      expect(row, subjectId).toBeDefined();
      expect(row?.pool).toBe("WR");
      expect(row?.readiness).toBe("Full");
      expect(row?.missing).toEqual([]);
    }

    const nflWrRows = footballLedgerAudit.rows.filter((row) => row.league === "NFL" && row.pool === "WR");
    expect(nflWrRows).toHaveLength(250);
    expect(nflWrRows.every((row) => row.readiness === "Full")).toBe(true);
  });
});
