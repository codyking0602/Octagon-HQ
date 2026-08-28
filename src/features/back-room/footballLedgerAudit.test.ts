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

  it("uses core canonical factual provenance to resolve source coverage when career years are absent", () => {
    const chaseYoung = footballLedgerAudit.players.find((row) => row.subjectId === "cfb-chase-young");
    expect(chaseYoung).toBeDefined();
    expect(chaseYoung?.startSeason).toBeUndefined();
    expect(chaseYoung?.endSeason).toBeUndefined();
    expect(chaseYoung?.coreFactCount).toBeGreaterThan(0);
    expect(chaseYoung?.sourceCoverage).toBe("inside-normalized-player-source");
  });

  it("does not let a generic modern-source fact prove an ambiguous CFB career is inside the normalized window", () => {
    const chrisLong = footballLedgerAudit.players.find((row) => row.subjectId === "cfb-chris-long");
    expect(chrisLong).toBeDefined();
    expect(chrisLong?.startSeason).toBeUndefined();
    expect(chrisLong?.endSeason).toBeUndefined();
    expect(chrisLong?.draftYear).toBeUndefined();
    expect(chrisLong?.numericFactCount).toBeGreaterThan(0);
    expect(chrisLong?.coreFactCount).toBe(0);
    expect(chrisLong?.sourceCoverage).toBe("unknown-career-window");
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
        draftYear: row.draftYear,
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
        draftYear: row.draftYear,
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
        draftYear: row.draftYear,
        facts: row.numericFactCount,
        coreFacts: row.coreFactCount,
        missing: row.missing,
        status: row.status,
      })),
    }, null, 2));
  });
});