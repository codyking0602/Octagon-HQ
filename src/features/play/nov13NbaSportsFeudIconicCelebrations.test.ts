import { describe, expect, it } from "vitest";
import {
  assertFamilyFeudPack,
  matchFamilyFeudAnswer,
  type FamilyFeudPack,
} from "../games/familyFeudEngine";
import { buildNbaSportsFeudDailyPack } from "../nba/nbaSportsFeudDailyRotation";
import {
  NBA_FEUD_CELEBRATION_QUESTION_ID,
  NBA_FEUD_CELEBRATION_RANKED,
  NBA_FEUD_CELEBRATION_UNRANKED,
} from "../nba/nbaSportsFeudIconicCelebrations";
import {
  advanceFamilyFeudDailyCore,
  buildFamilyFeudDailySetup,
  hydrateNbaIconicCelebrations,
} from "./familyFeudDailyCore";

const day = "2026-11-13";
const schedule = "nba-daily-regular-v3-oct30-public";
const guesses = [
  "Lakers", "Warriors", "Thunder", "Spurs",
  "Steph Curry", "Larry Bird", "Klay Thompson", "Damian Lillard",
  "Larry Bird", "Points", "Mutumbo", "Tim Duncan", "Scoreboard",
];

function publishedSlot(): FamilyFeudPack {
  const pack = buildNbaSportsFeudDailyPack(1);
  expect(pack.mainBoards.map((board) => board.id)).toEqual([
    "nba-feud-west-teams", "nba-feud-three-point-contest",
  ]);
  expect(pack.fastMoney.map((board) => board.id)).toEqual([
    "nba-feud-celtics-legends", "nba-feud-basketball-stat-box",
    NBA_FEUD_CELEBRATION_QUESTION_ID, "nba-feud-power-forwards",
    "nba-feud-arena-sights",
  ]);
  return pack;
}

function celebration(pack: FamilyFeudPack) {
  const board = pack.fastMoney.find((question) => question.id === NBA_FEUD_CELEBRATION_QUESTION_ID);
  if (!board) throw new Error("NBA Feud celebration board missing");
  return board;
}

function rankedName(pack: FamilyFeudPack, entityId: string) {
  return pack.entities.find((entity) => entity.id === entityId)?.displayName;
}

/** Reconstruct the old published answer omission without changing other seven-board data. */
function priorPublishedPack(): FamilyFeudPack {
  const pack = publishedSlot();
  const board = celebration(pack);
  const mutomboId = board.answers[0]!.entityId;
  const harden = pack.entities.find((entity) =>
    board.candidateIds.includes(entity.id) && entity.displayName === "James Harden");
  if (!harden) throw new Error("Historic NBA celebrity board lost Harden");
  const legacy: FamilyFeudPack = {
    ...pack,
    entities: pack.entities.filter((entity) => entity.id !== mutomboId),
    fastMoney: pack.fastMoney.map((question) => question.id === NBA_FEUD_CELEBRATION_QUESTION_ID
      ? {
          ...question,
          candidateIds: question.candidateIds.filter((id) => id !== mutomboId),
          answers: [{ entityId: harden.id, points: 8 }, ...question.answers.slice(1)],
          alsoAcceptedEntityIds: (question.alsoAcceptedEntityIds ?? []).filter((id) => id !== harden.id),
        }
      : question),
  };
  assertFamilyFeudPack(legacy);
  return legacy;
}

function replay(pack: FamilyFeudPack) {
  const setup = buildFamilyFeudDailySetup(pack, day, schedule);
  const frozen = structuredClone(setup.privateSetupEvidence);
  let submissionState: Record<string, unknown> = {};
  let result: ReturnType<typeof advanceFamilyFeudDailyCore> | null = null;
  for (const answer of guesses) {
    result = advanceFamilyFeudDailyCore({
      setupKey: setup.setupKey,
      publicSetup: setup.publicSetup,
      privateSetupEvidence: setup.privateSetupEvidence,
      submissionState,
    }, { type: "answer", answer });
    submissionState = result.submissionState;
  }
  expect(result?.complete).toBe(true);
  expect(setup.privateSetupEvidence).toEqual(frozen);
  return result!;
}

describe("November 13 NBA Sports Feud iconic celebration grading", () => {
  it("ranks actual signature gestures rather than player fame", () => {
    const pack = publishedSlot();
    const board = celebration(pack);
    expect(board.answers.map((answer) => rankedName(pack, answer.entityId))).toEqual([...NBA_FEUD_CELEBRATION_RANKED]);
    expect(board.answers.map((answer) => answer.points)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
    expect(board.alsoAcceptedEntityIds?.map((id) => rankedName(pack, id)))
      .toEqual([...NBA_FEUD_CELEBRATION_UNRANKED]);
    const expected: ReadonlyArray<readonly [string, string, number]> = [
      ["Mutumbo", "Dikembe Mutombo", 8],
      ["Deke", "Dikembe Mutombo", 8],
      ["Finger wag", "Dikembe Mutombo", 8],
      ["Night Night", "Stephen Curry", 7],
      ["Dame Time", "Damian Lillard", 6],
      ["Three to the dome", "Carmelo Anthony", 5],
      ["The Shrug", "Michael Jordan", 4],
      ["The Silencer", "LeBron James", 3],
      ["Rock the baby", "Russell Westbrook", 2],
      ["Ice in My Veins", "D'Angelo Russell", 1],
      ["Stirring the pot", "James Harden", 1],
      ["Choke sign", "Reggie Miller", 1],
      ["The Bow", "Trae Young", 1],
      ["Blue Arrow", "Jamal Murray", 1],
      ["Three-finger mask", "Jalen Brunson", 1],
      ["Three goggles", "Klay Thompson", 1],
      ["Airplane", "Joel Embiid", 1],
      ["This Is My House", "Dwyane Wade", 1],
    ];
    for (const [input, expectedName, points] of expected) {
      const match = matchFamilyFeudAnswer(pack, board, input);
      expect(match.status, input).toBe("matched");
      if (match.status !== "matched") continue;
      expect(rankedName(pack, match.entityId)).toBe(expectedName);
      expect(board.answers.find((a) => a.entityId === match.entityId)?.points
        ?? ((board.alsoAcceptedEntityIds ?? []).includes(match.entityId) ? 1 : 0)).toBe(points);
    }
  });

  it("keeps the historical ranked ladder and proof immutable while accepting Mutumbo as off-board", () => {
    const oldPack = priorPublishedPack();
    const frozen = structuredClone(oldPack);
    expect(matchFamilyFeudAnswer(oldPack, celebration(oldPack), "Mutumbo").status).toBe("unrecognized");
    const hydrated = hydrateNbaIconicCelebrations(oldPack);
    expect(oldPack).toEqual(frozen);
    expect(hydrateNbaIconicCelebrations(hydrated)).toEqual(hydrated);
    expect(hydrated.fastMoney.map((board) => board.answers))
      .toEqual(oldPack.fastMoney.map((board) => board.answers));
    expect(matchFamilyFeudAnswer(hydrated, celebration(hydrated), "Mutumbo").status).toBe("matched");
    expect(celebration(hydrated).alsoAcceptedEntityIds?.some((id) =>
      rankedName(hydrated, id) === "Dikembe Mutombo")).toBe(true);
    expect(hydrateNbaIconicCelebrations({ ...oldPack, sport: "football" })).toEqual({ ...oldPack, sport: "football" });
  });

  it("replays the 13 actual answers: 96 for future boards and 89 under immutable historical ladder", () => {
    const modern = replay(publishedSlot());
    expect(modern.finalSubmission).toMatchObject({
      main_points: 58, fast_money_points: 38, native_score: 96, normalized_score: 96,
    });
    expect((modern.publicState.fast_money as { results: { points: number }[] }).results.map((r) => r.points))
      .toEqual([8, 8, 8, 8, 6]);
    const legacy = replay(priorPublishedPack());
    expect(legacy.finalSubmission).toMatchObject({
      main_points: 58, fast_money_points: 31, native_score: 89, normalized_score: 89,
    });
  });
});
