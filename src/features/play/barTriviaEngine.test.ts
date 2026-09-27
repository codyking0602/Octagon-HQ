import { describe, expect, it } from "vitest";
import {
  BAR_TRIVIA_ROUND_NAMES,
  BAR_TRIVIA_ROUND_SLOTS,
  buildBarTriviaRun,
  createBarTriviaState,
  setBarTriviaWager,
  submitBarTriviaAnswer,
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

  it("scores the first nine at 10 points each and caps a perfect Last Call at 100", () => {
    const run = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "nfl", { random: () => 0 });
    let state = createBarTriviaState();

    for (let index = 0; index < 9; index += 1) {
      state = submitBarTriviaAnswer(run, state, run[index]!.answer).state;
    }

    expect(state.score).toBe(90);
    expect(state.index).toBe(9);

    state = setBarTriviaWager(state, 10);
    state = submitBarTriviaAnswer(run, state, run[9]!.answer).state;

    expect(state.score).toBe(100);
    expect(state.correctCount).toBe(10);
    expect(state.complete).toBe(true);
  });

  it("subtracts a Last Call wager on a miss without going below zero", () => {
    const run = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "ufc", { random: () => 0 });
    let state = createBarTriviaState();

    for (let index = 0; index < 9; index += 1) {
      const wrong = run[index]!.choices.find((choice) => choice !== run[index]!.answer)!;
      state = submitBarTriviaAnswer(run, state, wrong).state;
    }

    state = setBarTriviaWager(state, 10);
    const wrongFinal = run[9]!.choices.find((choice) => choice !== run[9]!.answer)!;
    state = submitBarTriviaAnswer(run, state, wrongFinal).state;
    expect(state.score).toBe(0);
  });

  it("deprioritizes recently seen questions when fresh questions exist", () => {
    const first = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "cfb", { random: () => 0 });
    const second = buildBarTriviaRun(BAR_TRIVIA_QUESTION_BANK, "cfb", {
      random: () => 0,
      recentQuestionIds: first.map((question) => question.id),
    });

    expect(second.every((question) => !first.some((prior) => prior.id === question.id))).toBe(true);
  });

  it("uses sport-specific round names", () => {
    expect(BAR_TRIVIA_ROUND_NAMES.nfl.round1).toBe("Around the League");
    expect(BAR_TRIVIA_ROUND_NAMES.cfb.round1).toBe("Around the Country");
    expect(BAR_TRIVIA_ROUND_NAMES.ufc.round1).toBe("Around the Octagon");
    expect(BAR_TRIVIA_ROUND_NAMES.ufc.round3).toBe("Championship Rounds");
    expect(BAR_TRIVIA_ROUND_NAMES.nfl["last-call"]).toBe("Last Call");
  });
});
