import type { MillionaireChoiceId } from "../games/millionaireAuthority";
import type { MillionaireRun } from "../games/millionaireEngine";

type JsonRecord = Record<string, unknown>;

export type MlbMillionaireQuestionDetail = {
  questionNumber: number;
  prompt: string;
  choices: Array<{ id: MillionaireChoiceId; text: string }>;
  correctChoiceId: MillionaireChoiceId;
  selectedChoiceIds: MillionaireChoiceId[];
  lifelines: string[];
  status: "correct" | "wrong" | "walked-away" | "timeout" | "detail-not-recorded";
  detailRecorded: boolean;
};

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function choiceId(value: unknown): MillionaireChoiceId | null {
  const id = String(value ?? "");
  return id === "A" || id === "B" || id === "C" || id === "D"
    ? id
    : null;
}

function firstMissFromLegacy(
  detail: JsonRecord,
  publicResult: JsonRecord,
  completedQuestions: number,
  outcome: string,
) {
  const explicit = Number(detail.first_miss_question ?? publicResult.first_miss_question ?? 0);
  if (Number.isInteger(explicit) && explicit >= 1 && explicit <= 8) return explicit;

  if (outcome === "lost") {
    const score = Number(publicResult.score ?? detail.score ?? Number.NaN);
    const lifelines = Number(publicResult.lifelines_used ?? detail.lifelines_used ?? 0);
    const baseScore = score + (lifelines * 2);
    const derived = ((baseScore - 20 - (completedQuestions * 5)) / 5) + 1;
    if (Number.isInteger(derived) && derived >= 1 && derived <= 8) return derived;
  }

  if (outcome === "lost" && completedQuestions >= 0 && completedQuestions < 8) {
    return Math.min(8, completedQuestions + 1);
  }
  return null;
}

export function buildMlbMillionaireQuestionDetails(
  run: MillionaireRun,
  resultDetail: JsonRecord,
  publicResult: JsonRecord,
): MlbMillionaireQuestionDetail[] {
  const rows: MlbMillionaireQuestionDetail[] = run.map((question, index) => ({
    questionNumber: index + 1,
    prompt: question.prompt,
    choices: question.choices.map((choice) => ({ id: choice.id, text: choice.text })),
    correctChoiceId: question.correctChoiceId,
    selectedChoiceIds: [],
    lifelines: [],
    status: "detail-not-recorded",
    detailRecorded: false,
  }));

  const actions = records(resultDetail.action_history);
  if (actions.length) {
    let inferredQuestionNumber = 1;
    for (const action of actions) {
      const explicitQuestionNumber = Number(action.question_number ?? 0);
      const questionNumber = Number.isInteger(explicitQuestionNumber)
        && explicitQuestionNumber >= 1
        && explicitQuestionNumber <= 8
        ? explicitQuestionNumber
        : inferredQuestionNumber;
      const row = rows[questionNumber - 1];
      if (!row) continue;

      const type = String(action.type ?? "");
      row.detailRecorded = true;

      if (type === "use_lifeline") {
        const lifeline = String(action.lifeline ?? "");
        if (lifeline && !row.lifelines.includes(lifeline)) row.lifelines.push(lifeline);
        continue;
      }

      if (type === "walk_away") {
        row.status = "walked-away";
        continue;
      }

      if (type === "timeout") {
        row.status = "timeout";
        continue;
      }

      if (type !== "answer") continue;
      const picked = choiceId(action.choice_id);
      if (picked) row.selectedChoiceIds.push(picked);

      if (picked === row.correctChoiceId) {
        row.status = "correct";
        inferredQuestionNumber = Math.min(8, questionNumber + 1);
        continue;
      }

      row.status = "wrong";
      // A second action with the same explicit question number is Double Dip.
      const next = actions[actions.indexOf(action) + 1];
      const nextQuestion = Number(next?.question_number ?? 0);
      if (nextQuestion !== questionNumber) inferredQuestionNumber = Math.min(8, questionNumber + 1);
    }
    return rows;
  }

  // Older MLB Millionaire results only stored the summary. Reconstruct only what
  // is provable and label the rest instead of inventing picks or lifeline timing.
  const outcome = String(resultDetail.outcome ?? publicResult.outcome ?? "lost");
  const completedQuestions = Math.max(
    0,
    Math.min(8, Number(resultDetail.completed_questions ?? publicResult.completed_questions ?? 0)),
  );
  const firstMiss = firstMissFromLegacy(resultDetail, publicResult, completedQuestions, outcome);

  if (outcome === "won") {
    rows.forEach((row) => {
      row.status = "correct";
      row.detailRecorded = false;
    });
    return rows;
  }

  if (outcome === "walked-away") {
    rows.forEach((row, index) => {
      if (index < 7) row.status = "correct";
      else row.status = "walked-away";
      row.detailRecorded = false;
    });
    return rows;
  }

  if (firstMiss) {
    rows.forEach((row, index) => {
      if (index < firstMiss - 1) row.status = "correct";
      else if (index === firstMiss - 1) row.status = "wrong";
      else row.status = "detail-not-recorded";
      row.detailRecorded = false;
    });
  }

  return rows;
}
