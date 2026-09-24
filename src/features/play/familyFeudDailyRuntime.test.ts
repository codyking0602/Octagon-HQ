import { describe, expect, it } from "vitest";
import {
  advanceFamilyFeudDailyRuntime,
  buildFamilyFeudDailySetup,
} from "./familyFeudDailyRuntime";
import type { FamilyFeudPack } from "../games/familyFeudEngine";

const entities = [
  "Alpha One",
  "Bravo Two",
  "Charlie Three",
  "Delta Four",
  "Echo Five",
  "Foxtrot Six",
  "Golf Seven",
  "Hotel Eight",
  "India Nine",
].map((displayName, index) => ({
  id: "entity-" + (index + 1),
  displayName,
  kind: "person" as const,
}));

const candidateIds = entities.map((entity) => entity.id);
const acceptedIds = candidateIds.slice(0, 6);
const mainPoints = [10, 8, 7, 5, 5, 4] as const;
const fastPoints = [8, 7, 6, 5, 4, 3] as const;

function question(
  id: string,
  prompt: string,
  points: readonly number[],
  alsoAcceptedEntityIds: readonly string[] = [],
) {
  return {
    id,
    prompt,
    candidateIds,
    answers: points.map((value, index) => ({
      entityId: acceptedIds[index]!,
      points: value,
    })),
    ...(alsoAcceptedEntityIds.length ? { alsoAcceptedEntityIds } : {}),
  };
}

const pack: FamilyFeudPack = {
  id: "persistence-fixture-v2",
  sport: "football",
  entities,
  mainBoards: [
    question("main-1", "Main board one", mainPoints, ["entity-7"]),
    question("main-2", "Main board two", mainPoints, ["entity-7"]),
  ],
  fastMoney: [
    question("fast-1", "Fast one", fastPoints),
    question("fast-2", "Fast two", fastPoints),
    question("fast-3", "Fast three", fastPoints),
    question("fast-4", "Fast four", fastPoints),
    question("fast-5", "Fast five", fastPoints),
  ],
};

function context(
  publication: ReturnType<typeof buildFamilyFeudDailySetup>,
  submissionState: Record<string, unknown> = {},
) {
  return {
    setupKey: publication.setupKey,
    publicSetup: publication.publicSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    submissionState,
  };
}

function strikeOutBothBoards(publication: ReturnType<typeof buildFamilyFeudDailySetup>) {
  let submission: Record<string, unknown> = {};
  let result: ReturnType<typeof advanceFamilyFeudDailyRuntime> | null = null;
  for (let board = 0; board < 2; board += 1) {
    for (const answer of ["Hotel Eight", "India Nine", "not a real answer"]) {
      result = advanceFamilyFeudDailyRuntime(
        context(publication, submission),
        { type: "answer", answer },
      );
      submission = result.submissionState;
    }
  }
  return { submission, result: result! };
}

describe("Family Feud V2 Daily persistence contract", () => {
  it("publishes prompts and rules without leaking accepted identities or candidate universes", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const publicJson = JSON.stringify(publication.publicSetup);

    expect(publicJson).toContain("Main board one");
    expect(publicJson).toContain("Fast one");
    expect(publicJson).not.toContain("Alpha One");
    expect(publicJson).not.toContain("entity-1");
    expect(publicJson).not.toContain("candidateIds");
    expect(publication.publicSetup).toMatchObject({
      answers_required_per_board: 4,
      main_board_max_points: 30,
      main_max_points: 60,
      fast_money_time_ms: 50_000,
      fast_money_max_points: 40,
      hq_score_max: 100,
    });

    const initial = publication.publicSetup.initial_state as Record<string, unknown>;
    const boards = initial.main_boards as Array<Record<string, unknown>>;
    const slots = boards[0]!.slots as Array<Record<string, unknown>>;
    expect(slots).toHaveLength(4);
    expect(slots.every((slot) =>
      slot.entity === null && slot.points === null && slot.revealed === false
    )).toBe(true);
  });

  it("reveals a found answer in the next visible slot while the remaining three stay hidden", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const result = advanceFamilyFeudDailyRuntime(
      context(publication),
      { type: "answer", answer: "Foxtrot Six" },
    );

    const boards = result.publicState.main_boards as Array<Record<string, unknown>>;
    const slots = boards[0]!.slots as Array<Record<string, unknown>>;
    expect(slots[0]).toMatchObject({
      slot_index: 0,
      points: 4,
      revealed: true,
      found: true,
      entity: { id: "entity-6", display_name: "Foxtrot Six" },
    });
    expect(slots.slice(1).every((slot) => slot.entity === null && slot.points === null)).toBe(true);
    expect(result.publicState.main_points).toBe(4);
  });

  it("scores a valid off-board Main answer at two points with no strike", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const result = advanceFamilyFeudDailyRuntime(
      context(publication),
      { type: "answer", answer: "Golf Seven" },
    );

    expect(result.publicState.last_feedback).toMatchObject({
      type: "correct",
      points: 2,
      message: "GOOD ANSWER",
    });
    const boards = result.publicState.main_boards as Array<Record<string, unknown>>;
    const slots = boards[0]!.slots as Array<Record<string, unknown>>;
    expect(boards[0]).toMatchObject({ strikes: 0 });
    expect(slots[0]).toMatchObject({
      points: 2,
      revealed: true,
      found: true,
      entity: { id: "entity-7", display_name: "Golf Seven" },
    });
    expect(result.publicState.main_points).toBe(2);
  });

  it("keeps the live board exactly as played and publishes a separate settled answer reveal", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    let submission: Record<string, unknown> = {};

    let result = advanceFamilyFeudDailyRuntime(
      context(publication, submission),
      { type: "answer", answer: "Foxtrot Six" },
    );
    submission = result.submissionState;

    for (const answer of ["Hotel Eight", "India Nine", "not a real answer"]) {
      result = advanceFamilyFeudDailyRuntime(
        context(publication, submission),
        { type: "answer", answer },
      );
      submission = result.submissionState;
    }

    const boards = result.publicState.main_boards as Array<Record<string, unknown>>;
    const firstBoard = boards[0]!;
    const slots = firstBoard.slots as Array<Record<string, unknown>>;
    const answerReveal = firstBoard.answer_reveal as Array<Record<string, unknown>>;
    expect(firstBoard).toMatchObject({ strikes: 3, settled: true });
    expect(slots).toHaveLength(4);
    expect((slots[0]!.entity as Record<string, unknown>).display_name).toBe("Foxtrot Six");
    expect(slots[0]).toMatchObject({ points: 4, found: true, revealed: true });
    expect(slots.slice(1).every((slot) => slot.entity === null && slot.points === null)).toBe(true);
    expect(answerReveal.map((row) => (row.entity as Record<string, unknown>).display_name)).toEqual([
      "Alpha One",
      "Bravo Two",
      "Charlie Three",
      "Delta Four",
      "Echo Five",
      "Foxtrot Six",
    ]);
    expect(answerReveal.map((row) => row.found)).toEqual([false, false, false, false, false, true]);
  });

  it("moves through both boards into a hidden 50-second Fast Money round", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const { result } = strikeOutBothBoards(publication);

    expect(result.publicState.phase).toBe("fast-money");
    expect(result.publicState.fast_money).toMatchObject({
      answered_count: 0,
      question_index: 0,
      current_question: { id: "fast-1", prompt: "Fast one" },
      time_remaining_ms: 50_000,
      results: [],
      points: null,
    });
  });

  it("keeps Fast Money values hidden during the clock, then reveals the user's result and full HQ board", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    let { submission } = strikeOutBothBoards(publication);

    let result = advanceFamilyFeudDailyRuntime(
      context(publication, submission),
      { type: "answer", answer: "Alpha One", question_id: "fast-1", question_index: 0, time_remaining_ms: 44_000 },
    );
    submission = result.submissionState;

    expect(result.publicState.last_feedback).toEqual({ type: "accepted" });
    expect(result.publicState.fast_money).toMatchObject({
      answered_count: 1,
      question_index: 1,
      submitted_answers: [{ submitted_answer: "Alpha One" }],
      results: [],
      points: null,
    });

    for (const [answer, timeRemaining, questionIndex] of [
      ["Bravo Two", 40_000, 1],
      ["Charlie Three", 35_000, 2],
      ["Delta Four", 30_000, 3],
      ["Echo Five", 25_000, 4],
    ] as const) {
      result = advanceFamilyFeudDailyRuntime(
        context(publication, submission),
        {
          type: "answer",
          answer,
          question_id: "fast-" + (questionIndex + 1),
          question_index: questionIndex,
          time_remaining_ms: timeRemaining,
        },
      );
      submission = result.submissionState;
    }

    expect(result.complete).toBe(true);
    expect(result.finalSubmission).toMatchObject({
      native_score: 30,
      normalized_score: 30,
      main_points: 0,
      fast_money_points: 30,
      fast_money_time_remaining_ms: 25_000,
    });

    const fastMoney = result.publicState.fast_money as Record<string, unknown>;
    const reveals = fastMoney.results as Array<Record<string, unknown>>;
    expect(fastMoney.points).toBe(30);
    expect(reveals).toHaveLength(5);
    expect(reveals.map((row) => row.points)).toEqual([8, 7, 6, 5, 4]);
    expect(reveals[0]).toMatchObject({
      submitted_answer: "Alpha One",
      counted: true,
      board_rank: 1,
    });
    const accepted = reveals[0]!.accepted_answers as Array<Record<string, unknown>>;
    expect(accepted[0]).toEqual({
      entity: { id: "entity-1", display_name: "Alpha One" },
      points: 8,
    });
    expect(result.publicState.hq_score).toBe(30);
  });

  it("rejects a queued Fast Money answer if its prompt no longer matches authoritative progress", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const { submission } = strikeOutBothBoards(publication);

    expect(() => advanceFamilyFeudDailyRuntime(
      context(publication, submission),
      {
        type: "answer",
        answer: "Alpha One",
        question_id: "fast-2",
        time_remaining_ms: 44_000,
      },
    )).toThrow("Fast Money question changed before this answer could sync.");
  });

  it("consumes zero-point Daily Fast Money answers and preserves per-answer timing evidence", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const { submission } = strikeOutBothBoards(publication);

    const result = advanceFamilyFeudDailyRuntime(
      context(publication, submission),
      {
        type: "answer",
        answer: "India Nine",
        question_id: "fast-1",
        question_index: 0,
        time_remaining_ms: 37_250,
      },
    );

    expect(result.publicState.fast_money).toMatchObject({
      answered_count: 1,
      question_index: 1,
      current_question: { id: "fast-2" },
    });
    const engineState = result.submissionState.engine_state as {
      fastMoneyResults: Array<Record<string, unknown>>;
    };
    expect(engineState.fastMoneyResults[0]).toMatchObject({
      questionId: "fast-1",
      submittedText: "India Nine",
      points: 0,
      timeRemainingMs: 37_250,
    });
  });

  it("rejects out-of-order Fast Money prompt identities before grading", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const { submission } = strikeOutBothBoards(publication);

    expect(() => advanceFamilyFeudDailyRuntime(
      context(publication, submission),
      {
        type: "answer",
        answer: "Alpha One",
        question_id: "fast-2",
        question_index: 1,
        time_remaining_ms: 44_000,
      },
    )).toThrow(/question changed/i);
  });

  it("settles unanswered Fast Money prompts at zero when time expires", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const fastState = {
      phase: "fast-money",
      mainBoardIndex: 1,
      mainBoards: [
        { revealedEntityIds: [], submittedEntityIds: [], submittedUnrecognized: [], strikes: 3 },
        { revealedEntityIds: [], submittedEntityIds: [], submittedUnrecognized: [], strikes: 3 },
      ],
      fastMoneyIndex: 0,
      fastMoneyResults: [],
      fastMoneyTimeRemainingMs: 50_000,
    };

    const result = advanceFamilyFeudDailyRuntime(
      context(publication, { engine_state: fastState }),
      { type: "timeout" },
    );

    expect(result.complete).toBe(true);
    expect(result.finalSubmission).toMatchObject({
      native_score: 0,
      normalized_score: 0,
      fast_money_points: 0,
      fast_money_time_remaining_ms: 0,
    });
  });
});
