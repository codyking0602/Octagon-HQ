import { describe, expect, it } from "vitest";
import {
  advanceAverageFanDailyRuntime,
  buildAverageFanDailySetup,
} from "./averageFanDailyRuntime";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";
import {
  AVERAGE_FAN_BOARD_QUESTION_COUNT,
  AVERAGE_FAN_PLAYABLE_GRADES,
  type AverageFanQuestion,
} from "../games/averageFanEngine";
import { AVERAGE_FAN_CONTENT_BANKS } from "../games/averageFanContentBanks";

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
    const publication = buildAverageFanDailySetup("ufc", "2026-10-01", "test-v1");
    const board = publication.publicSetup.board as Array<Record<string, unknown>>;
    expect(board).toHaveLength(AVERAGE_FAN_BOARD_QUESTION_COUNT);
    for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
      expect(board.filter((row) => row.grade === grade)).toHaveLength(2);
    }
    expect(JSON.stringify(publication.publicSetup)).not.toContain('"answer"');
    expect(publication.privateSetupEvidence.question_ids).toHaveLength(AVERAGE_FAN_BOARD_QUESTION_COUNT);
    expect((publication.privateSetupEvidence.final_question as AverageFanQuestion).protectedFinal).toBe(true);
  });

  it("stagger subjects within every grade and gives the opening grades easier answer formats", () => {
    for (const scope of ["ufc", "football"] as const) {
      const publication = buildAverageFanDailySetup(scope, "2026-10-01", `${scope}-stagger-v1`, []);
      const questions = publication.privateSetupEvidence.questions as AverageFanQuestion[];

      for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
        const gradeQuestions = questions.filter((question) => question.grade === grade);
        expect(gradeQuestions, `${scope} grade ${grade}`).toHaveLength(2);
        expect(new Set(gradeQuestions.map((question) => question.subject)).size, `${scope} grade ${grade}`).toBe(2);
        if (grade <= 3) {
          expect(
            gradeQuestions.filter((question) => question.format === "short-answer").length,
            `${scope} grade ${grade}`,
          ).toBeLessThanOrEqual(1);
        }
      }

      expect(questions.some((question) => question.grade === 2 && question.contentType === "current-event"), scope).toBe(false);
    }
  });

  it("uses at most one current event and blocks facts already used by another Daily game", () => {
    const baseline = buildAverageFanDailySetup("ufc", "2026-10-02", "ufc-current-v1", []);
    const baselineQuestions = baseline.privateSetupEvidence.questions as AverageFanQuestion[];
    const current = baselineQuestions.filter((question) => question.contentType === "current-event");
    expect(current.length).toBeLessThanOrEqual(1);

    if (current[0]?.sourceId) {
      const blocked = buildAverageFanDailySetup("ufc", "2026-10-02", "ufc-current-v1", [{
        used_current_event_source_ids: [current[0].sourceId],
      }]);
      const blockedQuestions = blocked.privateSetupEvidence.questions as AverageFanQuestion[];
      expect(blockedQuestions.some((question) => question.sourceId === current[0]!.sourceId)).toBe(false);
      expect(blockedQuestions.filter((question) => question.contentType === "current-event").length).toBeLessThanOrEqual(1);
    }
  });

  it("falls back to evergreen when every active current-event source has already appeared", () => {
    const allCurrentSources = [
      ...new Set(
        AVERAGE_FAN_CONTENT_BANKS.ufc
          .filter((question) => question.contentType === "current-event" && question.sourceId)
          .map((question) => question.sourceId!),
      ),
    ];

    // The publication-history metadata may contain more sources than the selected board.
    const sourceSweep = buildAverageFanDailySetup("ufc", "2026-10-02", "ufc-current-all-v1", [{
      used_current_event_source_ids: allCurrentSources,
    }]);
    const questions = sourceSweep.privateSetupEvidence.questions as AverageFanQuestion[];
    expect(questions.filter((question) => question.contentType === "current-event").length).toBeLessThanOrEqual(1);
  });

  it("starts Football with CFB and alternates CFB/NFL by appearance", () => {
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
        sport: "cfb",
        question_ids: first.privateSetupEvidence.question_ids,
        final_question_id: first.privateSetupEvidence.final_question_id,
      },
      {
        day: "2026-10-08",
        sport: "nfl",
        question_ids: second.privateSetupEvidence.question_ids,
        final_question_id: second.privateSetupEvidence.final_question_id,
      },
    ]);
    expect(third.publicSetup.sport).toBe("cfb");
  });


  it("shows the verdict after the first unsaved miss and then keeps HQ play alive", () => {
    const publication = buildAverageFanDailySetup("ufc", "2026-10-01", "test-v1");
    let result = advanceAverageFanDailyRuntime(contextFrom(publication), { fan: "shane" });
    const questions = publication.privateSetupEvidence.questions as AverageFanQuestion[];
    const first = questions[0]!;

    result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { question_id: first.id });
    result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { answer: "__definitely_wrong__" });
    const resolution = result.publicState.last_resolution as Record<string, unknown>;
    if (resolution.saved === true) {
      const second = questions[1]!;
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { continue: true });
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { question_id: second.id });
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { answer: "__definitely_wrong_again__" });
    }

    result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { continue: true });
    expect(result.publicState.phase).toBe("verdict");
    expect(result.publicState.verdict_shown).toBe(true);
    result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { continue: true });
    expect(result.publicState.phase).toBe("board");
    expect(result.complete).toBe(false);
  });

  it("runs a perfect server-owned game to 100", () => {
    const publication = buildAverageFanDailySetup("ufc", "2026-10-01", "test-v1");
    let result = advanceAverageFanDailyRuntime(contextFrom(publication), { fan: "shane" });
    const questions = publication.privateSetupEvidence.questions as AverageFanQuestion[];

    for (const question of questions) {
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { question_id: question.id });
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { answer: question.answer });
      expect((result.publicState.last_resolution as Record<string, unknown>).correct).toBe(true);
      result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { continue: true });
    }

    expect(result.publicState.phase).toBe("final-decision");
    expect(result.publicState.final_subject).toBe((publication.privateSetupEvidence.final_question as AverageFanQuestion).subject);
    expect(result.publicState.final_question).toBeNull();
    expect(JSON.stringify(result.publicState)).not.toContain(
      JSON.stringify((publication.privateSetupEvidence.final_question as AverageFanQuestion).prompt),
    );
    result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { final_decision: "go" });
    expect((result.publicState.final_question as Record<string, unknown>).id).toBe(
      (publication.privateSetupEvidence.final_question as AverageFanQuestion).id,
    );
    const finalQuestion = publication.privateSetupEvidence.final_question as AverageFanQuestion;
    result = advanceAverageFanDailyRuntime(contextFrom(publication, result), { answer: finalQuestion.answer });
    expect(result.complete).toBe(true);
    expect(result.finalSubmission?.board_score).toBe(90);
    expect(result.finalSubmission?.normalized_score).toBe(100);
    expect(result.finalSubmission?.final_outcome).toBe("correct");
  });
});
