import { describe, expect, it } from "vitest";
import {
  FOOTBALL_BLIND_RESUME_ROUNDS,
  buildFootballBlindResumeRounds,
  footballBlindResumeMatchups,
  resolvedFootballBlindResumeMatchups,
} from "./footballBlindResumeModel";
import {
  formatFootballFact,
  getFootballFact,
} from "./footballFactualStats";
import {
  getFootballRankFivePack,
  type FootballRankFivePackId,
} from "./footballRankFiveModel";

const EXPECTED_FAMILIES: readonly FootballRankFivePackId[] = [
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
];

describe("Football Blind Resume content maturity", () => {
  it("expands to a broad comparison universe across every approved family", () => {
    expect(footballBlindResumeMatchups.length).toBeGreaterThanOrEqual(80);

    const counts = new Map<FootballRankFivePackId, number>();
    for (const matchup of footballBlindResumeMatchups) {
      counts.set(matchup.packId, (counts.get(matchup.packId) ?? 0) + 1);
    }

    for (const packId of EXPECTED_FAMILIES) {
      expect(counts.get(packId) ?? 0).toBeGreaterThanOrEqual(6);
    }
  });

  it("keeps winner ownership exclusively on the canonical comparison ratings", () => {
    for (const matchup of resolvedFootballBlindResumeMatchups()) {
      const pack = getFootballRankFivePack(matchup.packId);
      const left = pack.items.find((item) => item.id === matchup.leftId)!;
      const right = pack.items.find((item) => item.id === matchup.rightId)!;
      expect(matchup.leftRating).toBe(left.rating);
      expect(matchup.rightRating).toBe(right.rating);
      expect(left.rating).not.toBe(right.rating);
      expect(matchup.winnerId).toBe(left.rating > right.rating ? left.id : right.id);
    }
  });

  it("resolves configured objective rows from the canonical factual-stat owner", () => {
    const factualMatchups = footballBlindResumeMatchups.filter((matchup) =>
      matchup.stats.some((stat) => stat.source?.owner === "footballFactualStats"));

    expect(factualMatchups.length).toBeGreaterThanOrEqual(3);

    for (const matchup of factualMatchups) {
      for (const stat of matchup.stats) {
        if (!stat.source) continue;
        const left = getFootballFact(matchup.leftId, stat.source.metricId);
        const right = getFootballFact(matchup.rightId, stat.source.metricId);
        expect(left).not.toBeNull();
        expect(right).not.toBeNull();
        expect(stat.label).toBe(left!.definition.label);
        expect(stat.valueA).toBe(formatFootballFact(stat.source.metricId, left!.fact.value));
        expect(stat.valueB).toBe(formatFootballFact(stat.source.metricId, right!.fact.value));
      }
    }
  });

  it("builds deterministic five-round cards with unique matchups, unique subjects and a healthy league/category mix", () => {
    const first = buildFootballBlindResumeRounds("pr6-deterministic-proof");
    const second = buildFootballBlindResumeRounds("pr6-deterministic-proof");

    expect(first.map((round) => round.id)).toEqual(second.map((round) => round.id));
    expect(first).toHaveLength(FOOTBALL_BLIND_RESUME_ROUNDS);
    expect(new Set(first.map((round) => round.id)).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS);

    const subjects = first.flatMap((round) => [round.leftId, round.rightId]);
    expect(new Set(subjects).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS * 2);

    const nflRounds = first.filter((round) => round.league === "NFL").length;
    const cfbRounds = first.filter((round) => round.league === "CFB").length;
    expect(nflRounds).toBeGreaterThanOrEqual(2);
    expect(cfbRounds).toBeGreaterThanOrEqual(2);
    expect(new Set(first.map((round) => round.packId)).size).toBeGreaterThanOrEqual(4);
  });

  it("keeps broad coverage and low matchup/subject overexposure across many seeded runs", () => {
    const matchupCounts = new Map<string, number>();
    const subjectCounts = new Map<string, number>();
    const packCounts = new Map<FootballRankFivePackId, number>();
    const runCount = 400;

    for (let index = 0; index < runCount; index += 1) {
      const rounds = buildFootballBlindResumeRounds(`pr6-simulation-${index}`);
      expect(rounds).toHaveLength(FOOTBALL_BLIND_RESUME_ROUNDS);

      const subjects = rounds.flatMap((round) => [round.leftId, round.rightId]);
      expect(new Set(subjects).size).toBe(subjects.length);

      const nflRounds = rounds.filter((round) => round.league === "NFL").length;
      const cfbRounds = rounds.filter((round) => round.league === "CFB").length;
      expect(nflRounds).toBeGreaterThanOrEqual(2);
      expect(cfbRounds).toBeGreaterThanOrEqual(2);
      expect(new Set(rounds.map((round) => round.packId)).size).toBeGreaterThanOrEqual(4);

      for (const round of rounds) {
        matchupCounts.set(round.id, (matchupCounts.get(round.id) ?? 0) + 1);
        packCounts.set(round.packId, (packCounts.get(round.packId) ?? 0) + 1);
        subjectCounts.set(round.leftId, (subjectCounts.get(round.leftId) ?? 0) + 1);
        subjectCounts.set(round.rightId, (subjectCounts.get(round.rightId) ?? 0) + 1);
      }
    }

    expect(matchupCounts.size).toBeGreaterThanOrEqual(Math.floor(footballBlindResumeMatchups.length * 0.9));
    expect(packCounts.size).toBe(EXPECTED_FAMILIES.length);

    const matchupAverage = (runCount * FOOTBALL_BLIND_RESUME_ROUNDS) / footballBlindResumeMatchups.length;
    const matchupMax = Math.max(...matchupCounts.values());
    expect(matchupMax).toBeLessThanOrEqual(matchupAverage * 2.25);

    const totalSubjectAppearances = runCount * FOOTBALL_BLIND_RESUME_ROUNDS * 2;
    const subjectAverage = totalSubjectAppearances / subjectCounts.size;
    const subjectMax = Math.max(...subjectCounts.values());
    expect(subjectMax).toBeLessThanOrEqual(subjectAverage * 3.5);
  });
});
