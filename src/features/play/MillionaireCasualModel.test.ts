import { describe, expect, it } from "vitest";
import { assertMillionaireRun, advanceMillionaireRuntime, createMillionaireState } from "../games/millionaireEngine";
import {
  MILLIONAIRE_REVEAL_DELAY_MS,
  MILLIONAIRE_TIME_BANK_MS,
  millionaireCasualRun,
  millionaireHostNumber,
  millionaireTimeLabel,
  millionaireTimeoutTransition,
  type MillionaireLeague,
} from "./MillionaireCasualModel";

const leagues: readonly MillionaireLeague[] = ["ufc", "nfl", "cfb"];

function answerCorrectly(league: MillionaireLeague, count: number) {
  const run = millionaireCasualRun(league);
  let state = createMillionaireState(run);
  for (let index = 0; index < count; index += 1) {
    const current = run[state.currentQuestionIndex]!;
    state = advanceMillionaireRuntime(run, state, {
      type: "answer",
      choiceId: current.correctChoiceId,
    }).state;
  }
  return { run, state };
}

describe("Millionaire private casual runtime", () => {
  it("locks the shared game clock to 2:30", () => {
    expect(MILLIONAIRE_TIME_BANK_MS).toBe(150_000);
    expect(millionaireTimeLabel(MILLIONAIRE_TIME_BANK_MS)).toBe("2:30");
  });

  it("uses the approved reveal pacing without result-specific timing", () => {
    expect(MILLIONAIRE_REVEAL_DELAY_MS).toEqual({
      Q1: 90,
      Q2: 90,
      Q3: 90,
      Q4: 750,
      Q5: 750,
      Q6: 750,
      Q7: 1_250,
      Q8: 1_750,
    });
  });

  it.each(leagues)("builds a valid eight-question %s run and disables every Q8 lifeline", (league) => {
    const run = millionaireCasualRun(league);
    expect(() => assertMillionaireRun(run)).not.toThrow();
    expect(run).toHaveLength(8);
    expect(run[7].level).toBe("Q8");
    expect(run[7].statSheet).toBeNull();
    expect(run[7].lifelineCompatibility).toEqual({
      fiftyFifty: false,
      statSheet: false,
      doubleDip: false,
    });
  });

  it.each(leagues)("rotates %s hosts canonically 1 → 2 → 3 and repeats", (league) => {
    const numbers = [
      millionaireHostNumber(league, "2026-09-17"),
      millionaireHostNumber(league, "2026-09-18"),
      millionaireHostNumber(league, "2026-09-19"),
      millionaireHostNumber(league, "2026-09-20"),
    ];
    expect(new Set(numbers.slice(0, 3))).toEqual(new Set([1, 2, 3]));
    expect(numbers[3]).toBe(numbers[0]);
  });

  it("settles a timeout to the latest checkpoint", () => {
    const opening = answerCorrectly("cfb", 0);
    expect(millionaireTimeoutTransition(opening.run, opening.state).state.finalMoney).toBe(0);

    const firstCheckpoint = answerCorrectly("cfb", 3);
    const q4Timeout = millionaireTimeoutTransition(firstCheckpoint.run, firstCheckpoint.state).state;
    expect(q4Timeout.finalMoney).toBe(5_000);
    expect(q4Timeout.score).toBe(45);

    const secondCheckpoint = answerCorrectly("cfb", 6);
    const q7Timeout = millionaireTimeoutTransition(secondCheckpoint.run, secondCheckpoint.state).state;
    expect(q7Timeout.finalMoney).toBe(100_000);
    expect(q7Timeout.score).toBe(80);

    const beforeQ8 = answerCorrectly("cfb", 7);
    const q8Timeout = millionaireTimeoutTransition(beforeQ8.run, beforeQ8.state).state;
    expect(q8Timeout.finalMoney).toBe(100_000);
    expect(q8Timeout.baseScore).toBe(80);
    expect(q8Timeout.score).toBe(80);
  });

  it("keeps lifeline deductions when the time bank expires", () => {
    const run = millionaireCasualRun("ufc");
    let state = createMillionaireState(run);
    state = advanceMillionaireRuntime(run, state, { type: "use_lifeline", lifeline: "stat-sheet" }).state;
    for (let index = 0; index < 3; index += 1) {
      const current = run[state.currentQuestionIndex]!;
      state = advanceMillionaireRuntime(run, state, { type: "answer", choiceId: current.correctChoiceId }).state;
    }
    const timedOut = millionaireTimeoutTransition(run, state).state;
    expect(timedOut.finalMoney).toBe(5_000);
    expect(timedOut.baseScore).toBe(45);
    expect(timedOut.score).toBe(43);
  });
});
