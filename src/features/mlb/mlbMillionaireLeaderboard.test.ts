import { describe, expect, it } from "vitest";
import { mlbMillionaireProductionRun } from "./mlbMillionaireProduction";
import { buildMlbMillionaireQuestionDetails } from "./mlbMillionaireLeaderboard";

const run = mlbMillionaireProductionRun("mlb-2026-play-03", "2026-10-01")!;

describe("MLB Millionaire leaderboard details", () => {
  it("reconstructs the exact question path for newly recorded results", () => {
    const q1 = run[0]!;
    const q2 = run[1]!;
    const q2Wrong = q2.choices.find((choice) => choice.id !== q2.correctChoiceId)!;

    const rows = buildMlbMillionaireQuestionDetails(run, {
      action_history: [
        { type: "use_lifeline", question_number: 1, lifeline: "stat-sheet" },
        { type: "answer", question_number: 1, choice_id: q1.correctChoiceId },
        { type: "answer", question_number: 2, choice_id: q2Wrong.id },
        { type: "answer", question_number: 3, choice_id: run[2]!.correctChoiceId },
      ],
    }, {
      outcome: "lost",
      completed_questions: 2,
      first_miss_question: 2,
    });

    expect(rows[0]).toMatchObject({
      status: "correct",
      selectedChoiceIds: [q1.correctChoiceId],
      lifelines: ["stat-sheet"],
      detailRecorded: true,
    });
    expect(rows[1]).toMatchObject({
      status: "wrong",
      selectedChoiceIds: [q2Wrong.id],
      detailRecorded: true,
    });
    expect(rows[2]).toMatchObject({
      status: "correct",
      selectedChoiceIds: [run[2]!.correctChoiceId],
      detailRecorded: true,
    });
  });

  it("shows only provable detail for today's legacy summary-only completions", () => {
    const rows = buildMlbMillionaireQuestionDetails(run, {
      outcome: "lost",
      completed_questions: 5,
      lifelines_used: 1,
      legacy_detail_limited: true,
    }, {
      outcome: "lost",
      score: 53,
      completed_questions: 5,
      lifelines_used: 1,
    });

    expect(rows.slice(0, 4).map((row) => row.status)).toEqual([
      "correct",
      "correct",
      "wrong",
      "detail-not-recorded",
    ]);
    expect(rows.every((row) => row.detailRecorded === false)).toBe(true);
  });

  it("shows the clean seven-question path and walk decision for the existing 84-point run", () => {
    const rows = buildMlbMillionaireQuestionDetails(run, {
      outcome: "walked-away",
      completed_questions: 7,
    }, {
      outcome: "walked-away",
      completed_questions: 7,
    });

    expect(rows.slice(0, 7).every((row) => row.status === "correct")).toBe(true);
    expect(rows[7]?.status).toBe("walked-away");
  });
});
