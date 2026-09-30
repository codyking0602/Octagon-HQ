import { describe, expect, it } from "vitest";
import {
  advanceAverageFanDailyRuntime,
  buildAverageFanDailySetup,
} from "./averageFanDailyRuntime";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";
import type { AverageFanQuestion } from "../games/averageFanEngine";

function contextFrom(
  publication: ReturnType<typeof buildAverageFanDailySetup>,
  previous?: OfficialDailyAdvanceResult,
): OfficialDailyRuntimeContext {
  return {
    gameType: "average_fan",
    setupKey: publication.setupKey,
    publicSetup: publication.publicSetup,
    revealSetup: publication.revealSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    privateGradingEvidence: publication.privateGradingEvidence,
    submissionState: previous?.submissionState ?? { final_submission: null },
    publicState: previous?.publicState ?? publication.publicSetup.initial_state as Record<string, unknown>,
  };
}

describe("Average Fan canonical Daily runtime", () => {
  it("builds two questions per grade without leaking answers", () => {
    const publication = buildAverageFanDailySetup("ufc", "2026-10-02", "test-v1");
    const board = publication.publicSetup.board as Array<Record<string, unknown>>;
    expect(board).toHaveLength(10);
    for (const grade of [1, 2, 3, 4, 5]) {
      expect(board.filter((row) => row.grade === grade)).toHaveLength(2);
    }
    expect(JSON.stringify(publication.publicSetup)).not.toContain('"answer"');
    expect(publication.privateSetupEvidence.question_ids).toHaveLength(10);
    expect((publication.privateSetupEvidence.final_question as AverageFanQuestion).protectedFinal).toBe(true);
  });

  it("starts Football with CFB on Oct 1, then alternates CFB and NFL", () => {
    const first = buildAverageFanDailySetup("football", "2026-10-01", "football-v1", []);
    expect(first.publicSetup.sport).toBe("cfb");
    const second = buildAverageFanDailySetup("football", "2026-10-08", "football-v1", [{
      day: "2026-10-01",
      sport: "cfb",
      question_ids: first.privateSetupEvidence.question_ids,
      final_question_id: first.privateSetupEvidence.final_question_id,
    }]);
    expect(second.publicSetup.sport).toBe("nfl");
    const third = buildAverageFanDailySetup("football", "2026-10-15", "football-v1", [
      {
        day: "2026-10-01",
        sport: "nfl",
        question_ids: first.privateSetupEvidence.question_ids,
        final_question_id: first.privateSetupEvidence.final_question_id,
      },
      {
        day: "2026-10-08",
        sport: "cfb",
        question_ids: second.privateSetupEvidence.question_ids,
        final_question_id: second.privateSetupEvidence.final_question_id,
      },
    ]);
    expect(third.publicSetup.sport).toBe("cfb");
  });

  it("runs a perfect server-owned game to 100", () => {
    const publication = buildAverageFanDailySetup("ufc", "2026-10-02", "test-v1");
    let result = advanceAverageFanDailyRuntime(contextFrom(publication), { fan: "shane" });
    const questions = publication.privateSetupEvidence.questions as AverageFanQuestion[];

    for (const question of questions) {
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { question_id: question.id });
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { answer: question.answer });
      expect((result.publicState.last_resolution as Record<string, unknown>).correct).toBe(true);
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { continue: true });
    }

    expect(result.publicState.phase).toBe("final-decision");
    result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { final_decision: "go" });
    const finalQuestion = publication.privateSetupEvidence.final_question as AverageFanQuestion;
    result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { answer: finalQuestion.answer });
    expect(result.complete).toBe(true);
    expect(result.finalSubmission?.board_score).toBe(90);
    expect(result.finalSubmission?.normalized_score).toBe(100);
    expect(result.finalSubmission?.final_outcome).toBe("correct");
  });
});


describe("Average Fan Daily Casual parity", () => {
  it("preserves the approved first-unsaved-miss verdict before continuing the HQ run", () => {
    const publication = buildAverageFanDailySetup("ufc", "2026-10-01", "parity-v1");
    const questions = publication.privateSetupEvidence.questions as AverageFanQuestion[];
    let result = advanceAverageFanDailyRuntime(contextFrom(publication), { fan: "shane" });
    let missQuestion: AverageFanQuestion | null = null;
    for (const candidate of questions) {
      const fanAnswer = candidate.answer === "__never__" ? "" : candidate.answer;
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { question_id: candidate.id });
      const wrong = candidate.format === "true-false"
        ? (candidate.answer.toLowerCase() === "true" ? "False" : "True")
        : "__definitely_wrong__";
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { answer: wrong });
      const resolution = result.publicState.last_resolution as Record<string, unknown>;
      if (resolution.saved !== true) {
        missQuestion = candidate;
        break;
      }
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { continue: true });
    }
    expect(missQuestion).not.toBeNull();
    result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { continue: true });
    expect(result.publicState.phase).toBe("verdict");
    expect(result.publicState.verdict_shown).toBe(true);
    result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { continue: true });
    expect(["board", "final-decision"]).toContain(result.publicState.phase);
  });
});
