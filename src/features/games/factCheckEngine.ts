export type FactCheckFormat =
  | "true_false"
  | "before_after"
  | "over_under"
  | "either_or";

export type FactCheckDifficulty = 1 | 2 | 3 | 4;
export type FactCheckRecency = "evergreen" | "weekly";

export interface FactCheckItem {
  id: string;
  sport: "football";
  league: "nfl" | "cfb" | "mixed";
  format: FactCheckFormat;
  difficulty: FactCheckDifficulty;
  prompt: string;
  choices: readonly [string, string];
  answer: string;
  explanation: string;
  recency: FactCheckRecency;
  activeFrom?: string;
  expiresAfter?: string;
  sourceId?: string;
}

export interface FactCheckAnswerResult {
  itemId: string;
  choice: string;
  correct: boolean;
  lockUsed: boolean;
  points: number;
}

export interface FactCheckState {
  index: number;
  score: number;
  streak: number;
  bestStreak: number;
  locksRemaining: number;
  answers: readonly FactCheckAnswerResult[];
  complete: boolean;
}

export interface FactCheckTransition {
  state: FactCheckState;
  result: FactCheckAnswerResult;
}

export const FACT_CHECK_RUN_SIZE = 10;
export const FACT_CHECK_LOCKS_PER_RUN = 2;
export const FACT_CHECK_WEEKLY_TARGET = 2;
export const FACT_CHECK_RECENT_MEMORY_SIZE = 40;
export const FACT_CHECK_DIFFICULTY_PLAN = [
  1, 1, 1, 1,
  2, 2, 2,
  3, 3,
  4,
] as const satisfies readonly FactCheckDifficulty[];

const FACT_CHECK_WEEKLY_SLOT_HINTS = new Set([1, 5]);

export function isFactCheckItemActive(item: FactCheckItem, onDate: string) {
  if (item.activeFrom && onDate < item.activeFrom) return false;
  if (item.expiresAfter && onDate > item.expiresAfter) return false;
  return true;
}

export function factCheckDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function pickCandidate(
  candidates: readonly FactCheckItem[],
  formatCounts: ReadonlyMap<FactCheckFormat, number>,
  random: () => number,
) {
  const lowestUsage = Math.min(...candidates.map((item) => formatCounts.get(item.format) ?? 0));
  const leastUsed = candidates.filter((item) => (formatCounts.get(item.format) ?? 0) === lowestUsage);
  return leastUsed[Math.floor(random() * leastUsed.length)] ?? leastUsed[0]!;
}

function candidatesForSlot(
  active: readonly FactCheckItem[],
  used: ReadonlySet<string>,
  recent: ReadonlySet<string>,
  difficulty: FactCheckDifficulty,
  preferWeekly: boolean,
  weeklyTargetMet: boolean,
) {
  const unused = active.filter((item) => !used.has(item.id));
  const exact = unused.filter((item) => item.difficulty === difficulty);
  const nearest = exact.length
    ? exact
    : unused
        .slice()
        .sort((a, b) => Math.abs(a.difficulty - difficulty) - Math.abs(b.difficulty - difficulty));

  let scoped = nearest;
  if (preferWeekly) {
    const weekly = nearest.filter((item) => item.recency === "weekly");
    if (weekly.length) scoped = weekly;
  } else if (weeklyTargetMet) {
    const evergreen = nearest.filter((item) => item.recency === "evergreen");
    if (evergreen.length) scoped = evergreen;
  }

  const fresh = scoped.filter((item) => !recent.has(item.id));
  return fresh.length ? fresh : scoped;
}

export function buildFactCheckRun(
  items: readonly FactCheckItem[],
  options: {
    onDate?: string;
    random?: () => number;
    recentItemIds?: readonly string[];
    weeklyTarget?: number;
  } = {},
) {
  const onDate = options.onDate ?? factCheckDateKey();
  const random = options.random ?? Math.random;
  const recent = new Set(options.recentItemIds ?? []);
  const weeklyTarget = Math.max(0, Math.min(
    FACT_CHECK_RUN_SIZE,
    options.weeklyTarget ?? FACT_CHECK_WEEKLY_TARGET,
  ));
  const active = items.filter((item) => isFactCheckItemActive(item, onDate));

  if (active.length < FACT_CHECK_RUN_SIZE) {
    throw new Error("Fact Check needs at least 10 active questions.");
  }

  const selected: FactCheckItem[] = [];
  const used = new Set<string>();
  const formatCounts = new Map<FactCheckFormat, number>();
  let weeklySelected = 0;

  FACT_CHECK_DIFFICULTY_PLAN.forEach((difficulty, index) => {
    const weeklyTargetMet = weeklySelected >= weeklyTarget;
    const preferWeekly = !weeklyTargetMet && FACT_CHECK_WEEKLY_SLOT_HINTS.has(index);
    const candidates = candidatesForSlot(
      active,
      used,
      recent,
      difficulty,
      preferWeekly,
      weeklyTargetMet,
    );

    if (!candidates.length) {
      throw new Error(`Fact Check could not fill question ${index + 1}.`);
    }

    const chosen = pickCandidate(candidates, formatCounts, random);
    selected.push(chosen);
    used.add(chosen.id);
    if (chosen.recency === "weekly") weeklySelected += 1;
    formatCounts.set(chosen.format, (formatCounts.get(chosen.format) ?? 0) + 1);
  });

  return selected;
}

export function createFactCheckState(): FactCheckState {
  return {
    index: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    locksRemaining: FACT_CHECK_LOCKS_PER_RUN,
    answers: [],
    complete: false,
  };
}

export function factCheckQuestionValue(streak: number) {
  return 10 + Math.min(streak, 4) * 2;
}

export function submitFactCheckAnswer(
  run: readonly FactCheckItem[],
  state: FactCheckState,
  choice: string,
  lockRequested = false,
): FactCheckTransition {
  if (state.complete) throw new Error("Fact Check run is already complete.");

  const item = run[state.index];
  if (!item) throw new Error("Fact Check question is missing.");
  if (!item.choices.includes(choice)) throw new Error("Answer choice is not valid for this question.");

  const lockUsed = lockRequested && state.locksRemaining > 0;
  const correct = choice === item.answer;
  const questionValue = factCheckQuestionValue(state.streak);
  const points = correct
    ? questionValue * (lockUsed ? 2 : 1)
    : lockUsed
      ? -questionValue
      : 0;
  const nextStreak = correct ? state.streak + 1 : 0;
  const nextIndex = state.index + 1;
  const result: FactCheckAnswerResult = {
    itemId: item.id,
    choice,
    correct,
    lockUsed,
    points,
  };

  return {
    result,
    state: {
      index: nextIndex,
      score: state.score + points,
      streak: nextStreak,
      bestStreak: Math.max(state.bestStreak, nextStreak),
      locksRemaining: state.locksRemaining - (lockUsed ? 1 : 0),
      answers: [...state.answers, result],
      complete: nextIndex >= run.length,
    },
  };
}
