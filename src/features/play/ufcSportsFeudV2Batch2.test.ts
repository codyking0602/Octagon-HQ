import { describe, expect, it } from "vitest";
import {
  matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudEntity, type FamilyFeudPack, type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH2 } from "./ufcSportsFeudV2MainBatch2";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH2 } from "./ufcSportsFeudV2FastBatch2";
import { UFC_SPORTS_FEUD_V2_MAIN_DRAFT } from "./ufcSportsFeudV2MainDraft";
import { UFC_SPORTS_FEUD_V2_FAST_DRAFT } from "./ufcSportsFeudV2FastDraft";

const batch = [...UFC_SPORTS_FEUD_V2_MAIN_BATCH2, ...UFC_SPORTS_FEUD_V2_FAST_BATCH2];
const bothBatches = [...UFC_SPORTS_FEUD_V2_MAIN_DRAFT, ...UFC_SPORTS_FEUD_V2_FAST_DRAFT, ...batch];

function materialize(question: UFCFeudDraft) {
  const people = [...question.answers, ...(question.alsoAcceptedAnswers ?? [])];
  const entities: FamilyFeudEntity[] = people.map((a, index) => ({
    id: question.id + ":" + index,
    displayName: a.name, kind: question.entityKind, aliases: a.aliases ?? [],
  }));
  const board: FamilyFeudQuestion = {
    id: question.id, prompt: question.prompt,
    candidateIds: entities.map(e => e.id),
    answers: entities.slice(0, 8).map((e, i) => ({ entityId: e.id, points: 8 - i })),
    alsoAcceptedEntityIds: entities.slice(8).map(e => e.id),
  };
  const pack: FamilyFeudPack = {
    id: "ufc-sports-feud-editorial-draft-batch2", sport: "ufc",
    entities, mainBoards: [], fastMoney: [],
  };
  return { board, pack, people };
}

describe("UFC Sports Feud v2 authoring batch two — not published", () => {
  it("contains five new Main and twelve new Fast concepts without repeated draft IDs", () => {
    expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH2).toHaveLength(5);
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH2).toHaveLength(12);
    expect(bothBatches).toHaveLength(43);
    expect(new Set(bothBatches.map(q => q.id)).size).toBe(43);
    expect(new Set(bothBatches.map(q => q.collisionGroup)).size).toBe(43);
    expect(new Set(bothBatches.map(q => normalizeFamilyFeudInput(q.prompt))).size).toBe(43);
  });

  it("keeps eight distinct ranked answers and correctly accepts all on-board, extra and alias forms", () => {
    for (const question of batch) {
      expect(question.answers, question.id).toHaveLength(8);
      expect(question.alsoAcceptedAnswers?.length ?? 0, question.id).toBeGreaterThan(0);
      if (question.entityKind === "person") expect(question.source?.length ?? 0).toBeGreaterThan(0);
      const { pack, board, people } = materialize(question);
      const seen = new Set<string>();
      for (const [index, answer] of people.entries()) {
        const key = normalizeFamilyFeudInput(answer.name);
        expect(seen.has(key), question.id + " duplicated canonical " + answer.name).toBe(false);
        seen.add(key);
        const matched = matchFamilyFeudAnswer(pack, board, answer.name);
        expect(matched.status, question.id + " canonical " + answer.name).toBe("matched");
        if (matched.status === "matched") {
          expect(matched.entityId).toBe(question.id + ":" + index);
        }
        for (const alias of answer.aliases ?? []) {
          const result = matchFamilyFeudAnswer(pack, board, alias);
          expect(result.status, question.id + " alias " + alias).toBe("matched");
          if (result.status === "matched") {
            expect(result.entityId, question.id + " wrong owner of " + alias)
              .toBe(question.id + ":" + index);
          }
        }
      }
    }
  });

  it("accepts natural fighter nicknames, short names and typos but not factual false positives", () => {
    const cases = [
      ["ufc-v2-fast2-nicknames", "Conor McGregor", "The Notorious"],
      ["ufc-v2-fast2-nicknames", "Bones", "Bones"],
      ["ufc-v2-fast2-nicknames", "Borz", "Borz"],
      ["ufc-v2-main2-olympic-athletes", "DC", "Daniel Cormier"],
      ["ufc-v2-main2-olympic-athletes", "Cejudo", "Henry Cejudo"],
      ["ufc-v2-main2-early-tournaments", "The Smashing Machine", "Mark Kerr"],
      ["ufc-v2-fast2-event-countries", "UAE", "United Arab Emirates"],
      ["ufc-v2-fast2-corner-shouts", "Hands up", "Keep your hands up"],
      ["ufc-v2-fast2-referee-phrases", "No fence grabbing", "Don't grab the fence"],
    ] as const;
    for (const [id, guess, expected] of cases) {
      const question = batch.find(q => q.id === id);
      expect(question, id).toBeDefined();
      const { board, pack, people } = materialize(question!);
      const matched = matchFamilyFeudAnswer(pack, board, guess);
      expect(matched.status, id + " guess " + guess).toBe("matched");
      if (matched.status === "matched") {
        expect(people[Number(matched.entityId.split(":").at(-1))]?.name)
          .toBe(expected);
      }
    }
    const wec = batch.find(q => q.id === "ufc-v2-main2-wec-champions")!;
    const { pack, board } = materialize(wec);
    expect(matchFamilyFeudAnswer(pack, board, "Rob McCullough").status)
      .toBe("unrecognized");
  });
});
