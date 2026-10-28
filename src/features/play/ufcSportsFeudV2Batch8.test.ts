import { describe, expect, it } from "vitest";
import {
  matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudPack, type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH8 } from "./ufcSportsFeudV2MainBatch8";

function fixture(question: (typeof UFC_SPORTS_FEUD_V2_MAIN_BATCH8)[number]) {
  const all = [...question.answers, ...(question.alsoAcceptedAnswers ?? [])];
  const entities = all.map((answer, index) => ({
    id: question.id + ":" + index,
    displayName: answer.name,
    kind: question.entityKind,
    aliases: answer.aliases ?? [],
  }));
  const board: FamilyFeudQuestion = {
    id: question.id,
    prompt: question.prompt,
    candidateIds: entities.map(entity => entity.id),
    answers: entities.slice(0, 8).map((entity, index) => ({
      entityId: entity.id, points: 8 - index,
    })),
    alsoAcceptedEntityIds: entities.slice(8).map(entity => entity.id),
  };
  const pack = {
    id: question.id, sport: "ufc", mainBoards: [], fastMoney: [], entities,
  } satisfies FamilyFeudPack;
  return { all, board, pack };
}

describe("UFC V2 batch 8: documented video-game covers and inaugural champions", () => {
  it("has two independent sports-history topics and complete eight-slot boards", () => {
    expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH8).toHaveLength(2);
    expect(new Set(UFC_SPORTS_FEUD_V2_MAIN_BATCH8.map(q => q.collisionGroup)).size).toBe(2);
    for (const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH8) {
      expect(q.answers, q.id).toHaveLength(8);
      expect(q.source?.length, q.id).toBeGreaterThan(0);
      const all = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])];
      expect(new Set(all.map(a => normalizeFamilyFeudInput(a.name))).size, q.id).toBe(all.length);
    }
  });

  it("accepts every documented name, extra and alias as exactly one owner", () => {
    for (const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH8) {
      const { all, board, pack } = fixture(q);
      for (const [index, answer] of all.entries()) {
        for (const entry of [answer.name, ...(answer.aliases ?? [])]) {
          const actual = matchFamilyFeudAnswer(pack, board, entry);
          expect(actual.status, q.id + " / " + entry).toBe("matched");
          if (actual.status === "matched") {
            expect(actual.entityId, q.id + " / " + entry).toBe(q.id + ":" + index);
          }
        }
      }
    }
  });

  it("does not accept recognizable but ineligible fighters", () => {
    for (const [id, name] of [
      ["ufc-v2-main8-ea-cover-athletes", "Jose Aldo"],
      ["ufc-v2-main8-ea-cover-athletes", "Georges St-Pierre"],
      ["ufc-v2-main8-first-division-champions", "Holly Holm"],
      ["ufc-v2-main8-first-division-champions", "Rose Namajunas"],
    ] as const) {
      const q = UFC_SPORTS_FEUD_V2_MAIN_BATCH8.find(q => q.id === id)!;
      const { board, pack } = fixture(q);
      expect(matchFamilyFeudAnswer(pack, board, name).status, id + " / " + name).toBe("unrecognized");
    }
  });
});
