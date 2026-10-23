import { describe, expect, it } from "vitest";
import { isBarTriviaQuestionActive } from "../games/barTriviaEngine";
import { NBA_BAR_TRIVIA_QUESTION_BANK } from "./nbaBarTriviaQuestionBank";
import { NBA_BAR_TRIVIA_CURRENT_EVENTS, validateNbaBarTriviaCurrentEvents } from "./nbaBarTriviaCurrentEvents";
import { buildNbaBarTriviaDailyBoard, NBA_BAR_TRIVIA_UNIQUE_APPEARANCES } from "./nbaBarTriviaDailyRotation";

const questions = NBA_BAR_TRIVIA_QUESTION_BANK;
const stems = questions.map(q => q.prompt.toLowerCase());

describe("NBA Bar Trivia semantic duplicates and difficulty calibration", () => {
  it("retires recognized cross-game fact collisions, not just verbatim matching", () => {
    const bannedCrossGameMoments = [
      /what is it called when the defense illegally touches a descending shot/,
      /kobe bryant scored 81|kobe bryant scored 81|opponent when kobe bryant scored 81/,
      /1976 nba finals.*triple.overtime/,
      /allan houston.*1999.*series.winner/,
      /winning three.pointer in game 5 of the 2005 finals for the spurs/,
      /nicknamed ['"]the klaw['"]/,
    ];
    for (const banned of bannedCrossGameMoments) {
      expect(stems.some(prompt => banned.test(prompt)), `NBA Bar Trivia repeated fact: ${banned}`).toBe(false);
    }
    // The Phoenix Suns offensive era is only used for ONE prompt, not a second
    // Mike D'Antoni variant whose answer is different but fact is the same.
    expect(stems.filter(prompt => prompt.includes("seven seconds or less"))).toHaveLength(1);
  });

  it("keeps the tough rounds recognizable but not answer-leaking", () => {
    const allIds = new Set(questions.map(q => q.id));
    expect(allIds.size).toBe(200);
    const gradeCorrections = [
      "nba-bt-h-001", "nba-bt-h-036", "nba-bt-f-010", "nba-bt-f-011",
      "nba-bt-200-h-01", "nba-bt-200-h-18", "nba-bt-200-f-04",
    ];
    for (const id of gradeCorrections) {
      const q = questions.find(row => row.id === id);
      expect(q, `Missing reviewed fact: ${id}`).toBeDefined();
      expect(q!.prompt.toLowerCase()).not.toContain(q!.answer.toLowerCase());
      expect(q!.sourceUrl).toMatch(/^https:\/\/www\.nba\.com\//);
      expect(q!.explanation.length).toBeGreaterThan(70);
    }
  });
});

describe("NBA Bar Trivia current-event editorial publishing", () => {
  it("only stages verified, bounded and sourced NBA current events", () => {
    expect(NBA_BAR_TRIVIA_CURRENT_EVENTS).toHaveLength(5);
    expect(() => validateNbaBarTriviaCurrentEvents(NBA_BAR_TRIVIA_CURRENT_EVENTS)).not.toThrow();
    for (const q of NBA_BAR_TRIVIA_CURRENT_EVENTS) {
      expect(q.contentType).toBe("current-event");
      expect(q.sourceUrl).toMatch(/^https:\/\/www\.nba\.com\//);
      expect(q.activeFrom).toBeTruthy();
      expect(q.expiresAt).toBeTruthy();
      expect(q.verifiedAt).toBeTruthy();
      expect(isBarTriviaQuestionActive(q, "2026-10-22T12:00:00Z")).toBe(false);
      expect(isBarTriviaQuestionActive(q, "2026-10-23T18:00:00Z")).toBe(true);
      expect(isBarTriviaQuestionActive(q, "2026-11-08T18:00:00Z")).toBe(false);
    }
    expect(() => validateNbaBarTriviaCurrentEvents([
      { ...NBA_BAR_TRIVIA_CURRENT_EVENTS[0]!, expiresAt: "2028-01-01T00:00:00Z" },
    ])).toThrow();
  });

  it("uses at most two timely stories when available with 20 unique appearances", () => {
    const seen = new Set<string>();
    let newsCount = 0;
    for (let slot = 0; slot < NBA_BAR_TRIVIA_UNIQUE_APPEARANCES; slot++) {
      const board = buildNbaBarTriviaDailyBoard(slot, "2026-10-23");
      const news = board.questions.filter(q => q.contentType === "current-event");
      expect(news.length).toBeLessThanOrEqual(2);
      newsCount += news.length;
      for (const q of board.questions) {
        expect(seen.has(q.id), `Repeated at appearance ${slot}: ${q.id}`).toBe(false);
        seen.add(q.id);
      }
    }
    expect(newsCount).toBe(5);
    expect(seen.size).toBe(200);
  });

  it("expires stories and falls back to all 200 evergreen questions without filler", () => {
    const seen = new Set<string>();
    for (let slot = 0; slot < NBA_BAR_TRIVIA_UNIQUE_APPEARANCES; slot++) {
      const board = buildNbaBarTriviaDailyBoard(slot, "2026-11-15");
      expect(board.questions.every(q => q.contentType === "evergreen")).toBe(true);
      for (const q of board.questions) {
        expect(seen.has(q.id)).toBe(false);
        seen.add(q.id);
      }
    }
    expect(seen).toEqual(new Set(questions.map(q => q.id)));
    expect(() => buildNbaBarTriviaDailyBoard(0, "not-a-date")).toThrow();
  });
});
