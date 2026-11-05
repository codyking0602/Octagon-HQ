// Action-only official evaluator. Do not import the Football fact universe here:
// generating its Higher or Lower candidate pairs exceeds the Edge CPU budget.
import type { FootballHigherLowerQuestion } from "../back-room/footballHigherLowerModel";
import type { OfficialDailyAdvanceResult, OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

const FOOTBALL_HIGHER_LOWER_QUESTION_COUNT = 10;
type JsonRecord = Record<string, unknown>;

// Mirrors the canonical persisted-board validation without initializing the
// expensive candidate registry. The original board remains frozen in the DB.
function parseLeanBoard(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const board = value as JsonRecord;
  if (board.version !== "football-higher-lower-v1"
    || typeof board.seed !== "string"
    || board.scope !== "MIXED"
    || !Array.isArray(board.questions)
    || board.questions.length !== FOOTBALL_HIGHER_LOWER_QUESTION_COUNT) return null;
  for (const value of board.questions) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const question = value as JsonRecord;
    const known = question.known as JsonRecord | null;
    const hidden = question.hidden as JsonRecord | null;
    if (typeof question.id !== "string"
      || (question.league !== "NFL" && question.league !== "CFB")
      || (question.answer !== "higher" && question.answer !== "lower")
      || !known || typeof known !== "object" || Array.isArray(known)
      || !hidden || typeof hidden !== "object" || Array.isArray(hidden)
      || typeof known.value !== "number" || typeof hidden.value !== "number"
      || known.value === hidden.value) return null;
  }
  return { scope: "MIXED" as const, questions: board.questions as FootballHigherLowerQuestion[] };
}

/** Never send the answer or hidden numerical value before official completion. */
export function footballHigherLowerPublicQuestion(question: FootballHigherLowerQuestion, index: number) {
  const { answer: _answer, hidden, id: _privateId, ...safe } = question;
  const { value: _value, formattedValue: _formatted, ...publicHidden } = hidden;
  // The private question ID contains ":higher"/":lower". Never expose it:
  // even publishing the ID alone would reveal the correct choice.
  return { ...safe, id: "football-daily-comparison-" + (index + 1), hidden: publicHidden };
}

function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Football Higher or Lower " + label + " must be an object.");
  }
  return value as JsonRecord;
}

export function advanceFootballHigherLowerDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: JsonRecord,
): OfficialDailyAdvanceResult {
  const board = parseLeanBoard(context.privateSetupEvidence.board);
  if (!board || board.scope !== "MIXED") {
    throw new Error("The saved Football Higher or Lower board is invalid.");
  }
  const state = record(context.publicState, "public state");
  const index = Number(state.index);
  const rows = state.answers;
  if (state.complete === true || !Number.isInteger(index) || index < 0
    || index >= FOOTBALL_HIGHER_LOWER_QUESTION_COUNT || !Array.isArray(rows)
    || rows.length !== index) {
    throw new Error("Football Higher or Lower is complete or progress is invalid.");
  }
  for (let i = 0; i < index; i += 1) {
    const answer = record(rows[i], "saved answer");
    if (answer.question_id !== board.questions[i]!.id
      || (answer.choice !== "higher" && answer.choice !== "lower")
      || answer.correct !== (answer.choice === board.questions[i]!.answer)) {
      throw new Error("Football Higher or Lower progress does not match the frozen board.");
    }
  }
  const choice = action.choice;
  if (choice !== "higher" && choice !== "lower") {
    throw new Error("Football Higher or Lower accepts only a higher or lower answer.");
  }
  const current = board.questions[index]!;
  const correct = choice === current.answer;
  const answers = [...rows, { question_id: current.id, choice, correct }];
  const correctCount = answers.filter(answer => answer.correct === true).length;
  const complete = answers.length === FOOTBALL_HIGHER_LOWER_QUESTION_COUNT;
  const finalSubmission = complete ? {
    answers, native_score: correctCount,
    normalized_score: correctCount * 10, correct_count: correctCount,
  } : null;
  return {
    submissionState: { answers, final_submission: finalSubmission },
    publicState: {
      complete, index: answers.length, correct_count: correctCount, answers,
      current_question: complete ? null : footballHigherLowerPublicQuestion(board.questions[index + 1]!, index + 1),
      last_result: {
        question_id: current.id, choice, correct,
        known: current.known, hidden: current.hidden,
      },
      score: complete ? correctCount * 10 : null,
    },
    complete, finalSubmission,
  };
}
