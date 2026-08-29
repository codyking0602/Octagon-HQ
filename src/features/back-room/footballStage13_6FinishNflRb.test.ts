import { describe, expect, it } from "vitest";

import { getFootballFact } from "./footballFactualStats";
import { footballLedgerAudit } from "./footballLedgerAudit";

describe("Football Ledger Stage 13.6 NFL RB factual closeout", () => {
  it("closes every NFL RB factual-readiness gap through the canonical PFR rushing owner", () => {
    expect(getFootballFact("nfl-bronko-nagurski", "nfl-career-rushing-yards")?.fact.value).toBe(2778);
    expect(getFootballFact("nfl-doak-walker", "nfl-career-rushing-touchdowns")?.fact.value).toBe(12);
    expect(getFootballFact("nfl-frank-gifford", "nfl-career-rushing-attempts")?.fact.value).toBe(840);
    expect(getFootballFact("nfl-harold-red-grange", "nfl-career-rushing-touchdowns")?.fact.value).toBe(21);
    expect(getFootballFact("nfl-jim-thorpe", "nfl-career-rushing-touchdowns")?.fact.value).toBe(6);
    expect(getFootballFact("nfl-oj-simpson", "nfl-career-rushing-yards")?.fact.value).toBe(11236);
    expect(getFootballFact("nfl-paul-hornung", "nfl-career-rushing-touchdowns")?.fact.value).toBe(50);
    expect(getFootballFact("nfl-floyd-little", "nfl-career-rushing-yards")?.fact.value).toBe(6323);
    expect(getFootballFact("nfl-larry-csonka", "nfl-career-rushing-yards")?.fact.value).toBe(8081);

    const nflRbRows = footballLedgerAudit.rows.filter((row) => row.league === "NFL" && row.pool === "RB");
    expect(nflRbRows).toHaveLength(179);
    expect(nflRbRows.every((row) => row.readiness === "Full")).toBe(true);
    expect(nflRbRows.every((row) => row.missing.length === 0)).toBe(true);
  });
});
