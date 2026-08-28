import { describe, expect, it } from "vitest";

import { footballLedgerAudit } from "./footballLedgerAudit";
import {
  footballProHallRecognitionCandidates,
  footballProHallRecognitionDispositions,
  PRO_FOOTBALL_HALL_DIRECTORY,
} from "./footballProHallRecognitionCompletenessEvidence";
import { footballProHallHistoricalRepairSeeds } from "./footballProHallHistoricalRepairSeeds";

const TIER_RANK = { A: 3, B: 2, C: 1 } as const;
const normalized = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

describe("Stage 13.5 exhaustive Pro Football Hall of Fame recognition review", () => {
  it("reviews all 387 official Hall members after the 2026 class and classifies every identity", () => {
    expect(footballProHallRecognitionDispositions).toHaveLength(387);
    expect(footballProHallRecognitionDispositions.filter((row) => row.reviewKind === "player")).toHaveLength(332);
    expect(footballProHallRecognitionDispositions.filter((row) => row.reviewKind === "coach")).toHaveLength(26);
    expect(footballProHallRecognitionDispositions.filter((row) => row.reviewKind === "contributor")).toHaveLength(29);

    expect(footballProHallRecognitionDispositions.filter((row) => row.disposition === "A")).toHaveLength(77);
    expect(footballProHallRecognitionDispositions.filter((row) => row.disposition === "B")).toHaveLength(193);
    expect(footballProHallRecognitionDispositions.filter((row) => row.disposition === "C")).toHaveLength(0);
    expect(footballProHallRecognitionDispositions.filter((row) => row.disposition === "D")).toHaveLength(117);

    for (const row of footballProHallRecognitionDispositions) {
      expect(["A", "B", "C", "D"]).toContain(row.disposition);
      expect(row.reason.trim().length, `${row.reviewKind} ${row.name}`).toBeGreaterThan(40);
      expect(row.source).toBe(PRO_FOOTBALL_HALL_DIRECTORY);
    }
  });

  it("keeps the two Jimmy Johnson Hall identities distinct by canonical kind", () => {
    const rows = footballProHallRecognitionDispositions.filter((row) => row.name === "Jimmy Johnson");
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.reviewKind).sort()).toEqual(["coach", "player"]);
    expect(rows.find((row) => row.reviewKind === "coach")?.disposition).toBe("A");
    expect(rows.find((row) => row.reviewKind === "player")?.disposition).toBe("B");
  });

  it("includes every 2026 enshrinee with an explicit reviewed disposition", () => {
    const expected = new Map([
      ["Drew Brees", ["player", "A"]],
      ["Roger Craig", ["player", "B"]],
      ["Larry Fitzgerald", ["player", "A"]],
      ["Luke Kuechly", ["player", "B"]],
      ["Adam Vinatieri", ["player", "B"]],
    ] as const);
    for (const [name, [reviewKind, disposition]] of expected) {
      expect(footballProHallRecognitionDispositions.find((row) => row.name === name)).toMatchObject({
        name,
        reviewKind,
        disposition,
      });
    }
  });

  it("keeps archive-only Hall reviews out of the A/B canonical challenge set", () => {
    expect(footballProHallRecognitionCandidates).toHaveLength(270);
    expect(footballProHallRecognitionCandidates.some((candidate) => candidate.name === "Lenny Moore")).toBe(false);
    expect(footballProHallRecognitionCandidates.some((candidate) => candidate.name === "Tommy McDonald")).toBe(false);
    expect(footballProHallRecognitionCandidates.some((candidate) => candidate.name === "Bobby Mitchell")).toBe(false);
    expect(footballProHallRecognitionCandidates.some((candidate) => candidate.name === "Art McNally")).toBe(false);
    expect(footballProHallRecognitionCandidates.some((candidate) => candidate.name === "Pete Rozelle")).toBe(false);
  });

  it("keeps every genuinely missing Hall repair bounded, unique, positioned when a player, and era-policy compliant", () => {
    expect(footballProHallHistoricalRepairSeeds).toHaveLength(149);
    expect(new Set(footballProHallHistoricalRepairSeeds.map((seed) => seed.id)).size).toBe(149);
    expect(new Set(footballProHallHistoricalRepairSeeds.map((seed) => `${seed.kind}:${normalized(seed.name)}`)).size).toBe(149);

    for (const seed of footballProHallHistoricalRepairSeeds) {
      expect(seed.startSeason, seed.name).toBeLessThanOrEqual(seed.endSeason);
      expect(["A", "B"]).toContain(seed.tier);
      if (seed.kind === "player-career") expect(seed.position, seed.name).toBeTruthy();
      if (seed.endSeason < 1970) expect(seed.tier, `${seed.name} ended before 1970`).toBe("A");
    }
  });

  it("requires every reviewed A/B Hall player and coach to reconcile into the canonical A-C universe at the reviewed tier", () => {
    const gaps = footballProHallRecognitionCandidates.flatMap((candidate) => {
      const identityKeys = [candidate.name, ...(candidate.identityAliases ?? [])].map(normalized);
      const matches = footballLedgerAudit.rows.filter((row) => (
        row.league === "NFL"
        && row.kind === candidate.kind
        && (identityKeys.includes(normalized(row.name)) || identityKeys.includes(normalized(row.subjectId)))
      ));
      const resolved = matches.sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier])[0];
      if (!resolved) return [{
        name: candidate.name,
        kind: candidate.kind,
        expectedTier: candidate.minimumTier,
        reason: "missing-from-canonical-a-c",
      }];
      if (TIER_RANK[resolved.tier] < TIER_RANK[candidate.minimumTier]) {
        return [{
          name: candidate.name,
          kind: candidate.kind,
          expectedTier: candidate.minimumTier,
          actualTier: resolved.tier,
          subjectId: resolved.subjectId,
          reason: "tier-below-reviewed-hall-evidence",
        }];
      }
      return [];
    });

    expect(gaps).toEqual([]);
  });
});
