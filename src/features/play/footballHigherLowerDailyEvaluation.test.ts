import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildFootballHigherLowerTwoGameDailyPublication, buildFootballHigherLowerDailyPublication, advanceFootballHigherLowerDailyRuntime } from "../footballHigherLowerDailyRuntime";
import { advanceTwoGameDailyRuntime } from "../dailyTwoGameRuntime";
import { advanceOfficialDailyGameRuntime as leanAdvance } from "./leanDaily/FootballHigherLowerAdvance";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

const day = "2026-11-05";
const version = "football-daily-v22-higher-lower-oct27";

function context(publication: ReturnType<typeof buildFootballHigherLowerDailyPublication>): OfficialDailyRuntimeContext {
  return {
    gameType: "higher_lower", setupKey: publication.setupKey,
    publicSetup: publication.publicSetup, revealSetup: publication.revealSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    privateGradingEvidence: publication.privateGradingEvidence,
    submissionState: {}, publicState: publication.publicSetup.initial_state as Record<string, unknown>,
  };
}

describe("Football Higher or Lower action-only Edge CPU isolation", () => {
  it("does not import the enormous fact-bank generator in the answer bundle", () => {
    const lean = readFileSync("src/features/play/leanDaily/FootballHigherLowerAdvance.ts", "utf8");
    const isolated = readFileSync("src/features/play/footballHigherLowerDailyEvaluation.ts", "utf8");
    expect(lean).toContain('from "../footballHigherLowerDailyEvaluation"');
    expect(lean).not.toContain('from "../footballHigherLowerDailyRuntime"');
    expect(isolated).not.toContain('from "../footballHigherLowerDailyRuntime"');
    expect(isolated).not.toContain('parseFootballHigherLowerBoard');
    expect(isolated).not.toContain('createFootballHigherLowerBoard');
    expect(isolated).toContain('import type { FootballHigherLowerQuestion }');
  });

  it("matches the canonical frozen-board evaluator on every answer, without public answer leakage", () => {
    const publication = buildFootballHigherLowerDailyPublication(day, version);
    const questions = (publication.privateSetupEvidence.board as { questions: Array<{ answer: "higher" | "lower" }> }).questions;
    let run = context(publication);
    expect(() => leanAdvance(run, { choice: "tie" })).toThrow();
    for (const [index, question] of questions.entries()) {
      const choice = index % 3 === 0 ? (question.answer === "higher" ? "lower" : "higher") : question.answer;
      const expected = advanceFootballHigherLowerDailyRuntime(run, { choice });
      const actual = leanAdvance(run, { choice });
      expect(actual).toEqual(expected);
      if (index < questions.length - 1) {
        const nextQuestion = actual.publicState.current_question as Record<string, unknown>;
        expect(nextQuestion).not.toHaveProperty("answer");
        expect(nextQuestion.hidden).not.toHaveProperty("value");
        expect(nextQuestion.hidden).not.toHaveProperty("formattedValue");
      }
      run = { ...run, submissionState: actual.submissionState, publicState: actual.publicState };
    }
    expect(run.publicState.complete).toBe(true);
    expect(() => leanAdvance(run, { choice: "higher" })).toThrow();
  });

  it("preserves both official games and the final average on the actual debut date", () => {
    const publication = buildFootballHigherLowerTwoGameDailyPublication(day, version);
    const rounds = (publication.privateSetupEvidence as {
      rounds: Array<{ private_setup_evidence: { board: { questions: Array<{ answer: "higher" | "lower" }> } } }>;
    }).rounds;
    let run = context(publication);
    for (let i = 0; i < 20; i += 1) {
      const roundIndex = Math.floor(i / 10);
      const answer = rounds[roundIndex]!.private_setup_evidence.board.questions[i % 10]!.answer;
      const choice = i % 5 === 0 ? (answer === "higher" ? "lower" : "higher") : answer;
      const expected = advanceTwoGameDailyRuntime(
        run, { choice },
        (child, action) => advanceFootballHigherLowerDailyRuntime(child, action as Record<string, unknown>),
        (_child, advanced) => Number(advanced.publicState.correct_count) * 10,
      );
      const actual = leanAdvance(run, { choice });
      expect(actual).toEqual(expected);
      run = { ...run, submissionState: actual.submissionState, publicState: actual.publicState };
    }
    expect(run.publicState.complete).toBe(true);
    expect(run.publicState.score).toBe(80);
    expect(run.publicState.round_scores).toEqual([80, 80]);
  });
});
