import type { FamilyFeudEntityKind } from "../games/familyFeudEngine";
import type {
  SportsFeudAuthoredAnswer,
  SportsFeudAuthoredQuestion,
} from "./sportsFeudBankTypes";

export interface SportsFeudQuestionVariant {
  prompt: string;
  category?: string;
  entityKind?: FamilyFeudEntityKind;
  collisionGroup?: string;
  answers?: readonly (string | SportsFeudAuthoredAnswer)[];
  alsoAcceptedAnswers?: readonly (string | SportsFeudAuthoredAnswer)[];
}

export interface SportsFeudQuestionFamily {
  category: string;
  entityKind: FamilyFeudEntityKind;
  collisionGroup?: string;
  prompts: readonly (string | SportsFeudQuestionVariant)[];
  answers: readonly (string | SportsFeudAuthoredAnswer)[];
  alsoAcceptedAnswers?: readonly (string | SportsFeudAuthoredAnswer)[];
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
      throw new Error(prefix + " family " + (familyIndex + 1) + " must contain exactly five prompts.");
    }
    if (family.answers.length < 8) {
      throw new Error(prefix + " family " + (familyIndex + 1) + " must contain at least eight answers.");
    }
    family.prompts.forEach((promptValue, promptIndex) => {
      const variant = typeof promptValue === "string" ? null : promptValue;
      const prompt = typeof promptValue === "string" ? promptValue : promptValue.prompt;
      const rankedAnswers = variant?.answers ?? family.answers;
      const acceptedAnswers = variant?.alsoAcceptedAnswers !== undefined
        ? variant.alsoAcceptedAnswers
        : family.alsoAcceptedAnswers;

      if (rankedAnswers.length < 8) {
        throw new Error(
          prefix + " family " + (familyIndex + 1) + " prompt " + (promptIndex + 1)
            + " must contain at least eight answers.",
        );
      }

      questions.push({
        id: prefix + "-" + String(familyIndex + 1).padStart(2, "0") + "-" + (promptIndex + 1),
        category: variant?.category ?? family.category,
        entityKind: variant?.entityKind ?? family.entityKind,
        collisionGroup: variant?.collisionGroup ?? family.collisionGroup,
        prompt,
        answers: rankedAnswers.slice(0, 8).map(answer),
        ...(acceptedAnswers?.length
          ? { alsoAcceptedAnswers: acceptedAnswers.map(answer) }
          : {}),
      });
    });
  });
  return questions;
}
