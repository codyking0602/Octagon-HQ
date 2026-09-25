import { describe, expect, it } from "vitest";
import {
  matchFamilyFeudAnswer,
  type FamilyFeudPack,
  type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";
import type { SportsFeudBankDomain } from "./sportsFeudBankTypes";

function addDays(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

type MaterializedQuestion = {
  pack: FamilyFeudPack;
  question: FamilyFeudQuestion;
};

function materializeEveryQuestion(domain: SportsFeudBankDomain) {
  const found = new Map<string, MaterializedQuestion>();
  for (let offset = 0; offset < 2_000 && found.size < 350; offset += 1) {
    const pack = buildSportsFeudPack(domain, addDays("2026-09-23", offset));
    for (const question of [...pack.mainBoards, ...pack.fastMoney]) {
      if (!found.has(question.id)) found.set(question.id, { pack, question });
    }
  }
  return found;
}
describe("Sports Feud authored alias contract", () => {
  for (const domain of ["ufc", "nfl", "cfb"] as const) {
    it(`${domain.toUpperCase()} preserves every authored alias through the production matcher`, () => {
      const questions = materializeEveryQuestion(domain);
      expect(questions.size).toBe(350);

      let aliasCount = 0;
      for (const { pack, question } of questions.values()) {
        const byId = new Map(pack.entities.map((entity) => [entity.id, entity]));
        for (const entityId of question.candidateIds) {
          const entity = byId.get(entityId);
          expect(entity, `${domain} ${question.id} ${entityId}`).toBeDefined();
          if (!entity) continue;

          for (const alias of entity.aliases ?? []) {
            aliasCount += 1;
            const match = matchFamilyFeudAnswer(pack, question, alias);
            expect(
              match,
              `${domain} ${question.id} alias "${alias}" for ${entity.displayName}`,
            ).toMatchObject({
              status: "matched",
              entityId,
            });
          }
        }
      }

      expect(aliasCount, `${domain} authored alias coverage`).toBeGreaterThan(0);
    });
  }

  it("locks high-risk natural phrase and venue shorthand that users type under Fast Money pressure", () => {
    const pack = buildSportsFeudPack("nfl", "2026-09-25");
    const byId = new Map(pack.entities.map((entity) => [entity.id, entity]));

    const expectations = [
      ["nfl-fast4-08-1", "Cover Punts", "Punt coverage"],
      ["nfl-fast4-08-1", "Punt Cover", "Punt coverage"],
      ["nfl-fast4-08-1", "Cover Kicks", "Kick coverage"],
      ["nfl-fast3-05-4", "Seattle", "Lumen Field"],
      ["nfl-fast3-05-4", "Seahawks", "Lumen Field"],
      ["nfl-fast3-05-4", "Seattle Seahawks", "Lumen Field"],
      ["nfl-fast3-05-4", "Seattle Seahwaks", "Lumen Field"],
      ["nfl-fast3-05-4", "Buffalo Bills", "Highmark Stadium"],
      ["nfl-fast3-05-4", "Green Bay Packers", "Lambeau Field"],
      ["nfl-fast3-05-4", "Minnesota Vikings", "U.S. Bank Stadium"],
      ["nfl-fast3-05-4", "Philadelphia Eagles", "Lincoln Financial Field"],
    ] as const;

    for (const [questionId, input, expectedName] of expectations) {
      const question = pack.fastMoney.find((row) => row.id === questionId);
      expect(question, questionId).toBeDefined();
      if (!question) continue;

      const match = matchFamilyFeudAnswer(pack, question, input);
      expect(match.status, `${questionId} "${input}"`).toBe("matched");
      if (match.status === "matched") {
        expect(byId.get(match.entityId)?.displayName, `${questionId} "${input}"`).toBe(expectedName);
      }
    }
  });
});
