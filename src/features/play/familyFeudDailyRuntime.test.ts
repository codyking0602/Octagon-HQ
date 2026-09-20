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

function question(id: string, prompt: string, points: readonly number[]) {
  return {
    id,
    prompt,
    candidateIds,
    answers: points.map((value, index) => ({
      entityId: acceptedIds[index]!,
      points: value,
    })),
  };
}

const pack: FamilyFeudPack = {
  id: "persistence-fixture-v2",
  sport: "football",
  entities,
  mainBoards: [
    question("main-1", "Main board one", mainPoints),
    question("main-2", "Main board two", mainPoints),
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
    for (const answer of ["Golf Seven", "Hotel Eight", "India Nine"]) {
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
      fast_money_time_ms: 45_000,
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

  it("reveals the highest-value missed HQ answers after the third strike", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    let submission: Record<string, unknown> = {};

    let result = advanceFamilyFeudDailyRuntime(
      context(publication, submission),
      { type: "answer", answer: "Foxtrot Six" },
    );
    submission = result.submissionState;

    for (const answer of ["Golf Seven", "Hotel Eight", "India Nine"]) {
      result = advanceFamilyFeudDailyRuntime(
        context(publication, submission),
        { type: "answer", answer },
      );
      submission = result.submissionState;
    }

    const boards = result.publicState.main_boards as Array<Record<string, unknown>>;
    const firstBoard = boards[0]!;
    const slots = firstBoard.slots as Array<Record<string, unknown>>;
    expect(firstBoard).toMatchObject({ strikes: 3, settled: true });
    expect(slots).toHaveLength(4);
    expect(slots.map((slot) => (slot.entity as Record<string, unknown>).display_name)).toEqual([
      "Foxtrot Six",
      "Alpha One",
      "Bravo Two",
      "Charlie Three",
    ]);
    expect(slots.map((slot) => slot.points)).toEqual([4, 10, 8, 7]);
    expect(slots.map((slot) => slot.found)).toEqual([true, false, false, false]);
  });

  it("moves through both boards into a hidden 45-second Fast Money round", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const { result } = strikeOutBothBoards(publication);

    expect(result.publicState.phase).toBe("fast-money");
    expect(result.publicState.fast_money).toMatchObject({
      answered_count: 0,
      question_index: 0,
      current_question: { id: "fast-1", prompt: "Fast one" },
      time_remaining_ms: 45_000,
      results: [],
      points: null,
    });
  });

  it("keeps Fast Money values hidden during the clock, then reveals the user's result and full HQ board", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    let { submission } = strikeOutBothBoards(publication);

    let result = advanceFamilyFeudDailyRuntime(
      context(publication, submission),
      { type: "answer", answer: "Alpha One", time_remaining_ms: 44_000 },
    );
    submission = result.submissionState;

    expect(result.publicState.last_feedback).toEqual({ type: "accepted" });
    expect(result.publicState.fast_money).toMatchObject({
      answered_count: 1,
      question_index: 1,
      results: [],
      points: null,
    });

    for (const remaining of [
      ["Bravo Two", 40_000],
      ["Charlie Three", 35_000],
      ["Delta Four", 30_000],
      ["Echo Five", 25_000],
    ] as const) {
      result = advanceFamilyFeudDailyRuntime(
        context(publication, submission),
        { type: "answer", answer: remaining[0], time_remaining_ms: remaining[1] },
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
      fastMoneyTimeRemainingMs: 45_000,
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
