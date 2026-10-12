import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createFamilyFeudState,
  familyFeudScore,
  matchFamilyFeudAnswer,
  submitFamilyFeudFastMoneyAnswer,
  submitFamilyFeudMainAnswer,
} from "../games/familyFeudEngine";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";

const migration = readFileSync(
  "supabase/migrations/202612310301_oct12_shane_ufc_feud_three_answer_repair.sql",
  "utf8",
);

describe("October 12 Shane UFC Sports Feud fair grading", () => {
  it("accepts both Conor alternatives and corner Advice within the intended question", () => {
    const pack = buildSportsFeudPack("ufc", "2026-10-12");
    expect(pack.mainBoards.map((q) => q.id)).toEqual(["ufc-main-09-4", "ufc-main-17-1"]);
    expect(pack.fastMoney.map((q) => q.id)).toEqual([
      "ufc-fast3-01-5", "ufc-fast4-01-2", "ufc-fast4-10-4",
      "ufc-fast5-10-1", "ufc-fast1-09-3",
    ]);
    for (const [question, answer] of [
      [pack.mainBoards[0]!, "Conor McGregor"],
      [pack.fastMoney[0]!, "Conor Mcgregor"],
      [pack.fastMoney[2]!, "Advice"],
    ] as const) {
      expect(matchFamilyFeudAnswer(pack, question, answer).status).toBe("matched");
    }
  });

  it("replays Shane's original answers under the four-correct board rule to 79, not 84", () => {
    const pack = buildSportsFeudPack("ufc", "2026-10-12");
    let state = createFamilyFeudState();
    for (const answer of [
      "George St Pier", "Islam Mahchachev", "Conor McGregor", "Kamara Usman",
      "Lightweight", "Welterweight", "Heavyweight", "Light Heavyweight",
    ]) {
      state = submitFamilyFeudMainAnswer(pack, state, answer).state;
    }
    expect(state.phase).toBe("fast-money");
    expect(state.mainBoards[0]?.revealedEntityIds).toHaveLength(4);
    expect(state.mainBoards[0]?.strikes).toBe(0);
    expect(familyFeudScore(pack, state).main).toBe(48);

    for (const answer of ["Conor Mcgregor", "Ko", "Advice", "Israel Adesanya", "Khabib"]) {
      state = submitFamilyFeudFastMoneyAnswer(pack, state, answer).state;
    }
    expect(state.phase).toBe("complete");
    expect(state.fastMoneyResults.map((result) => result.points)).toEqual([1, 7, 8, 7, 8]);
    expect(familyFeudScore(pack, state)).toMatchObject({
      main: 48,
      fastMoney: 31,
      raw: 79,
      hq: 79,
    });
  });

  it("limits the historical database repair to Shane's October 12 official attempt", () => {
    expect(migration).toContain("normalized_name='SHANE'");
    expect(migration).toContain("central_day=date '2026-10-12'");
    expect(migration).toContain("s.sport='ufc'");
    expect(migration).toContain("a.attempt_kind='official_first'");
    expect(migration).toContain("normalized_score=79");
    expect(migration).toContain("'main_points',48");
    expect(migration).toContain("'fast_money_points',31");
    expect(migration).toContain("four-correct");
    expect(migration).toContain("fifth_original_leon_not_replayed");
    expect(migration).toContain("enable trigger daily_challenge_attempts_immutable");
    expect(migration).toContain("enable trigger daily_challenge_setups_immutable");
    expect(migration).not.toContain("delete from private.daily_challenge_attempts");
    expect(migration).not.toContain("update private.daily_challenge_history");
  });
});
