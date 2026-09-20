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
  "stafford",
  "goff",
  "maye",
  "prescott",
  "lawrence",
  "caleb-williams",
  "kyren-williams",
  "mahomes",
];

const rushingCandidates = [
  "cook",
  "henry",
  "taylor",
  "bijan",
  "achane",
  "kyren-williams",
  "saquon",
  "mahomes",
];

const mainOne = {
  id: "passing-tds",
  prompt: "Name the six QBs with the most passing TDs.",
  candidateIds: passingCandidates,
  answers: [
    { entityId: "stafford", points: 30 },
    { entityId: "goff", points: 24 },
    { entityId: "maye", points: 18 },
    { entityId: "prescott", points: 13 },
    { entityId: "lawrence", points: 9 },
    { entityId: "caleb-williams", points: 6 },
  ],
} as const;

const mainTwo = {
  id: "rushing-yards",
  prompt: "Name the six players with the most rushing yards.",
  candidateIds: rushingCandidates,
  answers: [
    { entityId: "cook", points: 30 },
    { entityId: "henry", points: 24 },
    { entityId: "taylor", points: 18 },
    { entityId: "bijan", points: 13 },
    { entityId: "achane", points: 9 },
    { entityId: "kyren-williams", points: 6 },
  ],
} as const;

function fastQuestion(id: string, candidates: readonly string[]) {
  return {
    id,
    prompt: "Fast Money " + id,
    candidateIds: candidates,
    answers: [
      { entityId: candidates[0]!, points: 40 },
      { entityId: candidates[1]!, points: 30 },
      { entityId: candidates[2]!, points: 20 },
      { entityId: candidates[3]!, points: 15 },
      { entityId: candidates[4]!, points: 10 },
      { entityId: candidates[5]!, points: 5 },
    ],
  };
}

const pack: FamilyFeudPack = {
  id: "football-prototype",
  sport: "football",
  entities,
  mainBoards: [mainOne, mainTwo],
  fastMoney: [
    fastQuestion("fm-1", passingCandidates),
    fastQuestion("fm-2", rushingCandidates),
    fastQuestion("fm-3", passingCandidates),
    fastQuestion("fm-4", rushingCandidates),
    fastQuestion("fm-5", passingCandidates),
  ],
};

describe("Family Feud engine contract", () => {
  it("validates the locked two-board plus five-question structure", () => {
    expect(() => assertFamilyFeudPack(pack)).not.toThrow();
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

  it("returns ambiguous without leaking which candidate is on the board", () => {
    expect(matchFamilyFeudAnswer(pack, mainOne, "Williams")).toEqual({
      status: "ambiguous",
      entityIds: ["caleb-williams", "kyren-williams"],
    });

    const transition = submitFamilyFeudMainAnswer(pack, createFamilyFeudState(), "Williams");
    expect(transition.outcome.type).toBe("ambiguous");
    expect(transition.state.mainBoards[0]!.strikes).toBe(0);
  });

  it("counts a recognized candidate outside the six as a strike", () => {
    const transition = submitFamilyFeudMainAnswer(pack, createFamilyFeudState(), "Mahomes");
    expect(transition.outcome).toEqual({ type: "board-strike", boardIndex: 0, strikes: 1 });
  });

  it("counts nonsense as a strike but repeated submissions do not double-penalize", () => {
    let state = createFamilyFeudState();
    let transition = submitFamilyFeudMainAnswer(pack, state, "not a real player");
    expect(transition.outcome).toEqual({ type: "board-strike", boardIndex: 0, strikes: 1 });

    state = transition.state;
    transition = submitFamilyFeudMainAnswer(pack, state, "not a real player");
    expect(transition.outcome).toEqual({
      type: "already-guessed",
      boardIndex: 0,
      entityId: null,
    });
    expect(transition.state.mainBoards[0]!.strikes).toBe(1);

    state = transition.state;
    transition = submitFamilyFeudMainAnswer(pack, state, "Mahomes");
    expect(transition.outcome).toEqual({ type: "board-strike", boardIndex: 0, strikes: 2 });

    state = transition.state;
    transition = submitFamilyFeudMainAnswer(pack, state, "Patrick Mahomes");
    expect(transition.outcome).toEqual({
      type: "already-guessed",
      boardIndex: 0,
      entityId: "mahomes",
    });
    expect(transition.state.mainBoards[0]!.strikes).toBe(2);

    state = transition.state;
    transition = submitFamilyFeudMainAnswer(pack, state, "Stafford");
    expect(transition.outcome).toMatchObject({ type: "board-correct", entityId: "stafford", points: 30 });

    state = transition.state;
    transition = submitFamilyFeudMainAnswer(pack, state, "Matthew Stafford");
    expect(transition.outcome).toEqual({
      type: "already-guessed",
      boardIndex: 0,
      entityId: "stafford",
    });
    expect(transition.state.mainBoards[0]!.strikes).toBe(2);
  });

  it("moves to board two when the first board is cleared and to Fast Money after board two", () => {
    let state = createFamilyFeudState();
    for (const answer of mainOne.answers) {
      state = submitFamilyFeudMainAnswer(pack, state, answer.entityId === "caleb-williams" ? "Caleb Williams" : answer.entityId).state;
    }
    expect(state.phase).toBe("main");
    expect(state.mainBoardIndex).toBe(1);

    for (const answer of mainTwo.answers) {
      const entity = entities.find((row) => row.id === answer.entityId)!;
      state = submitFamilyFeudMainAnswer(pack, state, entity.displayName).state;
    }
    expect(state.phase).toBe("fast-money");
    expect(state.fastMoneyIndex).toBe(0);
    expect(state.fastMoneyTimeRemainingMs).toBe(FAMILY_FEUD_FAST_MONEY_TIME_MS);
  });

  it("ends a main board after three strikes", () => {
    let state = createFamilyFeudState();
    for (const wrong of ["Mahomes", "Kyren Williams", "nonsense"]) {
      state = submitFamilyFeudMainAnswer(pack, state, wrong).state;
    }
    expect(state.mainBoardIndex).toBe(1);
    expect(state.mainBoards[0]!.strikes).toBe(3);
  });

  it("keeps ambiguous Fast Money answers on the same prompt while the clock continues", () => {
    let state = createFamilyFeudState();
    state = { ...state, phase: "fast-money" };

    const transition = submitFamilyFeudFastMoneyAnswer(pack, state, "Williams", 24_000);
    expect(transition.outcome.type).toBe("ambiguous");
    expect(transition.state.fastMoneyIndex).toBe(0);
    expect(transition.state.fastMoneyTimeRemainingMs).toBe(24_000);
  });

  it("advances Fast Money with points for a board answer and zero for a valid off-board answer", () => {
    let state: FamilyFeudState = { ...createFamilyFeudState(), phase: "fast-money" };

    let transition = submitFamilyFeudFastMoneyAnswer(pack, state, "Stafford", 29_000);
    expect(transition.outcome).toEqual({
      type: "fast-money-answer",
      questionIndex: 0,
      entityId: "stafford",
      points: 40,
    });

    state = transition.state;
    transition = submitFamilyFeudFastMoneyAnswer(pack, state, "Saquon Barkley", 25_000);
    expect(transition.outcome).toEqual({
      type: "fast-money-answer",
      questionIndex: 1,
      entityId: "saquon",
      points: 0,
    });
    expect(transition.state.fastMoneyIndex).toBe(2);
  });

  it("settles Fast Money on timeout", () => {
    const state = { ...createFamilyFeudState(), phase: "fast-money" as const };
    const transition = timeoutFamilyFeudFastMoney(state);
    expect(transition.state.phase).toBe("complete");
    expect(transition.state.fastMoneyTimeRemainingMs).toBe(0);
  });

  it("uses the locked 400-point raw game and curved HQ scale", () => {
    expect(familyFeudHqScore(120)).toBe(55);
    expect(familyFeudHqScore(180)).toBe(67);
    expect(familyFeudHqScore(260)).toBe(81);
    expect(familyFeudHqScore(330)).toBe(91);
    expect(familyFeudHqScore(400)).toBe(100);

    let state = createFamilyFeudState();
    state = submitFamilyFeudMainAnswer(pack, state, "Stafford").state;
    state = {
      ...state,
      fastMoneyResults: [
        { questionId: "fm-1", submittedText: "Stafford", entityId: "stafford", points: 40, matchKind: "surname" },
      ],
    };
    expect(familyFeudScore(pack, state)).toEqual({
      main: 30,
      fastMoney: 40,
      raw: 70,
      hq: 42,
    });
  });
});
