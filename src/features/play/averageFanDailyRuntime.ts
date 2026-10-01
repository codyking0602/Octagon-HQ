import {
  AVERAGE_FAN_CONTENT_VERSION,
  AVERAGE_FAN_FANS,
  averageFanAnswersMatch,
  averageFanFanAnswer,
  averageFanPublicQuestion,
  averageFanQuestionEligibleForBoard,
  averageFanQuestionEligibleForFinal,
  scoreAverageFanBoard,
  scoreAverageFanFinal,
  type AverageFanFan,
  type AverageFanQuestion,
  type AverageFanSport,
} from "../games/averageFanEngine";
import { AVERAGE_FAN_CONTENT_BANKS } from "../games/averageFanContentBanks";
import { stableLineupHash } from "./lineupModel";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const AVERAGE_FAN_DAILY_CONTENT_VERSION = "average-fan-daily-v1" as const;
export const AVERAGE_FAN_DAILY_SCORING_VERSION = "average-fan-score-v1" as const;

type AverageFanDailyScope = "ufc" | "football";
type AverageFanDailySport = Exclude<AverageFanSport, "mlb">;
type JsonRecord = Record<string, unknown>;

interface AverageFanPublicationHistoryRow {
  day: string;
  sport: AverageFanDailySport;
  questionIds: string[];
  finalQuestionId: string | null;
}

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Average Fan runtime evidence must be an object.");
  }
  return value as JsonRecord;
}

function records(value: unknown) {
  if (!Array.isArray(value)) return [] as JsonRecord[];
  return value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row));
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((row): row is string => typeof row === "string") : [];
}

function parsePublicationHistory(value: unknown): AverageFanPublicationHistoryRow[] {
  return records(value).flatMap((row) => {
    const day = typeof row.day === "string" ? row.day : "";
    const sport = row.sport;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || (sport !== "nfl" && sport !== "cfb" && sport !== "ufc")) {
      return [];
    }
    return [{
      day,
      sport,
      questionIds: strings(row.question_ids),
      finalQuestionId: typeof row.final_question_id === "string" && row.final_question_id
        ? row.final_question_id
        : null,
    }];
  });
}

function dayNumber(day: string) {
  const millis = Date.parse(`${day}T12:00:00.000Z`);
  if (!Number.isFinite(millis)) throw new Error("Average Fan Daily day is invalid.");
  return Math.floor(millis / 86_400_000);
}

function recentHistory(history: readonly AverageFanPublicationHistoryRow[], day: string) {
  const current = dayNumber(day);
  return history.filter((row) => {
    const distance = current - dayNumber(row.day);
    return distance > 0 && distance <= 183;
  });
}

function dailySport(scope: AverageFanDailyScope, history: readonly AverageFanPublicationHistoryRow[]): AverageFanDailySport {
  if (scope === "ufc") return "ufc";
  const footballAppearances = history.filter((row) => row.sport === "nfl" || row.sport === "cfb").length;
  return footballAppearances % 2 === 0 ? "cfb" : "nfl";
}

function deterministicOrder<T extends { id: string }>(rows: readonly T[], seed: string) {
  return [...rows].sort((left, right) => {
    const leftHash = stableLineupHash(`${seed}|${left.id}`);
    const rightHash = stableLineupHash(`${seed}|${right.id}`);
    return leftHash - rightHash || left.id.localeCompare(right.id);
  });
}

function boardFor(
  sport: AverageFanDailySport,
  day: string,
  scheduleVersion: string,
  history: readonly AverageFanPublicationHistoryRow[],
) {
  const now = `${day}T12:00:00.000Z`;
  const bank = AVERAGE_FAN_CONTENT_BANKS[sport] as readonly AverageFanQuestion[];
  const used = new Set(
    recentHistory(history, day)
      .filter((row) => row.sport === sport)
      .flatMap((row) => row.questionIds),
  );
  const active = bank.filter((question) => averageFanQuestionEligibleForBoard(question, now));
  const fresh = active.filter((question) => !used.has(question.id));
  const poolForGrade = (grade: number) => {
    const freshGrade = fresh.filter((question) => question.grade === grade);
    if (freshGrade.length >= 2) return freshGrade;
    return active.filter((question) => question.grade === grade);
  };

  const seed = `${AVERAGE_FAN_DAILY_CONTENT_VERSION}|${sport}|${scheduleVersion}|${day}`;
  const currentCandidates = deterministicOrder(
    fresh.filter((question) => question.contentType === "current-event"),
    `${seed}|current`,
  );
  const current = currentCandidates[0] ?? null;
  const selected: AverageFanQuestion[] = [];
  const subjectCounts = new Map<string, number>();

  for (const grade of [1, 2, 3, 4, 5] as const) {
    const gradeSelected: AverageFanQuestion[] = [];
    if (current?.grade === grade) {
      gradeSelected.push(current);
      subjectCounts.set(current.subject, (subjectCounts.get(current.subject) ?? 0) + 1);
    }

    const candidates = deterministicOrder(
      poolForGrade(grade).filter((question) => question.id !== current?.id),
      `${seed}|grade|${grade}`,
    );

    while (gradeSelected.length < 2) {
      const ordered = [...candidates].sort((left, right) => {
        const leftSubjectRepeat = gradeSelected.some((question) => question.subject === left.subject) ? 1 : 0;
        const rightSubjectRepeat = gradeSelected.some((question) => question.subject === right.subject) ? 1 : 0;
        if (leftSubjectRepeat !== rightSubjectRepeat) return leftSubjectRepeat - rightSubjectRepeat;

        if (grade <= 2) {
          const leftShortAnswer = left.format === "short-answer" ? 1 : 0;
          const rightShortAnswer = right.format === "short-answer" ? 1 : 0;
          if (leftShortAnswer !== rightShortAnswer) return leftShortAnswer - rightShortAnswer;
          const difficultyDelta = left.difficultyNudge - right.difficultyNudge;
          if (difficultyDelta !== 0) return difficultyDelta;
        }

        const subjectDelta = (subjectCounts.get(left.subject) ?? 0) - (subjectCounts.get(right.subject) ?? 0);
        if (subjectDelta !== 0) return subjectDelta;
        const leftFormatRepeat = gradeSelected.some((question) => question.format === left.format) ? 1 : 0;
        const rightFormatRepeat = gradeSelected.some((question) => question.format === right.format) ? 1 : 0;
        return leftFormatRepeat - rightFormatRepeat;
      });
      const next = ordered[0];
      if (!next) throw new Error(`Average Fan ${sport} grade ${grade} cannot build two Daily questions.`);
      gradeSelected.push(next);
      subjectCounts.set(next.subject, (subjectCounts.get(next.subject) ?? 0) + 1);
      candidates.splice(candidates.indexOf(next), 1);
    }
    selected.push(...gradeSelected);
  }

  if (selected.length !== 10 || new Set(selected.map((question) => question.id)).size !== 10) {
    throw new Error("Average Fan Daily board must contain ten unique questions.");
  }
  return selected;
}

function finalFor(
  sport: AverageFanDailySport,
  day: string,
  scheduleVersion: string,
  history: readonly AverageFanPublicationHistoryRow[],
) {
  const now = `${day}T12:00:00.000Z`;
  const bank = AVERAGE_FAN_CONTENT_BANKS[sport] as readonly AverageFanQuestion[];
  const used = new Set(
    recentHistory(history, day)
      .filter((row) => row.sport === sport)
      .map((row) => row.finalQuestionId)
      .filter((id): id is string => Boolean(id)),
  );
  const active = bank.filter((question) => averageFanQuestionEligibleForFinal(question, now));
  const fresh = active.filter((question) => !used.has(question.id));
  const ordered = deterministicOrder(
    fresh.length ? fresh : active,
    `${AVERAGE_FAN_DAILY_CONTENT_VERSION}|${sport}|${scheduleVersion}|${day}|final`,
  );
  const final = ordered[0];
  if (!final) throw new Error(`Average Fan ${sport} has no active protected Final question.`);
  return final;
}

function publicTile(question: AverageFanQuestion) {
  return {
    id: question.id,
    grade: question.grade,
    subject: question.subject,
    format: question.format,
  };
}

export function buildAverageFanDailySetup(
  scope: AverageFanDailyScope,
  day: string,
  scheduleVersion: string,
  publicationHistory?: unknown,
): OfficialDailySetupPublication {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Average Fan Daily day must use YYYY-MM-DD.");
  if (!scheduleVersion.trim()) throw new Error("Average Fan Daily schedule version is required.");

  const history = parsePublicationHistory(publicationHistory);
  const sport = dailySport(scope, history);
  const questions = boardFor(sport, day, scheduleVersion, history);
  const finalQuestion = finalFor(sport, day, scheduleVersion, history);
  const questionIds = questions.map((question) => question.id);
  const proof = `${AVERAGE_FAN_DAILY_CONTENT_VERSION}:${stableLineupHash([
    AVERAGE_FAN_CONTENT_VERSION,
    scope,
    sport,
    scheduleVersion,
    day,
    ...questionIds,
    finalQuestion.id,
  ].join("|"))}`;

  return {
    setupKey: `${AVERAGE_FAN_DAILY_CONTENT_VERSION}:${scheduleVersion}:${day}:${sport}`,
    contentVersion: AVERAGE_FAN_DAILY_CONTENT_VERSION,
    scoringVersion: AVERAGE_FAN_DAILY_SCORING_VERSION,
    publicSetup: {
      sport,
      board: questions.map(publicTile),
      question_count: 10,
      initial_state: {
        complete: false,
        phase: "fan-select",
        fan: null,
        resolved: [],
        current_question: null,
        peek_used: false,
        copy_used: false,
        save_used: false,
        peek_answer: null,
        board_score: 90,
        verdict_shown: false,
        final_subject: null,
        final_question: null,
        final_outcome: null,
        final_score: null,
      },
    },
    revealSetup: {
      sport,
      questions: questions.map((question) => ({
        ...averageFanPublicQuestion(question),
        answer: question.answer,
        explanation: question.explanation,
      })),
      final_question: {
        ...averageFanPublicQuestion(finalQuestion),
        answer: finalQuestion.answer,
        explanation: finalQuestion.explanation,
      },
    },
    privateSetupEvidence: {
      sport,
      questions,
      question_ids: questionIds,
      final_question: finalQuestion,
      final_question_id: finalQuestion.id,
      proof,
    },
    privateGradingEvidence: {
      sport,
      proof,
      max_score: 100,
    },
  };
}

function fullQuestions(value: unknown) {
  const rows = records(value);
  if (rows.length !== 10) throw new Error("Average Fan official board evidence must contain ten questions.");
  return rows as unknown as AverageFanQuestion[];
}

function finalQuestion(value: unknown) {
  return asRecord(value) as unknown as AverageFanQuestion;
}

function selectedFan(value: unknown): AverageFanFan | null {
  return typeof value === "string" && (AVERAGE_FAN_FANS as readonly string[]).includes(value)
    ? value as AverageFanFan
    : null;
}

function resolvedRows(state: JsonRecord) {
  return records(state.resolved);
}

function boardScoreFromResolved(resolved: readonly JsonRecord[]) {
  const misses = resolved
    .filter((row) => row.correct !== true && row.saved !== true)
    .map((row) => Number(row.order));
  return scoreAverageFanBoard(misses);
}

function resolveQuestion(
  context: OfficialDailyRuntimeContext,
  question: AverageFanQuestion,
  fan: AverageFanFan,
  playerAnswer: string,
  copied: boolean,
): OfficialDailyAdvanceResult {
  const state = context.publicState;
  const resolved = resolvedRows(state);
  const fanResult = averageFanFanAnswer(question, fan);
  const correct = averageFanAnswersMatch(question, playerAnswer);
  const saveAvailable = state.save_used !== true;
  const saveConsumed = !correct && saveAvailable;
  const saved = saveConsumed && fanResult.correct;
  const nextResolved = [...resolved, {
    question: averageFanPublicQuestion(question),
    player_answer: playerAnswer,
    fan_answer: fanResult.answer,
    correct,
    copied,
    peek_used: state.peek_answer != null,
    save_consumed: saveConsumed,
    saved,
    order: resolved.length + 1,
    correct_answer: question.answer,
    explanation: question.explanation,
  }];
  const boardScore = boardScoreFromResolved(nextResolved);
  return {
    submissionState: { final_submission: null },
    publicState: {
      ...state,
      phase: "reveal",
      resolved: nextResolved,
      current_question: averageFanPublicQuestion(question),
      copy_used: state.copy_used === true || copied,
      save_used: state.save_used === true || saveConsumed,
      peek_answer: null,
      board_score: boardScore,
      last_resolution: nextResolved.at(-1) ?? null,
    },
    complete: false,
    finalSubmission: null,
  };
}

function finalSubmission(
  context: OfficialDailyRuntimeContext,
  outcome: "walk-away" | "correct" | "wrong",
) {
  const state = context.publicState;
  const fan = selectedFan(state.fan);
  if (!fan) throw new Error("Average Fan selected fan is unavailable.");
  const resolved = resolvedRows(state);
  if (resolved.length !== 10) throw new Error("Average Fan board must be complete before Final settlement.");
  const boardScore = boardScoreFromResolved(resolved);
  const score = scoreAverageFanFinal(boardScore, outcome);
  return {
    proof: String(context.privateSetupEvidence.proof ?? ""),
    fan,
    sport: String(context.privateSetupEvidence.sport ?? ""),
    board_score: boardScore,
    final_outcome: outcome,
    normalized_score: score,
    native_score: score,
    unsaved_miss_question_numbers: resolved
      .filter((row) => row.correct !== true && row.saved !== true)
      .map((row) => Number(row.order)),
    board_question_ids: resolved.map((row) => String(asRecord(row.question).id ?? "")),
    final_question_id: String(asRecord(context.privateSetupEvidence.final_question).id ?? ""),
    saves: resolved.filter((row) => row.saved === true).length,
  };
}

export function advanceAverageFanDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: JsonRecord,
): OfficialDailyAdvanceResult {
  const state = context.publicState;
  if (state.complete === true) throw new Error("The official Average Fan run is already complete.");
  const phase = String(state.phase ?? "fan-select");
  const questions = fullQuestions(context.privateSetupEvidence.questions);
  const final = finalQuestion(context.privateSetupEvidence.final_question);
  const fan = selectedFan(state.fan);

  if (action.fan != null) {
    if (phase !== "fan-select") throw new Error("Average Fan classmate selection is already locked.");
    const nextFan = selectedFan(action.fan);
    if (!nextFan) throw new Error("Average Fan classmate is invalid.");
    return {
      submissionState: { final_submission: null },
      publicState: { ...state, phase: "board", fan: nextFan },
      complete: false,
      finalSubmission: null,
    };
  }

  if (phase === "board" && action.question_id != null) {
    if (!fan) throw new Error("Average Fan classmate must be selected first.");
    const id = String(action.question_id);
    const resolvedIds = new Set(resolvedRows(state).map((row) => String(asRecord(row.question).id ?? "")));
    const question = questions.find((row) => row.id === id);
    if (!question || resolvedIds.has(id)) throw new Error("That Average Fan board tile is unavailable.");
    return {
      submissionState: { final_submission: null },
      publicState: {
        ...state,
        phase: "question",
        current_question: averageFanPublicQuestion(question),
        peek_answer: null,
        last_resolution: null,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  if (phase === "question") {
    if (!fan) throw new Error("Average Fan classmate is unavailable.");
    const currentId = String(asRecord(state.current_question).id ?? "");
    const question = questions.find((row) => row.id === currentId);
    if (!question) throw new Error("Average Fan current question is unavailable.");

    if (action.peek === true) {
      if (state.peek_used === true) throw new Error("Average Fan Peek has already been used.");
      const fanResult = averageFanFanAnswer(question, fan);
      return {
        submissionState: { final_submission: null },
        publicState: { ...state, peek_used: true, peek_answer: fanResult.answer },
        complete: false,
        finalSubmission: null,
      };
    }

    if (action.copy === true) {
      if (state.copy_used === true) throw new Error("Average Fan Copy has already been used.");
      const fanResult = averageFanFanAnswer(question, fan);
      return resolveQuestion(context, question, fan, fanResult.answer, true);
    }

    if (typeof action.answer === "string" && action.answer.trim()) {
      return resolveQuestion(context, question, fan, action.answer.trim(), false);
    }
    throw new Error("Average Fan answer action is invalid.");
  }

  if (phase === "reveal" && action.continue === true) {
    const resolved = resolvedRows(state);
    const last = resolved.at(-1) ?? {};
    const unsavedMisses = resolved.filter((row) => row.correct !== true && row.saved !== true);
    const firstUnsavedMiss = last.correct !== true
      && last.saved !== true
      && unsavedMisses.length === 1
      && state.verdict_shown !== true;

    if (firstUnsavedMiss) {
      return {
        submissionState: { final_submission: null },
        publicState: {
          ...state,
          phase: "verdict",
          verdict_shown: true,
          current_question: null,
          last_resolution: null,
        },
        complete: false,
        finalSubmission: null,
      };
    }

    if (resolved.length >= 10) {
      return {
        submissionState: { final_submission: null },
        publicState: {
          ...state,
          phase: "final-decision",
          current_question: null,
          last_resolution: null,
          final_subject: final.subject,
        },
        complete: false,
        finalSubmission: null,
      };
    }
    return {
      submissionState: { final_submission: null },
      publicState: {
        ...state,
        phase: "board",
        current_question: null,
        last_resolution: null,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  if (phase === "verdict" && action.continue === true) {
    const resolved = resolvedRows(state);
    if (resolved.length >= 10) {
      return {
        submissionState: { final_submission: null },
        publicState: {
          ...state,
          phase: "final-decision",
          final_subject: final.subject,
        },
        complete: false,
        finalSubmission: null,
      };
    }
    return {
      submissionState: { final_submission: null },
      publicState: { ...state, phase: "board" },
      complete: false,
      finalSubmission: null,
    };
  }

  if (phase === "final-decision" && action.final_decision != null) {
    const decision = String(action.final_decision);
    if (decision === "walk-away") {
      const submission = finalSubmission(context, "walk-away");
      return {
        submissionState: { final_submission: submission },
        publicState: {
          ...state,
          complete: true,
          phase: "result",
          final_outcome: "walk-away",
          final_score: submission.normalized_score,
        },
        complete: true,
        finalSubmission: submission,
      };
    }
    if (decision === "go") {
      return {
        submissionState: { final_submission: null },
        publicState: {
          ...state,
          phase: "final-question",
          final_question: averageFanPublicQuestion(final),
        },
        complete: false,
        finalSubmission: null,
      };
    }
    throw new Error("Average Fan Final decision is invalid.");
  }

  if (phase === "final-question" && typeof action.answer === "string" && action.answer.trim()) {
    const correct = averageFanAnswersMatch(final, action.answer.trim());
    const outcome = correct ? "correct" : "wrong";
    const submission = finalSubmission(context, outcome);
    return {
      submissionState: { final_submission: submission },
      publicState: {
        ...state,
        complete: true,
        phase: "final-reveal",
        final_question: averageFanPublicQuestion(final),
        final_player_answer: action.answer.trim(),
        final_correct_answer: final.answer,
        final_explanation: final.explanation,
        final_outcome: outcome,
        final_score: submission.normalized_score,
      },
      complete: true,
      finalSubmission: submission,
    };
  }

  throw new Error(`Average Fan action is not valid during ${phase}.`);
}
