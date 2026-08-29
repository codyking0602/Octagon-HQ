import { describe, expect, it } from "vitest";

import { getFootballFact } from "./footballFactualStats";
import { footballLedgerAudit } from "./footballLedgerAudit";

const HISTORICAL_RECEIVERS = [
  "nfl-don-hutson",
  "nfl-raymond-berry",
  "nfl-art-monk",
  "nfl-bob-hayes",
  "nfl-charley-taylor",
  "nfl-charlie-joiner",
  "nfl-cliff-branch",
  "nfl-don-maynard",
  "nfl-drew-pearson",
  "nfl-fred-biletnikoff",
] as const;

describe("Football Ledger Stage 13.6 historical NFL WR factual hydration", () => {
  it("hydrates the reviewed historical WR batch through the canonical PFR factual owner", () => {
    expect(getFootballFact("nfl-don-hutson", "nfl-career-receiving-yards")?.fact.value).toBe(7991);
    expect(getFootballFact("nfl-raymond-berry", "nfl-career-receptions")?.fact.value).toBe(631);
    expect(getFootballFact("nfl-art-monk", "nfl-career-receiving-touchdowns")?.fact.value).toBe(68);
    expect(getFootballFact("nfl-fred-biletnikoff", "nfl-career-receiving-yards")?.fact.value).toBe(8974);

    for (const subjectId of HISTORICAL_RECEIVERS) {
      const row = footballLedgerAudit.rows.find((candidate) => candidate.subjectId === subjectId);
      expect(row, subjectId).toBeDefined();
      expect(row?.pool).toBe("WR");
      expect(row?.readiness).toBe("Full");
      expect(row?.missing).toEqual([]);
    }
  });
});
