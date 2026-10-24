import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";
import { FOOTBALL_BAR_TRIVIA_V2_RETIREMENTS } from "./barTriviaFootballEditorialV2";
import {
  BAR_TRIVIA_EDITORIAL_RETIREMENTS,
  BAR_TRIVIA_EDITORIAL_ROUND_OVERRIDES,
} from "./barTriviaEditorialCuration";
import { millionaireDailyRun } from "./millionaireDailyQuestionBank";
import { barTriviaDifficultyForRound } from "../games/barTriviaEngine";

const byId = new Map(BAR_TRIVIA_QUESTION_BANK.map((question) => [question.id, question]));

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

describe("2026-10-22 NFL/CFB/UFC Bar Trivia editorial curation", () => {
  it("excludes every individually reviewed retirement from new Daily seeds", () => {
    for (const [id, reason] of Object.entries(BAR_TRIVIA_EDITORIAL_RETIREMENTS)) {
      expect(reason, id).toBeTruthy();
      expect(byId.has(id), id + " should remain in original source, not the playable pool").toBe(false);
    }
    const ids = Object.keys(BAR_TRIVIA_EDITORIAL_RETIREMENTS);
    expect(ids.length).toBeGreaterThanOrEqual(90);
    expect(ids.filter((id) => id.startsWith("nfl-")).length).toBeGreaterThan(15);
    expect(ids.filter((id) => id.startsWith("cfb-")).length).toBeGreaterThan(15);
    expect(ids.filter((id) => id.startsWith("ufc-")).length).toBeGreaterThan(35);
  });

  it("places explicit regrades into the reviewed round rather than trusting old labels", () => {
    for (const [id, round] of Object.entries(BAR_TRIVIA_EDITORIAL_ROUND_OVERRIDES)) {
      expect(BAR_TRIVIA_EDITORIAL_RETIREMENTS[id], id).toBeUndefined();
      if (FOOTBALL_BAR_TRIVIA_V2_RETIREMENTS.has(id)) continue; // newly retired in the later editorial pass
      const question = byId.get(id);
      expect(question, id).toBeDefined();
      expect(question?.round, id).toBe(round);
      expect(question?.difficulty, id).toBe(barTriviaDifficultyForRound(round));
    }
    expect(BAR_TRIVIA_EDITORIAL_ROUND_OVERRIDES["cfb-r3-bowden-program"]).toBe("round2");
    expect(BAR_TRIVIA_EDITORIAL_ROUND_OVERRIDES["cfb-r2-2016-title-catch"]).toBe("round3");
  });

  it("rejects exact-answer giveaways in playable question text", () => {
    for (const question of BAR_TRIVIA_QUESTION_BANK) {
      const answer = normalize(question.answer);
      const prompt = normalize(question.prompt);
      // Full answer contained in stem is not recall, even when answer options shuffle.
      expect(prompt.includes(answer) && answer.length > 3, question.id + ": " + question.prompt).toBe(false);
    }
  });

  it("preserves a truly challenging, recognizable last-call anchor", () => {
    const anchor = byId.get("cfb-final-bluegrass-miracle-qb");
    expect(anchor?.round).toBe("last-call");
    expect(anchor?.answer).toBe("Marcus Randall");
    expect(byId.has("cfb-r3-beamer-ball")).toBe(false);
    expect(byId.has("ufc-final-first-event-year")).toBe(false);
  });

  it("removes confirmed same-fact Millionaire repeats, not every shared athlete", () => {
    const cases = [
      { sport: "nfl", id: "nfl-r1-helmet-catch-player", phrase: "helmet catch" },
      { sport: "nfl", id: "nfl-r3-first-50-pass-td", phrase: "50 touchdown passes" },
      { sport: "cfb", id: "cfb-r3-2010-auburn-heisman", phrase: "auburn to the 2010 national championship" },
      { sport: "cfb", id: "cfb-r1-first-cfp-champion", phrase: "first college football playoff national championship" },
      { sport: "ufc", id: "ufc-easy2-aldo-13", phrase: "jose aldo in 13 seconds" },
      { sport: "ufc", id: "ufc-r1-khabib-final", phrase: "khabib nurmagomedov" },
    ] as const;
    const millionairePrompts = Object.fromEntries(
      (["nfl", "cfb", "ufc"] as const).map((sport) => [
        sport,
        Array.from({ length: 10 }, (_, i) => millionaireDailyRun(sport, i))
          .flat().map((q) => normalize(q.prompt)),
      ]),
    ) as Record<"nfl" | "cfb" | "ufc", string[]>;

    for (const row of cases) {
      expect(millionairePrompts[row.sport].some((prompt) =>
        prompt.includes(normalize(row.phrase))
      ), row.id + ": matching Millionaire fact must exist").toBe(true);
      expect(byId.has(row.id), row.id + ": duplicate removed from Bar Trivia").toBe(false);
    }
  });

  it("keeps sport-wide content available after removing poor questions", () => {
    for (const league of ["nfl", "cfb", "ufc"] as const) {
      const bank = BAR_TRIVIA_QUESTION_BANK.filter((question) => question.league === league);
      for (const round of ["round1", "round2", "round3", "last-call"] as const) {
        expect(bank.filter((q) => q.round === round && q.contentType === "evergreen").length, league + round)
          .toBeGreaterThanOrEqual(15);
      }
    }
  });
});
