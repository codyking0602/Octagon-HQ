export type BarTriviaLeague = "nfl" | "cfb" | "ufc";
export type BarTriviaRound = "round1" | "round2" | "round3" | "last-call";
export type BarTriviaDoubleRound = Exclude<BarTriviaRound, "last-call">;

export interface BarTriviaQuestion {
  id: string;
  league: BarTriviaLeague;
  round: BarTriviaRound;
  category: string;
  prompt: string;
  choices: readonly [string, string, string, string];
  answer: string;
  explanation: string;
  sourceId?: string;
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
export const BAR_TRIVIA_RECENT_MEMORY_SIZE = 40;

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
};

function roundTenth(value: number) {
  return Math.round(value * 10) / 10;
}

function pickQuestion(
  pool: readonly BarTriviaQuestion[],
  used: ReadonlySet<string>,
  recent: ReadonlySet<string>,
  random: () => number,
) {
  const unused = pool.filter((question) => !used.has(question.id));
  const fresh = unused.filter((question) => !recent.has(question.id));
  const candidates = fresh.length ? fresh : unused;
  if (!candidates.length) throw new Error("Bar Trivia does not have enough questions for this round.");
  return candidates[Math.floor(random() * candidates.length)] ?? candidates[0]!;
}

export function buildBarTriviaRun(
  bank: readonly BarTriviaQuestion[],
  league: BarTriviaLeague,
  options: { random?: () => number; recentQuestionIds?: readonly string[] } = {},
) {
  const random = options.random ?? Math.random;
  const recent = new Set(options.recentQuestionIds ?? []);
  const used = new Set<string>();
  const run: BarTriviaQuestion[] = [];

  for (const round of BAR_TRIVIA_ROUND_SLOTS) {
    const pool = bank.filter((question) => question.league === league && question.round === round);
    const chosen = pickQuestion(pool, used, recent, random);
    run.push(chosen);
    used.add(chosen.id);
  }

  return run;
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
  const normalized = Math.round((Math.max(0, rawScore) / maxRaw) * BAR_TRIVIA_MAX_SCORE);
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
