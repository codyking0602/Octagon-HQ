import {
  isTriviaContentActive,
  type TriviaContentType,
} from "./triviaContentExpiry";

export type BarTriviaLeague = "nfl" | "cfb" | "ufc" | "mlb";
export type BarTriviaRound = "round1" | "round2" | "round3" | "last-call";
export type BarTriviaDoubleRound = Exclude<BarTriviaRound, "last-call">;
export type BarTriviaDifficulty = "easy" | "medium" | "hard" | "last-call";
export type BarTriviaContentType = TriviaContentType;

export interface BarTriviaQuestion {
  id: string;
  league: BarTriviaLeague;
  round: BarTriviaRound;
  difficulty: BarTriviaDifficulty;
  category: string;
  prompt: string;
  choices: readonly [string, string, string, string];
  answer: string;
  explanation: string;
  contentType: BarTriviaContentType;
  activeFrom?: string;
  expiresAt?: string;
  sourceId?: string;
  sourceUrl?: string;
  verifiedAt?: string;
}

export interface BarTriviaAnswerResult {
  questionId: string;
  choice: string;
  correct: boolean;
  points: number;
  rawPoints: number;
  basePoints: number;
  doubleRoundBonus: number;
  streakBonus: number;
  wagerDelta: number;
  roundMultiplier: 1 | 2;
  streakMultiplier: 1 | 1.1 | 1.15 | 1.25;
}

export interface BarTriviaState {
  index: number;
  score: number;
  rawScore: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  wager: number | null;
  doubleRound: BarTriviaDoubleRound;
  answers: readonly BarTriviaAnswerResult[];
  complete: boolean;
}

export interface BarTriviaScoreBreakdown {
  baseEarned: number;
  doubleRoundBonus: number;
  streakBonus: number;
  wagerDelta: number;
  rawScore: number;
  perfectRawScore: number;
  normalizedScore: number;
}

export const BAR_TRIVIA_QUESTION_COUNT = 10;
export const BAR_TRIVIA_MAX_SCORE = 100;
export const BAR_TRIVIA_MAX_WAGER = 10;
export const BAR_TRIVIA_CURRENT_EVENT_TARGET = 2;
export const BAR_TRIVIA_RECENT_MEMORY_SIZE = 400;

export const BAR_TRIVIA_BASE_POINTS: Record<BarTriviaRound, number> = {
  round1: 10,
  round2: 12,
  round3: 14,
  "last-call": 16,
};

export const BAR_TRIVIA_ROUND_SLOTS = [
  "round1", "round1", "round1",
  "round2", "round2", "round2",
  "round3", "round3", "round3",
  "last-call",
] as const satisfies readonly BarTriviaRound[];

export const BAR_TRIVIA_ROUND_NAMES: Record<BarTriviaLeague, Record<BarTriviaRound, string>> = {
  nfl: {
    round1: "Around the League",
    round2: "Deep Cuts",
    round3: "Fourth Quarter",
    "last-call": "Last Call",
  },
  cfb: {
    round1: "Around the Country",
    round2: "Deep Cuts",
    round3: "Fourth Quarter",
    "last-call": "Last Call",
  },
  ufc: {
    round1: "Around the Octagon",
    round2: "Deep Cuts",
    round3: "Championship Rounds",
    "last-call": "Last Call",
  },
  mlb: {
    round1: "Around the Diamond",
    round2: "Deep Cuts",
    round3: "Late Innings",
    "last-call": "Last Call",
  },
};

function roundTenth(value: number) {
  return Math.round(value * 10) / 10;
}

export function barTriviaDifficultyForRound(round: BarTriviaRound): BarTriviaDifficulty {
  if (round === "round1") return "easy";
  if (round === "round2") return "medium";
  if (round === "round3") return "hard";
  return "last-call";
}

export type BarTriviaQuestionSeed = Omit<BarTriviaQuestion, "difficulty" | "contentType"> & {
  difficulty?: BarTriviaDifficulty;
  contentType?: BarTriviaContentType;
};

export function barTriviaQuestion(seed: BarTriviaQuestionSeed): BarTriviaQuestion {
  return {
    ...seed,
    difficulty: seed.difficulty ?? barTriviaDifficultyForRound(seed.round),
    contentType: seed.contentType ?? "evergreen",
  };
}

function normalizedNow(value: Date | string | undefined) {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function isBarTriviaQuestionActive(question: BarTriviaQuestion, now: Date | string = new Date()) {
  return isTriviaContentActive(question, now);
}

function recentRank(recentQuestionIds: readonly string[]) {
  return new Map(recentQuestionIds.map((id, index) => [id, index]));
}

function pickQuestion(
  pool: readonly BarTriviaQuestion[],
  used: ReadonlySet<string>,
  usedCategories: ReadonlySet<string>,
  recentQuestionIds: readonly string[],
  random: () => number,
) {
  const unused = pool.filter((question) => !used.has(question.id));
  if (!unused.length) throw new Error("Bar Trivia does not have enough questions for this round.");

  const ranks = recentRank(recentQuestionIds);
  const fresh = unused.filter((question) => !ranks.has(question.id));
  let candidates = fresh.length ? fresh : unused;

  const categoryFresh = candidates.filter((question) => !usedCategories.has(question.category));
  if (categoryFresh.length) candidates = categoryFresh;

  if (!fresh.length && recentQuestionIds.length) {
    const ordered = [...candidates].sort((a, b) => (ranks.get(b.id) ?? -1) - (ranks.get(a.id) ?? -1));
    const oldestBand = ordered.slice(0, Math.max(1, Math.ceil(ordered.length / 4)));
    candidates = oldestBand;
  }

  return candidates[Math.floor(random() * candidates.length)] ?? candidates[0]!;
}

function selectCurrentEvents(
  bank: readonly BarTriviaQuestion[],
  league: BarTriviaLeague,
  recentQuestionIds: readonly string[],
  now: Date,
  target: number,
  random: () => number,
) {
  const capacity = new Map<BarTriviaRound, number>([
    ["round1", 3],
    ["round2", 2],
    ["round3", 3],
    ["last-call", 1],
  ]);
  const selected: BarTriviaQuestion[] = [];
  const used = new Set<string>();
  const usedCategories = new Set<string>();
  const recent = new Set(recentQuestionIds);
  const active = bank.filter((question) =>
    question.league === league &&
    question.contentType === "current-event" &&
    isBarTriviaQuestionActive(question, now) &&
    !recent.has(question.id)
  );

  while (selected.length < target) {
    const pool = active.filter((question) =>
      !used.has(question.id) &&
      (capacity.get(question.round) ?? 0) > 0
    );
    if (!pool.length) break;

    const chosen = pickQuestion(pool, used, usedCategories, recentQuestionIds, random);
    selected.push(chosen);
    used.add(chosen.id);
    usedCategories.add(chosen.category);
    capacity.set(chosen.round, (capacity.get(chosen.round) ?? 0) - 1);
  }

  return selected;
}

function shuffleBarTriviaChoices(question: BarTriviaQuestion, random: () => number): BarTriviaQuestion {
  const choices = [...question.choices] as [string, string, string, string];

  for (let index = choices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [choices[index], choices[swapIndex]] = [choices[swapIndex]!, choices[index]!];
  }

  return { ...question, choices };
}

export function buildBarTriviaRun(
  bank: readonly BarTriviaQuestion[],
  league: BarTriviaLeague,
  options: {
    random?: () => number;
    recentQuestionIds?: readonly string[];
    now?: Date | string;
    currentEventTarget?: number;
  } = {},
) {
  const random = options.random ?? Math.random;
  const recentQuestionIds = options.recentQuestionIds ?? [];
  const now = normalizedNow(options.now);
  const currentEventTarget = Math.max(
    0,
    Math.min(BAR_TRIVIA_QUESTION_COUNT, options.currentEventTarget ?? BAR_TRIVIA_CURRENT_EVENT_TARGET),
  );
  const selectedCurrent = selectCurrentEvents(
    bank,
    league,
    recentQuestionIds,
    now,
    currentEventTarget,
    random,
  );
  const currentByRound = new Map<BarTriviaRound, BarTriviaQuestion[]>();
  for (const question of selectedCurrent) {
    const queue = currentByRound.get(question.round) ?? [];
    queue.push(question);
    currentByRound.set(question.round, queue);
  }

  const used = new Set<string>();
  const usedCategories = new Set<string>();
  const run: BarTriviaQuestion[] = [];

  for (const [index, round] of BAR_TRIVIA_ROUND_SLOTS.entries()) {
    if (index === 3) {
      const accessible = pickQuestion(
        bank.filter((question) =>
          question.league === league &&
          question.round === "round1" &&
          question.difficulty === "easy" &&
          question.contentType === "evergreen"
        ),
        used,
        usedCategories,
        recentQuestionIds,
        random,
      );
      const chosen = { ...accessible, round: "round2" as const };
      run.push(chosen);
      used.add(chosen.id);
      usedCategories.add(chosen.category);
      continue;
    }

    const currentQueue = currentByRound.get(round);
    const scheduledCurrent = currentQueue?.shift();
    const chosen = scheduledCurrent ?? pickQuestion(
      bank.filter((question) =>
        question.league === league &&
        question.round === round &&
        question.contentType === "evergreen"
      ),
      used,
      usedCategories,
      recentQuestionIds,
      random,
    );
    run.push(chosen);
    used.add(chosen.id);
    usedCategories.add(chosen.category);
  }

  return run.map((question) => shuffleBarTriviaChoices(question, random));
}

export function pickBarTriviaDoubleRound(random: () => number = Math.random): BarTriviaDoubleRound {
  const rounds: readonly BarTriviaDoubleRound[] = ["round1", "round2", "round3"];
  return rounds[Math.min(rounds.length - 1, Math.floor(random() * rounds.length))]!;
}

export function createBarTriviaState(doubleRound: BarTriviaDoubleRound = "round2"): BarTriviaState {
  return {
    index: 0,
    score: 0,
    rawScore: 0,
    streak: 0,
    bestStreak: 0,
    correctCount: 0,
    wager: null,
    doubleRound,
    answers: [],
    complete: false,
  };
}

export function barTriviaStreakMultiplier(streakAfterCorrect: number): 1 | 1.1 | 1.15 | 1.25 {
  if (streakAfterCorrect >= 7) return 1.25;
  if (streakAfterCorrect >= 5) return 1.15;
  if (streakAfterCorrect >= 3) return 1.1;
  return 1;
}

function perfectQuestionRawPoints(
  round: BarTriviaRound,
  streakAfterCorrect: number,
  doubleRound: BarTriviaDoubleRound,
) {
  const basePoints = BAR_TRIVIA_BASE_POINTS[round];
  const roundMultiplier = round === doubleRound ? 2 : 1;
  const streakMultiplier = barTriviaStreakMultiplier(streakAfterCorrect);
  return roundTenth(basePoints * roundMultiplier * streakMultiplier);
}

export function barTriviaPerfectRawScore(doubleRound: BarTriviaDoubleRound) {
  const questionTotal = BAR_TRIVIA_ROUND_SLOTS.reduce((sum, round, index) => (
    sum + perfectQuestionRawPoints(round, index + 1, doubleRound)
  ), 0);
  return roundTenth(questionTotal + BAR_TRIVIA_MAX_WAGER);
}

export function normalizeBarTriviaScore(rawScore: number, doubleRound: BarTriviaDoubleRound) {
  const maxRaw = barTriviaPerfectRawScore(doubleRound);
  const rawRatio = Math.max(0, rawScore) / maxRaw;
  const normalized = Math.round(Math.sqrt(rawRatio) * BAR_TRIVIA_MAX_SCORE);
  return Math.max(0, Math.min(BAR_TRIVIA_MAX_SCORE, normalized));
}

export function setBarTriviaWager(state: BarTriviaState, wager: number): BarTriviaState {
  if (state.complete || state.index !== 9) return state;
  return {
    ...state,
    wager: Math.max(0, Math.min(BAR_TRIVIA_MAX_WAGER, Math.round(wager))),
  };
}

export function submitBarTriviaAnswer(
  run: readonly BarTriviaQuestion[],
  state: BarTriviaState,
  choice: string,
) {
  if (state.complete) throw new Error("Bar Trivia run is already complete.");

  const question = run[state.index];
  if (!question) throw new Error("Bar Trivia question is missing.");
  if (!question.choices.includes(choice)) throw new Error("Answer choice is not valid.");

  const isLastCall = state.index === 9;
  if (isLastCall && state.wager == null) throw new Error("Last Call wager must be locked before answering.");

  const correct = choice === question.answer;
  const nextStreak = correct ? state.streak + 1 : 0;
  const basePoints = BAR_TRIVIA_BASE_POINTS[question.round];
  const roundMultiplier: 1 | 2 = question.round === state.doubleRound ? 2 : 1;
  const streakMultiplier = correct ? barTriviaStreakMultiplier(nextStreak) : 1;
  const doubledBase = correct ? basePoints * roundMultiplier : 0;
  const doubleRoundBonus = correct && roundMultiplier === 2 ? basePoints : 0;
  const streakBonus = correct ? roundTenth(doubledBase * (streakMultiplier - 1)) : 0;
  const questionPoints = correct ? roundTenth(doubledBase + streakBonus) : 0;
  const wagerDelta = isLastCall
    ? correct
      ? state.wager!
      : -state.wager!
    : 0;
  const rawPoints = roundTenth(questionPoints + wagerDelta);
  const nextRawScore = roundTenth(Math.max(0, state.rawScore + rawPoints));
  const nextScore = normalizeBarTriviaScore(nextRawScore, state.doubleRound);
  const result: BarTriviaAnswerResult = {
    questionId: question.id,
    choice,
    correct,
    points: nextScore - state.score,
    rawPoints,
    basePoints,
    doubleRoundBonus,
    streakBonus,
    wagerDelta,
    roundMultiplier,
    streakMultiplier,
  };
  const nextIndex = state.index + 1;

  return {
    result,
    state: {
      index: nextIndex,
      score: nextScore,
      rawScore: nextRawScore,
      streak: nextStreak,
      bestStreak: Math.max(state.bestStreak, nextStreak),
      correctCount: state.correctCount + (correct ? 1 : 0),
      wager: state.wager,
      doubleRound: state.doubleRound,
      answers: [...state.answers, result],
      complete: nextIndex >= run.length,
    } satisfies BarTriviaState,
  };
}

export function barTriviaScoreBreakdown(state: BarTriviaState): BarTriviaScoreBreakdown {
  let baseEarned = 0;
  let doubleRoundBonus = 0;
  let streakBonus = 0;
  let wagerDelta = 0;

  for (const answer of state.answers) {
    if (answer.correct) baseEarned += answer.basePoints;
    doubleRoundBonus += answer.doubleRoundBonus;
    streakBonus += answer.streakBonus;
    wagerDelta += answer.wagerDelta;
  }

  return {
    baseEarned: roundTenth(baseEarned),
    doubleRoundBonus: roundTenth(doubleRoundBonus),
    streakBonus: roundTenth(streakBonus),
    wagerDelta: roundTenth(wagerDelta),
    rawScore: roundTenth(state.rawScore),
    perfectRawScore: barTriviaPerfectRawScore(state.doubleRound),
    normalizedScore: state.score,
  };
}

export function barTriviaRoundForQuestion(index: number): BarTriviaRound {
  return BAR_TRIVIA_ROUND_SLOTS[Math.max(0, Math.min(BAR_TRIVIA_ROUND_SLOTS.length - 1, index))]!;
}

export function barTriviaRoundNumber(round: BarTriviaRound) {
  if (round === "round1") return 1;
  if (round === "round2") return 2;
  if (round === "round3") return 3;
  return 4;
}
