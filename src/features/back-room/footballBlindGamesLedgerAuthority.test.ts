import { describe, expect, it } from "vitest";
import {
  footballBlindResumeEvidenceProfiles,
  getFootballBlindResumeEvidenceProfilesForPack,
} from "./footballFactualStats";
import {
  footballBlindResumeEligibilityQuery,
  footballComparisonEligibilityQuery,
  footballComparisonItemsFromCanonicalLedger,
} from "./footballComparisonLedgerAuthority";
import {
  footballKeepCutEligibilityQuery,
} from "./footballKeepCutModel";
import {
  resolvedFootballBlindResumeMatchups,
} from "./footballBlindResumeModel";
import {
  buildFootballRankFiveLineup,
  footballRankFivePacks,
  getFootballRankFivePack,
} from "./footballRankFiveModel";
import {
  resolveFootballSubjectReference,
} from "./footballSubjectRegistry";

const CASUAL_TIERS = ["A", "B", "C"] as const;

describe("Football Blind games canonical ledger authority", () => {
  it("keeps Blind Rank ratings but lets the canonical ledger own board eligibility", () => {
    for (const pack of footballRankFivePacks) {
      const eligible = footballComparisonItemsFromCanonicalLedger(pack.id, pack.items, 5);
      const eligibleIds = new Set(eligible.map((item) => item.id));
      const query = footballComparisonEligibilityQuery(pack.id);

      expect(eligible.length, `${pack.id} canonical Blind Rank depth`).toBeGreaterThanOrEqual(5);
      for (const item of eligible) {
        const subject = resolveFootballSubjectReference(item.id, item.name, query);
        expect(subject, `${pack.id}:${item.id} canonical subject`).not.toBeNull();
        expect(subject?.casualEligible, `${pack.id}:${item.id} casual eligibility`).toBe(true);
        expect(CASUAL_TIERS, `${pack.id}:${item.id} recognizability`).toContain(subject?.recognizabilityTier);
        expect(typeof item.rating, `${pack.id}:${item.id} comparison rating`).toBe("number");
      }

      for (let index = 0; index < 24; index += 1) {
        const seed = `blind-rank-ledger-${pack.id}-${index}`;
        const first = buildFootballRankFiveLineup(pack.id, seed);
        const second = buildFootballRankFiveLineup(pack.id, seed);
        expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
        expect(first).toHaveLength(5);
        expect(new Set(first.map((item) => item.id)).size).toBe(5);
        expect(first.every((item) => eligibleIds.has(item.id))).toBe(true);
      }
    }
  });

  it("gates Blind Resume evidence profiles through the correct canonical entity query", () => {
    for (const pack of footballRankFivePacks) {
      const raw = footballBlindResumeEvidenceProfiles.filter((profile) => profile.packId === pack.id);
      const eligible = getFootballBlindResumeEvidenceProfilesForPack(pack.id);
      const query = footballBlindResumeEligibilityQuery(pack.id);
      const canonicalIds = new Set<string>();

      expect(eligible.length, `${pack.id} canonical Blind Resume depth`).toBeGreaterThanOrEqual(4);
      expect(eligible.length).toBeLessThanOrEqual(raw.length);

      for (const profile of eligible) {
        const item = getFootballRankFivePack(pack.id).items.find((candidate) => candidate.id === profile.subjectId);
        expect(item, `${pack.id}:${profile.subjectId} rated subject`).toBeDefined();
        const subject = resolveFootballSubjectReference(item!.id, item!.name, query);
        expect(subject, `${pack.id}:${profile.subjectId} canonical subject`).not.toBeNull();
        expect(subject?.casualEligible).toBe(true);
        expect(CASUAL_TIERS).toContain(subject?.recognizabilityTier);
        expect(canonicalIds.has(subject!.id), `${pack.id}:${profile.subjectId} canonical dedupe`).toBe(false);
        canonicalIds.add(subject!.id);
        expect(profile.evidence).toHaveLength(8);
      }
    }
  });

  it("builds the reviewed Blind Resume matchup catalog only from ledger-eligible evidence", () => {
    const eligibleByPack = new Map(
      footballRankFivePacks.map((pack) => [
        pack.id,
        new Set(getFootballBlindResumeEvidenceProfilesForPack(pack.id).map((profile) => profile.subjectId)),
      ]),
    );

    for (const matchup of resolvedFootballBlindResumeMatchups()) {
      const eligibleIds = eligibleByPack.get(matchup.packId)!;
      expect(eligibleIds.has(matchup.leftId), `${matchup.id} left`).toBe(true);
      expect(eligibleIds.has(matchup.rightId), `${matchup.id} right`).toBe(true);
      expect(matchup.stats).toHaveLength(8);
      expect(matchup.stats.every((row) => row.source.owner === "footballFactualStats")).toBe(true);
    }
  });

  it("shares the PR8 Keep/Cut eligibility criteria instead of creating a second comparison query owner", () => {
    for (const pack of footballRankFivePacks) {
      expect(footballKeepCutEligibilityQuery(pack.id)).toEqual(footballComparisonEligibilityQuery(pack.id));
    }
  });

  it("preserves legacy public comparison ids while resolving one canonical identity", () => {
    const quarterbacks = getFootballRankFivePack("nfl-quarterbacks");
    const mahomes = quarterbacks.items.find((item) => item.id === "patrick-mahomes")!;
    const subject = resolveFootballSubjectReference(
      mahomes.id,
      mahomes.name,
      footballComparisonEligibilityQuery(quarterbacks.id),
    );

    expect(mahomes.id).toBe("patrick-mahomes");
    expect(subject?.id).toBe("nfl-patrick-mahomes");
  });
});
