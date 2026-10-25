import type { FootballHigherLowerBoard } from "../back-room/footballHigherLowerModel";
import { footballHigherLowerPublicQuestion } from "./footballHigherLowerDailyPublication";
import type { OfficialDailyRuntimeContext, OfficialDailyAdvanceResult } from "./todaysChallengeRuntime";

type JsonRecord = Record<string, unknown>;

export function advanceFootballHigherLowerDaily(
  context: OfficialDailyRuntimeContext,
  action: JsonRecord,
): OfficialDailyAdvanceResult {
  const board = context.privateSetupEvidence.board as FootballHigherLowerBoard | undefined;
  if (!board || board.questions?.length !== 10) throw new Error("Football Higher or Lower official board is unavailable.");
  const state = context.publicState;
  const index = Number(state.index);
  const answers = state.answers;
  if (!Number.isInteger(index) || index < 0 || index >= 10
      || !Array.isArray(answers) || answers.length !== index || state.complete === true) {
    throw new Error("Football Higher or Lower progress is finished or invalid.");
  }
  const choice = action.choice;
  if (choice !== "higher" && choice !== "lower") throw new Error("Choose higher or lower.");
  const question = board.questions[index]!;
  const correct = choice === question.answer;
  const nextAnswers = [...answers, { question_id: question.id, choice, correct }];
  const correctCount = nextAnswers.filter(row => row.correct === true).length;
  const complete = nextAnswers.length === 10;
  const finalSubmission = complete ? { answers: nextAnswers } : null;
  return {
    submissionState: { answers: nextAnswers, final_submission: finalSubmission },
    publicState: {
      complete,
      index: nextAnswers.length,
      correct_count: correctCount,
      answers: nextAnswers,
      current_question: complete ? null : footballHigherLowerPublicQuestion(board.questions[index + 1]!),
      last_result: {
        question_id: question.id,
        choice, correct, known: question.known, hidden: question.hidden,
      },
      score: complete ? correctCount * 10 : null,
    },
    complete,
    finalSubmission,
  };
}
