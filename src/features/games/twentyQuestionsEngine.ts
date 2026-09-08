export type TwentyQuestionsSport = "ufc" | "football";
export type TwentyQuestionsLeague = "UFC" | "NFL" | "CFB";
export type TwentyQuestionsSubjectKind = "fighter" | "player" | "coach";
export type TwentyQuestionsQuestionCost = 5 | 6 | 7 | 8;
export type TwentyQuestionsHumanValue = 1 | 2 | 3 | 4;

export interface TwentyQuestionsSubject {
  id: string;
  name: string;
  kind: TwentyQuestionsSubjectKind;
  league: TwentyQuestionsLeague;
}

export interface TwentyQuestionsQuestion {
  id: string;
  label: string;
  internalCost: TwentyQuestionsQuestionCost;
  answer: (subjectId: string) => boolean;
  /** Human-recognizable deduction value. Higher values outrank cleaner database splits. */
  humanValue?: TwentyQuestionsHumanValue;
  /** Broad clue family used to keep Recommended varied. */
  recommendationFamily?: string;
}

export interface TwentyQuestionsUniverse {
  league: TwentyQuestionsLeague;
  subjects: readonly TwentyQuestionsSubject[];
  questions: readonly TwentyQuestionsQuestion[];
}

export const TWENTY_QUESTIONS_LIMIT = 10;
export const TWENTY_QUESTIONS_START_SCORE = 100;
export const TWENTY_QUESTIONS_WRONG_GUESS_PENALTY = 10;
export const TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT = 12;

export function twentyQuestionsScoreImpact(cost: TwentyQuestionsQuestionCost) {
  return Number((cost * 0.4).toFixed(1));
}

export function formatTwentyQuestionsScoreImpact(cost: TwentyQuestionsQuestionCost) {
  return `−${twentyQuestionsScoreImpact(cost).toFixed(1)} pts`;
}

/**
 * Static whole-universe pricing. A more even Yes/No split is more informative,
 * so it costs more. This is computed before play and never changes based on the
 * answers already given in a round.
 */
export function twentyQuestionsCostForSplit(yes: number, total: number): TwentyQuestionsQuestionCost {
  if (!Number.isInteger(yes) || !Number.isInteger(total) || total <= 1 || yes <= 0 || yes >= total) {
    throw new Error("20 Questions cost calibration requires an informative full-universe split.");
  }
  const minorityShare = Math.min(yes, total - yes) / total;
  if (minorityShare >= 0.4) return 8;
  if (minorityShare >= 0.3) return 7;
  if (minorityShare >= 0.18) return 6;
  return 5;
}

export function twentyQuestionsEligibleQuestions(
  questions: readonly TwentyQuestionsQuestion[],
  remainingSubjects: readonly TwentyQuestionsSubject[],
) {
  if (remainingSubjects.length <= 1) return [];
  return questions.filter((question) => {
    const yes = remainingSubjects.filter((subject) => question.answer(subject.id)).length;
    return yes > 0 && yes < remainingSubjects.length;
  });
}

export function twentyQuestionsRequiresFinalGuess(questionsAsked: number, remainingSubjectCount: number) {
  return remainingSubjectCount === 1 || questionsAsked >= TWENTY_QUESTIONS_LIMIT;
}

export function twentyQuestionsFinalGuessIsDirectlyPlayable(remainingSubjectCount: number) {
  return remainingSubjectCount >= 1 && remainingSubjectCount <= TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT;
}

function inferredHumanValue(question: TwentyQuestionsQuestion): TwentyQuestionsHumanValue {
  if (question.humanValue) return question.humanValue;
  const id = question.id.toLowerCase();
  if (
    id.startsWith("division:")
    || id.startsWith("role:")
    || id.startsWith("position:")
    || id.startsWith("position-family:")
    || id.startsWith("era:")
    || id.includes(":era:")
    || /(franchise|program|conference|college|school|team):/.test(id)
    || /(title|champ|award|mvp|all-pro|pro-bowl|heisman|super-bowl|playoff|hall-of-fame|hof|trophy|honor)/.test(id)
  ) return 4;
  if (id.startsWith("faced:") || id.startsWith("beat:") || id.includes("geography") || id.includes("height")) return 3;
  if (id.startsWith("stat:")) return 1;
  return 2;
}

function inferredRecommendationFamily(question: TwentyQuestionsQuestion) {
  if (question.recommendationFamily) return question.recommendationFamily;
  const id = question.id.toLowerCase();
  if (id.startsWith("division:") || id.startsWith("role:") || id.startsWith("position:") || id.startsWith("position-family:")) return "role";
  if (id.startsWith("era:") || id.includes(":era:") || id.includes("longevity")) return "era";
  if (id.startsWith("faced:") || id.startsWith("beat:")) return "matchups";
  if (/(franchise|program|conference|college|school|team):/.test(id)) return "affiliations";
  if (/(title|champ|award|mvp|all-pro|pro-bowl|heisman|super-bowl|playoff|hall-of-fame|hof|trophy|honor)/.test(id)) return "achievements";
  if (id.includes("geography") || id.includes("country") || id.includes("nationality") || id.includes("region")) return "geography";
  if (id.includes("height") || id.includes("size") || id.includes("weight")) return "physical";
  if (id.startsWith("stat:")) return "career-production";
  return id.split(":", 1)[0] || "career";
}

/**
 * Human deduction value is the first ranking lane during normal play. Once the
 * pool is small enough to be a direct final-guess board, exact live separation
 * takes priority so Recommended actively finishes the current candidate set.
 */
export function twentyQuestionsRecommendedQuestions(
  questions: readonly TwentyQuestionsQuestion[],
  remainingSubjects: readonly TwentyQuestionsSubject[],
  limit = 5,
) {
  if (limit <= 0 || remainingSubjects.length <= 1) return [];
  const endgame = remainingSubjects.length <= TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT;
  const ranked = twentyQuestionsEligibleQuestions(questions, remainingSubjects)
    .map((question) => {
      const yes = remainingSubjects.filter((subject) => question.answer(subject.id)).length;
      const no = remainingSubjects.length - yes;
      return {
        question,
        humanValue: inferredHumanValue(question),
        family: inferredRecommendationFamily(question),
        usefulSplit: Math.min(yes, no),
        imbalance: Math.abs(yes - no),
      };
    })
    .sort((left, right) => (
      endgame
        ? right.usefulSplit - left.usefulSplit
          || left.imbalance - right.imbalance
          || right.humanValue - left.humanValue
          || left.question.internalCost - right.question.internalCost
          || left.question.label.localeCompare(right.question.label)
        : right.humanValue - left.humanValue
          || right.usefulSplit - left.usefulSplit
          || left.imbalance - right.imbalance
          || left.question.internalCost - right.question.internalCost
          || left.question.label.localeCompare(right.question.label)
    ));

  if (endgame) return ranked.slice(0, limit).map(({ question }) => question);

  const selected: typeof ranked = [];
  const usedFamilies = new Set<string>();
  for (const entry of ranked) {
    if (usedFamilies.has(entry.family)) continue;
    selected.push(entry);
    usedFamilies.add(entry.family);
    if (selected.length >= limit) return selected.map(({ question }) => question);
  }
  for (const entry of ranked) {
    if (selected.includes(entry)) continue;
    selected.push(entry);
    if (selected.length >= limit) break;
  }
  return selected.map(({ question }) => question);
}

export function twentyQuestionsScoreAfterQuestion(score: number, cost: TwentyQuestionsQuestionCost) {
  return Math.max(0, score - twentyQuestionsScoreImpact(cost));
}

export function twentyQuestionsScoreAfterWrongGuess(score: number) {
  return Math.max(0, score - TWENTY_QUESTIONS_WRONG_GUESS_PENALTY);
}

export function twentyQuestionsFinalScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function chooseTwentyQuestionsFootballLeague(random: () => number = Math.random): "NFL" | "CFB" {
  return random() < 0.5 ? "NFL" : "CFB";
}

export function chooseTwentyQuestionsSubject<T>(subjects: readonly T[], random: () => number = Math.random): T {
  if (!subjects.length) throw new Error("20 Questions requires at least one eligible subject.");
  return subjects[Math.min(subjects.length - 1, Math.floor(random() * subjects.length))]!;
}
