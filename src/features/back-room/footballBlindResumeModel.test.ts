import { describe, expect, it } from "vitest";
import {
  buildFootballBlindResumeRounds,
  footballBlindResumeMatchups,
  footballBlindResumeSubjectIdentityId,
  resolvedFootballBlindResumeMatchups,
} from "./footballBlindResumeModel";
import {
  formatFootballFact,
  getFootballFact,
} from "./footballFactualStats";
import { getFootballRankFivePack } from "./footballRankFiveModel";

describe("Football Blind Resume content maturity", () => {
  it("builds a broad all-category matchup universe with canonical factual rows", () => {
    const resolved = resolvedFootballBlindResumeMatchups();
    const ids = resolved.map((matchup) => matchup.id);
    const packIds = new Set(resolved.map((matchup) => matchup.packId));

    expect(resolved.length).toBeGreaterThanOrEqual(80);
    expect(resolved.length).toBeLessThanOrEqual(100);
    expect(new Set(ids).size).toBe(ids.length);
    expect(packIds).toEqual(new Set([
      "nfl-quarterbacks",
      "nfl-running-backs",
      "nfl-wide-receivers",
      "nfl-tight-ends",
      "nfl-defensive-players",
      "nfl-head-coaches",
      "nfl-qb-seasons",
      "nfl-team-seasons",
      "college-quarterbacks",
      "college-head-coaches",
      "college-programs",
      "college-program-eras",
      "college-team-seasons",
    ]));

    for (const matchup of footballBlindResumeMatchups) {
      expect(matchup.stats).toHaveLength(5);
      const resolvedMatchup = resolved.find((row) => row.id === matchup.id)!;
      matchup.stats.forEach((stat, index) => {
        if (!("factMetricId" in stat)) {
          expect(stat.valueA, `${matchup.id}: authored value A`).not.toMatch(/\d/);
          expect(stat.valueB, `${matchup.id}: authored value B`).not.toMatch(/\d/);
          return;
        }
        const left = getFootballFact(matchup.leftId, stat.factMetricId);
        const right = getFootballFact(matchup.rightId, stat.factMetricId);
        expect(left, `${matchup.id}: ${matchup.leftId} ${stat.factMetricId}`).not.toBeNull();
        expect(right, `${matchup.id}: ${matchup.rightId} ${stat.factMetricId}`).not.toBeNull();
        expect(resolvedMatchup.stats[index]).toEqual({
          label: left!.definition.label,
          valueA: formatFootballFact(stat.factMetricId, left!.fact.value),
          valueB: formatFootballFact(stat.factMetricId, right!.fact.value),
        });
      });
    }
  });

  it("keeps seeded five-round runs deterministic, mixed and identity-unique", () => {
    for (let index = 0; index < 80; index += 1) {
      const seed = `blind-resume-determinism-${index}`;
      const first = buildFootballBlindResumeRounds(seed);
      const second = buildFootballBlindResumeRounds(seed);
      const identities = first.flatMap((round) => [
        footballBlindResumeSubjectIdentityId(round.leftId),
        footballBlindResumeSubjectIdentityId(round.rightId),
      ]);
      const leagueCounts = first.reduce((counts, round) => {
        counts[round.league] += 1;
        return counts;
      }, { NFL: 0, CFB: 0 });

      expect(first.map((round) => round.id)).toEqual(second.map((round) => round.id));
      expect(first).toHaveLength(5);
      expect(new Set(first.map((round) => round.id)).size).toBe(5);
      expect(new Set(first.map((round) => round.packId)).size).toBe(5);
      expect(new Set(identities).size).toBe(10);
      expect(leagueCounts).toEqual({ NFL: 3, CFB: 2 });
    }
  });

  it("covers the catalog broadly without badly overexposing a matchup or subject", () => {
    const runs = 600;
    const matchupExposure = new Map<string, number>();
    const subjectExposure = new Map<string, number>();
    const lineupExposure = new Map<string, number>();
    const categoriesSeen = new Set<string>();

    for (let index = 0; index < runs; index += 1) {
      const rounds = buildFootballBlindResumeRounds(`blind-resume-sim-${index}`);
      const signature = rounds.map((round) => round.id).sort().join("|");
      lineupExposure.set(signature, (lineupExposure.get(signature) ?? 0) + 1);
      for (const round of rounds) {
        categoriesSeen.add(round.packId);
        matchupExposure.set(round.id, (matchupExposure.get(round.id) ?? 0) + 1);
        for (const subjectId of [round.leftId, round.rightId]) {
          const identityId = footballBlindResumeSubjectIdentityId(subjectId);
          subjectExposure.set(identityId, (subjectExposure.get(identityId) ?? 0) + 1);
        }
      }
    }

    const catalogSize = footballBlindResumeMatchups.length;
    const coveredMatchups = matchupExposure.size;
    const meanMatchupExposure = (runs * 5) / catalogSize;
    const maxMatchupExposure = Math.max(...matchupExposure.values());
    const maxSubjectExposure = Math.max(...subjectExposure.values());
    const maxLineupRepeat = Math.max(...lineupExposure.values());

    expect(categoriesSeen.size).toBe(13);
    expect(coveredMatchups / catalogSize).toBeGreaterThan(0.95);
    expect(maxMatchupExposure).toBeLessThan(meanMatchupExposure * 2.2);
    expect(maxSubjectExposure).toBeLessThanOrEqual(runs * 0.3);
    expect(maxLineupRepeat).toBeLessThanOrEqual(3);
  });

  it("derives every non-tied winner from the canonical comparison pack ratings", () => {
    for (const matchup of resolvedFootballBlindResumeMatchups()) {
      const pack = getFootballRankFivePack(matchup.packId);
      const left = pack.items.find((item) => item.id === matchup.leftId)!;
      const right = pack.items.find((item) => item.id === matchup.rightId)!;
      expect(left.rating, `${matchup.id}: tied canonical ratings`).not.toBe(right.rating);
      const canonicalWinnerId = left.rating > right.rating ? left.id : right.id;
      expect(matchup.winnerId, matchup.id).toBe(canonicalWinnerId);
    }
  });
});
