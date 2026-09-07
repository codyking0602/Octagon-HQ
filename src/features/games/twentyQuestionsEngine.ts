export type TwentyQuestionsSport = "ufc" | "football";
export type TwentyQuestionsLeague = "UFC" | "NFL" | "CFB";
export type TwentyQuestionsSubjectKind = "fighter" | "player" | "coach";
export type TwentyQuestionsQuestionCost = 5 | 6 | 7 | 8;

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
}

export interface TwentyQuestionsUniverse {
  league: TwentyQuestionsLeague;
  subjects: readonly TwentyQuestionsSubject[];
  questions: readonly TwentyQuestionsQuestion[];
}

export const TWENTY_QUESTIONS_LIMIT = 10;
export const TWENTY_QUESTIONS_START_SCORE = 100;
export const TWENTY_QUESTIONS_WRONG_GUESS_PENALTY = 10;

export function twentyQuestionsScoreImpact(cost: TwentyQuestionsQuestionCost) {
  return cost * 0.4;
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
