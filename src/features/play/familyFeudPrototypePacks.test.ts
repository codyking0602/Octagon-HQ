import { describe, expect, it } from "vitest";
import { assertFamilyFeudPack, matchFamilyFeudAnswer } from "../games/familyFeudEngine";
import {
  FOOTBALL_FAMILY_FEUD_PROTOTYPE,
  UFC_FAMILY_FEUD_PROTOTYPE,
} from "./familyFeudPrototypePacks";

describe("Family Feud prototype packs", () => {
  it("satisfies the locked two-board and five-question engine contract", () => {
    expect(() => assertFamilyFeudPack(FOOTBALL_FAMILY_FEUD_PROTOTYPE)).not.toThrow();
    expect(() => assertFamilyFeudPack(UFC_FAMILY_FEUD_PROTOTYPE)).not.toThrow();
  });

  it("accepts useful football and UFC aliases without exposing suggestions", () => {
    expect(matchFamilyFeudAnswer(
      FOOTBALL_FAMILY_FEUD_PROTOTYPE,
      FOOTBALL_FAMILY_FEUD_PROTOTYPE.fastMoney[2]!,
      "JSN",
    )).toMatchObject({ status: "matched", entityId: "jsn", kind: "alias" });

    expect(matchFamilyFeudAnswer(
      UFC_FAMILY_FEUD_PROTOTYPE,
      UFC_FAMILY_FEUD_PROTOTYPE.fastMoney[3]!,
      "GSP",
    )).toMatchObject({ status: "matched", entityId: "gsp", kind: "alias" });
  });
});
