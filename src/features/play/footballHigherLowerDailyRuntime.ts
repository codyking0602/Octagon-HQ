import {
  FOOTBALL_HIGHER_LOWER_QUESTION_COUNT,
  createFootballHigherLowerBoard,
  parseFootballHigherLowerBoard,
  type FootballHigherLowerQuestion,
} from "../back-room/footballHigherLowerModel";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import { persistenceSetup } from "./footballDailyPublicationShared";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const FOOTBALL_HIGHER_LOWER_OFFICIAL_VERSION = "football-higher-lower-official-v1";

type JsonRecord = Record<string, unknown>;

/** Never send the answer or hidden numerical value before official completion. */
export function footballHigherLowerPublicQuestion(question: FootballHigherLowerQuestion) {
  const { answer: _answer, hidden, ...safe } = question;
  const { value: _value, formattedValue: _formatted, ...publicHidden } = hidden;
  return { ...safe, hidden: publicHidden };
}

export function buildFootballHigherLowerDailyPublication(
  day: string,
  scheduleVersion: string,
): OfficialDailySetupPublication {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !scheduleVersion.trim()) {
    throw new Error("Football Higher or Lower requires a canonical Daily date and schedule.");
  }
  const seed = [FOOTBALL_HIGHER_LOWER_OFFICIAL_VERSION, scheduleVersion, day].join("|");
  const board = createFootballHigherLowerBoard(seed, "MIXED");
  if (board.questions.length !== FOOTBALL_HIGHER_LOWER_QUESTION_COUNT) {
    throw new Error("Football Higher or Lower requires ten audited comparisons.");
  }
  return {
    setupKey: [FOOTBALL_HIGHER_LOWER_OFFICIAL_VERSION, scheduleVersion, day].join(":"),
    contentVersion: FOOTBALL_HIGHER_LOWER_OFFICIAL_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_HIGHER_LOWER_OFFICIAL_VERSION,
      league: "MIXED",
      question_count: FOOTBALL_HIGHER_LOWER_QUESTION_COUNT,
      initial_state: {
        complete: false, index: 0, correct_count: 0, answers: [],
        current_question: footballHigherLowerPublicQuestion(board.questions[0]!),
        last_result: null,
      },
    },
    revealSetup: {
      questions: board.questions.map(question => ({
        id: question.id, league: question.league, category: question.category,
        metricLabel: question.metricLabel, answer: question.answer,
        known: question.known, hidden: question.hidden,
      })),
    },
    privateSetupEvidence: { board },
    // Existing canonical SQL Higher/Lower grader independently scores ten
    // question-ID-matched choices; client score values are never trusted.
    privateGradingEvidence: {
      question_ids: board.questions.map(question => question.id),
      correct_choices: board.questions.map(question => question.answer),
    },
  };
}

/** The coordinated future calendar is the sole activation point. */
export function buildFootballHigherLowerDailyPersistenceSetup(day: string, scheduleVersion: string) {
  return persistenceSetup(
    "higher_lower", day, scheduleVersion,
    buildFootballHigherLowerDailyPublication(day, scheduleVersion),
  );
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
  const board = parseFootballHigherLowerBoard(context.privateSetupEvidence.board);
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
      current_question: complete ? null : footballHigherLowerPublicQuestion(board.questions[index + 1]!),
      last_result: {
        question_id: current.id, choice, correct,
        known: current.known, hidden: current.hidden,
      },
      score: complete ? correctCount * 10 : null,
    },
    complete, finalSubmission,
  };
}
