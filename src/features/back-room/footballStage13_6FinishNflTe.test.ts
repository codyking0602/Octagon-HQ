import { describe, expect, it } from "vitest";

import { getFootballFact } from "./footballFactualStats";
import { footballLedgerAudit } from "./footballLedgerAudit";

const HISTORICAL_TIGHT_END_NAMES = [
  "John Mackey",
  "Charlie Sanders",
  "Dave Casper",
  "Jackie Smith",
  "Mike Ditka",
] as const;

describe("Football Ledger Stage 13.6 NFL TE factual hydration", () => {
  it("closes every NFL TE factual-readiness gap through the canonical PFR receiving owner", () => {
    expect(getFootballFact("nfl-john-mackey", "nfl-career-receiving-yards")?.fact.value).toBe(5236);
    expect(getFootballFact("nfl-charlie-sanders", "nfl-career-receptions")?.fact.value).toBe(336);
    expect(getFootballFact("nfl-dave-casper", "nfl-career-receiving-touchdowns")?.fact.value).toBe(52);
    expect(getFootballFact("nfl-jackie-smith", "nfl-career-receiving-yards")?.fact.value).toBe(7918);
    expect(getFootballFact("mike-ditka", "nfl-career-receptions")?.fact.value).toBe(427);

    for (const name of HISTORICAL_TIGHT_END_NAMES) {
      const row = footballLedgerAudit.rows.find((candidate) => candidate.league === "NFL" && candidate.name === name);
      expect(row, name).toBeDefined();
      expect(row?.pool).toBe("TE");
      expect(row?.readiness).toBe("Full");
      expect(row?.missing).toEqual([]);
    }

    const nflTeRows = footballLedgerAudit.rows.filter((row) => row.league === "NFL" && row.pool === "TE");
    expect(nflTeRows).toHaveLength(74);
    expect(nflTeRows.every((row) => row.readiness === "Full")).toBe(true);
  });
});
