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

describe("Football Blind Resume PR4 behavior / PR5 evidence maturity", () => {
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

  it("precomputes eight distinct evidence dimensions from the canonical footballFactualStats owner", () => {
    for (const matchup of footballBlindResumeMatchups) {
      expect(matchup.stats).toHaveLength(8);
      expect(new Set(matchup.stats.map((stat) => stat.source.dimensionId)).size).toBe(8);
      expect(new Set(matchup.stats.map((stat) => stat.label.trim().toLowerCase())).size).toBe(8);
      expect(new Set(matchup.stats.map((stat) =>
        `${stat.label}|${stat.valueA}|${stat.valueB}`.trim().toLowerCase().replace(/\s+/g, " "),
      )).size).toBe(8);
      expect(matchup.stats.every((stat) => stat.source.owner === "footballFactualStats")).toBe(true);
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

  it("builds deterministic mixed casual cards without forcing the same difficulty staircase", () => {
    const difficultySequences = new Set<string>();
    for (let index = 0; index < 80; index += 1) {
      const seed = `pr4-casual-${index}`;
      const first = buildFootballBlindResumeRounds(seed);
      const second = buildFootballBlindResumeRounds(seed);
      expect(first.map((round) => round.id)).toEqual(second.map((round) => round.id));
      expect(first.map((round) => round.stats)).toEqual(second.map((round) => round.stats));
      expect(first.map((round) => round.difficulty)).toEqual(second.map((round) => round.difficulty));
      expectValidCard(first);
      expect(new Set(first.map((round) => round.difficulty)).size).toBeGreaterThanOrEqual(2);
      difficultySequences.add(first.map((round) => round.difficulty).join("/"));
    }
    expect(difficultySequences.size).toBeGreaterThanOrEqual(12);
  });

  it("uses the same engine for the tougher Daily authored mix: two Villains, two Hard, one Medium", () => {
    for (let index = 0; index < 80; index += 1) {
      const rounds = buildFootballBlindResumeRounds(`pr4-daily-${index}`, FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES);
      expectValidCard(rounds);
      expect(rounds.map((round) => round.difficulty)).toEqual([...FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES]);
    }
  });
});
