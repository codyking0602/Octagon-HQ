export type TwentyQuestionsSport = "ufc" | "football";
export type TwentyQuestionsLeague = "UFC" | "NFL" | "CFB";
export type TwentyQuestionsSubjectKind = "fighter" | "player" | "coach";
export type TwentyQuestionsQuestionCost = 5 | 6 | 7 | 8;
export type TwentyQuestionsHumanValue = 1 | 2 | 3 | 4 | 5;

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
  recommendationPriority?: TwentyQuestionsHumanValue;
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

export function twentyQuestionsQuestionHumanValue(question: TwentyQuestionsQuestion): TwentyQuestionsHumanValue {
  if (question.recommendationPriority) return question.recommendationPriority;
  const id = question.id.toLowerCase();

  if (/(^|:)(era|division|position|position-family|role|franchise|team|school|program|conference|nationality|country|region|geography|height|size|color|draft|hall-of-fame|hof|title|championship|champ|award|mvp|opoy|dpoy|all-pro|pro-bowl|heisman|super-bowl|playoff|trophy|honor)(:|-|$)/.test(id)) {
    return 5;
  }
  if (id.startsWith("faced:") || id.startsWith("beat:") || /(opponent|interim|main-event|tuf|transfer)/.test(id)) {
    return 4;
  }
  if (/(losses|active-years|opponents-beaten|games-played)/.test(id)) return 1;
  if (/(ko-tko|submission|decision|fights|wins)/.test(id)) return 2;
  return 3;
}

export function twentyQuestionsQuestionFamily(question: TwentyQuestionsQuestion) {
  if (question.recommendationFamily) return question.recommendationFamily;
  const id = question.id.toLowerCase();
  if (id.startsWith("faced:") || id.startsWith("beat:")) return "opponent";

  const parts = id.split(":");
  const root = parts[0] ?? id;
  if (root === "stat") return `stat:${parts[1] ?? "other"}`;
  if (root === "era") return "era";
  if ([
    "division",
    "position",
    "position-family",
    "role",
    "franchise",
    "team",
    "school",
    "program",
    "conference",
    "nationality",
    "country",
    "region",
    "geography",
    "height",
    "size",
    "color",
    "draft",
  ].includes(root)) return root;

  if (parts.length > 1) {
    return `${root}:${parts[1]!.replace(/-?\d+(?:\.\d+)?$/, "")}`;
  }
  return id.replace(/-?\d+(?:\.\d+)?$/, "");
}

export function rankTwentyQuestionsRecommendedQuestions(
  questions: readonly TwentyQuestionsQuestion[],
  remainingSubjects: readonly TwentyQuestionsSubject[],
  limit = 5,
) {
  if (remainingSubjects.length <= 1 || limit <= 0) return [];

  const ranked = questions
    .map((question) => {
      const yes = remainingSubjects.filter((subject) => question.answer(subject.id)).length;
      const no = remainingSubjects.length - yes;
      return {
        question,
        humanValue: twentyQuestionsQuestionHumanValue(question),
        family: twentyQuestionsQuestionFamily(question),
        usefulSplit: Math.min(yes, no),
      };
    })
    .filter((entry) => entry.usefulSplit > 0)
    .sort((left, right) => (
      right.humanValue - left.humanValue
      || right.usefulSplit - left.usefulSplit
      || left.question.internalCost - right.question.internalCost
      || left.question.label.localeCompare(right.question.label)
    ));

  const selected: typeof ranked = [];
  const selectedIds = new Set<string>();
  const usedFamilies = new Set<string>();

  for (const entry of ranked) {
    if (usedFamilies.has(entry.family)) continue;
    selected.push(entry);
    selectedIds.add(entry.question.id);
    usedFamilies.add(entry.family);
    if (selected.length >= limit) return selected.map((row) => row.question);
  }

  for (const entry of ranked) {
    if (selectedIds.has(entry.question.id)) continue;
    selected.push(entry);
    if (selected.length >= limit) break;
  }

  return selected.map((row) => row.question);
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
