import { describe, expect, it } from "vitest";
import {
  buildFootballKeepCutLineup,
  footballKeepCutCategoryQuery,
  footballKeepCutPacks,
} from "./footballKeepCutModel";
import { footballRankFivePacks } from "./footballRankFiveModel";
import {
  getFootballSubject,
  queryFootballSubjects,
} from "./footballSubjectRegistry";

const CASUAL_TIERS = ["A", "B", "C"] as const;

function eligibleCanonicalIds(packId: (typeof footballKeepCutPacks)[number]["id"]) {
  return new Set(
    queryFootballSubjects({
      ...footballKeepCutCategoryQuery(packId),
      recognizabilityTiers: CASUAL_TIERS,
      casualEligible: true,
      includeProjectedSourceSubjects: true,
    }).map((subject) => subject.id),
  );
}

describe("Football Keep 4, Cut 4 canonical ledger authority", () => {
  it("uses the registry for category eligibility while preserving the comparison rating owner", () => {
    for (const pack of footballKeepCutPacks) {
      const ratedPack = footballRankFivePacks.find((candidate) => candidate.id === pack.id)!;
      const eligibleIds = eligibleCanonicalIds(pack.id);
      const seenCanonicalIds = new Set<string>();
      const expected = ratedPack.items.filter((item) => {
        const subject = getFootballSubject(item.id);
        if (!subject || !eligibleIds.has(subject.id) || seenCanonicalIds.has(subject.id)) return false;
        seenCanonicalIds.add(subject.id);
        return true;
      });

      expect(pack.items.map((item) => item.id), `${pack.id} canonical roster`).toEqual(
        expected.map((item) => item.id),
      );
      expect(pack.items.length, `${pack.id} board depth`).toBeGreaterThanOrEqual(8);

      for (const item of pack.items) {
        const subject = getFootballSubject(item.id);
        const ratedItem = ratedPack.items.find((candidate) => candidate.id === item.id);
        expect(subject, `${pack.id}:${item.id} canonical subject`).not.toBeNull();
        expect(subject?.casualEligible, `${pack.id}:${item.id} casual eligibility`).toBe(true);
        expect(CASUAL_TIERS, `${pack.id}:${item.id} recognizability`).toContain(subject?.recognizabilityTier);
        expect(eligibleIds.has(subject!.id), `${pack.id}:${item.id} category query`).toBe(true);
        expect(item.rating, `${pack.id}:${item.id} comparison rating`).toBe(ratedItem?.rating);
        expect(item.ratingBasis, `${pack.id}:${item.id} comparison evidence`).toBe(ratedItem?.ratingBasis);
      }

      const canonicalIds = pack.items.map((item) => getFootballSubject(item.id)!.id);
      expect(new Set(canonicalIds).size, `${pack.id} canonical dedupe`).toBe(canonicalIds.length);
    }
  });

  it("preserves public comparison ids while resolving them to canonical subject ids", () => {
    const quarterbacks = footballKeepCutPacks.find((pack) => pack.id === "nfl-quarterbacks")!;
    const mahomes = quarterbacks.items.find((item) => item.id === "patrick-mahomes")!;

    expect(mahomes.id).toBe("patrick-mahomes");
    expect(getFootballSubject(mahomes.id)?.id).toBe("nfl-patrick-mahomes");
  });

  it("keeps deterministic eight-subject boards inside the canonical eligible roster", () => {
    for (const pack of footballKeepCutPacks) {
      const eligibleIds = new Set(pack.items.map((item) => item.id));
      for (let index = 0; index < 24; index += 1) {
        const seed = `keep-cut-ledger-${pack.id}-${index}`;
        const first = buildFootballKeepCutLineup(pack.id, seed);
        const second = buildFootballKeepCutLineup(pack.id, seed);
        const ids = first.map((item) => item.id);

        expect(ids).toHaveLength(8);
        expect(new Set(ids).size).toBe(8);
        expect(ids).toEqual(second.map((item) => item.id));
        expect(ids.every((id) => eligibleIds.has(id))).toBe(true);
      }
    }
  });
});
