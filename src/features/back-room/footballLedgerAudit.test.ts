import { describe, expect, it } from "vitest";

import { footballSubjectMeetsFactRequirements } from "./footballFactualEligibility";
import { formatFootballLedgerAuditMarkdown, footballLedgerAudit } from "./footballLedgerAudit";
import { queryFootballSubjects } from "./footballSubjectRegistry";

describe("Football Knowledge Ledger Stage 13.5 human audit", () => {
  it("audits every permanent NFL and CFB pool from the canonical A-C universe", () => {
    expect(footballLedgerAudit.subjectCount).toBeGreaterThan(1_500);
    expect(new Set(footballLedgerAudit.rows.map((row) => row.subjectId)).size).toBe(footballLedgerAudit.rows.length);
    const pools = [
      "QB", "RB", "WR", "TE", "OL", "DL / EDGE", "LB", "Secondary", "K / P",
      "Player seasons", "Team seasons", "Franchises / programs", "Head coaches", "Eras / dynasties", "Notable games / misc",
    ] as const;
    for (const league of ["NFL", "CFB"] as const) for (const pool of pools) {
      const summary = footballLedgerAudit.poolSummaries.find((row) => row.league === league && row.pool === pool);
      expect(summary, `${league} ${pool}`).toBeDefined();
      expect(summary!.universeCount, `${league} ${pool}`).toBeGreaterThan(0);
      expect(summary!.tierCounts.A + summary!.tierCounts.B + summary!.tierCounts.C).toBe(summary!.universeCount);
      expect(summary!.readinessCounts.Full + summary!.readinessCounts.Partial + summary!.readinessCounts["Identity-only"]).toBe(summary!.universeCount);
    }
  });

  it("reconciles independent historical recognition evidence into canonical A-C", () => {
    expect(footballLedgerAudit.independentOmissionCandidates).toEqual([]);
    for (const expected of [
      ["NFL", "Jim Brown"], ["NFL", "Johnny Unitas"], ["NFL", "Vince Lombardi"],
      ["CFB", "Archie Griffin"], ["CFB", "Herschel Walker"], ["CFB", "Bear Bryant"],
    ] as const) {
      expect(footballLedgerAudit.rows.some((row) => row.league === expected[0] && row.name === expected[1]), expected.join(" ")).toBe(true);
    }
  });

  it("enforces the historical A/B/C policy without erasing sparse important subjects", () => {
    expect(footballLedgerAudit.historicalTierIssues).toEqual([]);
    const jimBrown = footballLedgerAudit.rows.find((row) => row.name === "Jim Brown" && row.league === "NFL");
    expect(jimBrown?.tier).toBe("A");
    expect(jimBrown?.sourceCoverage).toBe("before-normalized-player-source");
    expect(["Partial", "Identity-only"]).toContain(jimBrown?.readiness);
    const canonical = queryFootballSubjects({
      league: "NFL",
      recognizabilityTiers: ["A"],
      includeProjectedCanonicalRecognition: true,
      includeProjectedSourceSubjects: true,
    });
    expect(canonical.some((subject) => subject.name === "Jim Brown")).toBe(true);
  });

  it("derives numerical game eligibility from facts without creating a private roster", () => {
    const jimBrown = footballLedgerAudit.rows.find((row) => row.name === "Jim Brown" && row.league === "NFL");
    expect(jimBrown).toBeDefined();
    expect(footballSubjectMeetsFactRequirements(jimBrown!.subjectId, [])).toBe(true);
    expect(footballSubjectMeetsFactRequirements(jimBrown!.subjectId, [
      { anyOf: ["nfl-career-passing-yards"] },
    ])).toBe(false);
  });

  it("uses position/entity-specific readiness rather than a generic fact threshold", () => {
    const olRows = footballLedgerAudit.players.filter((row) => row.pool === "OL");
    expect(olRows.length).toBeGreaterThan(0);
    expect(olRows.some((row) => row.readiness !== "Identity-only" && row.numericFactCount === 0)).toBe(true);
    expect(footballLedgerAudit.rows.filter((row) => row.kind === "team-season").some((row) => row.readiness === "Full")).toBe(true);
    expect(footballLedgerAudit.rows.filter((row) => row.kind === "coach" && row.league === "CFB").some((row) => row.numericFactCount > 0)).toBe(true);
    expect(footballLedgerAudit.rows.filter((row) => row.kind === "program-era" && row.league === "CFB").some((row) => row.numericFactCount > 0)).toBe(true);
  });

  it("keeps source-era deficiencies explicit instead of fabricating zeroes", () => {
    expect(footballLedgerAudit.sourceEraFactGaps.length).toBeGreaterThan(0);
    for (const row of footballLedgerAudit.sourceEraFactGaps.slice(0, 25)) {
      expect(row.sourceEraLimitations.length).toBeGreaterThan(0);
    }
    const chaseYoung = footballLedgerAudit.players.find((row) => row.subjectId === "cfb-chase-young");
    expect(chaseYoung?.sourceCoverage).toBe("inside-normalized-player-source");
    const chrisLong = footballLedgerAudit.players.find((row) => row.subjectId === "cfb-chris-long");
    expect(chrisLong?.sourceCoverage).toBe("unknown-career-window");
  });

  it("renders the complete human-review surface rather than a sliced CI queue", () => {
    const report = formatFootballLedgerAuditMarkdown(footballLedgerAudit);
    expect(report).toContain("## NFL");
    expect(report).toContain("## CFB");
    expect(report).toContain("Player seasons");
    expect(report).toContain("Head coaches");
    expect(report).toContain("Eras / dynasties");
    expect(report).toContain("## Independent omission queue");
    expect(report).toContain("## Factual-readiness problems");
    const nonFullRows = footballLedgerAudit.rows.filter((row) => row.readiness !== "Full");
    for (const row of nonFullRows.slice(0, 20)) expect(report).toContain(`**${row.name}**`);
  });

  it("keeps the audit queues deterministic and fully classified", () => {
    expect(
      footballLedgerAudit.sourceEraFactGaps.length
      + footballLedgerAudit.inSourceWindowFactGaps.length
      + footballLedgerAudit.unknownCareerWindowFactGaps.length,
    ).toBe(footballLedgerAudit.allMaterialFactGaps.length);
    console.log("FOOTBALL_LEDGER_STAGE13_5_SUMMARY", JSON.stringify({
      subjectCount: footballLedgerAudit.subjectCount,
      playerCount: footballLedgerAudit.playerCount,
      omissionCount: footballLedgerAudit.independentOmissionCandidates.length,
      historicalTierIssueCount: footballLedgerAudit.historicalTierIssues.length,
      highPriorityFactGapCount: footballLedgerAudit.highPriorityFactGaps.length,
      poolSummaries: footballLedgerAudit.poolSummaries,
      omissions: footballLedgerAudit.independentOmissionCandidates,
    }, null, 2));
  });
});
