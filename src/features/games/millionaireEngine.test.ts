import { describe, expect, it } from "vitest";
import {
  MILLIONAIRE_LEVELS,
  MILLIONAIRE_MONEY_BY_LEVEL,
  type MillionaireLevel,
  type MillionaireRuntimeQuestion,
} from "./millionaireAuthority";
import {
  MILLIONAIRE_CHECKPOINT_LEVELS,
  MILLIONAIRE_LIFELINE_PENALTY,
  MILLIONAIRE_OCTAGON_SCORE_BY_LEVEL,
  MILLIONAIRE_WALK_AWAY_QUESTION_LEVELS,
  advanceMillionaireRuntime,
  assertMillionaireRun,
  createMillionaireState,
  currentMillionairePublicQuestion,
  millionaireCanWalkAway,
  millionaireCheckpointMoney,
  millionaireScoreAfterLifelines,
  type MillionaireRun,
  type MillionaireState,
} from "./millionaireEngine";

function fixtureQuestion(level: MillionaireLevel, sport: "ufc" | "football" = "ufc"): MillionaireRuntimeQuestion {
  const q8 = level === "Q8";
  return {
    id: `${sport}-${level.toLowerCase()}`,
    sport,
    level,
    money: MILLIONAIRE_MONEY_BY_LEVEL[level],
    type: "fixture",
    prompt: `Fixture prompt ${level}`,
    choices: [
      { id: "A", text: "Choice A" },
      { id: "B", text: "Choice B" },
      { id: "C", text: "Choice C" },
      { id: "D", text: "Choice D" },
    ],
    correctChoiceId: "A",
    explanation: `Fixture explanation ${level}`,
    statSheet: q8 ? null : `Fixture Stat Sheet ${level}`,
    fiftyFifty: {
      survivorChoiceIds: ["A", "B"],
      removalChoiceIds: ["C", "D"],
    },
    lifelineCompatibility: {
      fiftyFifty: !q8,
      statSheet: !q8,
      doubleDip: !q8,
    },
  };
}

function fixtureRun(sport: "ufc" | "football" = "ufc"): MillionaireRun {
  return MILLIONAIRE_LEVELS.map((level) => fixtureQuestion(level, sport)) as unknown as MillionaireRun;
}

function answerCorrect(run: MillionaireRun, state: MillionaireState, count = 1) {
  let next = state;
  for (let index = 0; index < count; index += 1) {
    next = advanceMillionaireRuntime(run, next, { type: "answer", choiceId: "A" }).state;
  }
  return next;
}

describe("Millionaire locked ladder and score contract", () => {
  it("uses the locked checkpoints, walk-away gates, money ladder, and leaderboard ladder", () => {
    expect(MILLIONAIRE_CHECKPOINT_LEVELS).toEqual([3, 6]);
    expect(MILLIONAIRE_WALK_AWAY_QUESTION_LEVELS).toEqual([8]);
    expect(MILLIONAIRE_LIFELINE_PENALTY).toBe(2);
    expect(MILLIONAIRE_LEVELS.map((level) => MILLIONAIRE_MONEY_BY_LEVEL[level]))
      .toEqual([500, 1_000, 5_000, 10_000, 50_000, 100_000, 500_000, 1_000_000]);
    expect(MILLIONAIRE_LEVELS.map((level) => MILLIONAIRE_OCTAGON_SCORE_BY_LEVEL[level]))
      .toEqual([25, 35, 45, 55, 68, 80, 90, 100]);
  });

  it("returns the most recent checkpoint after a wrong answer", () => {
    expect(millionaireCheckpointMoney(0)).toBe(0);
    expect(millionaireCheckpointMoney(2)).toBe(0);
    expect(millionaireCheckpointMoney(3)).toBe(5_000);
    expect(millionaireCheckpointMoney(5)).toBe(5_000);
    expect(millionaireCheckpointMoney(6)).toBe(100_000);
    expect(millionaireCheckpointMoney(7)).toBe(100_000);
  });

  it("deducts exactly two points for each used lifeline and clamps the normalized score", () => {
    expect(millionaireScoreAfterLifelines(80, { fiftyFifty: true, statSheet: false, doubleDip: false })).toBe(78);
    expect(millionaireScoreAfterLifelines(100, { fiftyFifty: true, statSheet: true, doubleDip: true })).toBe(94);
    expect(millionaireScoreAfterLifelines(0, { fiftyFifty: true, statSheet: true, doubleDip: true })).toBe(0);
  });
});

describe("Millionaire run contract", () => {
  it("requires exactly one Q1-Q8 sequence inside one sport scope", () => {
    const run = fixtureRun("football");
    expect(() => assertMillionaireRun(run)).not.toThrow();
    expect(() => assertMillionaireRun(run.slice(0, 7))).toThrow("exactly eight");
    expect(() => assertMillionaireRun([
      ...run.slice(0, 7),
      { ...run[7], level: "Q7" },
    ])).toThrow("must be Q8");
    expect(() => assertMillionaireRun([
      run[0],
      { ...run[1], sport: "ufc" },
      ...run.slice(2),
    ])).toThrow("one sport scope");
  });

  it("starts at Q1 with no money, no score, no lifelines used, and no private answer in the public projection", () => {
    const run = fixtureRun();
    const state = createMillionaireState(run);
    expect(state).toMatchObject({
      status: "playing",
      currentQuestionIndex: 0,
      completedQuestions: 0,
      currentMoney: 0,
      finalMoney: null,
      baseScore: 0,
      score: 0,
    });
    const question = currentMillionairePublicQuestion(run, state)!;
    expect(question.level).toBe("Q1");
    expect("correctChoiceId" in question).toBe(false);
    expect("explanation" in question).toBe(false);
  });
});

describe("Millionaire progression and settlement", () => {
  it("advances one question per correct answer and makes Q6 an 80-point good result", () => {
    const run = fixtureRun();
    let state = createMillionaireState(run);
    state = answerCorrect(run, state, 6);
    expect(state).toMatchObject({
      status: "playing",
      completedQuestions: 6,
      currentQuestionIndex: 6,
      currentMoney: 100_000,
      baseScore: 80,
      score: 80,
    });
  });

  it("settles wrong answers to checkpoints and makes Q8 a real 90-to-80 risk", () => {
    const run = fixtureRun();

    const q1Loss = advanceMillionaireRuntime(run, createMillionaireState(run), { type: "answer", choiceId: "B" });
    expect(q1Loss.state).toMatchObject({ status: "lost", finalMoney: 0, score: 0 });
    expect(q1Loss.answerOutcome).toBe("wrong");
    expect(q1Loss.questionReveal?.correctChoiceId).toBe("A");

    const afterQ3 = answerCorrect(run, createMillionaireState(run), 3);
    const q4Loss = advanceMillionaireRuntime(run, afterQ3, { type: "answer", choiceId: "B" });
    expect(q4Loss.state).toMatchObject({ status: "lost", finalMoney: 5_000, baseScore: 45, score: 45 });

    const afterQ6 = answerCorrect(run, createMillionaireState(run), 6);
    const q7Loss = advanceMillionaireRuntime(run, afterQ6, { type: "answer", choiceId: "B" });
    expect(q7Loss.state).toMatchObject({ status: "lost", finalMoney: 100_000, baseScore: 80, score: 80 });

    const afterQ7 = answerCorrect(run, createMillionaireState(run), 7);
    const q8Loss = advanceMillionaireRuntime(run, afterQ7, { type: "answer", choiceId: "B" });
    expect(q8Loss.state).toMatchObject({ status: "lost", finalMoney: 100_000, baseScore: 80, score: 80 });
  });

  it("offers the walk-away decision only before Q8 and preserves the earned 90-point result", () => {
    const run = fixtureRun();
    const initial = createMillionaireState(run);
    expect(millionaireCanWalkAway(initial)).toBe(false);
    expect(() => advanceMillionaireRuntime(run, initial, { type: "walk_away" })).toThrow("only available before Q8");

    const beforeQ7 = answerCorrect(run, initial, 6);
    expect(millionaireCanWalkAway(beforeQ7)).toBe(false);
    expect(() => advanceMillionaireRuntime(run, beforeQ7, { type: "walk_away" })).toThrow("only available before Q8");

    const beforeQ8 = answerCorrect(run, initial, 7);
    expect(millionaireCanWalkAway(beforeQ8)).toBe(true);
    expect(advanceMillionaireRuntime(run, beforeQ8, { type: "walk_away" }).state)
      .toMatchObject({ status: "walked-away", finalMoney: 500_000, baseScore: 90, score: 90 });
  });

  it("awards $1,000,000 and 100 for a perfect no-lifeline run", () => {
    const run = fixtureRun();
    const state = answerCorrect(run, createMillionaireState(run), 8);
    expect(state).toMatchObject({
      status: "won",
      completedQuestions: 8,
      currentMoney: 1_000_000,
      finalMoney: 1_000_000,
      baseScore: 100,
      score: 100,
    });
    expect(() => advanceMillionaireRuntime(run, state, { type: "answer", choiceId: "A" })).toThrow("already settled");
  });
});

describe("Millionaire lifeline invariants", () => {
  it("uses authored deterministic 50/50 removals, charges the score once, and blocks removed answers", () => {
    const run = fixtureRun();
    const start = answerCorrect(run, createMillionaireState(run), 3);
    const result = advanceMillionaireRuntime(run, start, { type: "use_lifeline", lifeline: "fifty-fifty" });

    expect(result.lifelineReveal).toEqual({ type: "fifty-fifty", removedChoiceIds: ["C", "D"] });
    expect(result.state.questionState.removedChoiceIds).toEqual(["C", "D"]);
    expect(result.state.score).toBe(43);
    expect(() => advanceMillionaireRuntime(run, result.state, { type: "answer", choiceId: "C" })).toThrow("removed 50/50 choice");
    expect(() => advanceMillionaireRuntime(run, result.state, { type: "use_lifeline", lifeline: "fifty-fifty" })).toThrow("already been used");
  });

  it("reveals Stat Sheet only when used and makes it globally single-use", () => {
    const run = fixtureRun();
    const start = createMillionaireState(run);
    const result = advanceMillionaireRuntime(run, start, { type: "use_lifeline", lifeline: "stat-sheet" });
    expect(result.lifelineReveal).toEqual({ type: "stat-sheet", text: "Fixture Stat Sheet Q1" });
    expect(result.state.questionState.statSheetRevealed).toBe(true);

    const next = advanceMillionaireRuntime(run, result.state, { type: "answer", choiceId: "A" }).state;
    expect(() => advanceMillionaireRuntime(run, next, { type: "use_lifeline", lifeline: "stat-sheet" })).toThrow("already been used");
  });

  it("forbids 50/50 and Double Dip on the same question in either order", () => {
    const run = fixtureRun();
    const start = createMillionaireState(run);

    const afterFifty = advanceMillionaireRuntime(run, start, { type: "use_lifeline", lifeline: "fifty-fifty" }).state;
    expect(() => advanceMillionaireRuntime(run, afterFifty, { type: "use_lifeline", lifeline: "double-dip" }))
      .toThrow("cannot be used on the same question");

    const afterDouble = advanceMillionaireRuntime(run, start, { type: "use_lifeline", lifeline: "double-dip" }).state;
    expect(() => advanceMillionaireRuntime(run, afterDouble, { type: "use_lifeline", lifeline: "fifty-fifty" }))
      .toThrow("cannot be used on the same question");
  });

  it("gives Double Dip two attempts without revealing the correct answer after the first miss", () => {
    const run = fixtureRun();
    const start = answerCorrect(run, createMillionaireState(run), 3);
    const doubleDip = advanceMillionaireRuntime(run, start, { type: "use_lifeline", lifeline: "double-dip" }).state;
    const firstMiss = advanceMillionaireRuntime(run, doubleDip, { type: "answer", choiceId: "B" });

    expect(firstMiss.answerOutcome).toBe("double-dip-continue");
    expect(firstMiss.questionReveal).toBeNull();
    expect(firstMiss.state.status).toBe("playing");
    expect(firstMiss.state.questionState.doubleDipWrongChoiceIds).toEqual(["B"]);
    expect(() => advanceMillionaireRuntime(run, firstMiss.state, { type: "answer", choiceId: "B" })).toThrow("cannot be submitted twice");

    const secondMiss = advanceMillionaireRuntime(run, firstMiss.state, { type: "answer", choiceId: "C" });
    expect(secondMiss.answerOutcome).toBe("wrong");
    expect(secondMiss.questionReveal?.correctChoiceId).toBe("A");
    expect(secondMiss.state).toMatchObject({ status: "lost", finalMoney: 5_000, score: 43 });
  });

  it("lets the second Double Dip attempt succeed and then clears per-question Double Dip state", () => {
    const run = fixtureRun();
    const start = answerCorrect(run, createMillionaireState(run), 2);
    const doubleDip = advanceMillionaireRuntime(run, start, { type: "use_lifeline", lifeline: "double-dip" }).state;
    const firstMiss = advanceMillionaireRuntime(run, doubleDip, { type: "answer", choiceId: "B" }).state;
    const recovered = advanceMillionaireRuntime(run, firstMiss, { type: "answer", choiceId: "A" });

    expect(recovered.answerOutcome).toBe("correct");
    expect(recovered.state).toMatchObject({
      status: "playing",
      completedQuestions: 3,
      currentQuestionIndex: 3,
      currentMoney: 5_000,
      baseScore: 45,
      score: 43,
    });
    expect(recovered.state.questionState.doubleDipActive).toBe(false);
    expect(recovered.state.questionState.doubleDipWrongChoiceIds).toEqual([]);
  });

  it("does not offer walking away on Q7, including after Double Dip is activated", () => {
    const run = fixtureRun();
    const beforeQ7 = answerCorrect(run, createMillionaireState(run), 6);
    expect(millionaireCanWalkAway(beforeQ7)).toBe(false);

    const doubleDip = advanceMillionaireRuntime(run, beforeQ7, { type: "use_lifeline", lifeline: "double-dip" }).state;
    expect(millionaireCanWalkAway(doubleDip)).toBe(false);
    expect(() => advanceMillionaireRuntime(run, doubleDip, { type: "walk_away" })).toThrow("only available before Q8");
  });

  it("disables all lifelines on Q8", () => {
    const run = fixtureRun();
    const beforeQ8 = answerCorrect(run, createMillionaireState(run), 7);
    for (const lifeline of ["fifty-fifty", "stat-sheet", "double-dip"] as const) {
      expect(() => advanceMillionaireRuntime(run, beforeQ8, { type: "use_lifeline", lifeline })).toThrow("disabled on Q8");
    }
  });

  it("can finish at 94 after using all three lifelines earlier in the run", () => {
    const run = fixtureRun();
    let state = createMillionaireState(run);
    state = advanceMillionaireRuntime(run, state, { type: "use_lifeline", lifeline: "stat-sheet" }).state;
    state = advanceMillionaireRuntime(run, state, { type: "answer", choiceId: "A" }).state;
    state = advanceMillionaireRuntime(run, state, { type: "use_lifeline", lifeline: "fifty-fifty" }).state;
    state = advanceMillionaireRuntime(run, state, { type: "answer", choiceId: "A" }).state;
    state = advanceMillionaireRuntime(run, state, { type: "use_lifeline", lifeline: "double-dip" }).state;
    state = answerCorrect(run, state, 6);

    expect(state).toMatchObject({ status: "won", finalMoney: 1_000_000, baseScore: 100, score: 94 });
  });
});
