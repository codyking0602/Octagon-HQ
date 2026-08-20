import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "./rankingInputs";
import { ufcStatsSupplementalFactsSnapshot } from "./ufcStatsSupplementalFacts";

const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);

describe("canonical UFCStats supplemental fight snapshot", () => {
  it("pins the raw UFCStats export provenance used to build the checked-in snapshot", () => {
    expect(ufcStatsSupplementalFactsSnapshot.provenance.core).toEqual({
      repository: "Greco1899/scrape_ufc_stats",
      commit: "8e40eb945e1127bf0ef172ab211a34787948f312",
      refreshedAt: "2026-08-18",
      files: [
        "ufc_event_details.csv",
        "ufc_fight_details.csv",
        "ufc_fight_results.csv",
        "ufc_fight_stats.csv",
      ],
    });
    expect(ufcStatsSupplementalFactsSnapshot.provenance.bonuses).toEqual({
      repository: "manzlerh/MMA-Grid",
      commit: "2d363d60b3a3f44e6a8bf83cdcef409f47fb3948",
      refreshedAt: "2026-03-02",
      files: ["data/raw/ufc_bonuses.csv"],
    });
  });

  it("covers every canonical ranked UFC fight and never turns missing source coverage into zero", () => {
    const expectedSlugs = canonicalRankingInputs.fighters
      .map((fighter) => fighter.presentation.slug)
      .sort();
    expect(Object.keys(ufcStatsSupplementalFactsSnapshot.fighters).sort()).toEqual(expectedSlugs);

    let verifiedBonusRows = 0;
    let unavailableBonusRows = 0;
    let verifiedKnockdownRows = 0;
    let unavailableKnockdownRows = 0;

    for (const fighter of canonicalRankingInputs.fighters) {
      const snapshotFights = ufcStatsSupplementalFactsSnapshot.fighters[fighter.presentation.slug];
      expect(snapshotFights, fighter.fighter).toBeDefined();
      expect(Object.keys(snapshotFights ?? {}).sort()).toEqual(
        fighter.facts.fights.map((fight) => fight.id).sort(),
      );

      for (const fight of fighter.facts.fights) {
        const supplemental = fight.supplementalFacts;
        expect(supplemental, `${fighter.fighter} vs ${fight.opponent}`).toBeDefined();
        expect(supplemental?.source.provider).toBe("ufcstats");
        expect(supplemental?.source.eventId).toMatch(/^[a-z0-9]+$/i);
        expect(supplemental?.source.fightId).toMatch(/^[a-z0-9]+$/i);
        expect(supplemental?.source.checkedAt).toBe("2026-08-18");
        expect(supplemental?.mainEvent.status).toBe("verified");

        if (supplemental?.bonuses.status === "verified") verifiedBonusRows += 1;
        else if (supplemental?.bonuses.status === "unavailable") unavailableBonusRows += 1;
        else throw new Error(`Unexpected bonus coverage for ${fighter.fighter} vs ${fight.opponent}.`);

        if (FINISH_METHODS.has(fight.methodCategory)) {
          expect(supplemental?.finish.status).toBe("verified");
        } else {
          expect(supplemental?.finish.status).toBe("not-applicable");
        }

        if (supplemental?.knockdowns.status === "verified") verifiedKnockdownRows += 1;
        else if (supplemental?.knockdowns.status === "unavailable") unavailableKnockdownRows += 1;
        else throw new Error(`Unexpected knockdown coverage for ${fighter.fighter} vs ${fight.opponent}.`);
      }
    }

    expect(verifiedBonusRows).toBeGreaterThan(0);
    expect(unavailableBonusRows).toBeGreaterThan(0);
    expect(verifiedKnockdownRows).toBeGreaterThan(0);
    expect(unavailableKnockdownRows).toBeGreaterThan(0);
  });

  it("keeps shared fight evidence symmetric when two ranked fighters faced each other", () => {
    const byUfcStatsFight = new Map<
      string,
      Array<{ fighter: string; facts: NonNullable<(typeof canonicalRankingInputs.fighters)[number]["facts"]["fights"][number]["supplementalFacts"]> }>
    >();

    for (const fighter of canonicalRankingInputs.fighters) {
      for (const fight of fighter.facts.fights) {
        if (!fight.supplementalFacts) continue;
        const rows = byUfcStatsFight.get(fight.supplementalFacts.source.fightId) ?? [];
        rows.push({ fighter: fighter.fighter, facts: fight.supplementalFacts });
        byUfcStatsFight.set(fight.supplementalFacts.source.fightId, rows);
      }
    }

    const shared = [...byUfcStatsFight.values()].filter((rows) => rows.length > 1);
    expect(shared.length).toBeGreaterThan(0);

    for (const rows of shared) {
      expect(rows).toHaveLength(2);
      const [left, right] = rows;
      expect(left.facts.source.eventId).toBe(right.facts.source.eventId);
      expect(left.facts.mainEvent).toEqual(right.facts.mainEvent);
      expect(left.facts.finish).toEqual(right.facts.finish);
      if (left.facts.knockdowns.status === "verified" && right.facts.knockdowns.status === "verified") {
        expect(left.facts.knockdowns.for).toBe(right.facts.knockdowns.against);
        expect(left.facts.knockdowns.against).toBe(right.facts.knockdowns.for);
      }
    }
  });
});
