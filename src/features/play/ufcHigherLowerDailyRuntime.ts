import {
  createUfcHigherLowerOfficialBoard, parseUfcHigherLowerBoard,
  UFC_HIGHER_LOWER_QUESTION_COUNT, type UfcHigherLowerQuestion,
} from "./ufcHigherLowerModel";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import type {
  OfficialDailyAdvanceResult, OfficialDailyRuntimeContext, OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const UFC_HIGHER_LOWER_OFFICIAL_VERSION = "ufc-higher-lower-official-v1";

type Row = Record<string, unknown>;
function record(value: unknown): Row {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Official UFC Higher or Lower state must be an object.");
  }
  return value as Row;
}

/** Private IDs contain the answer. Never send an unanswered question's ID. */
export function ufcHigherLowerPublicQuestion(question: UfcHigherLowerQuestion, index: number) {
  const { answer: _answer, id: _id, hidden, ...safe } = question;
  const { value: _value, formattedValue: _formattedValue, ...publicHidden } = hidden;
  return { ...safe, id: "ufc-daily-comparison-" + (index + 1), hidden: publicHidden };
}

export function buildUfcHigherLowerDailyPublication(
  day: string, scheduleVersion: string,
): OfficialDailySetupPublication {
  if (!scheduleVersion.trim()) throw new Error("UFC Higher or Lower needs a schedule version.");
  const board = createUfcHigherLowerOfficialBoard(day);
  if (board.questions.length !== UFC_HIGHER_LOWER_QUESTION_COUNT) {
    throw new Error("UFC Higher or Lower Daily must publish ten verified comparisons.");
  }
  return {
    setupKey: [UFC_HIGHER_LOWER_OFFICIAL_VERSION, scheduleVersion, day].join(":"),
    contentVersion: UFC_HIGHER_LOWER_OFFICIAL_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: UFC_HIGHER_LOWER_OFFICIAL_VERSION, league: "UFC",
      question_count: UFC_HIGHER_LOWER_QUESTION_COUNT,
      initial_state: {
        complete: false, index: 0, correct_count: 0, answers: [],
        current_question: ufcHigherLowerPublicQuestion(board.questions[0]!, 0),
        last_result: null,
      },
    },
    revealSetup: {
      questions: board.questions.map(q => ({
        id: q.id, category: q.category, metricLabel: q.metricLabel, note: q.note,
        answer: q.answer, known: q.known, hidden: q.hidden,
      })),
    },
    privateSetupEvidence: { board },
    privateGradingEvidence: {
      question_ids: board.questions.map(q => q.id),
      correct_choices: board.questions.map(q => q.answer),
    },
  };
}

export function advanceUfcHigherLowerDailyRuntime(
  context: OfficialDailyRuntimeContext, action: Row,
): OfficialDailyAdvanceResult {
  const board = parseUfcHigherLowerBoard(context.privateSetupEvidence.board);
  if (!board || !board.seed.startsWith("official-slot-")) {
    throw new Error("The official UFC Higher or Lower evidence is invalid.");
  }
  const state = record(context.publicState);
  const index = Number(state.index);
  if (state.complete === true || !Number.isInteger(index) || index < 0
    || index >= UFC_HIGHER_LOWER_QUESTION_COUNT || !Array.isArray(state.answers)
    || state.answers.length !== index) {
    throw new Error("UFC Higher or Lower is complete or has invalid progress.");
  }
  const rows = state.answers as unknown[];
  for (let i = 0; i < index; i++) {
    const saved = record(rows[i]);
    if (saved.question_id !== board.questions[i]!.id
      || (saved.choice !== "higher" && saved.choice !== "lower")
      || saved.correct !== (saved.choice === board.questions[i]!.answer)) {
      throw new Error("UFC Higher or Lower progress does not match its frozen board.");
    }
  }
  if (action.choice !== "higher" && action.choice !== "lower") {
    throw new Error("Choose higher or lower.");
  }
  const active = board.questions[index]!;
  const correct = action.choice === active.answer;
  const answers = [...rows, { question_id: active.id, choice: action.choice, correct }];
  const correctCount = answers.filter(a => record(a).correct === true).length;
  const complete = answers.length === UFC_HIGHER_LOWER_QUESTION_COUNT;
  const finalSubmission = complete ? {
    answers, native_score: correctCount, normalized_score: correctCount * 10,
    correct_count: correctCount,
  } : null;
  return {
    submissionState: { answers, final_submission: finalSubmission },
    publicState: {
      complete, index: answers.length, correct_count: correctCount, answers,
      current_question: complete ? null : ufcHigherLowerPublicQuestion(board.questions[index + 1]!, index + 1),
      last_result: {
        question_id: active.id, choice: action.choice, correct,
        known: active.known, hidden: active.hidden,
      },
      score: complete ? correctCount * 10 : null,
    },
    complete, finalSubmission,
  };
}
