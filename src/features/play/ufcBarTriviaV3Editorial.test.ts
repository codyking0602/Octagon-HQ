import { describe, expect, it } from "vitest";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";
import { buildBarTriviaDailySetup, UFC_BAR_TRIVIA_UNIQUE_APPEARANCES } from "./barTriviaDailyRuntime";
import { lockedWeightedGameForDay } from "./dailyChallengeRotation";
import {
  UFC_BAR_TRIVIA_V3_RETIRE_IDS,
  UFC_BAR_TRIVIA_V3_REWORK_IDS,
  UFC_BAR_TRIVIA_V3_FACT_FAMILIES,
} from "./ufcBarTriviaV3Editorial";

const ufc = BAR_TRIVIA_QUESTION_BANK.filter((q) => q.league === "ufc");
const evergreen = ufc.filter((q) => q.contentType === "evergreen");

describe("UFC Bar Trivia v3 full editorial rebuild", () => {
  it("removes the 98 reviewed legacy facts without touching authored publication evidence", () => {
    expect(UFC_BAR_TRIVIA_V3_RETIRE_IDS.size).toBe(98);
    expect(UFC_BAR_TRIVIA_V3_REWORK_IDS.size).toBe(96);
    for (const id of UFC_BAR_TRIVIA_V3_RETIRE_IDS) {
      expect(ufc.some((q) => q.id === id), id).toBe(false);
    }
    expect(ufc.some((q) => q.id === "ufc-r3-bustamante-ufc-debut")).toBe(false);
  });

  it("adds 110 distinct sourced new facts and enough inventory for a 20-appearance cycle", () => {
    const additions = evergreen.filter((q) => q.id.startsWith("ufc-bt-v3-"));
    expect(additions).toHaveLength(110);
    expect(new Set(additions.map((q) => q.prompt.trim().toLowerCase())).size).toBe(110);
    expect(new Set(ufc.map((q) => q.id)).size).toBe(ufc.length);
    expect(new Set(ufc.map((q) => q.prompt.trim().toLowerCase())).size).toBe(ufc.length);
    const required: Record<string, number> = { round1: 80, round2: 40, round3: 60, "last-call": 20 };
    for (const [round, minimum] of Object.entries(required)) {
      expect(evergreen.filter((q) => q.round === round).length, round).toBeGreaterThanOrEqual(minimum);
    }
    for (const question of ufc) {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices).toContain(question.answer);
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.sourceUrl, question.id).toMatch(/^https:\/\//);
    }
  });

  it("guarantees 20 seeded UFC Daily appearances with no repeated ID or reviewed fact family", () => {
    expect(UFC_BAR_TRIVIA_UNIQUE_APPEARANCES).toBe(20);
    const days = ["2026-09-29"];
    for (let offset = 0; offset < 240 && days.length < 20; offset++) {
      const day = new Date(Date.UTC(2026, 9, 1 + offset)).toISOString().slice(0, 10);
      if (lockedWeightedGameForDay("ufc", day) === "bar_trivia") days.push(day);
    }
    expect(days).toHaveLength(20);
    const ids = new Set<string>();
    const families = UFC_BAR_TRIVIA_V3_FACT_FAMILIES.map((members) => new Set(members));
    const seenFamilies = new Set<number>();
    for (const day of days) {
      const board = buildBarTriviaDailySetup("ufc", day, "ufc-v3-cycle-regression");
      const questions = board.revealSetup.questions as Array<{id: string; round: string; difficulty: string}>;
      expect(questions).toHaveLength(10);
      expect(questions[3]?.round).toBe("round2");
      expect(questions[3]?.difficulty).toBe("easy");
      expect(new Set(questions.map((q) => q.id)).size).toBe(10);
      for (const question of questions) {
        expect(ids.has(question.id), day + ": " + question.id).toBe(false);
        ids.add(question.id);
        for (const [index, members] of families.entries()) {
          if (!members.has(question.id)) continue;
          expect(seenFamilies.has(index), day + ": duplicate conceptual fact family " + index).toBe(false);
          seenFamilies.add(index);
        }
      }
    }
    expect(ids.size).toBe(200);
  });
});
