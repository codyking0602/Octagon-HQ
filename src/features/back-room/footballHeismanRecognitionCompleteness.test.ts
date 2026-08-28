import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";
import {
  footballHeismanCareerRecognitionCandidates,
  footballHeismanWinnerDispositions,
} from "./footballRecognitionCompletenessEvidence";

const OFFICIAL_HEISMAN_WINNERS = "https://www.heisman.com/heisman-winners/";
const TIER_RANK = { A: 3, B: 2, C: 1, D: 0 } as const;

describe("Stage 13.5 exhaustive Heisman recognition review", () => {
  it("reviews every official Heisman award year from 1935 through 2025 exactly once", () => {
    expect(footballHeismanWinnerDispositions).toHaveLength(91);
    expect(footballHeismanWinnerDispositions.map((row) => row.awardYear)).toEqual(
      Array.from({ length: 91 }, (_, index) => 1935 + index),
    );
    expect(new Set(footballHeismanWinnerDispositions.map((row) => row.awardYear)).size).toBe(91);
    expect(footballHeismanWinnerDispositions.at(-1)).toMatchObject({
      awardYear: 2025,
      name: "Fernando Mendoza",
      disposition: "B",
      source: OFFICIAL_HEISMAN_WINNERS,
    });
  });

  it("forces an explicit A/B/C/D disposition and reason for every official source row", () => {
    expect(footballHeismanWinnerDispositions.filter((row) => row.disposition === "A")).toHaveLength(30);
    expect(footballHeismanWinnerDispositions.filter((row) => row.disposition === "B")).toHaveLength(29);
    expect(footballHeismanWinnerDispositions.filter((row) => row.disposition === "C")).toHaveLength(0);
    expect(footballHeismanWinnerDispositions.filter((row) => row.disposition === "D")).toHaveLength(32);
    for (const row of footballHeismanWinnerDispositions) {
      expect(["A", "B", "C", "D"]).toContain(row.disposition);
      expect(row.reason.trim().length, `${row.awardYear} ${row.name}`).toBeGreaterThan(20);
      expect(row.source).toBe(OFFICIAL_HEISMAN_WINNERS);
    }
  });

  it("keeps archive dispositions out of the A/B recognition challenge while preserving every reviewed A/B career", () => {
    expect(footballHeismanCareerRecognitionCandidates).toHaveLength(58);
    expect(new Set(footballHeismanCareerRecognitionCandidates.map((candidate) => candidate.name)).size).toBe(58);

    const requiredByName = new Map<string, "A" | "B">();
    for (const row of footballHeismanWinnerDispositions) {
      if (row.disposition !== "A" && row.disposition !== "B") continue;
      const existing = requiredByName.get(row.name);
      if (!existing || TIER_RANK[row.disposition] > TIER_RANK[existing]) requiredByName.set(row.name, row.disposition);
    }
    expect(requiredByName.size).toBe(58);
    for (const candidate of footballHeismanCareerRecognitionCandidates) {
      expect(candidate.kind).toBe("player-career");
      expect(candidate.league).toBe("CFB");
      expect(candidate.evidenceFamily).toBe("heisman");
      expect(candidate.minimumTier).toBe(requiredByName.get(candidate.name));
    }
  });

  it("requires every reviewed A/B Heisman career to reconcile into the canonical A-C universe", () => {
    const heismanGaps = footballLedgerAudit.independentOmissionCandidates.filter((gap) => (
      gap.league === "CFB" && gap.kind === "player-career" && gap.evidenceFamily === "heisman"
    ));
    console.log("FOOTBALL_HEISMAN_RECOGNITION_GAPS", JSON.stringify(heismanGaps, null, 2));
    expect(heismanGaps).toEqual([]);
  });
});
