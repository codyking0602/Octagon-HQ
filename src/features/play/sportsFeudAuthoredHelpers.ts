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

const STANDARD_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "Arrowhead Stadium": ["Arrowhead", "Chiefs", "Kansas City", "Kansas City Chiefs"],
  "Lumen Field": ["Lumen", "Seahawks", "Seattle", "Seattle Seahawks"],
  "Lambeau Field": ["Lambeau", "Packers", "Green Bay", "Green Bay Packers"],
  "Highmark Stadium": ["Highmark", "Bills", "Buffalo", "Buffalo Bills"],
  "Superdome": ["Caesars Superdome", "Saints", "New Orleans", "New Orleans Saints"],
  "Lincoln Financial Field": ["The Linc", "Linc", "Eagles", "Philadelphia", "Philadelphia Eagles"],
  "M&T Bank Stadium": ["M and T", "Ravens", "Baltimore", "Baltimore Ravens"],
  "U.S. Bank Stadium": ["US Bank", "Vikings", "Minnesota", "Minnesota Vikings"],
  "Ford Field": ["Lions", "Detroit", "Detroit Lions"],
  "Empower Field at Mile High": ["Mile High", "Broncos", "Denver", "Denver Broncos"],
  "Punt coverage": ["Cover punt", "Cover punts", "Punt cover", "Punt team"],
  "Kick coverage": ["Cover kick", "Cover kicks", "Kick cover", "Kickoff coverage"],
  "Defensive Player of the Year": ["DPOY"],
  "Offensive Player of the Year": ["OPOY"],
  "Offensive Rookie of the Year": ["OROY"],
  "Defensive Rookie of the Year": ["DROY"],
  "Comeback Player of the Year": ["CPOY"],
  "Walter Payton Man of the Year": ["WPMOY", "Man of the Year"],
  "First-team All-Pro": ["All-Pro", "First Team All-Pro"],
  "Pass interference": ["PI", "DPI", "OPI"],
  "Personal foul": ["Unnecessary roughness"],
  "Roughing the passer": ["RTP"],
  "Best player available": ["BPA", "Best available"],
  "Play-action": ["Play action", "PA"],
  "RPO": ["Run-pass option", "Run pass option"],
  "Four verticals": ["Four verts", "4 verts", "Verts"],
  "Running back": ["RB"],
  "Touchdown": ["TD"],
  "Field goal": ["FG"],
  "Extra point": ["PAT", "Point after", "Point after touchdown"],
  "Yards per attempt": ["YPA"],
  "Tackles for loss": ["TFL", "TFLs"],
};

function answer(value: string | SportsFeudAuthoredAnswer): SportsFeudAuthoredAnswer {
  if (typeof value !== "string") return value;
  const aliases = STANDARD_ALIASES[value];
  return aliases ? { name: value, aliases } : { name: value };
}

function answerName(value: string | SportsFeudAuthoredAnswer): string {
  return (typeof value === "string" ? value : value.name).trim().toLowerCase();
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
    const familyAnswerByName = new Map(
      [...family.answers, ...(family.alsoAcceptedAnswers ?? [])].map((value) => [answerName(value), value] as const),
    );
    const resolveFamilyAnswer = (value: string | SportsFeudAuthoredAnswer) =>
      typeof value === "string" ? (familyAnswerByName.get(answerName(value)) ?? value) : value;

    family.prompts.forEach((promptValue, promptIndex) => {
      const variant = typeof promptValue === "string" ? null : promptValue;
      const prompt = typeof promptValue === "string" ? promptValue : promptValue.prompt;
      const rankedAnswers = (variant?.answers ?? family.answers).map(resolveFamilyAnswer);
      const acceptedAnswers = (variant?.alsoAcceptedAnswers !== undefined
        ? variant.alsoAcceptedAnswers
        : family.alsoAcceptedAnswers)?.map(resolveFamilyAnswer);

      if (rankedAnswers.length < 8) {
        throw new Error(
          prefix + " family " + (familyIndex + 1) + " prompt " + (promptIndex + 1)
            + " must contain at least eight answers.",
        );
      }

      const rankedNames = new Set(rankedAnswers.slice(0, 8).map(answerName));
      const offBoardAnswers = acceptedAnswers?.filter((value) => !rankedNames.has(answerName(value)));

      questions.push({
        id: prefix + "-" + String(familyIndex + 1).padStart(2, "0") + "-" + (promptIndex + 1),
        category: variant?.category ?? family.category,
        entityKind: variant?.entityKind ?? family.entityKind,
        collisionGroup: variant?.collisionGroup ?? family.collisionGroup,
        prompt,
        answers: rankedAnswers.slice(0, 8).map(answer),
        ...(offBoardAnswers?.length
          ? { alsoAcceptedAnswers: offBoardAnswers.map(answer) }
          : {}),
      });
    });
  });
  return questions;
}
