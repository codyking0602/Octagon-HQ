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
export const TWENTY_QUESTIONS_BANK_LIMIT = 60;

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

/**
 * Keep the player-facing bank compact without inventing a second factual owner.
 * The authority may generate many deterministic candidate predicates for calibration;
 * this greedily keeps the questions that separate the most still-indistinguishable
 * subject pairs, with whole-universe split quality as the tie-breaker.
 */
export function selectTwentyQuestionsQuestionBank(
  questions: readonly TwentyQuestionsQuestion[],
  subjects: readonly TwentyQuestionsSubject[],
  limit: number = TWENTY_QUESTIONS_BANK_LIMIT,
) {
  if (!Number.isInteger(limit) || limit <= 0) throw new Error("20 Questions bank limit must be a positive integer.");
  const remaining = questions.map((question) => ({
    question,
    answers: subjects.map((subject) => question.answer(subject.id)),
  }));
  const signatures = subjects.map(() => "");
  const selected: TwentyQuestionsQuestion[] = [];

  while (selected.length < limit && remaining.length) {
    const groups = new Map<string, number[]>();
    for (let index = 0; index < signatures.length; index += 1) {
      const signature = signatures[index]!;
      const group = groups.get(signature) ?? [];
      group.push(index);
      groups.set(signature, group);
    }

    let bestIndex = 0;
    let bestGain = -1;
    let bestBalance = -1;
    for (let candidateIndex = 0; candidateIndex < remaining.length; candidateIndex += 1) {
      const candidate = remaining[candidateIndex]!;
      let gain = 0;
      for (const indexes of groups.values()) {
        if (indexes.length < 2) continue;
        let yes = 0;
        for (const index of indexes) if (candidate.answers[index]) yes += 1;
        gain += yes * (indexes.length - yes);
      }
      const yes = candidate.answers.filter(Boolean).length;
      const balance = Math.min(yes, candidate.answers.length - yes);
      const best = remaining[bestIndex]!;
      if (
        gain > bestGain
        || (gain === bestGain && balance > bestBalance)
        || (gain === bestGain && balance === bestBalance && candidate.question.internalCost < best.question.internalCost)
        || (gain === bestGain && balance === bestBalance && candidate.question.internalCost === best.question.internalCost
          && candidate.question.label.localeCompare(best.question.label) < 0)
      ) {
        bestIndex = candidateIndex;
        bestGain = gain;
        bestBalance = balance;
      }
    }

    if (bestGain <= 0) break;

    const [picked] = remaining.splice(bestIndex, 1);
    selected.push(picked!.question);
    for (let index = 0; index < signatures.length; index += 1) {
      signatures[index] += picked!.answers[index] ? "1" : "0";
    }
  }

  return selected;
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
