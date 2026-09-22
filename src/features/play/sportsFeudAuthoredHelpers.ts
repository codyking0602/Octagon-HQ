import type {
  SportsFeudAuthoredAnswer,
  SportsFeudAuthoredQuestion,
} from "./sportsFeudBankTypes";

export interface SportsFeudQuestionFamily {
  category: string;
  collisionGroup?: string;
  prompts: readonly string[];
  answers: readonly (string | SportsFeudAuthoredAnswer)[];
}

function answer(value: string | SportsFeudAuthoredAnswer): SportsFeudAuthoredAnswer {
  return typeof value === "string" ? { name: value } : value;
}

export function expandSportsFeudFamilies(
  prefix: string,
  families: readonly SportsFeudQuestionFamily[],
): SportsFeudAuthoredQuestion[] {
  const questions: SportsFeudAuthoredQuestion[] = [];
  families.forEach((family, familyIndex) => {
    if (family.prompts.length !== 5) {
      throw new Error(`${prefix} family ${familyIndex + 1} must contain exactly five prompts.`);
    }
    if (family.answers.length < 8) {
      throw new Error(`${prefix} family ${familyIndex + 1} must contain at least eight answers.`);
    }
    family.prompts.forEach((prompt, promptIndex) => {
      questions.push({
        id: `${prefix}-${String(familyIndex + 1).padStart(2, "0")}-${promptIndex + 1}`,
        category: family.category,
        collisionGroup: family.collisionGroup,
        prompt,
        answers: family.answers.slice(0, 8).map(answer),
      });
    });
  });
  return questions;
}
