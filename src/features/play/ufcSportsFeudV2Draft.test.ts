import { describe, expect, it } from "vitest";
import {
  matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudPack, type FamilyFeudQuestion, type FamilyFeudEntity,
} from "../games/familyFeudEngine";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";
import { UFC_SPORTS_FEUD_V2_MAIN_DRAFT } from "./ufcSportsFeudV2MainDraft";
import { UFC_SPORTS_FEUD_V2_FAST_DRAFT } from "./ufcSportsFeudV2FastDraft";
import { UFC_SPORTS_FEUD_MAIN } from "./ufcSportsFeudMain";
import { UFC_SPORTS_FEUD_FAST_1 } from "./ufcSportsFeudFast1";
import { UFC_SPORTS_FEUD_FAST_2 } from "./ufcSportsFeudFast2";
import { UFC_SPORTS_FEUD_FAST_3 } from "./ufcSportsFeudFast3";
import { UFC_SPORTS_FEUD_FAST_4 } from "./ufcSportsFeudFast4";
import { UFC_SPORTS_FEUD_FAST_5 } from "./ufcSportsFeudFast5";

const fresh = [...UFC_SPORTS_FEUD_V2_MAIN_DRAFT, ...UFC_SPORTS_FEUD_V2_FAST_DRAFT];
const existing = [
  ...UFC_SPORTS_FEUD_MAIN, ...UFC_SPORTS_FEUD_FAST_1, ...UFC_SPORTS_FEUD_FAST_2,
  ...UFC_SPORTS_FEUD_FAST_3, ...UFC_SPORTS_FEUD_FAST_4, ...UFC_SPORTS_FEUD_FAST_5,
];

function materialize(question: UFCFeudDraft) {
  const candidates = [...question.answers, ...(question.alsoAcceptedAnswers ?? [])];
  const entities: FamilyFeudEntity[] = candidates.map((answer, i) => ({
    id: question.id + ":a" + i,
    displayName: answer.name,
    kind: question.entityKind,
    aliases: answer.aliases ?? [],
  }));
  const board: FamilyFeudQuestion = {
    id: question.id, prompt: question.prompt,
    candidateIds: entities.map(x => x.id),
    answers: entities.slice(0, 8).map((entity, i) => ({ entityId: entity.id, points: 8 - i })),
    alsoAcceptedEntityIds: entities.slice(8).map(x => x.id),
  };
  const pack: FamilyFeudPack = {
    id: "new-ufc-review-only",
    sport: "ufc",
    entities,
    mainBoards: [],
    fastMoney: [],
  };
  return { pack, board, entities };
}

describe("UFC Feud v2 review-only question additions", () => {
  it("adds 26 separate concepts without changing the historical 350-question corpus", () => {
    expect(UFC_SPORTS_FEUD_V2_MAIN_DRAFT).toHaveLength(6);
    expect(UFC_SPORTS_FEUD_V2_FAST_DRAFT).toHaveLength(20);
    expect(existing).toHaveLength(350);
    const ids = [...existing, ...fresh].map(x => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(fresh.map(x => x.prompt.toLowerCase())).size).toBe(fresh.length);
    expect(new Set(fresh.map(x => x.collisionGroup)).size).toBe(fresh.length);
  });

  it("has eight uniquely identifiable scored answers and broad accepted extras per draft", () => {
    for (const q of fresh) {
      expect(q.answers, q.id).toHaveLength(8);
      expect(q.alsoAcceptedAnswers?.length ?? 0, q.id).toBeGreaterThan(0);
      if (q.id.startsWith("ufc-v2-fast")) {
        expect(q.alsoAcceptedAnswers?.length ?? 0, q.id).toBeGreaterThanOrEqual(7);
        expect(q.prompt.length, q.id).toBeLessThan(120);
      } else {
        expect(q.source?.length ?? 0, q.id).toBeGreaterThan(0);
      }
      const candidates = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])];
      expect(new Set(candidates.map(x => normalizeFamilyFeudInput(x.name))).size, q.id)
        .toBe(candidates.length);
      const { pack, board } = materialize(q);
      for (const answer of candidates) {
        expect(matchFamilyFeudAnswer(pack, board, answer.name).status,
          q.id + " valid answer " + answer.name).toBe("matched");
        for (const alias of answer.aliases ?? []) {
          const result = matchFamilyFeudAnswer(pack, board, alias);
          expect(result.status, q.id + " alias " + alias).toBe("matched");
          if (result.status === "matched") {
            const expected = candidates.indexOf(answer);
            expect(result.entityId, q.id + " alias bound to wrong answer " + alias)
              .toBe(q.id + ":a" + expected);
          }
        }
      }
    }
  });

  it("recognizes common spoken aliases and safe misspellings in materialized boards", () => {
    const samples = [
      ["ufc-v2-main-ufc-one-roster", "Royse Gracie"],
      ["ufc-v2-main-tuf-head-coaches", "GSP"],
      ["ufc-v2-main-tuf-winner-champs", "Bobby Knuckles"],
      ["ufc-v2-main-pro-wrestlers", "Phil Brooks"],
      ["ufc-v2-fast-corner-gear", "Enswell"],
      ["ufc-v2-fast-watch-party", "TV"],
      ["ufc-v2-fast-practice-gear", "Punching bag"],
      ["ufc-v2-fast-merchandise", "Tshirt"],
    ] as const;
    for (const [id, answer] of samples) {
      const question = fresh.find(x => x.id === id);
      expect(question).toBeDefined();
      const { pack, board } = materialize(question!);
      expect(matchFamilyFeudAnswer(pack, board, answer).status, id + " " + answer)
        .toBe("matched");
    }
  });

  it("never awards an unrecognized phrase or short ambiguous person identity", () => {
    const q = UFC_SPORTS_FEUD_V2_MAIN_DRAFT.find(x => x.id === "ufc-v2-main-tuf-head-coaches")!;
    const { pack, board } = materialize(q);
    expect(matchFamilyFeudAnswer(pack, board, "the potato fighter").status).toBe("unrecognized");
    // Recognizable unique surnames still work, but we do not suppress ambiguity if a later
    // candidate row introduces the same surname or first name.
    expect(matchFamilyFeudAnswer(pack, board, "Cormier").status).toBe("matched");
  });
});
