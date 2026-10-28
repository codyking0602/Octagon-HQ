import { describe, expect, it } from "vitest";
import { matchFamilyFeudAnswer, normalizeFamilyFeudInput } from "../games/familyFeudEngine";
import { UFC_SPORTS_FEUD_MAIN } from "./ufcSportsFeudMain";
import { UFC_SPORTS_FEUD_FAST_1 } from "./ufcSportsFeudFast1";
import { UFC_SPORTS_FEUD_FAST_2 } from "./ufcSportsFeudFast2";
import { UFC_SPORTS_FEUD_FAST_3 } from "./ufcSportsFeudFast3";
import { UFC_SPORTS_FEUD_FAST_4 } from "./ufcSportsFeudFast4";
import { UFC_SPORTS_FEUD_FAST_5 } from "./ufcSportsFeudFast5";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";
import { UFC_SPORTS_FEUD_MAIN_CANDIDATES, UFC_SPORTS_FEUD_FAST_EASY_CANDIDATES, UFC_SPORTS_FEUD_FAST_ON_HOLD } from "./ufcSportsFeudEditorialCandidates";

const fast = [...UFC_SPORTS_FEUD_FAST_1, ...UFC_SPORTS_FEUD_FAST_2, ...UFC_SPORTS_FEUD_FAST_3, ...UFC_SPORTS_FEUD_FAST_4, ...UFC_SPORTS_FEUD_FAST_5];

describe("UFC Sports Feud editorial review-only shortlists", () => {
  it("keeps the authored source bank immutable until future-only selection is approved", () => {
    expect(UFC_SPORTS_FEUD_MAIN).toHaveLength(100);
    expect(fast).toHaveLength(250);
  });
  it("accounts for every candidate, with no duplicate semantic bank prompt", () => {
    expect(UFC_SPORTS_FEUD_MAIN_CANDIDATES).toHaveLength(16);
    expect(UFC_SPORTS_FEUD_FAST_EASY_CANDIDATES).toHaveLength(18);
    const source = [...UFC_SPORTS_FEUD_MAIN, ...fast];
    const ids = [...UFC_SPORTS_FEUD_MAIN_CANDIDATES, ...UFC_SPORTS_FEUD_FAST_EASY_CANDIDATES, ...UFC_SPORTS_FEUD_FAST_ON_HOLD];
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      const question = source.find(q => q.id === id);
      expect(question, id).toBeDefined();
      expect(question?.answers).toHaveLength(8);
    }
    const confirmed = source.filter(q => (UFC_SPORTS_FEUD_MAIN_CANDIDATES as readonly string[]).includes(q.id) || (UFC_SPORTS_FEUD_FAST_EASY_CANDIDATES as readonly string[]).includes(q.id));
    expect(new Set(confirmed.map(q => normalizeFamilyFeudInput(q.prompt))).size).toBe(confirmed.length);
    expect(new Set(UFC_SPORTS_FEUD_FAST_EASY_CANDIDATES.map(id => source.find(q => q.id === id)!.collisionGroup ?? source.find(q => q.id === id)!.category)).size).toBeGreaterThanOrEqual(12);
  });
  it("preserves colloquial and typo grading without guessing among ambiguous identities", () => {
    const pack = buildSportsFeudPack("ufc", "2026-10-06");
    const board = pack.mainBoards.find(q => q.id === "ufc-main-01-2");
    expect(board).toBeDefined();
    for (const answer of ["Royce", "GSP", "Georges St Piere", "Conor McGreggor", "Jon"]) {
      expect(matchFamilyFeudAnswer(pack, board!, answer).status, answer).toBe("matched");
    }
  });
});
