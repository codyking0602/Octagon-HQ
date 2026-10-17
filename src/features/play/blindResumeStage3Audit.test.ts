import { describe, expect, it } from "vitest";
import {
  BLIND_RESUME_ROUNDS,
  blindResumeStats,
  blindResumeWinner,
} from "./blindResumeEngine";
import { createBlindResumeV3Card } from "./blindResumeV3";
import { rankedPlayFighters } from "./playFighterPool";
import {
  FOOTBALL_BLIND_RESUME_REVEAL_STAGES,
  footballBlindResumeMatchups,
} from "../back-room/footballBlindResumeModel";

const UFC_STAT_LABELS = new Set([
  "UFC title-fight wins",
  "Top-5 wins",
  "Prime UFC record",
  "Main UFC era",
  "Apex rating",
  "Rounds won",
  "Finish rate",
  "Active elite years",
]);

describe("Stage 3 Blind Resume content-audit baseline", () => {
  it("samples 80 reproducible UFC five-round cards from the actual official V3 setup owner", () => {
    const eligible = new Set(rankedPlayFighters.map((fighter) => fighter.id));

    for (let index = 0; index < 80; index += 1) {
      const seed = `stage3-ufc-v3-audit-${index}`;
      const card = createBlindResumeV3Card(seed);
      // Official card generation is deterministic for the same seed.
      expect(createBlindResumeV3Card(seed)).toEqual(card);
      expect(card.roundSet.pairs).toHaveLength(BLIND_RESUME_ROUNDS);
      expect(card.statsByRound).toHaveLength(BLIND_RESUME_ROUNDS);
      expect(card.revealCounts).toEqual([2, 4, 6, 8]);

      const allSubjects = card.roundSet.pairs.flatMap((pair) => [pair.fighterA.id, pair.fighterB.id]);
      expect(new Set(allSubjects).size).toBe(BLIND_RESUME_ROUNDS * 2);

      card.roundSet.pairs.forEach((pair, roundIndex) => {
        expect(eligible.has(pair.fighterA.id)).toBe(true);
        expect(eligible.has(pair.fighterB.id)).toBe(true);
        expect(pair.fighterA.gender).toBe(pair.fighterB.gender);
        expect([pair.fighterA.id, pair.fighterB.id]).toContain(blindResumeWinner(pair).id);

        const canonicalStats = blindResumeStats(pair);
        const visible = card.statsByRound[roundIndex]!;
        expect(visible).toHaveLength(UFC_STAT_LABELS.size);
        expect(new Set(visible.map((stat) => stat.label))).toEqual(UFC_STAT_LABELS);
        expect(visible.map((stat) => stat.label).sort()).toEqual(
          canonicalStats.map((stat) => stat.label).sort(),
        );
        for (const stat of visible) {
          expect(stat.valueA.trim().length).toBeGreaterThan(0);
          expect(stat.valueB.trim().length).toBeGreaterThan(0);
          expect([stat.valueA, stat.valueB].join(" ")).not.toMatch(/(?:NaN|Infinity|undefined|null)/);
        }
        expect(
          visible.slice(0, 2).map((stat) => stat.label).sort(),
        ).not.toEqual(["Top-5 wins", "UFC title-fight wins"]);
      });
    }
  });

  it("covers every authored Football comparison without pretending a schema check approves its verdict", () => {
    expect(footballBlindResumeMatchups.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    for (const matchup of footballBlindResumeMatchups) {
      expect(ids.has(matchup.id)).toBe(false);
      ids.add(matchup.id);
      expect([matchup.leftId, matchup.rightId]).toContain(matchup.winnerId);
      expect(matchup.revealCounts).toHaveLength(FOOTBALL_BLIND_RESUME_REVEAL_STAGES);
      expect(matchup.revealCounts[2]).toBe(matchup.stats.length);
      const dimensions = new Set(matchup.stats.map((stat) => stat.source.dimensionId));
      expect(dimensions.size).toBe(matchup.stats.length);
      for (const stat of matchup.stats) {
        expect(stat.source.owner).toBe("footballFactualStats");
        expect(stat.label.trim()).not.toBe("");
        expect(stat.valueA.trim()).not.toBe("");
        expect(stat.valueB.trim()).not.toBe("");
      }
    }
  });
});
