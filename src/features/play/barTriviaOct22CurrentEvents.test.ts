import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_CURRENT_EVENT_QUESTIONS } from "./barTriviaCurrentEvents";
import { isBarTriviaQuestionActive } from "../games/barTriviaEngine";

const OCT22_IDS = [
  "nfl-current-2026-w6-titans-colts-upset",
  "nfl-current-2026-w7-walker-mvp-buzz",
  "cfb-current-2026-w7-auburn-georgia-upset",
  "cfb-current-2026-w7-florida-texas-upset",
  "ufc-current-2026-10-17-malott-buckley",
  "ufc-current-2026-10-17-jasudavicius-blanchfield",
  "ufc-current-2026-10-10-allen-duncan",
] as const;

describe("October 22 Bar Trivia source-backed event refresh", () => {
  it("publishes exactly the reviewed stories with validated windows and answers", () => {
    const bank = new Map(BAR_TRIVIA_CURRENT_EVENT_QUESTIONS.map((q) => [q.id, q]));
    expect(new Set(BAR_TRIVIA_CURRENT_EVENT_QUESTIONS.map((q) => q.id)).size)
      .toBe(BAR_TRIVIA_CURRENT_EVENT_QUESTIONS.length);

    for (const id of OCT22_IDS) {
      const q = bank.get(id);
      expect(q, id).toBeDefined();
      expect(q?.verifiedAt).toBe("2026-10-22");
      expect(q?.sourceUrl).toMatch(/^https:\/\/(www\.)?(nfl|ncaa|ufc)\.com\//);
      expect(q?.choices).toContain(q?.answer);
      expect(new Set(q?.choices).size).toBe(4);
      expect(q?.contentType).toBe("current-event");
      expect(isBarTriviaQuestionActive(q!, "2026-10-22T12:00:00Z")).toBe(true);
      expect(isBarTriviaQuestionActive(q!, "2026-11-14T12:00:00Z")).toBe(false);
    }
  });

  it("has at least three distinct eligible sourced event questions per league", () => {
    for (const league of ["nfl", "cfb", "ufc"] as const) {
      const eligible = BAR_TRIVIA_CURRENT_EVENT_QUESTIONS.filter((q) =>
        q.league === league && isBarTriviaQuestionActive(q, "2026-10-22T12:00:00Z")
      );
      expect(eligible.length, league).toBeGreaterThanOrEqual(3);
      expect(new Set(eligible.map((q) => q.id)).size).toBe(eligible.length);
    }
  });
});
