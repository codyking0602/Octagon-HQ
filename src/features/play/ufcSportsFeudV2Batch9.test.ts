import { describe, expect, it } from "vitest";
import {
  matchFamilyFeudAnswer, normalizeFamilyFeudInput,
  type FamilyFeudPack, type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH9 } from "./ufcSportsFeudV2MainBatch9";

function fixture(question: (typeof UFC_SPORTS_FEUD_V2_MAIN_BATCH9)[number]) {
  const all = [...question.answers, ...(question.alsoAcceptedAnswers ?? [])];
  const entities = all.map((answer, index) => ({
    id: question.id + ":" + index,
    displayName: answer.name,
    kind: question.entityKind,
    aliases: answer.aliases ?? [],
  }));
  const board: FamilyFeudQuestion = {
    id: question.id, prompt: question.prompt,
    candidateIds: entities.map(entity => entity.id),
    answers: entities.slice(0, 8).map((entity, index) => ({
      entityId: entity.id, points: 8 - index,
    })),
    alsoAcceptedEntityIds: entities.slice(8).map(entity => entity.id),
  };
  const pack = {
    id: question.id, sport: "ufc",
    mainBoards: [], fastMoney: [], entities,
  } satisfies FamilyFeudPack;
  return { all, board, pack };
}

const AUTHORED_TOP_TEN_LENGTHS: Record<string, number> = {
  "ufc-v2-main9-twenty-wins": 10,
  "ufc-v2-main9-ten-knockouts": 13,
  "ufc-v2-main9-eight-submissions": 10,
  "ufc-v2-main9-postfight-bonuses": 10,
  "ufc-v2-main9-ufc-win-streak": 12,
  "ufc-v2-main9-title-fight-wins": 11,
  "ufc-v2-main9-sig-strike-volume": 10,
  "ufc-v2-main9-knockdowns": 13,
  "ufc-v2-main9-decision-wins": 10,
  "ufc-v2-main9-fight-appearances": 11,
};
describe("UFC V2 batch 9 editorial: as-of-date official recordbook and HOF sets", () => {
  it("has 12 source-annotated topics and exactly eight ranked answers", () => {
    expect(UFC_SPORTS_FEUD_V2_MAIN_BATCH9).toHaveLength(12);
    for (const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH9) {
      expect(q.answers, q.id).toHaveLength(8);
      expect(q.source?.length, q.id).toBeGreaterThan(0);
      const all = [...q.answers, ...(q.alsoAcceptedAnswers ?? [])];
      expect(new Set(all.map(a => normalizeFamilyFeudInput(a.name))).size, q.id).toBe(all.length);
      if (q.id in AUTHORED_TOP_TEN_LENGTHS) {
        expect(q.prompt, q.id).toContain("Top 10");
        expect(q.prompt, q.id).toContain("October 18, 2026");
        expect(all.length, q.id).toBe(AUTHORED_TOP_TEN_LENGTHS[q.id]);
      }
    }
  });
  it("matches every ranked, off-board and alias string to its sole rightful candidate", () => {
    for (const q of UFC_SPORTS_FEUD_V2_MAIN_BATCH9) {
      const { all, board, pack } = fixture(q);
      for (const [i, a] of all.entries()) {
        for (const spelling of [a.name, ...(a.aliases ?? [])]) {
          const match = matchFamilyFeudAnswer(pack, board, spelling);
          expect(match.status, q.id + " / " + spelling).toBe("matched");
          if (match.status === "matched") {
            expect(match.entityId, q.id + " / " + spelling).toBe(q.id + ":" + i);
          }
        }
      }
    }
  });
  it("rejects unsupported answers from other categories or different Hall wings", () => {
    for (const [id, name] of [
      ["ufc-v2-main9-ten-knockouts", "Conor McGregor"],
      ["ufc-v2-main9-eight-submissions", "Daniel Cormier"],
      ["ufc-v2-main9-hall-contributors", "Thomas Gerbasi"],
      ["ufc-v2-main9-hall-contributors", "Bruce Buffer"],
      ["ufc-v2-main9-fight-hall-of-fame", "Khabib Nurmagomedov"],
    ] as const) {
      const q = UFC_SPORTS_FEUD_V2_MAIN_BATCH9.find(x => x.id === id)!;
      const { board, pack } = fixture(q);
      expect(matchFamilyFeudAnswer(pack, board, name).status, id + " / " + name).toBe("unrecognized");
    }
  });
});
