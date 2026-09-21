import { describe, expect, it } from "vitest";
import {
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
  assertFamilyFeudPack,
  createFamilyFeudState,
  familyFeudHqScore,
  familyFeudScore,
  matchFamilyFeudAnswer,
  normalizeFamilyFeudInput,
  submitFamilyFeudFastMoneyAnswer,
  submitFamilyFeudMainAnswer,
  timeoutFamilyFeudFastMoney,
  type FamilyFeudPack,
  type FamilyFeudState,
} from "./familyFeudEngine";

const entities = [
  { id: "stafford", displayName: "Matthew Stafford", kind: "person" as const },
  { id: "goff", displayName: "Jared Goff", kind: "person" as const },
  { id: "maye", displayName: "Drake Maye", kind: "person" as const },
  { id: "prescott", displayName: "Dak Prescott", kind: "person" as const, aliases: ["Dak"] },
  { id: "lawrence", displayName: "Trevor Lawrence", kind: "person" as const },
  { id: "caleb-williams", displayName: "Caleb Williams", kind: "person" as const },
  { id: "kyren-williams", displayName: "Kyren Williams", kind: "person" as const },
  { id: "mahomes", displayName: "Patrick Mahomes", kind: "person" as const },
  { id: "cook", displayName: "James Cook", kind: "person" as const },
  { id: "henry", displayName: "Derrick Henry", kind: "person" as const },
  { id: "taylor", displayName: "Jonathan Taylor", kind: "person" as const },
  { id: "bijan", displayName: "Bijan Robinson", kind: "person" as const, aliases: ["Bijan"] },
  { id: "achane", displayName: "De'Von Achane", kind: "person" as const },
  { id: "saquon", displayName: "Saquon Barkley", kind: "person" as const },
] as const;

const passingCandidates = [
  "stafford", "goff", "maye", "prescott", "lawrence", "caleb-williams",
  "kyren-williams", "mahomes",
] as const;

const rushingCandidates = [
  "cook", "henry", "taylor", "bijan", "achane", "saquon", "kyren-williams", "mahomes",
] as const;

const mainPoints = [10, 8, 7, 5, 5, 4] as const;
const fastPoints = [8, 7, 6, 5, 4, 3] as const;

function question(
  id: string,
  prompt: string,
  candidates: readonly string[],
  answerIds: readonly string[],
  points: readonly number[],
  alsoAcceptedEntityIds: readonly string[] = [],
) {
  return {
    id,
    prompt,
    candidateIds: candidates,
    answers: answerIds.map((entityId, index) => ({ entityId, points: points[index]! })),
    ...(alsoAcceptedEntityIds.length ? { alsoAcceptedEntityIds } : {}),
  };
}

const mainOne = question(
  "main-one",
  "Name four good quarterback answers.",
  passingCandidates,
  ["stafford", "goff", "maye", "prescott"],
  mainPoints,
  ["lawrence", "caleb-williams"],
);

const mainTwo = question(
  "main-two",
  "Name four good running back answers.",
  rushingCandidates,
  ["cook", "henry", "taylor", "bijan"],
  mainPoints,
  ["achane", "saquon"],
);

function fastQuestion(id: string, candidates: readonly string[], answerIds: readonly string[]) {
  return question(id, "Fast Money " + id, candidates, answerIds, fastPoints);
}

const pack: FamilyFeudPack = {
  id: "football-prototype-v2",
  sport: "football",
  entities,
  mainBoards: [mainOne, mainTwo],
  fastMoney: [
    fastQuestion("fm-1", passingCandidates, ["stafford", "goff", "maye", "prescott", "lawrence", "caleb-williams"]),
    fastQuestion("fm-2", rushingCandidates, ["cook", "henry", "taylor", "bijan", "achane", "saquon"]),
    fastQuestion("fm-3", passingCandidates, ["stafford", "goff", "maye", "prescott", "lawrence", "caleb-williams"]),
    fastQuestion("fm-4", rushingCandidates, ["cook", "henry", "taylor", "bijan", "achane", "saquon"]),
    fastQuestion("fm-5", passingCandidates, ["stafford", "goff", "maye", "prescott", "lawrence", "caleb-williams"]),
  ],
};

describe("Family Feud V2 engine contract", () => {
  it("validates four-slot main boards, recap-only accepted pools, and five Fast Money prompts", () => {
    expect(() => assertFamilyFeudPack(pack)).not.toThrow();
    expect(pack.mainBoards.every((board) => board.answers.length === 4)).toBe(true);
    expect(pack.mainBoards.every((board) => (board.alsoAcceptedEntityIds?.length ?? 0) > 0)).toBe(true);
    expect(() => assertFamilyFeudPack({ ...pack, mainBoards: [mainOne] })).toThrow(/two main boards/i);
  });

  it("normalizes punctuation, accents, spacing, and casing", () => {
    expect(normalizeFamilyFeudInput("  DE'VON   Achéne!! ")).toBe("de von achene");
  });

  it("accepts canonical names, aliases, unique surnames, and normal typos", () => {
    expect(matchFamilyFeudAnswer(pack, mainOne, "Matthew Stafford")).toMatchObject({
      status: "matched",
      entityId: "stafford",
      kind: "exact",
    });
    expect(matchFamilyFeudAnswer(pack, mainOne, "Dak")).toMatchObject({
      status: "matched",
      entityId: "prescott",
      kind: "alias",
    });
    expect(matchFamilyFeudAnswer(pack, mainOne, "Stafford")).toMatchObject({
      status: "matched",
      entityId: "stafford",
      kind: "surname",
    });
    expect(matchFamilyFeudAnswer(pack, mainOne, "Mahoms")).toMatchObject({
      status: "matched",
      entityId: "mahomes",
      kind: "typo",
    });
  });

  it("returns ambiguous without a strike and without revealing a candidate", () => {
    expect(matchFamilyFeudAnswer(pack, mainOne, "Williams")).toEqual({
      status: "ambiguous",
      entityIds: ["caleb-williams", "kyren-williams"],
    });
    const transition = submitFamilyFeudMainAnswer(pack, createFamilyFeudState(), "Williams");
    expect(transition.outcome.type).toBe("ambiguous");
    expect(transition.state.mainBoards[0]!.strikes).toBe(0);
  });

  it("counts a recognized but intentionally unaccepted candidate as a strike", () => {
    const transition = submitFamilyFeudMainAnswer(pack, createFamilyFeudState(), "Patrick Mahomes");
    expect(transition.outcome).toEqual({ type: "board-strike", boardIndex: 0, strikes: 1 });
  });

  it("does not double-penalize duplicate wrong or duplicate recognized answers", () => {
    let state = createFamilyFeudState();
    let transition = submitFamilyFeudMainAnswer(pack, state, "not a real player");
    expect(transition.state.mainBoards[0]!.strikes).toBe(1);

    state = transition.state;
    transition = submitFamilyFeudMainAnswer(pack, state, "not a real player");
    expect(transition.outcome.type).toBe("already-guessed");
    expect(transition.state.mainBoards[0]!.strikes).toBe(1);

    state = transition.state;
    transition = submitFamilyFeudMainAnswer(pack, state, "Patrick Mahomes");
    expect(transition.state.mainBoards[0]!.strikes).toBe(2);

    state = transition.state;
    transition = submitFamilyFeudMainAnswer(pack, state, "Mahomes");
    expect(transition.outcome.type).toBe("already-guessed");
    expect(transition.state.mainBoards[0]!.strikes).toBe(2);
  });

  it("keeps also-accepted responses off the live board and clears only the four core answers", () => {
    let state = createFamilyFeudState();
    let transition = submitFamilyFeudMainAnswer(pack, state, "Caleb Williams");
    expect(transition.outcome).toMatchObject({
      type: "board-also-accepted",
      entityId: "caleb-williams",
    });
    expect(transition.state.mainBoards[0]!.strikes).toBe(0);
    expect(transition.state.mainBoards[0]!.revealedEntityIds).toEqual([]);

    state = transition.state;
    for (const answer of ["Matthew Stafford", "Jared Goff", "Drake Maye", "Dak Prescott"]) {
      state = submitFamilyFeudMainAnswer(pack, state, answer).state;
    }
    expect(state.mainBoardIndex).toBe(1);
    expect(state.mainBoards[0]!.revealedEntityIds).toEqual([
      "stafford", "goff", "maye", "prescott",
    ]);
    expect(familyFeudScore(pack, state).main).toBe(30);
  });

  it("ends a main board on the third strike without subtracting banked points", () => {
    let state = createFamilyFeudState();
    state = submitFamilyFeudMainAnswer(pack, state, "Matthew Stafford").state;
    for (const wrong of ["Patrick Mahomes", "Kyren Williams", "nonsense"]) {
      state = submitFamilyFeudMainAnswer(pack, state, wrong).state;
    }
    expect(state.mainBoardIndex).toBe(1);
    expect(state.mainBoards[0]!.strikes).toBe(3);
    expect(familyFeudScore(pack, state).main).toBe(10);
  });

  it("uses a 45-second Fast Money clock and keeps ambiguity on the same prompt", () => {
    let state: FamilyFeudState = { ...createFamilyFeudState(), phase: "fast-money" };
    expect(FAMILY_FEUD_FAST_MONEY_TIME_MS).toBe(45_000);

    const transition = submitFamilyFeudFastMoneyAnswer(pack, state, "Williams", 36_000);
    expect(transition.outcome.type).toBe("ambiguous");
    expect(transition.state.fastMoneyIndex).toBe(0);
    expect(transition.state.fastMoneyTimeRemainingMs).toBe(36_000);
  });

  it("advances Fast Money with variable points and zero for a valid off-board answer", () => {
    let state: FamilyFeudState = { ...createFamilyFeudState(), phase: "fast-money" };

    let transition = submitFamilyFeudFastMoneyAnswer(pack, state, "Stafford", 44_000);
    expect(transition.outcome).toEqual({
      type: "fast-money-answer",
      questionIndex: 0,
      entityId: "stafford",
      points: 8,
    });

    state = transition.state;
    transition = submitFamilyFeudFastMoneyAnswer(pack, state, "Patrick Mahomes", 39_000);
    expect(transition.outcome).toEqual({
      type: "fast-money-answer",
      questionIndex: 1,
      entityId: "mahomes",
      points: 0,
    });
  });

  it("settles Fast Money on timeout", () => {
    const state = { ...createFamilyFeudState(), phase: "fast-money" as const };
    const transition = timeoutFamilyFeudFastMoney(state);
    expect(transition.state.phase).toBe("complete");
    expect(transition.state.fastMoneyTimeRemainingMs).toBe(0);
  });

  it("uses transparent direct 100-point scoring with no hidden curve", () => {
    expect(familyFeudHqScore(0)).toBe(0);
    expect(familyFeudHqScore(80)).toBe(80);
    expect(familyFeudHqScore(90)).toBe(90);
    expect(familyFeudHqScore(100)).toBe(100);
    expect(familyFeudHqScore(120)).toBe(100);

    let state = createFamilyFeudState();
    state = submitFamilyFeudMainAnswer(pack, state, "Stafford").state;
    state = {
      ...state,
      fastMoneyResults: [
        { questionId: "fm-1", submittedText: "Stafford", entityId: "stafford", points: 8, matchKind: "surname" },
      ],
    };
    expect(familyFeudScore(pack, state)).toEqual({
      main: 10,
      fastMoney: 8,
      raw: 18,
      hq: 18,
    });
  });
});
