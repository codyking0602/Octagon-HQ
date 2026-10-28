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
  /** Human-recognizable deduction value. Higher values favor better game clues. */
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
export const TWENTY_QUESTIONS_ENDGAME_THRESHOLD = 5;
export const TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT = 10;

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

function isEndgameFingerprintQuestion(question: TwentyQuestionsQuestion) {
  return question.recommendationFamily === "endgame-fingerprint";
}

/**
 * The broader question bank is intentionally independent of the private live
 * candidate split. A useful identity clue should remain available even when all
 * currently surviving subjects happen to share the same answer. Fine-grained
 * fingerprint questions stay out of normal play entirely.
 */
export function twentyQuestionsEligibleQuestions(
  questions: readonly TwentyQuestionsQuestion[],
  remainingSubjects: readonly TwentyQuestionsSubject[],
) {
  if (remainingSubjects.length <= 1) return [];
  return questions.filter((question) => !isEndgameFingerprintQuestion(question));
}

export function twentyQuestionsRequiresFinalGuess(questionsAsked: number, remainingSubjectCount: number) {
  return remainingSubjectCount === 1 || questionsAsked >= TWENTY_QUESTIONS_LIMIT;
}

export function twentyQuestionsFinalGuessIsDirectlyPlayable(remainingSubjectCount: number) {
  return remainingSubjectCount >= 1 && remainingSubjectCount <= TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT;
}

function stableBoardRank(seed: string, value: string) {
  let hash = 2166136261;
  const input = `${seed}:${value}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Builds a fair final-guess board without exposing the exact private survivor
 * set. The hidden identity is always present, survivors are represented, and
 * same-kind distractors are preferred before other subjects from the league.
 */
export function twentyQuestionsFinalGuessChoices(
  allSubjects: readonly TwentyQuestionsSubject[],
  remainingSubjects: readonly TwentyQuestionsSubject[],
  hiddenSubjectId: string,
  limit = TWENTY_QUESTIONS_FINAL_GUESS_CHOICE_LIMIT,
) {
  if (limit <= 0) return [];
  const hidden = allSubjects.find((subject) => subject.id === hiddenSubjectId);
  if (!hidden) throw new Error("20 Questions final guess requires the hidden subject in the playable universe.");

  const target = Math.min(limit, allSubjects.length);
  const remainingIds = new Set(remainingSubjects.map((subject) => subject.id));
  remainingIds.add(hidden.id);

  const stableSort = (subjects: readonly TwentyQuestionsSubject[]) => [...subjects].sort((left, right) => (
    Number(right.kind === hidden.kind) - Number(left.kind === hidden.kind)
    || stableBoardRank(hidden.id, left.id) - stableBoardRank(hidden.id, right.id)
    || left.name.localeCompare(right.name)
  ));

  const survivors = stableSort(allSubjects.filter((subject) => remainingIds.has(subject.id) && subject.id !== hidden.id));
  const distractors = stableSort(allSubjects.filter((subject) => !remainingIds.has(subject.id)));
  const distractorSlots = distractors.length > 0 && target > 1
    ? Math.min(distractors.length, Math.max(1, Math.floor(target / 3)))
    : 0;
  const survivorSlots = Math.max(0, target - 1 - distractorSlots);

  const selected = [hidden, ...survivors.slice(0, survivorSlots), ...distractors.slice(0, distractorSlots)];
  if (selected.length < target) {
    const selectedIds = new Set(selected.map((subject) => subject.id));
    const fillers = stableSort(allSubjects.filter((subject) => !selectedIds.has(subject.id)));
    selected.push(...fillers.slice(0, target - selected.length));
  }

  return stableSort(selected);
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
 * Recommended balances recognizable clues with the number of identities a
 * question can actually eliminate. Unlike the broader bank, Recommended only
 * contains questions that split the live pool and never uses fingerprint clues.
 */
export function twentyQuestionsRecommendedQuestions(
  questions: readonly TwentyQuestionsQuestion[],
  remainingSubjects: readonly TwentyQuestionsSubject[],
  limit = 5,
) {
  if (limit <= 0 || remainingSubjects.length <= 1) return [];
  const endgame = remainingSubjects.length <= TWENTY_QUESTIONS_ENDGAME_THRESHOLD;
  const ranked = twentyQuestionsEligibleQuestions(questions, remainingSubjects)
    .map((question) => {
      const yes = remainingSubjects.filter((subject) => question.answer(subject.id)).length;
      const no = remainingSubjects.length - yes;
      const humanValue = inferredHumanValue(question);
      const usefulSplit = Math.min(yes, no);
      return {
        question,
        humanValue,
        family: inferredRecommendationFamily(question),
        usefulSplit,
        recommendationScore: usefulSplit * (humanValue + 1),
        imbalance: Math.abs(yes - no),
      };
    })
    .filter(({ usefulSplit }) => usefulSplit > 0)
    .sort((left, right) => (
      endgame
        ? right.usefulSplit - left.usefulSplit
          || left.imbalance - right.imbalance
          || right.humanValue - left.humanValue
          || left.question.internalCost - right.question.internalCost
          || left.question.label.localeCompare(right.question.label)
        : right.recommendationScore - left.recommendationScore
          || right.humanValue - left.humanValue
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
