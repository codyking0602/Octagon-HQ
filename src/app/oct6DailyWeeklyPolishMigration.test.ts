import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310269_oct6_daily_weekly_polish.sql",
  "utf8",
);

describe("Oct. 6 Daily + Weekly production polish", () => {
  it("retires the generic weekly themes while preserving the exposed board", () => {
    expect(migration).toContain("v_theme:='Super Bowl Champions'");
    expect(migration).toContain("candidate.super_bowl_champion");
    expect(migration).not.toContain("('open_field',1.50,2)");
    expect(migration).toContain("when 1 then 'Champions & Contenders'");
    expect(migration).toContain("when 4 then 'Postseason Runs'");
    expect(migration).toContain("where week_start = date '2026-10-06'");
  });

  it("accepts the hot-route phrasing and restores Cody's banked 90", () => {
    expect(migration).toContain("'Audible to change route'");
    expect(migration).toContain("'audible to change route'");
    expect(migration).toContain("'question_7_regraded_correct',true");
    expect(migration).toContain("'question_8_saved',true");
    expect(migration).toContain("'banked_score',90");
    expect(migration).toContain("normalized_score = 90");
  });
});
