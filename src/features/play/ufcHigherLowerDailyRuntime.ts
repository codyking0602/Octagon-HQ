import {
  UFC_HIGHER_LOWER_COUNT, parseUfcHigherLowerBoard, ufcHigherLowerDailyBoard,
  type UfcHigherLowerQuestion,
} from "./ufcHigherLowerModel";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import type {
  OfficialDailyAdvanceResult, OfficialDailyRuntimeContext, OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const UFC_HIGHER_LOWER_OFFICIAL_VERSION = "ufc-higher-lower-official-v1";

type Row = Record<string, unknown>;
function object(value: unknown, label: string): Row {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("UFC Higher or Lower invalid " + label + ".");
  return value as Row;
}
/** The private id encodes the answer: do NOT expose it while unanswered. */
export function ufcHigherLowerPublicQuestion(question: UfcHigherLowerQuestion, index: number) {
  const { id: _privateId, answer: _answer, hidden, ...visible } = question;
  const { value: _hiddenValue, formattedValue: _formattedValue, ...hiddenIdentity } = hidden;
  return { ...visible, id: "ufc-daily-comparison-" + (index + 1), hidden: hiddenIdentity };
}
export function buildUfcHigherLowerDailyPublication(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  if (!scheduleVersion.trim()) throw new Error("UFC Higher or Lower requires a schedule version.");
  const board = ufcHigherLowerDailyBoard(day);
  return {
    setupKey: [UFC_HIGHER_LOWER_OFFICIAL_VERSION, scheduleVersion, day].join(":"),
    contentVersion: UFC_HIGHER_LOWER_OFFICIAL_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: UFC_HIGHER_LOWER_OFFICIAL_VERSION,
      league: "UFC", question_count: UFC_HIGHER_LOWER_COUNT,
      initial_state: {
        complete: false, index: 0, correct_count: 0, answers: [],
        current_question: ufcHigherLowerPublicQuestion(board.questions[0]!, 0), last_result: null,
      },
    },
    revealSetup: {
      questions: board.questions.map(question => ({
        id: question.id, metricKey: question.metricKey, metricLabel: question.metricLabel,
        scopeLabel: question.scopeLabel, difficulty: question.difficulty,
        known: question.known, hidden: question.hidden, answer: question.answer,
      })),
    },
    privateSetupEvidence: { board },
    privateGradingEvidence: {
      question_ids: board.questions.map(question => question.id),
      correct_choices: board.questions.map(question => question.answer),
    },
  };
}
export function advanceUfcHigherLowerDailyRuntime(
  context: OfficialDailyRuntimeContext, action: Row,
): OfficialDailyAdvanceResult {
  const board = parseUfcHigherLowerBoard(context.privateSetupEvidence.board);
  if (!board) throw new Error("UFC Higher or Lower saved comparison evidence is invalid.");
  const state = object(context.publicState, "public state");
  const index = state.index;
  const previous = state.answers;
  if (state.complete === true || !Number.isInteger(index) || Number(index) < 0
    || Number(index) >= UFC_HIGHER_LOWER_COUNT || !Array.isArray(previous)
    || previous.length !== index) throw new Error("UFC Higher or Lower progress is invalid or finished.");
  for (let i = 0; i < Number(index); i++) {
    const answer = object(previous[i], "previous answer");
    const q = board.questions[i]!;
    if (answer.question_id !== q.id || (answer.choice !== "higher" && answer.choice !== "lower")
      || answer.correct !== (answer.choice === q.answer)) throw new Error("UFC Higher or Lower resume evidence does not match its frozen board.");
  }
  const choice = action.choice;
  if (choice !== "higher" && choice !== "lower") throw new Error("UFC Higher or Lower requires a higher or lower choice.");
  const current = board.questions[Number(index)]!;
  const correct = choice === current.answer;
  const answers = [...previous, { question_id: current.id, choice, correct }];
  const correctCount = answers.filter(answer => answer.correct).length;
  const complete = answers.length === UFC_HIGHER_LOWER_COUNT;
  const finalSubmission = complete ? {
    answers, native_score: correctCount, normalized_score: correctCount * 10, correct_count: correctCount,
  } : null;
  return {
    submissionState: { answers, final_submission: finalSubmission },
    publicState: {
      complete, index: answers.length, correct_count: correctCount, answers,
      current_question: complete ? null : ufcHigherLowerPublicQuestion(board.questions[answers.length]!, answers.length),
      last_result: { question_id: current.id, choice, correct, known: current.known, hidden: current.hidden },
      score: complete ? correctCount * 10 : null,
    },
    complete, finalSubmission,
  };
}
