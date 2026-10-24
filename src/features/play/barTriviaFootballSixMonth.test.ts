import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";
import { BAR_TRIVIA_EDITORIAL_RETIREMENTS } from "./barTriviaEditorialCuration";
import { FOOTBALL_BAR_TRIVIA_V2_LAST_CALL, FOOTBALL_BAR_TRIVIA_V2_RETIREMENTS } from "./barTriviaFootballEditorialV2";
import { FOOTBALL_BAR_TRIVIA_V2_REWRITES } from "./barTriviaFootballRewritesV2";
import { footballTriviaConceptKey } from "./barTriviaFootballConcepts";
import { buildBarTriviaDailySetup } from "./barTriviaDailyRuntime";
import { footballBarTriviaLeagueForDay, lockedWeightedGameForDay } from "./dailyChallengeRotation";
import type { BarTriviaQuestion } from "../games/barTriviaEngine";

describe("Football Bar Trivia quality-first six-month bank", () => {
  it("honors every v2 retirement and preserves correct four-choice grading for replacements", () => {
    const ids = new Set(BAR_TRIVIA_QUESTION_BANK.map((question) => question.id));
    for (const id of FOOTBALL_BAR_TRIVIA_V2_RETIREMENTS) expect(ids.has(id), id).toBe(false);
    for (const id of Object.keys(BAR_TRIVIA_EDITORIAL_RETIREMENTS)) expect(ids.has(id), id).toBe(false);

    expect(FOOTBALL_BAR_TRIVIA_V2_RETIREMENTS.size).toBe(71);
    expect(Object.keys(FOOTBALL_BAR_TRIVIA_V2_REWRITES)).toHaveLength(55);
    expect(FOOTBALL_BAR_TRIVIA_V2_LAST_CALL.filter((q) => q.league === "nfl")).toHaveLength(8);
    expect(FOOTBALL_BAR_TRIVIA_V2_LAST_CALL.filter((q) => q.league === "cfb")).toHaveLength(12);
    for (const question of FOOTBALL_BAR_TRIVIA_V2_LAST_CALL) {
      expect(question.sourceUrl, question.id).toMatch(/^https:\/\//);
      expect(question.verifiedAt, question.id).toBe("2026-10-24");
    }

    for (const league of ["nfl", "cfb"] as const) {
      const bank = BAR_TRIVIA_QUESTION_BANK.filter((question) => question.league === league);
      expect(bank).toHaveLength(league === "nfl" ? 214 : 211);
      const lastCall = bank.filter((question) => question.round === "last-call");
      expect(lastCall.length).toBeGreaterThanOrEqual(league === "nfl" ? 15 : 12);
    }

    const allPrompts = new Set<string>();
    for (const question of BAR_TRIVIA_QUESTION_BANK.filter((q) => q.league === "nfl" || q.league === "cfb")) {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices).toContain(question.answer);
      expect(question.factKey).toBe(footballTriviaConceptKey(question.id));
      const prompt = question.prompt.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      expect(allPrompts.has(question.league + ":" + prompt), question.id).toBe(false);
      allPrompts.add(question.league + ":" + prompt);
    }
  });

  it("produces unique question IDs AND fact families over the exact 182-day horizon", () => {
    const seen: Record<"nfl" | "cfb", Set<string>> = { nfl: new Set(), cfb: new Set() };
    const counts: Record<"nfl" | "cfb", number> = { nfl: 0, cfb: 0 };
    const seed = "football-bar-trivia-v3-six-month-contract";
    for (let offset = 0; offset < 182; offset++) {
      const date = new Date(Date.UTC(2026, 9, 24 + offset)).toISOString().slice(0, 10);
      if (lockedWeightedGameForDay("football", date) !== "bar_trivia") continue;
      const league = footballBarTriviaLeagueForDay(date);
      const setup = buildBarTriviaDailySetup(league, date, seed);
      const run = setup.privateSetupEvidence.questions as BarTriviaQuestion[];
      expect(run, date).toHaveLength(10);
      expect(new Set(run.map((q) => q.id)).size, date).toBe(10);
      expect(new Set(run.map((q) => q.factKey ?? q.id)).size, date).toBe(10);
      for (const question of run) {
        const key = question.factKey ?? question.id;
        expect(seen[league].has(key), league + " " + date + " repeated fact " + key).toBe(false);
        seen[league].add(key);
      }
      counts[league]++;
    }
    expect(counts).toEqual({ nfl: 10, cfb: 10 });
    expect(seen.nfl.size).toBe(100);
    expect(seen.cfb.size).toBe(100);
  });

  it("retains a dedicated, non-overlapping December Cowboys-Seahawks board", () => {
    const board = buildBarTriviaDailySetup("nfl", "2026-12-07", "football-bar-trivia-v3-six-month-contract");
    const questions = board.privateSetupEvidence.questions as BarTriviaQuestion[];
    expect(questions).toHaveLength(10);
    expect(questions.every((question) => question.id.startsWith("theme-cowboys-seahawks-2026-"))).toBe(true);
    expect(new Set(questions.map((question) => question.factKey ?? question.id)).size).toBe(10);
    expect(questions.some((question) => question.prompt.includes("1992-season NFC Championship"))).toBe(true);
  });
});
