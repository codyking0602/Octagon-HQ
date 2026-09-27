export type BarTriviaLeague = "nfl" | "cfb" | "ufc";
export type BarTriviaRound = "round1" | "round2" | "round3" | "last-call";

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
}

export interface BarTriviaState {
  index: number;
  score: number;
  streak: number;
  bestStreak: number;
  correctCount: number;
  wager: number | null;
  answers: readonly BarTriviaAnswerResult[];
  complete: boolean;
}

export const BAR_TRIVIA_QUESTION_COUNT = 10;
export const BAR_TRIVIA_MAX_SCORE = 100;
export const BAR_TRIVIA_STANDARD_POINTS = 10;
export const BAR_TRIVIA_MAX_WAGER = 10;
export const BAR_TRIVIA_RECENT_MEMORY_SIZE = 40;

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

export function createBarTriviaState(): BarTriviaState {
  return {
    index: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctCount: 0,
    wager: null,
    answers: [],
    complete: false,
  };
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
  const points = isLastCall
    ? correct ? state.wager! : -state.wager!
    : correct ? BAR_TRIVIA_STANDARD_POINTS : 0;
  const nextScore = Math.max(0, Math.min(BAR_TRIVIA_MAX_SCORE, state.score + points));
  const nextStreak = correct ? state.streak + 1 : 0;
  const nextIndex = state.index + 1;
  const result: BarTriviaAnswerResult = {
    questionId: question.id,
    choice,
    correct,
    points,
  };

  return {
    result,
    state: {
      index: nextIndex,
      score: nextScore,
      streak: nextStreak,
      bestStreak: Math.max(state.bestStreak, nextStreak),
      correctCount: state.correctCount + (correct ? 1 : 0),
      wager: state.wager,
      answers: [...state.answers, result],
      complete: nextIndex >= run.length,
    } satisfies BarTriviaState,
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
