import { describe, expect, it } from "vitest";
import {
  buildFootballKeepCutLineup,
  footballKeepCutEligibilityQuery,
  footballKeepCutPacks,
} from "./footballKeepCutModel";
import { footballRankFivePacks } from "./footballRankFiveModel";
import {
  getFootballSubject,
  resolveFootballSubjectReference,
} from "./footballSubjectRegistry";

const CASUAL_TIERS = ["A", "B", "C"] as const;

describe("Football Keep 4, Cut 4 canonical ledger authority", () => {
  it("uses the registry for category eligibility while preserving the comparison rating owner", () => {
    for (const pack of footballKeepCutPacks) {
      const ratedPack = footballRankFivePacks.find((candidate) => candidate.id === pack.id)!;
      const query = footballKeepCutEligibilityQuery(pack.id);
      const seenCanonicalIds = new Set<string>();
      const expected = ratedPack.items.filter((item) => {
        const subject = resolveFootballSubjectReference(item.id, item.name, query);
        if (!subject || seenCanonicalIds.has(subject.id)) return false;
        seenCanonicalIds.add(subject.id);
        return true;
      });

      expect(pack.items.map((item) => item.id), `${pack.id} canonical roster`).toEqual(
        expected.map((item) => item.id),
      );
      expect(pack.items.length, `${pack.id} board depth`).toBeGreaterThanOrEqual(8);

      for (const item of pack.items) {
        const subject = resolveFootballSubjectReference(item.id, item.name, query);
        const ratedItem = ratedPack.items.find((candidate) => candidate.id === item.id);
        expect(subject, `${pack.id}:${item.id} canonical subject`).not.toBeNull();
        expect(subject?.casualEligible, `${pack.id}:${item.id} casual eligibility`).toBe(true);
        expect(CASUAL_TIERS, `${pack.id}:${item.id} recognizability`).toContain(subject?.recognizabilityTier);
        expect(item.rating, `${pack.id}:${item.id} comparison rating`).toBe(ratedItem?.rating);
        expect(item.ratingBasis, `${pack.id}:${item.id} comparison evidence`).toBe(ratedItem?.ratingBasis);
      }

      const canonicalIds = pack.items.map((item) => (
        resolveFootballSubjectReference(item.id, item.name, query)!.id
      ));
      expect(new Set(canonicalIds).size, `${pack.id} canonical dedupe`).toBe(canonicalIds.length);
    }
  });

  it("preserves legacy public ids while the registry resolves canonical identities", () => {
    const quarterbacks = footballKeepCutPacks.find((pack) => pack.id === "nfl-quarterbacks")!;
    const mahomes = quarterbacks.items.find((item) => item.id === "patrick-mahomes")!;
    expect(mahomes.id).toBe("patrick-mahomes");
    expect(getFootballSubject(mahomes.id)?.id).toBe("nfl-patrick-mahomes");

    const receivers = footballKeepCutPacks.find((pack) => pack.id === "nfl-wide-receivers")!;
    const rice = receivers.items.find((item) => item.id === "jerry-rice")!;
    const riceSubject = resolveFootballSubjectReference(
      rice.id,
      rice.name,
      footballKeepCutEligibilityQuery(receivers.id),
    );
    expect(rice.id).toBe("jerry-rice");
    expect(riceSubject?.name).toBe("Jerry Rice");
    expect(riceSubject?.position).toBe("WR");

    const coaches = footballKeepCutPacks.find((pack) => pack.id === "nfl-head-coaches")!;
    const vrabel = coaches.items.find((item) => item.id === "mike-vrabel")!;
    const vrabelSubject = resolveFootballSubjectReference(
      vrabel.id,
      vrabel.name,
      footballKeepCutEligibilityQuery(coaches.id),
    );
    expect(vrabelSubject?.id).toBe("mike-vrabel");
    expect(vrabelSubject?.kind).toBe("coach");
    expect(vrabelSubject?.sourceIdentityKeys.some((key) => key.provider === "nflverse")).toBe(false);
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
