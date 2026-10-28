import { describe, expect, it } from "vitest";
import {
  matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudEntity, type FamilyFeudPack, type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";
import { UFC_SPORTS_FEUD_V2_MAIN_DRAFT } from "./ufcSportsFeudV2MainDraft";
import { UFC_SPORTS_FEUD_V2_FAST_DRAFT } from "./ufcSportsFeudV2FastDraft";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH2 } from "./ufcSportsFeudV2MainBatch2";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH2 } from "./ufcSportsFeudV2FastBatch2";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH3 } from "./ufcSportsFeudV2MainBatch3";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH3 } from "./ufcSportsFeudV2FastBatch3";

const newBatch = [...UFC_SPORTS_FEUD_V2_MAIN_BATCH3, ...UFC_SPORTS_FEUD_V2_FAST_BATCH3];
const allDrafts: readonly UFCFeudDraft[] = [
  ...UFC_SPORTS_FEUD_V2_MAIN_DRAFT, ...UFC_SPORTS_FEUD_V2_FAST_DRAFT,
  ...UFC_SPORTS_FEUD_V2_MAIN_BATCH2, ...UFC_SPORTS_FEUD_V2_FAST_BATCH2,
  ...newBatch,
];

function materialize(question: UFCFeudDraft) {
  const list = [...question.answers, ...(question.alsoAcceptedAnswers ?? [])];
  const entities: FamilyFeudEntity[] = list.map((a, index) => ({
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
    id: "ufc-feud-v2-draft-batch3", sport: "ufc", entities,
    mainBoards: [], fastMoney: [],
  };
  return { list, pack, board };
}

describe("UFC Sports Feud third editorial batch (review only, not live)", () => {
  it("adds four main and 21 fast subjects, with unique IDs/lanes across all 68 drafts", () => {
    expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH3).toHaveLength(4);
    expect(UFC_SPORTS_FEUD_V2_FAST_BATCH3).toHaveLength(21);
    expect(allDrafts).toHaveLength(68);
    expect(new Set(allDrafts.map(q => q.id)).size).toBe(allDrafts.length);
    expect(new Set(allDrafts.map(q => q.collisionGroup)).size).toBe(allDrafts.length);
    expect(new Set(allDrafts.map(q => normalizeFamilyFeudInput(q.prompt))).size).toBe(allDrafts.length);
  });

  it("retains eight ranked canonical choices and accepts each authored extra and alias", () => {
    for (const q of newBatch) {
      expect(q.answers, q.id).toHaveLength(8);
      const others = q.alsoAcceptedAnswers ?? [];
      expect(others.length, q.id).toBeGreaterThanOrEqual(6);
      if (q.id.includes("main3")) expect(q.source?.length ?? 0, q.id).toBeGreaterThan(0);
      const { list, pack, board } = materialize(q);
      expect(new Set(list.map(a => normalizeFamilyFeudInput(a.name))).size, q.id)
        .toBe(list.length);
      for (const [index, answer] of list.entries()) {
        const exact = matchFamilyFeudAnswer(pack, board, answer.name);
        expect(exact.status, q.id + " canonical " + answer.name).toBe("matched");
        if (exact.status === "matched") {
          expect(exact.entityId, q.id + " incorrect canonical owner").toBe(q.id + ":" + index);
        }
        for (const alias of answer.aliases ?? []) {
          const matched = matchFamilyFeudAnswer(pack, board, alias);
          expect(matched.status, q.id + " alias " + alias).toBe("matched");
          if (matched.status === "matched") {
            expect(matched.entityId, q.id + " incorrect alias owner " + alias)
              .toBe(q.id + ":" + index);
          }
        }
      }
    }
  });

  it("accepts obvious UFC identity and fan-language equivalents", () => {
    const samples = [
      ["ufc-v2-main3-ufc100-card", "Sexyama", "Yoshihiro Akiyama"],
      ["ufc-v2-main3-ufc300-card", "Poatan", "Alex Pereira"],
      ["ufc-v2-main3-ufc200-card", "DC", "Daniel Cormier"],
      ["ufc-v2-main3-tuf1-contestants", "KenFlo", "Kenny Florian"],
      ["ufc-v2-fast3-fan-acronyms", "Pound for pound", "P4P"],
      ["ufc-v2-fast3-cage-parts", "Gate", "Cage door"],
      ["ufc-v2-fast3-announcer-intro", "Wins and losses", "Professional record"],
      ["ufc-v2-fast3-walkout-music", "Rap", "Hip-hop"],
      ["ufc-v2-fast3-canadian-fighters", "GSP", "Georges St-Pierre"],
      ["ufc-v2-fast3-australia-nz-fighters", "JDM", "Jack Della Maddalena"],
    ] as const;
    for (const [id, guess, expected] of samples) {
      const q = newBatch.find(x => x.id === id);
      expect(q, "missing " + id).toBeDefined();
      const { list, pack, board } = materialize(q!);
      const match = matchFamilyFeudAnswer(pack, board, guess);
      expect(match.status, id + " " + guess).toBe("matched");
      if (match.status === "matched") {
        expect(list[Number(match.entityId.split(":").at(-1))]?.name).toBe(expected);
      }
    }
  });

  it("holds the known withdrawn-scheduled vs actually-fought distinction", () => {
    const ufc100 = newBatch.find(x => x.id === "ufc-v2-main3-ufc100-card")!;
    const { pack, board } = materialize(ufc100);
    expect(matchFamilyFeudAnswer(pack, board, "Jonathan Goulet").status)
      .toBe("unrecognized");
  });
});
