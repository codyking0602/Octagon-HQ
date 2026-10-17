import { describe, expect, it } from "vitest";
import {
  FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES,
  FOOTBALL_BLIND_RESUME_STAGE3_HOLDS,
  buildFootballBlindResumeRounds,
  footballBlindResumeMatchups,
  footballBlindResumeStage3Eligible,
  footballBlindResumeSubjectIdentityId,
} from "./footballBlindResumeModel";

describe("Stage 3 Football Blind Resume review-only holds", () => {
  it("preserves all existing 30 authored matchups, including published history", () => {
    expect(footballBlindResumeMatchups).toHaveLength(30);
    expect(FOOTBALL_BLIND_RESUME_STAGE3_HOLDS.size).toBe(6);
    for (const id of FOOTBALL_BLIND_RESUME_STAGE3_HOLDS) {
      const original = footballBlindResumeMatchups.find((pair) => pair.id === id);
      expect(original, `unrecognized held ID: ${id}`).toBeDefined();
      expect(footballBlindResumeStage3Eligible(original!)).toBe(false);
    }
  });

  it("builds varied three-round future NFL/CFB slates without held pairs or reused subjects", () => {
    const matched = new Set<string>();
    for (let i = 0; i < 60; i += 1) {
      const seed = `stage3-football-review-${i}`;
      const rounds = buildFootballBlindResumeRounds(
        seed,
        FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES,
        { stage3ReviewedSelection: true },
      );
      expect(buildFootballBlindResumeRounds(
        seed, FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES, { stage3ReviewedSelection: true },
      )).toEqual(rounds);
      expect(rounds).toHaveLength(3);
      expect(rounds.map((round) => round.difficulty)).toEqual([...FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES]);
      expect(new Set(rounds.map((round) => round.league))).toEqual(new Set(["NFL", "CFB"]));
      const identities = rounds.flatMap((round) => [
        footballBlindResumeSubjectIdentityId(round.leftId),
        footballBlindResumeSubjectIdentityId(round.rightId),
      ]);
      expect(new Set(identities).size).toBe(6);
      for (const round of rounds) {
        expect(footballBlindResumeStage3Eligible(round)).toBe(true);
        matched.add(round.id);
      }
    }
    expect(matched.size).toBeGreaterThan(10);
  });

  it("opens six retained matchups with meaningful winner evidence rather than two misleading leads", () => {
    const expectedWinnerOpening = new Map([
      ["nfl-quarterbacks-drew-brees-v-peyton-manning", "5× AP MVP"],
      ["nfl-running-backs-adrian-peterson-v-emmitt-smith", "3 championships"],
      ["nfl-running-backs-adrian-peterson-v-walter-payton", "5× first-team All-Pro"],
      ["nfl-wide-receivers-randy-moss-v-jerry-rice", "22,895 receiving yards"],
      ["nfl-wide-receivers-calvin-johnson-v-jerry-rice", "22,895 receiving yards"],
      ["nfl-tight-ends-antonio-gates-v-tony-gonzalez", "6× first-team All-Pro"],
    ]);
    for (const [id, anchor] of expectedWinnerOpening) {
      const pair = footballBlindResumeMatchups.find((round) => round.id === id);
      expect(pair, id).toBeDefined();
      const firstClues = pair!.stats.slice(0, pair!.revealCounts[0]);
      expect(firstClues.some((clue) => clue.valueB.includes(anchor)), id).toBe(true);
    }
  });

  it("does not rewrite legacy seed selection when safe mode is omitted", () => {
    const seed = "stage3-legacy-football-seed";
    const legacy = buildFootballBlindResumeRounds(seed, FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES);
    expect(buildFootballBlindResumeRounds(seed, FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES, {})).toEqual(legacy);
  });
});
