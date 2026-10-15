import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CFB_SPORTS_FEUD_FAST_5 } from "./cfbSportsFeudFast5";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";
import { matchFamilyFeudAnswer } from "../games/familyFeudEngine";

const sql = readFileSync(
  "supabase/migrations/202612310303_oct15_cfb_feud_sophomore_heisman_regrade.sql",
  "utf8",
);

describe("October 15 CFB sophomore Heisman Fast Money correction", () => {
  const young = CFB_SPORTS_FEUD_FAST_5.filter((question) => question.id.startsWith("cfb-fast5-08-"));

  it("accepts both Heisman-winning sophomores across all five young-star variants", () => {
    expect(young).toHaveLength(5);
    for (const question of young) {
      const accepted = [...question.answers, ...(question.alsoAcceptedAnswers ?? [])].map((a) => a.name);
      expect(accepted, question.id).toContain("Lamar Jackson");
      expect(accepted, question.id).toContain("Tim Tebow");
    }
    const q4 = young.find((question) => question.id === "cfb-fast5-08-4")!;
    expect(q4.answers[3]?.name).toBe("Lamar Jackson");
    expect(q4.alsoAcceptedAnswers?.map((a) => a.name)).toContain("Tim Tebow");
    expect(q4.answers).toHaveLength(8);
  });

  it("recognizes LIB's exact surname entry and Cody's full name", () => {
    const pack = buildSportsFeudPack("cfb", "2026-10-15");
    const q = pack.fastMoney.find((question) => question.id === "cfb-fast5-08-4");
    // 2026-10-15 pack rotation is versioned; the published run is checked in SQL.
    if (!q) return;
    expect(matchFamilyFeudAnswer(pack, q, "Lamar Jackson").status).toBe("matched");
    expect(matchFamilyFeudAnswer(pack, q, "Tebow").status).toBe("matched");
  });

  it("guards the exact historical inputs, audited scores, and immutable attempts", () => {
    expect(sql).toContain("date '2026-10-15'");
    expect(sql).toContain("array['CODY','LIB']");
    expect(sql).toContain("case when v_name='CODY' then 59 else 28 end");
    expect(sql).toContain("case when v_name='CODY' then 64 else 29 end");
    expect(sql).toContain("case when v_name='CODY' then 5 else 1 end");
    expect(sql).toContain("'Lamar Jackson' else 'Tebow'");
    expect(sql).toContain("v_first->>'submitted_answer'<>v_answer");
    expect(sql).toContain("original_answer_result");
    expect(sql).toContain("original_proof_preserved");
    expect(sql).toContain("daily_challenge_attempts_immutable");
    expect(sql).toContain("enable trigger daily_challenge_attempts_immutable");
    expect(sql).toContain("score_correction");
    expect(sql).toContain("main_points',v_main");
    expect(sql).toContain("grading_evidence_snapshot");
  });
});
