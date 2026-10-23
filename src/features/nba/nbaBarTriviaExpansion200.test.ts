import { describe, expect, it } from "vitest";
import { nbaAverageFanQuestionBank } from "../games/nbaAverageFanBank";
import { NBA_MILLIONAIRE_QUESTION_BANK } from "./nbaMillionaireBank";
import { NBA_SPORTS_FEUD_MAIN, NBA_SPORTS_FEUD_FAST } from "./nbaSportsFeudBank";
import { NBA_BAR_TRIVIA_EASY_200 } from "./nbaBarTriviaEasy200";
import { NBA_BAR_TRIVIA_MEDIUM_200 } from "./nbaBarTriviaMedium200";
import { NBA_BAR_TRIVIA_HARD_200 } from "./nbaBarTriviaHard200";
import { NBA_BAR_TRIVIA_LAST_CALL_200 } from "./nbaBarTriviaLastCall200";
import { NBA_BAR_TRIVIA_QUESTION_BANK } from "./nbaBarTriviaQuestionBank";
import { buildNbaBarTriviaDailyBoard } from "./nbaBarTriviaDailyRotation";

const additions = [
  ...NBA_BAR_TRIVIA_EASY_200,
  ...NBA_BAR_TRIVIA_MEDIUM_200,
  ...NBA_BAR_TRIVIA_HARD_200,
  ...NBA_BAR_TRIVIA_LAST_CALL_200,
] as const;

function canonical(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
}

describe("NBA Bar Trivia four-month editorial expansion", () => {
  it("retains the 119 original questions and adds exactly 81 authored, source-linked questions", () => {
    expect(additions.length).toBe(81);
    expect(NBA_BAR_TRIVIA_QUESTION_BANK.length).toBe(200);
    for (const [round, size] of Object.entries({ round1: 60, round2: 60, round3: 60, "last-call": 20 })) {
      expect(NBA_BAR_TRIVIA_QUESTION_BANK.filter(q => q.round === round)).toHaveLength(size);
    }
    expect(new Set(NBA_BAR_TRIVIA_QUESTION_BANK.map(q => q.id)).size).toBe(200);
    expect(new Set(NBA_BAR_TRIVIA_QUESTION_BANK.map(q => canonical(q.prompt))).size).toBe(200);
    for (const q of additions) {
      expect(q.contentType).toBe("evergreen");
      expect(q.explanation.length).toBeGreaterThan(48);
      expect(q.sourceUrl).toMatch(/^https:\/\/www\.nba\.com\//);
      expect(q.choices).toHaveLength(4);
      expect(q.choices).toContain(q.answer);
      expect(new Set(q.choices.map(canonical)).size).toBe(4);
      expect(canonical(q.prompt)).not.toContain(canonical(q.answer));
    }
  });

  it("does not reuse exact questions from NBA Average Fan, Millionaire, or Sports Feud", () => {
    const otherPrompts = [
      ...nbaAverageFanQuestionBank.map(q => q.prompt),
      ...NBA_MILLIONAIRE_QUESTION_BANK.flat().map(q => q.prompt),
      ...NBA_SPORTS_FEUD_MAIN.map(q => q.prompt),
      ...NBA_SPORTS_FEUD_FAST.map(q => q.prompt),
    ];
    const other = new Set(otherPrompts.map(canonical));
    for (const q of additions) {
      expect(other.has(canonical(q.prompt)), `Already in another NBA game: ${q.id}`).toBe(false);
    }
  });

  it("has no repeated question in any of 20 NBA Daily appearances over two cycles", () => {
    for (let cycle = 0; cycle < 2; cycle++) {
      const ids = new Set<string>();
      for (let slot = 0; slot < 20; slot++) {
        const board = buildNbaBarTriviaDailyBoard(cycle * 20 + slot);
        expect(board.questions).toHaveLength(10);
        for (const q of board.questions) {
          expect(ids.has(q.id), `Repeated in cycle ${cycle}: ${q.id}`).toBe(false);
          ids.add(q.id);
        }
      }
      expect(ids.size).toBe(200);
    }
  });
});
