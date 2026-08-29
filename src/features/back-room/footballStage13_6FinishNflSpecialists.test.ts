import { describe, expect, it } from "vitest";

import { getFootballFact } from "./footballFactualStats";
import { footballLedgerAudit } from "./footballLedgerAudit";

describe("Football Ledger Stage 13.6 NFL specialist factual hydration", () => {
  it("closes every NFL K/P factual-readiness gap through the canonical specialist owner", () => {
    expect(getFootballFact("nfl-jan-stenerud", "nfl-career-field-goals-made")?.fact.value).toBe(373);
    expect(getFootballFact("nfl-jan-stenerud", "nfl-career-field-goals-attempted")?.fact.value).toBe(558);
    expect(getFootballFact("nfl-mark-moseley", "nfl-career-field-goals-made")?.fact.value).toBe(300);
    expect(getFootballFact("nfl-ray-guy", "nfl-career-punts")?.fact.value).toBe(1049);
    expect(getFootballFact("nfl-ray-guy", "nfl-career-punting-yards")?.fact.value).toBe(44493);
    expect(getFootballFact("pat-mcafee", "nfl-career-punts")?.fact.value).toBe(575);
    expect(getFootballFact("pat-mcafee", "nfl-career-punting-yards")?.fact.value).toBe(26653);

    const specialistRows = footballLedgerAudit.rows.filter((row) => row.league === "NFL" && row.pool === "K / P");
    expect(specialistRows).toHaveLength(19);
    expect(specialistRows.every((row) => row.readiness === "Full")).toBe(true);
    expect(specialistRows.every((row) => row.missing.length === 0)).toBe(true);
  });
});
