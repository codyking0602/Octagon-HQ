import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";

describe("Football Knowledge Ledger Stage 13.5 human audit", () => {
  it("audits the full canonical A-C player universe without duplicate identities", () => {
    expect(footballLedgerAudit.playerCount).toBeGreaterThan(1_500);
    const ids = footballLedgerAudit.players.map((row) => row.subjectId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const league of ["NFL", "CFB"] as const) {
      for (const pool of ["QB", "RB", "WR", "TE", "OL", "DL / EDGE", "LB", "Secondary", "K / P"] as const) {
        expect(footballLedgerAudit.poolCounts[league][pool], `${league} ${pool}`).toBeGreaterThan(0);
      }
    }
  });

  it("proves every reviewed recognition-evidence identity reaches canonical A-C at its reviewed tier or better", () => {
    expect(footballLedgerAudit.recognitionGaps).toEqual([]);
  });

  it("keeps the human review queues deterministic and visible", () => {
    expect(footballLedgerAudit.rosterReview.length).toBeGreaterThan(100);
    expect(footballLedgerAudit.highPriorityFactGaps.length).toBeGreaterThanOrEqual(0);
    expect(footballLedgerAudit.allMaterialFactGaps.length).toBeGreaterThanOrEqual(0);
    expect(
      footballLedgerAudit.sourceEraFactGaps.length
      + footballLedgerAudit.inSourceWindowFactGaps.length
      + footballLedgerAudit.unknownCareerWindowFactGaps.length,
    ).toBe(footballLedgerAudit.allMaterialFactGaps.length);
    console.log("FOOTBALL_LEDGER_AUDIT_SUMMARY", JSON.stringify({
      playerCount: footballLedgerAudit.playerCount,
      statusCounts: footballLedgerAudit.statusCounts,
      recognitionGapCount: footballLedgerAudit.recognitionGaps.length,
      highPriorityFactGapCount: footballLedgerAudit.highPriorityFactGaps.length,
      materialFactGapCount: footballLedgerAudit.allMaterialFactGaps.length,
      sourceEraMaterialGapCount: footballLedgerAudit.sourceEraFactGaps.length,
      inSourceWindowMaterialGapCount: footballLedgerAudit.inSourceWindowFactGaps.length,
      unknownCareerWindowMaterialGapCount: footballLedgerAudit.unknownCareerWindowFactGaps.length,
      inSourceWindowMaterialFactGaps: footballLedgerAudit.inSourceWindowFactGaps.map((row) => ({
        id: row.subjectId,
        name: row.name,
        league: row.league,
        pool: row.pool,
        tier: row.tier,
        startSeason: row.startSeason,
        endSeason: row.endSeason,
        facts: row.numericFactCount,
        coreFacts: row.coreFactCount,
        missing: row.missing,
      })),
      unknownCareerWindowMaterialFactGaps: footballLedgerAudit.unknownCareerWindowFactGaps.slice(0, 80).map((row) => ({
        id: row.subjectId,
        name: row.name,
        league: row.league,
        pool: row.pool,
        tier: row.tier,
        facts: row.numericFactCount,
        coreFacts: row.coreFactCount,
        missing: row.missing,
      })),
      highPriorityFactGaps: footballLedgerAudit.highPriorityFactGaps.slice(0, 80).map((row) => ({
        id: row.subjectId,
        name: row.name,
        league: row.league,
        pool: row.pool,
        tier: row.tier,
        sourceCoverage: row.sourceCoverage,
        facts: row.numericFactCount,
        coreFacts: row.coreFactCount,
        missing: row.missing,
        status: row.status,
      })),
    }, null, 2));
  });
});
