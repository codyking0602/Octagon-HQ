import { describe, expect, it } from "vitest";

import { getFootballFact } from "./footballFactualStatsCore";
import { footballLedgerAudit } from "./footballLedgerAudit";

const historicalCoaches = [
  ["bear-bryant", 323, 85, 17, 6],
  ["woody-hayes", 205, 61, 10, 5],
  ["tom-osborne", 255, 49, 3, 3],
  ["barry-switzer", 157, 29, 4, 3],
] as const;

describe("Football Knowledge Ledger Stage 13.6 factual exhaustion", () => {
  it("makes the researched historical CFB coach slice fully factual-ready", () => {
    for (const [subjectId, wins, losses, ties, titles] of historicalCoaches) {
      const row = footballLedgerAudit.rows.find((candidate) => candidate.subjectId === subjectId);
      expect(row, subjectId).toBeDefined();
      expect(row!.readiness, subjectId).toBe("Full");
      expect(row!.missing, subjectId).toEqual([]);

      expect(getFootballFact(subjectId, "cfb-coach-career-wins")?.fact.value).toBe(wins);
      expect(getFootballFact(subjectId, "cfb-coach-career-losses")?.fact.value).toBe(losses);
      expect(getFootballFact(subjectId, "cfb-coach-career-ties")?.fact.value).toBe(ties);
      expect(getFootballFact(subjectId, "cfb-coach-national-titles")?.fact.value).toBe(titles);
    }
  });
});
