import { describe, expect, it } from "vitest";
import {
  buildFootballComparisonCandidatePool,
  footballComparisonEligibilityQuery,
} from "./footballComparisonAuthority";
import { FOOTBALL_RANKING_FRAMEWORK_VERSION } from "./footballRankingFramework";
import {
  footballRankFivePacks,
  getFootballRankFivePack,
  type FootballRankFivePackId,
} from "./footballRankFiveModel";
import { resolveFootballSubjectReference } from "./footballSubjectRegistry";

const DEEP_PLAYER_PACKS: readonly FootballRankFivePackId[] = [
  "nfl-quarterbacks",
  "nfl-running-backs",
  "nfl-wide-receivers",
  "nfl-tight-ends",
  "nfl-defensive-players",
  "nfl-qb-seasons",
  "nfl-team-seasons",
  "college-quarterbacks",
  "college-team-seasons",
];

describe("Football deep comparison authority", () => {
  it("starts every comparison pool from canonical A-C eligibility and preserves reviewed calibration", () => {
    for (const pack of footballRankFivePacks) {
      const pool = buildFootballComparisonCandidatePool(pack.id, pack.items);
      const query = footballComparisonEligibilityQuery(pack.id);
      const canonicalIds = new Set<string>();

      expect(pool.length, `${pack.id} playable depth`).toBeGreaterThanOrEqual(8);
      for (const candidate of pool) {
        const subject = resolveFootballSubjectReference(candidate.id, candidate.name, query);
        expect(subject, `${pack.id}:${candidate.id} canonical identity`).not.toBeNull();
        expect(subject?.casualEligible, `${pack.id}:${candidate.id} casual`).toBe(true);
        expect(["A", "B", "C"], `${pack.id}:${candidate.id} recognition`).toContain(subject?.recognizabilityTier);
        expect(candidate.canonicalSubjectId).toBe(subject?.id);
        expect(canonicalIds.has(candidate.canonicalSubjectId), `${pack.id}:${candidate.canonicalSubjectId} duplicate`).toBe(false);
        canonicalIds.add(candidate.canonicalSubjectId);
        expect(candidate.rankingVersion).toBe(FOOTBALL_RANKING_FRAMEWORK_VERSION);
        expect(candidate.rankingCoverage).toBeGreaterThanOrEqual(0);
        expect(candidate.rankingCoverage).toBeLessThanOrEqual(1);
        expect(candidate.rankingConfidence).toBeGreaterThanOrEqual(0);
        expect(candidate.rankingConfidence).toBeLessThanOrEqual(1);

        if (candidate.evaluationSource === "canonical-facts") {
          expect(candidate.factMetricIds.length, `${pack.id}:${candidate.id} fact-backed`).toBeGreaterThan(0);
          expect(candidate.ratingBasis).toContain("dimension coverage");
          expect(candidate.ratingBasis).toContain("confidence");
        }
      }

      for (const reviewed of pack.items) {
        const subject = resolveFootballSubjectReference(reviewed.id, reviewed.name, query);
        if (!subject) continue;
        const candidate = pool.find((row) => row.canonicalSubjectId === subject.id);
        expect(candidate, `${pack.id}:${reviewed.id} reviewed calibration`).toBeDefined();
        expect(candidate?.rating).toBe(reviewed.rating);
        expect(candidate?.ratingBasis).toBe(reviewed.ratingBasis);
        expect(candidate?.rankingStatus).toBe("rated");
      }
    }
  });

  it("makes the canonical database the player/season candidate source instead of the legacy rated inventory", () => {
    for (const packId of DEEP_PLAYER_PACKS) {
      const legacy = getFootballRankFivePack(packId);
      const pool = buildFootballComparisonCandidatePool(packId, legacy.items);
      const legacyCanonicalIds = new Set(
        legacy.items.flatMap((item) => {
          const subject = resolveFootballSubjectReference(item.id, item.name, footballComparisonEligibilityQuery(packId));
          return subject ? [subject.id] : [];
        }),
      );
      const newCandidates = pool.filter((candidate) => !legacyCanonicalIds.has(candidate.canonicalSubjectId));
      expect(newCandidates.length, `${packId} non-legacy canonical candidates`).toBeGreaterThan(0);
      expect(newCandidates.some((candidate) => candidate.evaluationSource === "canonical-facts"), `${packId} deep evaluation`).toBe(true);
    }
  });

  it("eliminates the four-profile WR-style bottleneck at the comparison authority", () => {
    const legacy = getFootballRankFivePack("nfl-wide-receivers");
    const pool = buildFootballComparisonCandidatePool("nfl-wide-receivers", legacy.items);
    const legacyCanonicalIds = new Set(
      legacy.items.flatMap((item) => {
        const subject = resolveFootballSubjectReference(
          item.id,
          item.name,
          footballComparisonEligibilityQuery("nfl-wide-receivers"),
        );
        return subject ? [subject.id] : [];
      }),
    );

    expect(pool.length).toBeGreaterThan(legacyCanonicalIds.size);
    expect(pool.filter((candidate) => !legacyCanonicalIds.has(candidate.canonicalSubjectId)).length).toBeGreaterThan(10);
  });

  it("keeps a data-derived rating fixed when caller-provided reviewed rows change", () => {
    const packId = "nfl-wide-receivers" as const;
    const reviewed = getFootballRankFivePack(packId).items;
    const withOverrides = buildFootballComparisonCandidatePool(packId, reviewed);
    const reviewedCanonicalIds = new Set(
      reviewed.flatMap((item) => {
        const subject = resolveFootballSubjectReference(item.id, item.name, footballComparisonEligibilityQuery(packId));
        return subject ? [subject.id] : [];
      }),
    );
    const target = withOverrides.find(
      (candidate) => candidate.evaluationSource === "canonical-facts" && !reviewedCanonicalIds.has(candidate.canonicalSubjectId),
    );
    expect(target).toBeDefined();

    const withoutOverrides = buildFootballComparisonCandidatePool(packId, []);
    const sameSubject = withoutOverrides.find((candidate) => candidate.canonicalSubjectId === target?.canonicalSubjectId);
    expect(sameSubject).toBeDefined();
    expect(sameSubject?.rating).toBe(target?.rating);
    expect(sameSubject?.rankingSemantic).toBe(target?.rankingSemantic);
    expect(sameSubject?.rankingCoverage).toBe(target?.rankingCoverage);
    expect(sameSubject?.rankingConfidence).toBe(target?.rankingConfidence);
  });

  it("is deterministic for the same canonical facts and reviewed calibration", () => {
    const reviewed = getFootballRankFivePack("nfl-wide-receivers").items;
    const first = buildFootballComparisonCandidatePool("nfl-wide-receivers", reviewed);
    const second = buildFootballComparisonCandidatePool("nfl-wide-receivers", reviewed);
    expect(second).toEqual(first);
  });
});
