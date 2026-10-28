import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";
import {
  FOOTBALL_LEDGER_CENSUS_POOLS,
  footballLedgerCensus,
  footballLedgerCensusEndingSeasonFor,
  footballLedgerCensusEraFor,
  footballLedgerCensusEraFromActiveDecades,
} from "./footballLedgerCensus";

const TIERS = ["A", "B", "C"] as const;
const ERAS = ["historical", "middle", "modern", "unknown", "timeless"] as const;

describe("Football Knowledge Ledger canonical census", () => {
  it("reports every permanent pool separately for NFL and CFB", () => {
    expect(footballLedgerCensus.rows).toHaveLength(FOOTBALL_LEDGER_CENSUS_POOLS.length * 2);
    for (const league of ["NFL", "CFB"] as const) for (const pool of FOOTBALL_LEDGER_CENSUS_POOLS) {
      expect(footballLedgerCensus.rows.some((row) => row.league === league && row.pool === pool), `${league} ${pool}`).toBe(true);
    }
  });

  it("reconciles every era and tier cell exactly to the canonical Stage 13.5 audit", () => {
    for (const censusRow of footballLedgerCensus.rows) {
      const auditSummary = footballLedgerAudit.poolSummaries.find((row) => row.league === censusRow.league && row.pool === censusRow.pool);
      expect(auditSummary).toBeDefined();
      for (const tier of TIERS) {
        const eraTierTotal = ERAS.reduce((sum, era) => sum + censusRow.eras[era][tier], 0);
        expect(eraTierTotal, `${censusRow.league} ${censusRow.pool} ${tier}`).toBe(censusRow.tierCounts[tier]);
        expect(censusRow.tierCounts[tier]).toBe(auditSummary!.tierCounts[tier]);
      }
      expect(censusRow.total).toBe(auditSummary!.universeCount);
      expect(TIERS.reduce((sum, tier) => sum + censusRow.tierCounts[tier], 0)).toBe(censusRow.total);
    }
    expect(footballLedgerCensus.grandTotal.total).toBe(footballLedgerAudit.subjectCount);
    expect(footballLedgerCensus.leagueTotals.NFL.total + footballLedgerCensus.leagueTotals.CFB.total).toBe(footballLedgerAudit.subjectCount);
  });

  it("makes the historical recognition policy visible in the census", () => {
    const nflHistorical = footballLedgerCensus.leagueTotals.NFL.eras.historical;
    const nflMiddle = footballLedgerCensus.leagueTotals.NFL.eras.middle;
    const cfbHistorical = footballLedgerCensus.leagueTotals.CFB.eras.historical;
    const cfbMiddle = footballLedgerCensus.leagueTotals.CFB.eras.middle;
    const policyIssues = footballLedgerAudit.rows
      .map((row) => ({ ...row, censusEra: footballLedgerCensusEraFor(row) }))
      .filter((row) => (
        (row.league === "NFL" && row.tier === "C" && (row.censusEra === "historical" || row.censusEra === "middle"))
        || (row.league === "CFB" && row.tier === "C" && (row.censusEra === "historical" || row.censusEra === "middle"))
        || (row.league === "NFL" && row.tier === "B" && row.censusEra === "historical")
        || (row.league === "CFB" && row.tier === "B" && row.censusEra === "historical")
      ))
      .map(({ subjectId, name, league, pool, tier, censusEra }) => ({ subjectId, name, league, pool, tier, censusEra }));
    console.log("FOOTBALL_LEDGER_CENSUS_HISTORICAL_POLICY_ISSUES", JSON.stringify(policyIssues, null, 2));

    expect(nflHistorical.B).toBe(0);
    expect(nflHistorical.C).toBe(0);
    expect(nflMiddle.C).toBe(0);
    expect(cfbHistorical.B).toBe(0);
    expect(cfbHistorical.C).toBe(0);
    expect(cfbMiddle.C).toBe(0);
  });

  it("recovers reviewed identities' existing Stage 12 source windows before calling them unknown", () => {
    const recovered = footballLedgerAudit.rows.filter((row) => (
      row.pool !== "Franchises / programs"
      && row.endSeason == null
      && row.season == null
      && footballLedgerCensusEndingSeasonFor(row) != null
    ));
    expect(recovered.length).toBeGreaterThan(0);

    const unknownCount = footballLedgerCensus.rows
      .filter((row) => row.pool !== "Franchises / programs")
      .reduce((sum, row) => sum + TIERS.reduce((tierSum, tier) => tierSum + row.eras.unknown[tier], 0), 0);
    expect(unknownCount).toBeLessThan(562);
  });

  it("uses canonical active decades only when they cannot cross an era boundary", () => {
    expect(footballLedgerCensusEraFromActiveDecades("NFL", [1960])).toBe("historical");
    expect(footballLedgerCensusEraFromActiveDecades("NFL", [1970, 1980, 1990])).toBe("middle");
    expect(footballLedgerCensusEraFromActiveDecades("NFL", [1990, 2000])).toBe("modern");
    expect(footballLedgerCensusEraFromActiveDecades("CFB", [1970])).toBe("historical");
    expect(footballLedgerCensusEraFromActiveDecades("CFB", [1980, 1990])).toBe("middle");
    expect(footballLedgerCensusEraFromActiveDecades("CFB", [2000])).toBeNull();
    expect(footballLedgerCensusEraFromActiveDecades("CFB", [2000, 2010])).toBe("modern");

    const unresolvedAfterExactWindows = footballLedgerAudit.rows.filter((row) => (
      row.pool !== "Franchises / programs" && footballLedgerCensusEndingSeasonFor(row) == null
    )).length;
    const unresolvedAfterSafeEraMetadata = footballLedgerCensus.rows
      .filter((row) => row.pool !== "Franchises / programs")
      .reduce((sum, row) => sum + TIERS.reduce((tierSum, tier) => tierSum + row.eras.unknown[tier], 0), 0);
    expect(unresolvedAfterSafeEraMetadata).toBeLessThan(unresolvedAfterExactWindows);
  });

  it("keeps programs/franchises timeless and truly unresolved dated subjects explicit", () => {
    for (const league of ["NFL", "CFB"] as const) {
      const organizations = footballLedgerCensus.rows.find((row) => row.league === league && row.pool === "Franchises / programs");
      expect(organizations).toBeDefined();
      expect(TIERS.reduce((sum, tier) => sum + organizations!.eras.timeless[tier], 0)).toBe(organizations!.total);
      for (const era of ["historical", "middle", "modern", "unknown"] as const) {
        expect(TIERS.reduce((sum, tier) => sum + organizations!.eras[era][tier], 0)).toBe(0);
      }
    }

    expect(
      footballLedgerCensus.rows
        .filter((row) => row.pool !== "Franchises / programs")
        .reduce((sum, row) => sum + TIERS.reduce((tierSum, tier) => tierSum + row.eras.unknown[tier], 0), 0),
    ).toBeGreaterThan(0);
  });

  it("prints the exact shorthand census for human review", () => {
    console.log("FOOTBALL_LEDGER_CENSUS", JSON.stringify(footballLedgerCensus, null, 2));
  });
});
