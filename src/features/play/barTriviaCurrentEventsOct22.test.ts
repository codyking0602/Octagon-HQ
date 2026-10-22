import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_OCT22_VERIFIED_EVENTS } from "./barTriviaCurrentEventsOct22";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";
import { buildBarTriviaRun, isBarTriviaQuestionActive } from "../games/barTriviaEngine";

describe("October 22 independently sourced Bar Trivia current events", () => {
  it("has eight distinct readable questions spanning NFL, college football and UFC", () => {
    const rows = BAR_TRIVIA_OCT22_VERIFIED_EVENTS;
    expect(rows).toHaveLength(8);
    expect(new Set(rows.map((q) => q.id)).size).toBe(8);
    expect(rows.filter((q) => q.league === "nfl")).toHaveLength(3);
    expect(rows.filter((q) => q.league === "cfb")).toHaveLength(3);
    expect(rows.filter((q) => q.league === "ufc")).toHaveLength(2);

    for (const q of rows) {
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.choices).toContain(q.answer);
      expect(q.prompt.toLowerCase().includes(q.answer.toLowerCase()), q.id).toBe(false);
      expect(q.choices.some((choice) =>
        choice.toLowerCase() !== q.answer.toLowerCase() &&
        q.prompt.toLowerCase().includes(choice.toLowerCase())
      ), q.id + " includes an obvious already-named wrong option").toBe(false);
      expect(q.sourceUrl).toMatch(/^https:\/\/(?:www\.)?(?:nfl|buccaneers|ncaa|ufc)\.com\//);
      expect(q.verifiedAt).toBe("2026-10-22");
      expect(q.contentType).toBe("current-event");
      expect(isBarTriviaQuestionActive(q, "2026-10-22T12:00:00Z")).toBe(true);
      expect(isBarTriviaQuestionActive(q, "2026-11-14T12:00:00Z")).toBe(false);
      expect(BAR_TRIVIA_QUESTION_BANK.some((x) => x.id === q.id)).toBe(true);
    }
  });

  it("keeps readable evergreen fallback and ten-choice boards in all three leagues", () => {
    for (const league of ["nfl", "cfb", "ufc"] as const) {
      const run = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, league, {
        random: () => 0.43,
        now: "2026-10-23T12:00:00Z",
      });
      expect(run).toHaveLength(10);
      expect(new Set(run.map((q) => q.id)).size).toBe(10);
      expect(run.filter((q) => q.contentType === "current-event").length).toBeGreaterThan(0);
    }
  });
});
