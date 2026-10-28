import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";
import {
  footballNflMvpCareerRecognitionCandidates,
  footballNflMvpRecognitionDispositions,
} from "./footballNflMvpRecognitionCompletenessEvidence";

const TIER_RANK = { A: 3, B: 2, C: 1 } as const;

const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

describe("Stage 13.5 exhaustive AP NFL MVP recognition review", () => {
  it("reviews every AP NFL MVP recipient from 1957 through 2025, including both shared awards", () => {
    expect(footballNflMvpRecognitionDispositions).toHaveLength(71);
    expect(new Set(footballNflMvpRecognitionDispositions.map((row) => row.awardYear))).toEqual(
      new Set(Array.from({ length: 69 }, (_, index) => 1957 + index)),
    );
    expect(footballNflMvpRecognitionDispositions.filter((row) => row.awardYear === 1997)).toHaveLength(2);
    expect(footballNflMvpRecognitionDispositions.filter((row) => row.awardYear === 2003)).toHaveLength(2);
    expect(footballNflMvpRecognitionDispositions.at(-1)).toMatchObject({
      awardYear: 2025,
      name: "Matthew Stafford",
      disposition: "B",
    });
  });

  it("forces an explicit A/B/C/D disposition and source for every AP MVP recipient", () => {
    expect(footballNflMvpRecognitionDispositions.filter((row) => row.disposition === "A")).toHaveLength(51);
    expect(footballNflMvpRecognitionDispositions.filter((row) => row.disposition === "B")).toHaveLength(12);
    expect(footballNflMvpRecognitionDispositions.filter((row) => row.disposition === "C")).toHaveLength(0);
    expect(footballNflMvpRecognitionDispositions.filter((row) => row.disposition === "D")).toHaveLength(8);
    for (const row of footballNflMvpRecognitionDispositions) {
      expect(["A", "B", "C", "D"]).toContain(row.disposition);
      expect(row.reason.trim().length, `${row.awardYear} ${row.name}`).toBeGreaterThan(20);
      expect(row.source).toMatch(/^https:\/\//);
    }
  });

  it("deduplicates repeat winners into the 43 reviewed A/B career identities", () => {
    expect(footballNflMvpCareerRecognitionCandidates).toHaveLength(43);
    expect(new Set(footballNflMvpCareerRecognitionCandidates.map((candidate) => candidate.name)).size).toBe(43);
    for (const candidate of footballNflMvpCareerRecognitionCandidates) {
      expect(candidate.league).toBe("NFL");
      expect(candidate.kind).toBe("player-career");
      expect(candidate.evidenceFamily).toBe("mvp-all-pro");
      expect(["A", "B"]).toContain(candidate.minimumTier);
    }
  });

  it("requires every reviewed A/B AP MVP career to reconcile into the canonical A-C universe at the reviewed tier", () => {
    const gaps = footballNflMvpCareerRecognitionCandidates.flatMap((candidate) => {
      const identityKeys = [candidate.name, ...(candidate.identityAliases ?? [])].map(normalized);
      const matches = footballLedgerAudit.rows.filter((row) => (
        row.league === "NFL"
        && row.kind === "player-career"
        && (identityKeys.includes(normalized(row.name)) || identityKeys.includes(normalized(row.subjectId)))
      ));
      const resolved = matches.sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier])[0];
      if (!resolved) return [{ name: candidate.name, expectedTier: candidate.minimumTier, reason: "missing-from-canonical-a-c" }];
      if (TIER_RANK[resolved.tier] < TIER_RANK[candidate.minimumTier]) {
        return [{ name: candidate.name, expectedTier: candidate.minimumTier, actualTier: resolved.tier, subjectId: resolved.subjectId, reason: "tier-below-reviewed-mvp-evidence" }];
      }
      return [];
    });
    console.log("FOOTBALL_NFL_MVP_RECOGNITION_GAPS", JSON.stringify(gaps, null, 2));
    expect(gaps).toEqual([]);
  });
});
