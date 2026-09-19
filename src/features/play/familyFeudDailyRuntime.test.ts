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
const mainPoints = [30, 24, 18, 13, 9, 6] as const;
const fastPoints = [40, 30, 20, 15, 10, 5] as const;

function question(id: string, prompt: string, points: readonly number[]) {
  return {
    id,
    prompt,
    candidateIds,
    answers: points.map((value, index) => ({
      entityId: candidateIds[index]!,
      points: value,
    })),
  };
}

const pack: FamilyFeudPack = {
  id: "persistence-fixture",
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

function context(publication: ReturnType<typeof buildFamilyFeudDailySetup>, submissionState: Record<string, unknown> = {}) {
  return {
    setupKey: publication.setupKey,
    publicSetup: publication.publicSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    submissionState,
  };
}

describe("Family Feud Daily persistence contract", () => {
  it("publishes prompts and slot values without leaking candidate or answer identities", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const publicJson = JSON.stringify(publication.publicSetup);

    expect(publicJson).toContain("Main board one");
    expect(publicJson).toContain("Fast one");
    expect(publicJson).not.toContain("Alpha One");
    expect(publicJson).not.toContain("entity-1");
    expect(publicJson).not.toContain("candidateIds");

    const initial = publication.publicSetup.initial_state as Record<string, unknown>;
    const boards = initial.main_boards as Array<Record<string, unknown>>;
    const slots = boards[0]!.slots as Array<Record<string, unknown>>;
    expect(slots.every((slot) => slot.entity === null && slot.revealed === false)).toBe(true);
  });

  it("reveals a correct main-board slot but keeps the rest hidden while the board is live", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const result = advanceFamilyFeudDailyRuntime(
      context(publication),
      { type: "answer", answer: "Alpha One" },
    );

    const boards = result.publicState.main_boards as Array<Record<string, unknown>>;
    const slots = boards[0]!.slots as Array<Record<string, unknown>>;
    expect(slots[0]).toMatchObject({
      slot_index: 0,
      points: 30,
      revealed: true,
      found: true,
      entity: { id: "entity-1", display_name: "Alpha One" },
    });
    expect(slots.slice(1).every((slot) => slot.entity === null)).toBe(true);
  });

  it("reveals the remaining main board after the third strike", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    let submission: Record<string, unknown> = {};
    let result;

    for (const answer of ["Golf Seven", "Hotel Eight", "India Nine"]) {
      result = advanceFamilyFeudDailyRuntime(
        context(publication, submission),
        { type: "answer", answer },
      );
      submission = result.submissionState;
    }

    const boards = result!.publicState.main_boards as Array<Record<string, unknown>>;
    const firstBoard = boards[0]!;
    const slots = firstBoard.slots as Array<Record<string, unknown>>;
    expect(firstBoard).toMatchObject({ strikes: 3, settled: true });
    expect(slots.every((slot) => slot.revealed === true && slot.entity !== null)).toBe(true);
    expect(result!.publicState.main_board_index).toBe(1);
  });

  it("moves through both boards into a hidden 30-second Fast Money round", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    let submission: Record<string, unknown> = {};
    let result;

    for (let board = 0; board < 2; board += 1) {
      for (const answer of ["Golf Seven", "Hotel Eight", "India Nine"]) {
        result = advanceFamilyFeudDailyRuntime(
          context(publication, submission),
          { type: "answer", answer },
        );
        submission = result.submissionState;
      }
    }

    expect(result!.publicState.phase).toBe("fast-money");
    expect(result!.publicState.fast_money).toMatchObject({
      answered_count: 0,
      question_index: 0,
      current_question: { id: "fast-1", prompt: "Fast one" },
      time_remaining_ms: 30_000,
      results: [],
      points: null,
    });
  });

  it("does not reveal Fast Money points until all five answers are locked", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    let submission: Record<string, unknown> = {};

    for (let board = 0; board < 2; board += 1) {
      for (const answer of ["Golf Seven", "Hotel Eight", "India Nine"]) {
        const result = advanceFamilyFeudDailyRuntime(
          context(publication, submission),
          { type: "answer", answer },
        );
        submission = result.submissionState;
      }
    }

    let result = advanceFamilyFeudDailyRuntime(
      context(publication, submission),
      { type: "answer", answer: "Alpha One", time_remaining_ms: 28_000 },
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
      ["Bravo Two", 25_000],
      ["Charlie Three", 20_000],
      ["Delta Four", 15_000],
      ["Echo Five", 10_000],
    ] as const) {
      result = advanceFamilyFeudDailyRuntime(
        context(publication, submission),
        { type: "answer", answer: remaining[0], time_remaining_ms: remaining[1] },
      );
      submission = result.submissionState;
    }

    expect(result.complete).toBe(true);
    expect(result.finalSubmission).toMatchObject({
      native_score: 115,
      normalized_score: 54,
      main_points: 0,
      fast_money_points: 115,
      fast_money_time_remaining_ms: 10_000,
    });

    const fastMoney = result.publicState.fast_money as Record<string, unknown>;
    const reveals = fastMoney.results as Array<Record<string, unknown>>;
    expect(fastMoney.points).toBe(115);
    expect(reveals).toHaveLength(5);
    expect(reveals.map((row) => row.points)).toEqual([40, 30, 20, 15, 10]);
    expect(result.publicState.hq_score).toBe(54);
  });

  it("settles unanswered Fast Money prompts at zero when time expires", () => {
    const publication = buildFamilyFeudDailySetup(pack, "2026-09-20", "test-schedule");
    const initial = publication.privateSetupEvidence.pack as FamilyFeudPack;
    expect(initial.id).toBe(pack.id);

    const fastState = {
      phase: "fast-money",
      mainBoardIndex: 1,
      mainBoards: [
        { revealedEntityIds: [], submittedEntityIds: [], submittedUnrecognized: [], strikes: 3 },
        { revealedEntityIds: [], submittedEntityIds: [], submittedUnrecognized: [], strikes: 3 },
      ],
      fastMoneyIndex: 0,
      fastMoneyResults: [],
      fastMoneyTimeRemainingMs: 30_000,
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
