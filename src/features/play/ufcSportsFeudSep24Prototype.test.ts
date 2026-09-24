import { describe, expect, it } from "vitest";
import {
  assertFamilyFeudPack,
  createFamilyFeudState,
  matchFamilyFeudAnswer,
  submitFamilyFeudFastMoneyAnswer,
  submitFamilyFeudMainAnswer,
  type FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";

function matchedName(
  pack: ReturnType<typeof buildSportsFeudPack>,
  question: FamilyFeudQuestion,
  input: string,
) {
  const match = matchFamilyFeudAnswer(pack, question, input);
  expect(match.status, input).toBe("matched");
  if (match.status !== "matched") return null;
  return pack.entities.find((entity) => entity.id === match.entityId)?.displayName ?? null;
}

describe("September 24 UFC Sports Feud prototype launch pack", () => {
  const pack = buildSportsFeudPack("ufc", "2026-09-24");

  it("locks the individually audited two Main plus five Fast Money questions", () => {
    expect(() => assertFamilyFeudPack(pack)).not.toThrow();
    expect(pack.id).toBe("ufc-sep24-prototype-v1-ufc-2026-09-24");
    expect(pack.mainBoards.map((question) => question.prompt)).toEqual([
      "Name a UFC star you associate with relentless grappling pressure.",
      "Name a fighter who helped make women's MMA a major part of the UFC.",
    ]);
    expect(pack.fastMoney.map((question) => question.prompt)).toEqual([
      "Name a submission you might see finish a UFC fight.",
      "Name a UFC fighter famous for trash talk.",
      "Name a UFC weight class.",
      "Name a UFC star you would pick for a striking showcase.",
      "Name an MMA referee you have seen inside the Octagon.",
    ]);
  });

  it("makes the grappling Main board match the prototype standard", () => {
    const question = pack.mainBoards[0]!;
    expect(question.answers.map((answer) =>
      pack.entities.find((entity) => entity.id === answer.entityId)?.displayName
    )).toEqual([
      "Khabib Nurmagomedov",
      "Islam Makhachev",
      "Khamzat Chimaev",
      "Merab Dvalishvili",
      "Georges St-Pierre",
      "Cain Velasquez",
      "Kamaru Usman",
      "Daniel Cormier",
    ]);

    expect(matchedName(pack, question, "Khabib")).toBe("Khabib Nurmagomedov");
    expect(matchedName(pack, question, "Islam")).toBe("Islam Makhachev");
    expect(matchedName(pack, question, "Khamzat Chimaev")).toBe("Khamzat Chimaev");
    expect(matchedName(pack, question, "Cain")).toBe("Cain Velasquez");
    expect(matchedName(pack, question, "Geroege St Lierre")).toBe("Georges St-Pierre");
    expect(matchedName(pack, question, "Arman")).toBe("Arman Tsarukyan");
  });

  it("makes the women's Main board forgiving without shrinking the valid universe", () => {
    const question = pack.mainBoards[1]!;
    expect(matchedName(pack, question, "Rousey")).toBe("Ronda Rousey");
    expect(matchedName(pack, question, "Valentina")).toBe("Valentina Shevchenko");
    expect(matchedName(pack, question, "Joana")).toBe("Joanna Jedrzejczyk");
    expect(matchedName(pack, question, "Joanna Jeddecici")).toBe("Joanna Jedrzejczyk");
    expect(matchedName(pack, question, "Cat Zigano")).toBe("Cat Zingano");
    expect(matchedName(pack, question, "Cyborg")).toBe("Cris Cyborg");
  });

  it("gives valid Main extras two points and lets them occupy one of the four slots", () => {
    let state = createFamilyFeudState();
    let transition = submitFamilyFeudMainAnswer(pack, state, "Arman");
    expect(transition.outcome).toMatchObject({
      type: "board-correct",
      points: 2,
    });
    expect(transition.state.mainBoards[0]!.revealedEntityIds).toHaveLength(1);

    state = transition.state;
    for (const answer of ["Khabib", "Islam", "Khamzat"]) {
      transition = submitFamilyFeudMainAnswer(pack, state, answer);
      state = transition.state;
    }

    expect(state.mainBoards[0]!.revealedEntityIds).toHaveLength(4);
    expect(state.mainBoardIndex).toBe(1);
  });

  it("gives valid Fast Money extras one point", () => {
    const state = { ...createFamilyFeudState(), phase: "fast-money" as const };
    const transition = submitFamilyFeudFastMoneyAnswer(pack, state, "Von Flue", 45_000);
    expect(transition.outcome).toMatchObject({
      type: "fast-money-answer",
      points: 1,
    });
  });

  it("keeps Fast Money immediate and human-friendly", () => {
    expect(matchedName(pack, pack.fastMoney[1]!, "Paddy")).toBe("Paddy Pimblett");
    expect(matchedName(pack, pack.fastMoney[2]!, "155")).toBe("Lightweight");
    expect(matchedName(pack, pack.fastMoney[3]!, "Wonderboy")).toBe("Stephen Thompson");
    expect(matchedName(pack, pack.fastMoney[4]!, "Herb")).toBe("Herb Dean");
    expect(matchedName(pack, pack.fastMoney[4]!, "Big John")).toBe("John McCarthy");
  });
});
