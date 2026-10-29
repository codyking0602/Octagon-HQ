import { describe, expect, it } from "vitest";
import { UFC_BAR_TRIVIA_V3_EASY_MEDIUM } from "./ufcBarTriviaV3EasyMedium";
import { UFC_BAR_TRIVIA_V3_HARD_FINAL } from "./ufcBarTriviaV3HardFinal";

const v3 = [...UFC_BAR_TRIVIA_V3_EASY_MEDIUM, ...UFC_BAR_TRIVIA_V3_HARD_FINAL];

describe("UFC Bar Trivia v3 plausible multiple-choice options", () => {
  it("never offers a wrong choice already named in its question stem", () => {
    expect(v3).toHaveLength(110);
    for (const question of v3) {
      const stem = question.prompt.toLocaleLowerCase();
      for (const choice of question.choices) {
        if (choice === question.answer || choice.length < 5) continue;
        expect(stem.includes(choice.toLocaleLowerCase()),
          `${question.id}: distractor "${choice}" appears in the stem`).toBe(false);
      }
      expect(new Set(question.choices).size, question.id).toBe(4);
      expect(question.choices, question.id).toContain(question.answer);
    }
  });

  it("preserves valid answers while removing the three opponent-as-answer distractors", () => {
    const examples = [
      ["ufc-bt-v3-h-002", "Chuck Liddell", "Wanderlei Silva", "Tito Ortiz"],
      ["ufc-bt-v3-h-023", "Zhang Weili", "Joanna Jedrzejczyk", "Carla Esparza"],
      ["ufc-bt-v3-f-013", "Chan Sung Jung", "Dustin Poirier", "Ricardo Lamas"],
    ] as const;
    for (const [id, answer, invalid, replacement] of examples) {
      const question = v3.find((q) => q.id === id);
      expect(question, id).toBeDefined();
      expect(question?.answer, id).toBe(answer);
      expect(question?.choices, id).not.toContain(invalid);
      expect(question?.choices, id).toContain(replacement);
    }
  });
});
