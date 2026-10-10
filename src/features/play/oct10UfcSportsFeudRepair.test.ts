import { describe, expect, it } from "vitest";
import { assertFamilyFeudPack, matchFamilyFeudAnswer } from "../games/familyFeudEngine";
import { buildFamilyFeudDailySetup } from "./familyFeudDailyRuntime";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";

const day = "2026-10-10";
const pack = buildSportsFeudPack("ufc", day);

describe("October 10 UFC Sports Feud repair", () => {
  it("keeps the first board, replaces only the subjective second board, and preserves Fast Money", () => {
    assertFamilyFeudPack(pack);
    expect(pack.mainBoards[0]!.id).toBe("ufc-main-06-5");
    expect(pack.mainBoards[1]!.id).toBe("ufc-main-20261010-submissions");
    expect(pack.mainBoards[1]!.prompt).toContain("submission hold");
    expect(pack.fastMoney.map((q) => q.id)).toEqual([
      "ufc-fast2-07-3",
      "ufc-fast3-06-5",
      "ufc-fast4-06-2",
      "ufc-fast1-05-1",
      "ufc-fast2-04-3",
    ]);
    expect(JSON.stringify(buildFamilyFeudDailySetup(pack, day, "test-oct10").publicSetup)).toContain("ufc-main-20261010-submissions");
  });

  it("credits reasonable first-board showmen without changing the ranked board", () => {
    const first = pack.mainBoards[0]!;
    for (const answer of ["Jon Jones", "Brock Lesnar", "Ronda Rousey", "Israel Adesanya"]) {
      expect(matchFamilyFeudAnswer(pack, first, answer).status).toBe("matched");
    }
    expect(first.answers[0]!.points).toBe(10);
  });

  it("accepts everyday submission names, shorthand, and less common real finishes", () => {
    const second = pack.mainBoards[1]!;
    for (const answer of ["RNC", "Rear naked choke", "Arm bar", "Guillotine", "Triangle", "Kimura", "Darce", "Anaconda", "Twister", "Kneebar", "Von Flue"]) {
      expect(matchFamilyFeudAnswer(pack, second, answer).status).toBe("matched");
    }
  });

  it("preserves reviewed Fast Money grading without inventing Team Alpha Male ties", () => {
    const questions = pack.fastMoney;
    for (const [index, answer] of [[0, "Dan Hardy"], [1, "Quenton Jackson"], [2, "Headbutt"], [3, "Ngannou"]] as const) {
      expect(matchFamilyFeudAnswer(pack, questions[index]!, answer).status).toBe("matched");
    }
    expect(matchFamilyFeudAnswer(pack, questions[4]!, "Daniel Cormier").status).toBe("unrecognized");
  });

  it("doesn't alter other days' boards", () => {
    const other = buildSportsFeudPack("ufc", "2026-10-11");
    expect(other.mainBoards.every((q) => q.id !== "ufc-main-20261010-submissions")).toBe(true);
  });
});
