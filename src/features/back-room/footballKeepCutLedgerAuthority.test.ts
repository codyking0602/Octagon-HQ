import { describe, expect, it } from "vitest";
import {
  buildFootballKeepCutLineup,
  footballKeepCutEligibilityQuery,
  footballKeepCutPacks,
} from "./footballKeepCutModel";
import {
  footballRankFivePacks,
  getFootballReviewedRankFivePack,
} from "./footballRankFivePlayableModel";
import { resolveFootballSubjectReference } from "./footballSubjectRegistry";

const CASUAL_TIERS = ["A", "B", "C"] as const;

describe("Football Keep 4, Cut 4 canonical comparison authority", () => {
  it("consumes the exact same deep canonical comparison pool as Blind Rank", () => {
    for (const pack of footballKeepCutPacks) {
      const rankPack = footballRankFivePacks.find((candidate) => candidate.id === pack.id)!;
      expect(pack.items.map((item) => item.id), `${pack.id} shared runtime pool`).toEqual(
        rankPack.items.map((item) => item.id),
      );
      expect(pack.items.length, `${pack.id} board depth`).toBeGreaterThanOrEqual(8);

      const query = footballKeepCutEligibilityQuery(pack.id);
      const canonicalIds = pack.items.map((item) => {
        const subject = resolveFootballSubjectReference(item.id, item.name, query);
        expect(subject, `${pack.id}:${item.id} canonical subject`).not.toBeNull();
        expect(subject?.casualEligible, `${pack.id}:${item.id} casual eligibility`).toBe(true);
        expect(CASUAL_TIERS, `${pack.id}:${item.id} recognizability`).toContain(subject?.recognizabilityTier);
        return subject!.id;
      });
      expect(new Set(canonicalIds).size, `${pack.id} canonical dedupe`).toBe(canonicalIds.length);
    }
  });

  it("materially expands the NFL receiver pool beyond reviewed calibration rows", () => {
    const receivers = footballKeepCutPacks.find((pack) => pack.id === "nfl-wide-receivers")!;
    const reviewed = getFootballReviewedRankFivePack("nfl-wide-receivers");
    const reviewedIds = new Set(reviewed.items.map((item) => item.id));

    expect(receivers.items.length).toBeGreaterThan(reviewed.items.length);
    expect(receivers.items.some((item) => !reviewedIds.has(item.id))).toBe(true);
  });

  it("keeps deterministic eight-subject boards inside the deep canonical roster", () => {
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

  it("actually exposes non-legacy canonical receivers in playable Keep/Cut boards", () => {
    const reviewedIds = new Set(
      getFootballReviewedRankFivePack("nfl-wide-receivers").items.map((item) => item.id),
    );
    let exposed = false;
    for (let index = 0; index < 96 && !exposed; index += 1) {
      exposed = buildFootballKeepCutLineup("nfl-wide-receivers", `deep-wr-${index}`)
        .some((item) => !reviewedIds.has(item.id));
    }
    expect(exposed).toBe(true);
  });
});
