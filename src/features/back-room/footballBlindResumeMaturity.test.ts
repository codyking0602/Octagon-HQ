import { describe, expect, it } from "vitest";
import {
  FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES,
  FOOTBALL_BLIND_RESUME_REVEAL_STAGES,
  FOOTBALL_BLIND_RESUME_ROUNDS,
  buildFootballBlindResumeRounds,
  footballBlindResumeMatchups,
  footballBlindResumeSubjectIdentityId,
  resolvedFootballBlindResumeMatchups,
} from "./footballBlindResumeModel";

describe("Football Blind Resume curated Daily maturity", () => {
  it("keeps a broad editorial bank across NFL and CFB without pretending to own exact football rankings", () => {
    expect(footballBlindResumeMatchups.length).toBeGreaterThanOrEqual(24);
    expect(new Set(footballBlindResumeMatchups.map((matchup) => matchup.id)).size).toBe(footballBlindResumeMatchups.length);
    expect(new Set(footballBlindResumeMatchups.map((matchup) => matchup.league))).toEqual(new Set(["NFL", "CFB"]));
    expect(new Set(footballBlindResumeMatchups.map((matchup) => matchup.packId)).size).toBeGreaterThanOrEqual(8);
    expect(new Set(footballBlindResumeMatchups.map((matchup) => matchup.archetype))).toEqual(new Set([
      "player-career",
      "player-season",
      "coach",
      "program-era",
    ]));

    for (const matchup of resolvedFootballBlindResumeMatchups()) {
      expect([matchup.leftId, matchup.rightId]).toContain(matchup.winnerId);
      expect(matchup.prompt).toBe("Who has the better résumé?");
      expect(["medium", "hard"]).toContain(matchup.difficulty);
    }
  });

  it("uses only canonical footballFactualStats rows and varies the evidence shape by matchup", () => {
    const evidenceLengths = new Set<number>();
    const revealSignatures = new Set<string>();
    const openingCounts = new Set<number>();

    for (const matchup of footballBlindResumeMatchups) {
      expect(matchup.stats.length).toBeGreaterThanOrEqual(6);
      expect(matchup.stats.length).toBeLessThanOrEqual(8);
      expect(matchup.stats.every((stat) => stat.source.owner === "footballFactualStats")).toBe(true);
      expect(new Set(matchup.stats.map((stat) => stat.source.dimensionId)).size).toBe(matchup.stats.length);
      expect(new Set(matchup.stats.map((stat) => stat.label.trim().toLowerCase())).size).toBe(matchup.stats.length);
      expect(matchup.revealCounts).toHaveLength(FOOTBALL_BLIND_RESUME_REVEAL_STAGES);
      expect(matchup.revealCounts[0]).toBeGreaterThan(0);
      expect(matchup.revealCounts[0]).toBeLessThan(matchup.revealCounts[1]);
      expect(matchup.revealCounts[1]).toBeLessThan(matchup.revealCounts[2]);
      expect(matchup.revealCounts[2]).toBe(matchup.stats.length);

      evidenceLengths.add(matchup.stats.length);
      revealSignatures.add(matchup.revealCounts.join("/"));
      openingCounts.add(matchup.revealCounts[0]);
    }

    expect(evidenceLengths.size).toBeGreaterThan(1);
    expect(revealSignatures.size).toBeGreaterThanOrEqual(4);
    expect(openingCounts.size).toBeGreaterThan(1);
  });

  it("builds deterministic three-round mixed Daily slates without duplicate subjects or categories", () => {
    for (let index = 0; index < 32; index += 1) {
      const seed = `blind-resume-daily-v4-${index}`;
      const first = buildFootballBlindResumeRounds(seed, FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES);
      const second = buildFootballBlindResumeRounds(seed, FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES);

      expect(first).toEqual(second);
      expect(first).toHaveLength(FOOTBALL_BLIND_RESUME_ROUNDS);
      expect(first.map((round) => round.difficulty)).toEqual([...FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES]);
      expect(new Set(first.map((round) => round.id)).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS);
      expect(new Set(first.map((round) => round.packId)).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS);
      expect(new Set(first.map((round) => round.league))).toEqual(new Set(["NFL", "CFB"]));

      const subjectIds = first.flatMap((round) => [
        footballBlindResumeSubjectIdentityId(round.leftId),
        footballBlindResumeSubjectIdentityId(round.rightId),
      ]);
      expect(new Set(subjectIds).size).toBe(FOOTBALL_BLIND_RESUME_ROUNDS * 2);
    }
  });
});