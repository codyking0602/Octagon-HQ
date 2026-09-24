import { describe, expect, it } from "vitest";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import {
  buildMillionaireLeaderboardQuestions,
  buildSportsFeudFastMoneyRows,
} from "./DailyLeaderboardGameResult";

function baseProjection(overrides: Partial<TodayChallengeProjection>): TodayChallengeProjection {
  return {
    available: true,
    sport: "football",
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-09-24",
    scheduleVersion: "football-daily-v15-weighted-sep24",
    gameType: "millionaire",
    setupKey: "test",
    contentVersion: "test",
    scoringVersion: "test",
    fallbackReason: null,
    publicSetup: {},
    progressRevision: 3,
    publicState: { complete: true },
    revealSetup: null,
    officialAttempt: {
      nativeScore: 23,
      normalizedScore: 23,
      completedAt: "2026-09-24T14:00:00Z",
      publicResult: {
        outcome: "lost",
        completed_questions: 1,
        final_money: 0,
        lifelines_used: 1,
        time_remaining_ms: 104151,
      },
    },
    deploymentSha: "abc123",
    ...overrides,
  };
}

describe("Daily leaderboard game result reconstruction", () => {
  it("reconstructs a completed Millionaire run from sanitized action history", () => {
    const questions = Array.from({ length: 8 }, (_, index) => ({
      id: `q${index + 1}`,
      prompt: `Question ${index + 1}`,
      choices: [
        { id: "A", text: `A${index + 1}` },
        { id: "B", text: `B${index + 1}` },
        { id: "C", text: `C${index + 1}` },
        { id: "D", text: `D${index + 1}` },
      ],
    }));
    const projection = baseProjection({
      publicSetup: { questions },
      revealSetup: {
        questions: questions.map((question, index) => ({
          id: question.id,
          correct_choice_id: index === 0 ? "A" : index === 1 ? "B" : "C",
        })),
      },
    });

    const rows = buildMillionaireLeaderboardQuestions(projection, {
      action_history: [
        { type: "answer", choice_id: "A", time_remaining_ms: 116278 },
        { type: "use_lifeline", lifeline: "fifty-fifty", time_remaining_ms: 108397 },
        { type: "answer", choice_id: "C", time_remaining_ms: 104151 },
      ],
    });

    expect(rows[0]).toMatchObject({
      status: "correct",
      selectedChoiceIds: ["A"],
      correctChoiceId: "A",
    });
    expect(rows[1]).toMatchObject({
      status: "wrong",
      selectedChoiceIds: ["C"],
      correctChoiceId: "B",
      lifelines: ["fifty-fifty"],
    });
    expect(rows[2]?.status).toBe("unreached");
  });

  it("keeps the player's raw Fast Money text while showing the canonical match", () => {
    const projection = baseProjection({
      sport: "ufc",
      gameType: "sports_feud",
      publicState: {
        complete: true,
        fast_money: {
          results: [{
            question_id: "trash-talk",
            prompt: "Name a UFC fighter famous for trash talk.",
            submitted_answer: "Conor McGregor",
            board_rank: 1,
            points: 8,
          }],
        },
      },
    });

    expect(buildSportsFeudFastMoneyRows(projection, {
      fast_money_results: [{
        question_id: "trash-talk",
        submitted_text: "Conor Mcgegor",
      }],
    })).toEqual([{
      questionId: "trash-talk",
      prompt: "Name a UFC fighter famous for trash talk.",
      rawAnswer: "Conor Mcgegor",
      matchedAnswer: "Conor McGregor",
      rank: 1,
      points: 8,
    }]);
  });
});
