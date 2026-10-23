import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_ROUND_SLOTS, createBarTriviaState, setBarTriviaWager, submitBarTriviaAnswer } from "../games/barTriviaEngine";
import { NBA_BAR_TRIVIA_QUESTION_BANK } from "./nbaBarTriviaQuestionBank";
import {
  buildNbaBarTriviaDailyBoard,
  NBA_BAR_TRIVIA_UNIQUE_APPEARANCES,
} from "./nbaBarTriviaDailyRotation";

const roundDifficulty = {
  round1: "easy",
  round2: "medium",
  round3: "hard",
  "last-call": "last-call",
} as const;

describe("NBA Bar Trivia quality and Daily owner preview", () => {
  it("maintains audited evergreen bank dimensions without hiding content shortfall", () => {
    expect(NBA_BAR_TRIVIA_QUESTION_BANK.length).toBe(163);
    expect(NBA_BAR_TRIVIA_UNIQUE_APPEARANCES).toBe(15);
    for (const [round, minimum] of Object.entries({ round1: 45, round2: 51, round3: 46, "last-call": 21 })) {
      expect(NBA_BAR_TRIVIA_QUESTION_BANK.filter(q => q.round === round)).toHaveLength(minimum);
    }
    const ids = NBA_BAR_TRIVIA_QUESTION_BANK.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const prompts = NBA_BAR_TRIVIA_QUESTION_BANK.map(q => q.prompt.trim().toLowerCase());
    expect(new Set(prompts).size).toBe(prompts.length);
    for (const question of NBA_BAR_TRIVIA_QUESTION_BANK) {
      expect(question.league).toBe("nba");
      expect(question.difficulty).toBe(roundDifficulty[question.round]);
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices.map(choice => choice.toLowerCase())).size).toBe(4);
      expect(question.choices).toContain(question.answer);
      expect(question.prompt.length).toBeGreaterThan(20);
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.contentType).toBe("evergreen");
      expect(question.sourceId).toBeTruthy();
      expect(question.sourceUrl).toMatch(/^https:\/\/www\.nba\.com\//);
    }
  });

  it("provides 15 shared seeded appearances with no question repeated inside a cycle", () => {
    for (let cycle = 0; cycle < 2; cycle += 1) {
      const seen = new Set<string>();
      for (let slot = 0; slot < NBA_BAR_TRIVIA_UNIQUE_APPEARANCES; slot++) {
        const index = cycle * NBA_BAR_TRIVIA_UNIQUE_APPEARANCES + slot;
        const board = buildNbaBarTriviaDailyBoard(index);
        expect(buildNbaBarTriviaDailyBoard(index)).toBe(board);
        expect(board.questions).toHaveLength(10);
        expect(board.questions.map(q => q.round)).toEqual(BAR_TRIVIA_ROUND_SLOTS);
        expect(board.questions.map(q => q.difficulty)).toEqual(
          BAR_TRIVIA_ROUND_SLOTS.map(round => roundDifficulty[round]),
        );
        expect(new Set(board.questions.map(q => q.id)).size).toBe(10);
        for (const q of board.questions) {
          expect(seen.has(q.id), `repeated question ${q.id} in cycle ${cycle}`).toBe(false);
          seen.add(q.id);
        }
      }
      expect(seen.size).toBe(150);
    }
  });

  it("never silently accepts invalid appearance indices", () => {
    for (const invalid of [Number.NaN, -1, Infinity, 0.2, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => buildNbaBarTriviaDailyBoard(invalid)).toThrow();
    }
  });

  it("inherits the established engine for a complete Last Call preview run", () => {
    const board = buildNbaBarTriviaDailyBoard(0);
    let state = createBarTriviaState(board.doubleRound);
    for (let i = 0; i < 9; i++) {
      state = submitBarTriviaAnswer(board.questions, state, board.questions[i]!.answer).state;
    }
    state = setBarTriviaWager(state, 5);
    state = submitBarTriviaAnswer(board.questions, state, board.questions[9]!.answer).state;
    expect(state.complete).toBe(true);
    expect(state.index).toBe(10);
    expect(state.correctCount).toBe(10);
    expect(state.answers).toHaveLength(10);
    expect(state.score).toBeGreaterThanOrEqual(90);
  });

  it("gates preview to owner and never invokes official Daily result/write plumbing", () => {
    const routes = readFileSync("src/app/router.tsx", "utf8");
    expect(routes).toContain('path: "nba/bar-trivia", element: <NbaWhoAmIOwnerGate><NbaBarTriviaOwnerPreviewPage /></NbaWhoAmIOwnerGate>');
    const preview = readFileSync("src/features/nba/NbaBarTriviaOwnerPreviewPage.tsx", "utf8");
    expect(preview).toContain('scope="nba"');
    expect(preview).toContain("runOverride={board.questions}");
    expect(preview).toContain("onSettled={() => undefined}");
    expect(preview).not.toMatch(/submitOfficial|recordLineupCompletion|claimDaily|onAdvanceDaily|mutateAsync|createOfficial/);
    const landing = readFileSync("src/features/nba/NbaPlayPage.tsx", "utf8");
    const entry = landing.split('aria-label="NBA Bar Trivia owner Daily preview"')[1]?.slice(0, 750) ?? "";
    expect(entry).toContain("DAILY ONLY");
    expect(entry).not.toContain("PLAY CASUAL");
  });
});
