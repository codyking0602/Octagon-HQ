import { describe, expect, it } from "vitest";

import { getFootballFact } from "./footballFactualStats";
import { footballLedgerAudit } from "./footballLedgerAudit";

describe("Football Ledger Stage 13.6 CFB DL hydration", () => {
  it("hydrates Aaron Donald and Jadeveon Clowney through the canonical factual owner", () => {
    expect(getFootballFact("cfb-aaron-donald", "cfb-best-season-sacks")?.fact.value).toBe(11);
    expect(getFootballFact("cfb-aaron-donald", "cfb-best-season-tackles-for-loss")?.fact.value).toBe(28.5);
    expect(getFootballFact("cfb-jadeveon-clowney", "cfb-best-season-sacks")?.fact.value).toBe(13);
    expect(getFootballFact("cfb-jadeveon-clowney", "cfb-best-season-tackles-for-loss")?.fact.value).toBe(23.5);

    for (const subjectId of ["cfb-aaron-donald", "cfb-jadeveon-clowney"] as const) {
      const row = footballLedgerAudit.rows.find((candidate) => candidate.subjectId === subjectId);
      expect(row, subjectId).toBeDefined();
      expect(row?.readiness).toBe("Full");
      expect(row?.missing).toEqual([]);
    }
  });
});
