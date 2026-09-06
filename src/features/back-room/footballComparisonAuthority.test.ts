import { describe, expect, it } from "vitest";
import {
  buildFootballComparisonCandidatePool,
  footballComparisonEligibilityQuery,
  footballDeepPlayerComparisonPackIds,
} from "./footballComparisonAuthority";
import { FOOTBALL_RANKING_FRAMEWORK_VERSION } from "./footballRankingFramework";
import {
  footballRankFivePacks,
  getFootballRankFivePack,
} from "./footballRankFiveModel";
import { resolveFootballSubjectReference } from "./footballSubjectRegistry";

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
          if (footballDeepPlayerComparisonPackIds.includes(pack.id as typeof footballDeepPlayerComparisonPackIds[number])) {
            expect(candidate.ratingBasis, `${pack.id}:${candidate.id} anchor reconciliation`)
              .toContain("Reviewed-anchor reconciliation");
          }
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

  it("makes the canonical database the active player candidate source instead of the reviewed rated inventory", () => {
    for (const packId of footballDeepPlayerComparisonPackIds) {
      const reviewed = getFootballRankFivePack(packId);
      const pool = buildFootballComparisonCandidatePool(packId, reviewed.items);
      const reviewedCanonicalIds = new Set(
        reviewed.items.flatMap((item) => {
          const subject = resolveFootballSubjectReference(item.id, item.name, footballComparisonEligibilityQuery(packId));
          return subject ? [subject.id] : [];
        }),
      );
      const newCandidates = pool.filter((candidate) => !reviewedCanonicalIds.has(candidate.canonicalSubjectId));
      expect(newCandidates.length, `${packId} non-reviewed canonical candidates`).toBeGreaterThan(0);
      expect(newCandidates.some((candidate) => candidate.evaluationSource === "canonical-facts"), `${packId} deep evaluation`).toBe(true);
      expect(newCandidates.every((candidate) => candidate.ratingBasis?.includes("canonical anchors")), `${packId} anchor-calibrated depth`).toBe(true);
    }
  });

  it("eliminates the four-profile WR-style bottleneck at the comparison authority", () => {
    const reviewed = getFootballRankFivePack("nfl-wide-receivers");
    const pool = buildFootballComparisonCandidatePool("nfl-wide-receivers", reviewed.items);
    const reviewedCanonicalIds = new Set(
      reviewed.items.flatMap((item) => {
        const subject = resolveFootballSubjectReference(
          item.id,
          item.name,
          footballComparisonEligibilityQuery("nfl-wide-receivers"),
        );
        return subject ? [subject.id] : [];
      }),
    );

    expect(pool.length).toBeGreaterThan(reviewedCanonicalIds.size);
    expect(pool.filter((candidate) => !reviewedCanonicalIds.has(candidate.canonicalSubjectId)).length).toBeGreaterThan(10);
  });

  it("keeps canonical reviewed anchors as the calibration owner even without caller overrides", () => {
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
    expect(target?.ratingBasis).toContain("Reviewed-anchor reconciliation");

    const withoutOverrides = buildFootballComparisonCandidatePool(packId, []);
    const sameSubject = withoutOverrides.find((candidate) => candidate.canonicalSubjectId === target?.canonicalSubjectId);
    expect(sameSubject).toBeDefined();
    expect(sameSubject?.rating).toBe(target?.rating);
    expect(sameSubject?.rankingSemantic).toBe(target?.rankingSemantic);
    expect(sameSubject?.rankingCoverage).toBe(target?.rankingCoverage);
    expect(sameSubject?.rankingConfidence).toBe(target?.rankingConfidence);
  });

  it("keeps historically accomplished generated QBs out of the low-end starter band", () => {
    const packId = "nfl-quarterbacks" as const;
    const reviewed = getFootballRankFivePack(packId).items;
    const pool = buildFootballComparisonCandidatePool(packId, reviewed);
    const steveMcNair = pool.find((candidate) => candidate.name === "Steve McNair");
    const joeNamath = pool.find((candidate) => candidate.name === "Joe Namath");
    const andyDalton = pool.find((candidate) => candidate.name === "Andy Dalton");

    expect(steveMcNair?.evaluationSource).toBe("canonical-facts");
    expect(joeNamath?.evaluationSource).toBe("canonical-facts");
    expect(andyDalton?.rating).toBe(62);
    expect(steveMcNair?.rating).toBeGreaterThanOrEqual(70);
    expect(joeNamath?.rating).toBeGreaterThanOrEqual(70);
  });

  it("is deterministic for the same canonical facts and reviewed calibration", () => {
    const reviewed = getFootballRankFivePack("nfl-wide-receivers").items;
    const first = buildFootballComparisonCandidatePool("nfl-wide-receivers", reviewed);
    const second = buildFootballComparisonCandidatePool("nfl-wide-receivers", reviewed);
    expect(second).toEqual(first);
  });
});
