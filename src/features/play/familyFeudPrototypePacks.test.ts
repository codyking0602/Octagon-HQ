import { describe, expect, it } from "vitest";
import { assertFamilyFeudPack, matchFamilyFeudAnswer } from "../games/familyFeudEngine";
import {
  FOOTBALL_FAMILY_FEUD_PROTOTYPE,
  UFC_FAMILY_FEUD_PROTOTYPE,
} from "./familyFeudPrototypePacks";

describe("Family Feud V2 prototype packs", () => {
  it("satisfies the two-board, four-to-clear, five-Fast-Money engine contract", () => {
    expect(() => assertFamilyFeudPack(FOOTBALL_FAMILY_FEUD_PROTOTYPE)).not.toThrow();
    expect(() => assertFamilyFeudPack(UFC_FAMILY_FEUD_PROTOTYPE)).not.toThrow();

    for (const pack of [FOOTBALL_FAMILY_FEUD_PROTOTYPE, UFC_FAMILY_FEUD_PROTOTYPE]) {
      expect(pack.mainBoards).toHaveLength(2);
      expect(pack.fastMoney).toHaveLength(5);
      expect(pack.mainBoards.every((board) => board.answers.length >= 8 && board.answers.length <= 12)).toBe(true);
      expect(pack.mainBoards.every((board) => (board.alsoAcceptedEntityIds?.length ?? 0) === 0)).toBe(true);
      expect(pack.mainBoards.every((board) =>
        board.answers.slice(0, 4).reduce((sum, answer) => sum + answer.points, 0) === 30
      )).toBe(true);
    }
  });

  it("uses constrained HQ-opinion prompts instead of leaderboard prototype prompts", () => {
    expect(FOOTBALL_FAMILY_FEUD_PROTOTYPE.mainBoards[0]!.prompt).toMatch(/electric Cowboys/i);
    expect(FOOTBALL_FAMILY_FEUD_PROTOTYPE.mainBoards[1]!.prompt).toMatch(/down 4 late/i);
    expect(UFC_FAMILY_FEUD_PROTOTYPE.mainBoards[0]!.prompt).toMatch(/scariest UFC heavyweight punchers/i);
    expect(UFC_FAMILY_FEUD_PROTOTYPE.mainBoards[1]!.prompt).toMatch(/most entertaining UFC lightweights/i);
  });

  it("accepts useful football and UFC aliases without exposing suggestions", () => {
    expect(matchFamilyFeudAnswer(
      FOOTBALL_FAMILY_FEUD_PROTOTYPE,
      FOOTBALL_FAMILY_FEUD_PROTOTYPE.fastMoney[4]!,
      "Megatron",
    )).toMatchObject({ status: "matched", entityId: "calvin", kind: "alias" });

    expect(matchFamilyFeudAnswer(
      UFC_FAMILY_FEUD_PROTOTYPE,
      UFC_FAMILY_FEUD_PROTOTYPE.fastMoney[2]!,
      "Do Bronx",
    )).toMatchObject({ status: "matched", entityId: "oliveira", kind: "alias" });
  });
});
