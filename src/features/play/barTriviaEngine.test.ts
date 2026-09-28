import { describe, expect, it } from "vitest";
import {
  BAR_TRIVIA_BASE_POINTS,
  BAR_TRIVIA_ROUND_NAMES,
  BAR_TRIVIA_ROUND_SLOTS,
  barTriviaPerfectRawScore,
  barTriviaScoreBreakdown,
  barTriviaStreakMultiplier,
  buildBarTriviaRun,
  createBarTriviaState,
  normalizeBarTriviaScore,
  pickBarTriviaDoubleRound,
  setBarTriviaWager,
  submitBarTriviaAnswer,
  type BarTriviaDoubleRound,
} from "../games/barTriviaEngine";
import { BAR_TRIVIA_QUESTION_BANK } from "./barTriviaQuestionBank";

describe("Bar Trivia engine", () => {
  it("builds separate 10-question NFL, CFB, and UFC runs with the locked round shape", () => {
    for (const league of ["nfl", "cfb", "ufc"] as const) {
      const run = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, league, { random: () => 0 });
      expect(run).toHaveLength(10);
      expect(run.every((question) => question.league === league)).toBe(true);
      expect(run.map((question) => question.round)).toEqual(BAR_TRIVIA_ROUND_SLOTS);
      expect(new Set(run.map((question) => question.id)).size).toBe(10);
    }
  });

  it("locks the calibrated base ladder and streak heat thresholds", () => {
    expect(BAR_TRIVIA_BASE_POINTS).toEqual({
      round1: 10,
      round2: 12,
      round3: 14,
      "last-call": 16,
    });
    expect(barTriviaStreakMultiplier(2)).toBe(1);
    expect(barTriviaStreakMultiplier(3)).toBe(1.1);
    expect(barTriviaStreakMultiplier(5)).toBe(1.15);
    expect(barTriviaStreakMultiplier(7)).toBe(1.25);
  });

  it("doubles the announced round and layers streak heat on top", () => {
    const run = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "nfl", { random: () => 0 });
    let state = createBarTriviaState("round2");

    for (let index = 0; index < 3; index += 1) {
      state = submitBarTriviaAnswer(run, state, run[index]!.answer).state;
    }

    const fourth = submitBarTriviaAnswer(run, state, run[3]!.answer);
    expect(fourth.result.basePoints).toBe(12);
    expect(fourth.result.roundMultiplier).toBe(2);
    expect(fourth.result.doubleRoundBonus).toBe(12);
    expect(fourth.result.streakMultiplier).toBe(1.1);
    expect(fourth.result.streakBonus).toBe(2.4);
    expect(fourth.result.rawPoints).toBe(26.4);
  });

  it("adds Last Call wager on top of the 16-point question instead of replacing it", () => {
    const run = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "ufc", { random: () => 0 });
    let state = createBarTriviaState("round2");

    for (let index = 0; index < 9; index += 1) {
      const wrong = run[index]!.choices.find((choice) => choice !== run[index]!.answer)!;
      state = submitBarTriviaAnswer(run, state, wrong).state;
    }

    state = setBarTriviaWager(state, 10);
    const final = submitBarTriviaAnswer(run, state, run[9]!.answer);

    expect(final.result.basePoints).toBe(16);
    expect(final.result.wagerDelta).toBe(10);
    expect(final.result.rawPoints).toBe(26);
    expect(final.state.rawScore).toBe(26);
  });

  it("subtracts the wager on a missed Last Call while preserving the accumulated tab", () => {
    const run = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "cfb", { random: () => 0 });
    let state = createBarTriviaState("round3");

    for (let index = 0; index < 9; index += 1) {
      state = submitBarTriviaAnswer(run, state, run[index]!.answer).state;
    }

    const beforeFinal = state.rawScore;
    state = setBarTriviaWager(state, 10);
    const wrongFinal = run[9]!.choices.find((choice) => choice !== run[9]!.answer)!;
    const final = submitBarTriviaAnswer(run, state, wrongFinal);

    expect(final.result.rawPoints).toBe(-10);
    expect(final.state.rawScore).toBe(beforeFinal - 10);
    expect(final.state.score).toBeLessThan(state.score);
  });

  it("normalizes every perfect scoring path to exactly 100", () => {
    const run = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "nfl", { random: () => 0 });

    for (const doubleRound of ["round1", "round2", "round3"] as const) {
      let state = createBarTriviaState(doubleRound);
      for (let index = 0; index < 9; index += 1) {
        state = submitBarTriviaAnswer(run, state, run[index]!.answer).state;
      }
      state = setBarTriviaWager(state, 10);
      state = submitBarTriviaAnswer(run, state, run[9]!.answer).state;

      expect(state.rawScore).toBe(barTriviaPerfectRawScore(doubleRound));
      expect(state.score).toBe(100);
      expect(normalizeBarTriviaScore(state.rawScore, doubleRound)).toBe(100);
    }
  });

  it("provides a transparent end-of-game scoring breakdown", () => {
    const run = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "ufc", { random: () => 0 });
    let state = createBarTriviaState("round1");

    for (let index = 0; index < 9; index += 1) {
      state = submitBarTriviaAnswer(run, state, run[index]!.answer).state;
    }
    state = setBarTriviaWager(state, 7);
    state = submitBarTriviaAnswer(run, state, run[9]!.answer).state;

    const breakdown = barTriviaScoreBreakdown(state);
    expect(breakdown.baseEarned).toBe(124);
    expect(breakdown.doubleRoundBonus).toBe(30);
    expect(breakdown.streakBonus).toBeGreaterThan(0);
    expect(breakdown.wagerDelta).toBe(7);
    expect(breakdown.rawScore).toBe(state.rawScore);
    expect(breakdown.normalizedScore).toBe(state.score);
  });

  it("can select any of the first three rounds as the Double Round", () => {
    expect(pickBarTriviaDoubleRound(() => 0)).toBe("round1");
    expect(pickBarTriviaDoubleRound(() => 0.4)).toBe("round2");
    expect(pickBarTriviaDoubleRound(() => 0.99)).toBe("round3");
  });

  it("deprioritizes recently seen questions when fresh questions exist", () => {
    const first = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "cfb", { random: () => 0 });
    const second = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "cfb", {
      random: () => 0,
      recentQuestionIds: first.map((question) => question.id),
    });

    const repeats = second.filter((question) => first.some((prior) => prior.id === question.id));
    expect(repeats.length).toBeLessThanOrEqual(3);
    expect(second.length - repeats.length).toBeGreaterThanOrEqual(7);
  });

  it("uses sport-specific round names", () => {
    expect(BAR_TRIVIA_ROUND_NAMES.nfl.round1).toBe("Around the League");
    expect(BAR_TRIVIA_ROUND_NAMES.cfb.round1).toBe("Around the Country");
    expect(BAR_TRIVIA_ROUND_NAMES.ufc.round1).toBe("Around the Octagon");
    expect(BAR_TRIVIA_ROUND_NAMES.ufc.round3).toBe("Championship Rounds");
    expect(BAR_TRIVIA_ROUND_NAMES.nfl["last-call"]).toBe("Last Call");
  });
});
