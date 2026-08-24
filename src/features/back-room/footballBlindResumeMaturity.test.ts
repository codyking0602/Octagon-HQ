import { describe, expect, it } from "vitest";
import {
  FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES,
  FOOTBALL_BLIND_RESUME_ROUNDS,
  buildFootballBlindResumeRounds,
  footballBlindResumeMatchups,
  footballBlindResumeSubjectIdentityId,
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

function expectValidCard(rounds: ReturnType<typeof buildFootballBlindResumeRounds>) {
  expect(rounds).toHaveLength(FOOTBALL_BLIND_RESUME_ROUNDS);
  expect(new Set(rounds.map((round) => round.id)).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS);
  expect(new Set(rounds.map((round) => round.packId)).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS);
  const subjects = rounds.flatMap((round) => [
    footballBlindResumeSubjectIdentityId(round.leftId),
    footballBlindResumeSubjectIdentityId(round.rightId),
  ]);
  expect(new Set(subjects).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS * 2);
  const nfl = rounds.filter((round) => round.league === "NFL").length;
  const cfb = rounds.filter((round) => round.league === "CFB").length;
  expect([nfl, cfb].sort((left, right) => left - right)).toEqual([2, 3]);
}

describe("Football Blind Resume PR4 maturity", () => {
  it("preserves a broad comparison universe across every approved family", () => {
    expect(footballBlindResumeMatchups.length).toBeGreaterThanOrEqual(80);
    const counts = new Map<FootballRankFivePackId, number>();
    for (const matchup of footballBlindResumeMatchups) {
      counts.set(matchup.packId, (counts.get(matchup.packId) ?? 0) + 1);
    }
    for (const packId of EXPECTED_FAMILIES) expect(counts.get(packId) ?? 0).toBeGreaterThanOrEqual(5);
  });

  it("keeps winner ownership exclusively on canonical Rank Five ratings", () => {
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

  it("precomputes an eight-row matchup-specific evidence ladder while factual rows stay canonical", () => {
    const factualMatchups = footballBlindResumeMatchups.filter((matchup) =>
      matchup.stats.some((stat) => stat.source?.owner === "footballFactualStats"));
    expect(factualMatchups.length).toBeGreaterThanOrEqual(3);

    for (const matchup of footballBlindResumeMatchups) {
      expect(matchup.stats).toHaveLength(8);
      for (const stat of matchup.stats) {
        if (!stat.source) {
          expect(stat.valueA, `${matchup.id}: authored value A`).not.toMatch(/\d/);
          expect(stat.valueB, `${matchup.id}: authored value B`).not.toMatch(/\d/);
          continue;
        }
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

  it("has real NFL and CFB inventory for Easy, Medium, Hard, and Villain slates", () => {
    for (const difficulty of ["easy", "medium", "hard", "villain"] as const) {
      const rows = footballBlindResumeMatchups.filter((matchup) => matchup.difficulty === difficulty);
      expect(rows.length, difficulty).toBeGreaterThanOrEqual(4);
      expect(rows.some((row) => row.league === "NFL"), `${difficulty} NFL`).toBe(true);
      expect(rows.some((row) => row.league === "CFB"), `${difficulty} CFB`).toBe(true);
    }
  });

  it("builds deterministic mixed casual cards without a predictable easy-to-hard staircase", () => {
    for (let index = 0; index < 80; index += 1) {
      const seed = `pr4-casual-${index}`;
      const first = buildFootballBlindResumeRounds(seed);
      const second = buildFootballBlindResumeRounds(seed);
      expect(first.map((round) => round.id)).toEqual(second.map((round) => round.id));
      expect(first.map((round) => round.difficulty)).toEqual(second.map((round) => round.difficulty));
      expectValidCard(first);
      expect(first.some((round) => round.difficulty === "easy")).toBe(true);
      expect(first.filter((round) => round.difficulty === "hard")).toHaveLength(2);
      expect(first[0]?.difficulty).not.toBe("easy");
    }
  });

  it("uses the same engine for the tougher Daily authored mix: two Villains, two Hard, one Medium", () => {
    for (let index = 0; index < 80; index += 1) {
      const rounds = buildFootballBlindResumeRounds(`pr4-daily-${index}`, FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES);
      expectValidCard(rounds);
      expect(rounds.map((round) => round.difficulty)).toEqual([...FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES]);
    }
  });
});
